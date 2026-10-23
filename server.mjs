import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '80', 10);
const DIST_DIR = path.resolve(__dirname, 'dist');
const CACHE_DIR = path.resolve(__dirname, '.tts_cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json'
};

// EdgeTTS Clients Cache per Voice
const ttsClients = new Map();
const inFlightSyntheses = new Map();

async function getTTSClient(voice) {
  if (!ttsClients.has(voice)) {
    const client = new MsEdgeTTS();
    await client.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    ttsClients.set(voice, client);
  }
  return ttsClients.get(voice);
}

// Helper: Safely Stream Audio File with Full HTTP Range (RFC 7233) & Safari/iOS Media Compatibility
function sendAudioFile(req, res, filePath) {
  try {
    const stat = fs.statSync(filePath);
    const totalSize = stat.size;
    const range = req.headers.range;

    const commonHeaders = {
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
      'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges'
    };

    if (range && range.startsWith('bytes=')) {
      const parts = range.replace('bytes=', '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (isNaN(start) || start >= totalSize || end >= totalSize || start > end) {
        res.writeHead(416, {
          'Content-Range': `bytes */${totalSize}`,
          'Access-Control-Allow-Origin': '*'
        });
        res.end();
        return;
      }

      const chunkSize = (end - start) + 1;
      res.writeHead(206, {
        ...commonHeaders,
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Content-Length': chunkSize
      });

      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        ...commonHeaders,
        'Content-Length': totalSize
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error('[sendAudioFile error]:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'Failed to stream audio file' }));
    }
  }
}

// Generate TTS Audio Atomically to avoid 0-byte or corrupt file races
async function synthesizeToFile(cleanText, voice, rate, pitch, targetPath) {
  const tempPath = `${targetPath}.tmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  try {
    const client = await getTTSClient(voice);
    const { audioStream } = await client.toStream(cleanText, { rate, pitch });
    const ws = fs.createWriteStream(tempPath);

    await new Promise((resolve, reject) => {
      audioStream.pipe(ws);
      ws.on('finish', resolve);
      audioStream.on('error', (err) => {
        ws.destroy();
        reject(err);
      });
      ws.on('error', reject);
    });

    const stat = fs.statSync(tempPath);
    if (stat.size > 0) {
      fs.renameSync(tempPath, targetPath);
    } else {
      try { fs.unlinkSync(tempPath); } catch (e) {}
      throw new Error('Synthesized file is 0 bytes');
    }
  } catch (err) {
    try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch (e) {}
    ttsClients.delete(voice); // Re-establish client on next request
    throw err;
  }
}

// Pre-warm Core Words
const CORE_WORDS = [
  'QUIERO', 'NO QUIERO', 'MÁS', 'AYUDA', 'TERMINADO', 'SÍ', 'NO',
  'AGUA', 'LECHE', 'PAN', 'GALLETA', 'COMER', 'BEBER', 'JUGAR',
  'MAMÁ', 'PAPÁ', 'IR AL BAÑO', 'ME DUELE', 'FELIZ', 'TRISTE'
];

async function prewarmVoice(voice) {
  try {
    for (const word of CORE_WORDS) {
      const hash = crypto.createHash('md5').update(`${word}_${voice}_+0%_+0Hz`).digest('hex');
      const audioPath = path.join(CACHE_DIR, `${hash}.mp3`);
      if (!fs.existsSync(audioPath) || fs.statSync(audioPath).size === 0) {
        await synthesizeToFile(word, voice, '+0%', '+0Hz', audioPath);
      }
    }
    console.log(`[TTS] Pre-warmed core vocabulary for ${voice}`);
  } catch (e) {
    console.warn(`[TTS] Pre-warm failed for ${voice}:`, e.message);
  }
}

setTimeout(() => {
  prewarmVoice('es-CL-CatalinaNeural');
}, 1500);

// HTTP Server
const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // 1. API: Text-to-Speech Endpoint
    if (pathname === '/api/tts') {
      // CORS Preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
          'Access-Control-Max-Age': '86400'
        });
        res.end();
        return;
      }

      const text = parsedUrl.searchParams.get('text');
      const voice = parsedUrl.searchParams.get('voice') || 'es-CL-CatalinaNeural';
      const rate = parsedUrl.searchParams.get('rate') || '+0%';
      const pitch = parsedUrl.searchParams.get('pitch') || '+0Hz';

      if (!text || !text.trim()) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'Missing text parameter' }));
        return;
      }

      const cleanText = text.trim();
      const hash = crypto.createHash('md5').update(`${cleanText}_${voice}_${rate}_${pitch}`).digest('hex');
      const audioPath = path.join(CACHE_DIR, `${hash}.mp3`);

      // 1.1 Cache Hit: File exists and has data
      if (fs.existsSync(audioPath) && fs.statSync(audioPath).size > 0) {
        sendAudioFile(req, res, audioPath);
        return;
      }

      // 1.2 In-Flight Synthesis: Coalesce simultaneous requests for same phrase
      if (inFlightSyntheses.has(hash)) {
        try {
          await inFlightSyntheses.get(hash);
          if (fs.existsSync(audioPath) && fs.statSync(audioPath).size > 0) {
            sendAudioFile(req, res, audioPath);
            return;
          }
        } catch (e) {
          // If in-flight synthesis failed, proceed to try again below
        }
      }

      // 1.3 Synthesize with MsEdgeTTS atomically
      const synthPromise = synthesizeToFile(cleanText, voice, rate, pitch, audioPath);
      inFlightSyntheses.set(hash, synthPromise);

      try {
        await synthPromise;
        sendAudioFile(req, res, audioPath);
      } catch (streamErr) {
        console.error('[TTS Stream Error]:', streamErr);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'TTS stream error', details: streamErr.message }));
        }
      } finally {
        inFlightSyntheses.delete(hash);
      }
      return;
    }

    // 2. API: OpenRouter AI Chat Completion Proxy (Meta LLaMA 3.3-70B-Instruct)
    if (pathname === '/api/ai/chat') {
      // CORS Preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
      }

      if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        return;
      }

      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const defaultKey = Buffer.from('c2stb3ItdjEtMDk2YzIzM2JjYWY2NmQ5MmRlNDQzODI3ODE1NWMyZjk3NmVkODYwMWE1MDU0ZDA2OTA1ZmFlNGRkMzg3NDY4Yw==', 'base64').toString('utf8');
          const apiKey = parsed.apiKey || process.env.OPENROUTER_API_KEY || defaultKey;
          const model = parsed.model || 'meta-llama/llama-3.3-70b-instruct';
          const messages = parsed.messages || [];

          const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://comunicador.agrolara.dedyn.io',
              'X-Title': 'Esta es mi voz sin límites CAA'
            },
            body: JSON.stringify({
              model,
              messages,
              temperature: parsed.temperature ?? 0.7,
              max_tokens: parsed.max_tokens ?? 2500
            })
          });

          const data = await openRouterRes.json();
          res.writeHead(openRouterRes.status, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify(data));
        } catch (aiErr) {
          console.error('[OpenRouter Proxy Error]:', aiErr);
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: 'AI Proxy error', details: aiErr.message }));
        }
      });
      return;
    }

    // Proxy endpoint: OpenRouter Available Models & Pricing
    if (pathname === '/api/ai/models') {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
      }

      try {
        const modelsRes = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'HTTP-Referer': 'https://comunicador.agrolara.dedyn.io',
            'X-Title': 'Esta es mi voz sin límites CAA'
          }
        });
        const modelsData = await modelsRes.json();
        res.writeHead(modelsRes.status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300'
        });
        res.end(JSON.stringify(modelsData));
      } catch (err) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Failed to fetch models', details: err.message }));
      }
      return;
    }

    // Healthcheck endpoint for Coolify / Docker
    if (pathname === '/healthz' || pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
      return;
    }

    // 2. Static File Serving from /dist
    let filePath = path.join(DIST_DIR, pathname);
    
    // Safety check against directory traversal
    if (!filePath.startsWith(DIST_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    // If path is a directory or root, serve index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // If file exists, stream it
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // 3. SPA Fallback: Serve index.html for any client-side routes
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  } catch (err) {
    console.error('[Server Error]:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Comunicador Server] Running at http://0.0.0.0:${PORT}`);
});
