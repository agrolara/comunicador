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

async function getTTSClient(voice) {
  if (!ttsClients.has(voice)) {
    const client = new MsEdgeTTS();
    await client.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    ttsClients.set(voice, client);
  }
  return ttsClients.get(voice);
}

// Pre-warm Core Words
const CORE_WORDS = [
  'QUIERO', 'NO QUIERO', 'MÁS', 'AYUDA', 'TERMINADO', 'SÍ', 'NO',
  'AGUA', 'LECHE', 'PAN', 'GALLETA', 'COMER', 'BEBER', 'JUGAR',
  'MAMÁ', 'PAPÁ', 'IR AL BAÑO', 'ME DUELE', 'FELIZ', 'TRISTE'
];

async function prewarmVoice(voice) {
  try {
    const client = await getTTSClient(voice);
    for (const word of CORE_WORDS) {
      const hash = crypto.createHash('md5').update(`${word}_${voice}_+0%_+0Hz`).digest('hex');
      const audioPath = path.join(CACHE_DIR, `${hash}.mp3`);
      if (!fs.existsSync(audioPath)) {
        const { audioStream } = await client.toStream(word);
        const ws = fs.createWriteStream(audioPath);
        audioStream.pipe(ws);
        await new Promise((resolve) => ws.on('finish', resolve));
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
      const text = parsedUrl.searchParams.get('text');
      const voice = parsedUrl.searchParams.get('voice') || 'es-CL-CatalinaNeural';
      const rate = parsedUrl.searchParams.get('rate') || '+0%';
      const pitch = parsedUrl.searchParams.get('pitch') || '+0Hz';

      if (!text || !text.trim()) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing text parameter' }));
        return;
      }

      const cleanText = text.trim();
      const hash = crypto.createHash('md5').update(`${cleanText}_${voice}_${rate}_${pitch}`).digest('hex');
      const audioPath = path.join(CACHE_DIR, `${hash}.mp3`);

      // Cache Hit (Instant response)
      if (fs.existsSync(audioPath)) {
        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(audioPath).pipe(res);
        return;
      }

      // Generate via MsEdgeTTS Stream
      try {
        const client = await getTTSClient(voice);
        const { audioStream } = await client.toStream(cleanText, { rate, pitch });

        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*'
        });

        const fileWs = fs.createWriteStream(audioPath);
        audioStream.pipe(fileWs);
        audioStream.pipe(res);
      } catch (streamErr) {
        console.error('[TTS Stream Error]:', streamErr);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'TTS stream error', details: streamErr.message }));
      }
      return;
    }

    // Healthcheck endpoint for Coolify / Docker
    if (pathname === '/healthz' || pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
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
