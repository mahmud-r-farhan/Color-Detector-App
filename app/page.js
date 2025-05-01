'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import namer from 'color-namer';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#000000');
  const [colorName, setColorName] = useState('Detecting...');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setLoading(false);
        }
      } catch (err) {
        setError('Camera access denied.');
        setLoading(false);
      }
    };

    getCamera();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!canvasRef.current || !videoRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      const pixel = ctx.getImageData(
        video.videoWidth / 2,
        video.videoHeight / 2,
        1,
        1
      ).data;

      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setColor(hex);
      const name = namer(hex).ntc[0].name;
      setColorName(name);

      setHistory((prev) => {
        const updated = [{ hex, name }, ...prev];
        return updated.slice(0, 5); // limit history to last 5
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} install`);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(color);
  };

  const addToFavorites = () => {
    setFavorites((prev) => [...prev, { hex: color, name: colorName }]);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <video ref={videoRef} className="absolute h-full w-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay focus point */}
      <div className="absolute top-1/2 left-1/2 w-6 h-6 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20" />

      <AnimatePresence>
        <motion.div
          className="absolute top-6 left-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 z-10 text-black"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="w-64 flex flex-col items-center space-y-2">
            <div
              className="w-16 h-16 rounded-full border shadow-inner"
              style={{ backgroundColor: color }}
            />
            <p className="text-lg font-semibold text-center">{colorName}</p>
            <p className="text-sm text-gray-700">{color}</p>

            <div className="flex gap-2 mt-2">
              <button className="text-sm text-blue-600" onClick={copyToClipboard}>Copy</button>
              <button className="text-sm text-red-600" onClick={addToFavorites}>❤️</button>
            </div>
          </div>
        </motion.div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-lg font-medium z-20">
            Loading camera...
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500 text-white text-lg font-bold z-20">
            {error}
          </div>
        )}

        {showInstallPrompt && (
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-black rounded-xl px-6 py-4 shadow-xl z-50"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            <p className="text-center font-semibold mb-2">Install this app?</p>
            <div className="flex justify-center">
              <button className="text-blue-600 font-semibold" onClick={handleInstall}>Install</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color History */}
      {history.length > 0 && (
        <div className="absolute bottom-6 left-6 z-10 bg-white/80 text-black backdrop-blur-md rounded-xl p-3 shadow-lg">
          <h3 className="text-xs font-semibold mb-1">Recent Colors</h3>
          <div className="flex gap-2">
            {history.map((c, i) => (
              <div key={i} className="flex flex-col items-center text-[10px]">
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: c.hex }}
                />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
