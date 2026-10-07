import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';
import { tts } from '../services/tts';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) | 'user' (front)
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara en vivo no está soportada en este navegador.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setError('No se pudo acceder a la cámara en vivo. Asegúrate de otorgar permisos o utiliza la opción de subir archivo.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    // Crop or capture square central region
    const minDim = Math.min(video.videoWidth, video.videoHeight) || 480;
    const size = Math.min(minDim, 512);

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    const startX = (video.videoWidth - minDim) / 2;
    const startY = (video.videoHeight - minDim) / 2;

    ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, size, size);

    const base64 = canvas.toDataURL('image/jpeg', 0.85);

    tts.playChime('pop');
    stopCamera();
    onCapture(base64);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-3 md:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#111c2d] border-2 border-[#334155] rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between p-4 bg-black/40 text-white z-10">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#6cf8bb]" />
            <span className="font-black text-sm">Cámara en Vivo Danmax</span>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            type="button"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Container */}
        <div className="relative w-full aspect-square bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-white space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <p className="text-xs text-slate-300 font-medium">{error}</p>
              <button
                onClick={startCamera}
                type="button"
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Square framing guide overlay */}
              <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-3xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] font-bold text-white/70 bg-black/40 px-2 py-1 rounded-md">
                  Encuadra el objeto o persona aquí
                </span>
              </div>
            </>
          )}
        </div>

        {/* Controls Footer */}
        <div className="w-full p-4 bg-black/60 flex items-center justify-around gap-4">
          <button
            onClick={handleSwitchCamera}
            type="button"
            title="Cambiar cámara"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw className="w-6 h-6" />
          </button>

          {/* Big Shutter Button */}
          <button
            onClick={handleCapture}
            disabled={!!error || !stream}
            type="button"
            style={{ boxShadow: '0 4px 0 #003ea8' }}
            className="px-6 py-3.5 bg-[#004ac6] hover:bg-[#003ea8] text-white font-black text-sm rounded-2xl flex items-center gap-2 cursor-pointer transition-all active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Camera className="w-5 h-5" />
            <span>DISPARAR FOTO</span>
          </button>
        </div>
      </div>
    </div>
  );
}
