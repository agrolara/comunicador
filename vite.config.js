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
