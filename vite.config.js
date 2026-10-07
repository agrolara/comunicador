import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function edgeTtsPlugin() {
  const cacheDir = path.resolve(__dirname, '.tts_cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const ttsClients = new Map();

  async function getClient(voice) {
    if (!ttsClients.has(voice)) {
      const client = new MsEdgeTTS();
      await client.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      ttsClients.set(voice, client);
    }
    return ttsClients.get(voice);
  }

  // Pre-warm essential core words in background on server start
  const CORE_WORDS = [
    'QUIERO', 'NO QUIERO', 'MÁS', 'AYUDA', 'TERMINADO', 'SÍ', 'NO',
    'AGUA', 'LECHE', 'PAN', 'GALLETA', 'COMER', 'BEBER', 'JUGAR',
    'MAMÁ', 'PAPÁ', 'IR AL BAÑO', 'ME DUELE', 'FELIZ', 'TRISTE'
  ];

  async function prewarmVoice(voice) {
    try {
      const client = await getClient(voice);
      for (const word of CORE_WORDS) {
        const hash = crypto.createHash('md5').update(`${word}_${voice}_+0%_+0Hz`).digest('hex');
        const audioPath = path.join(cacheDir, `${hash}.mp3`);
        if (!fs.existsSync(audioPath)) {
          const { audioStream } = await client.toStream(word);
          const ws = fs.createWriteStream(audioPath);
          audioStream.pipe(ws);
          await new Promise((resolve) => ws.on('finish', resolve));
        }
      }
    } catch (e) {
      // Ignore pre-warming errors
    }
  }

  setTimeout(() => {
    prewarmVoice('es-CL-CatalinaNeural');
  }, 2000);

  return {
    name: 'edge-tts-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/tts')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost:5173');
          const text = urlObj.searchParams.get('text');
          const voice = urlObj.searchParams.get('voice') || 'es-CL-CatalinaNeural';
          const rate = urlObj.searchParams.get('rate') || '+0%';
          const pitch = urlObj.searchParams.get('pitch') || '+0Hz';

          if (!text) {
            res.statusCode = 400;
            res.end('Missing text parameter');
            return;
          }

          const cleanText = text.trim();
          const hash = crypto.createHash('md5').update(`${cleanText}_${voice}_${rate}_${pitch}`).digest('hex');
          const audioPath = path.join(cacheDir, `${hash}.mp3`);

          // 1. Instant Cache Hit (Serves in < 10ms)
          if (fs.existsSync(audioPath)) {
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            fs.createReadStream(audioPath).pipe(res);
            return;
          }

          // 2. Direct WebSocket Streaming via pure Node MsEdgeTTS
          const client = await getClient(voice);
          const { audioStream } = await client.toStream(cleanText, {
            rate: rate,
            pitch: pitch
          });

          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

          // Write to disk cache and pipe to client concurrently
          const fileWs = fs.createWriteStream(audioPath);
          audioStream.pipe(fileWs);
          audioStream.pipe(res);
        } catch (e) {
          console.error('Edge-TTS direct error:', e);
          res.statusCode = 500;
          res.end('TTS error: ' + e.message);
        }
      });

      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/ai/chat')) {
          return next();
        }

        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.statusCode = 204;
          res.end();
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
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
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = openRouterRes.status;
            res.end(JSON.stringify(data));
          } catch (aiErr) {
            console.error('[Vite OpenRouter Error]:', aiErr);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ error: 'AI proxy error', details: aiErr.message }));
          }
        });
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    edgeTtsPlugin()
  ],
  server: {
    port: 5173,
    host: true
  }
});
