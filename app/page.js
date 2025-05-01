'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import namer from 'color-namer';
import { Camera, Loader, Copy, Heart, Info, X, RefreshCw } from 'lucide-react';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#000000');
  const [colorName, setColorName] = useState('Waiting...');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  
  useEffect(() => {
    const savedFavorites = localStorage.getItem('colorDetectorFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse saved favorites', e);
      }
    }
  }, []);

 
  useEffect(() => {
    localStorage.setItem('colorDetectorFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const initializeCamera = async () => {
    setCameraStatus('loading');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
  
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraStatus('ready');
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraStatus('permission');
        setErrorMessage('Camera access denied. Please grant permission.');
      } else {
        setCameraStatus('error');
        setErrorMessage(`Camera error: ${err.message}`);
      }
    }
  };


  useEffect(() => {
    initializeCamera();
    

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);


  useEffect(() => {
    if (cameraStatus !== 'ready' || isPaused) return;
    
    const interval = setInterval(() => {
      if (!canvasRef.current || !videoRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

   
      const pixel = ctx.getImageData(
        Math.floor(video.videoWidth / 2),
        Math.floor(video.videoHeight / 2),
        1,
        1
      ).data;

      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setColor(hex);
      
 
      const colorNames = namer(hex);
      const name = colorNames.ntc[0].name;
      setColorName(name);


      setHistory(prev => {
        if (prev.length > 0 && prev[0].hex === hex) return prev;
        const updated = [{ hex, name }, ...prev];
        return updated.slice(0, 6); 
      });
    }, 500);

    return () => clearInterval(interval);
  }, [cameraStatus, isPaused]);


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

  const dismissInstall = () => {
    setShowInstallPrompt(false);
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addToFavorites = () => {
    if (favorites.some(fav => fav.hex === color)) return;
    setFavorites(prev => [...prev, { hex: color, name: colorName }]);
  };

  const removeFromFavorites = (hexToRemove) => {
    setFavorites(prev => prev.filter(fav => fav.hex !== hexToRemove));
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const retryCamera = () => {
    initializeCamera();
  };


  const getContrastText = (hexColor) => {

    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    

    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">

      <video 
        ref={videoRef} 
        className="absolute h-full w-full object-cover" 
        playsInline 
        muted 
      />
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />


      <AnimatePresence>
        {cameraStatus === 'loading' && (
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader className="h-12 w-12 text-white animate-spin mb-4" />
            <p className="text-xl font-medium">Initializing camera...</p>
          </motion.div>
        )}

        {cameraStatus === 'permission' && (
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Camera className="h-16 w-16 text-white mb-4" />
            <h2 className="text-2xl font-bold mb-2">Camera Permission Required</h2>
            <p className="text-lg text-center mb-6">This app needs camera access to detect colors.</p>
            <button 
              className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
              onClick={retryCamera}
            >
              Grant Permission
            </button>
          </motion.div>
        )}

        {cameraStatus === 'error' && (
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Info className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-red-500">Camera Error</h2>
            <p className="text-lg text-center mb-6">{errorMessage}</p>
            <button 
              className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
              onClick={retryCamera}
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay focus point */}
      {cameraStatus === 'ready' && (
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-16 h-16 rounded-full border-2 border-white/70 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white/90" />
          </div>
        </motion.div>
      )}

      {/* Color info display */}
      {cameraStatus === 'ready' && (
        <motion.div
          className="absolute top-6 left-80 mx-6 -translate-x-1/1 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-4 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="w-72 flex flex-col items-center space-y-3">
            <div className="flex items-center gap-4 w-full">
              <div
                className="w-20 h-20 rounded-xl shadow-lg"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-black">{colorName}</h3>
                <p className="text-base font-mono text-gray-700">{color}</p>
                <div className="flex gap-3 mt-2">
                  <button 
                    className="flex items-center gap-1 text-sm font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg transition-colors"
                    onClick={copyToClipboard}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    className="flex items-center gap-1 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg transition-colors"
                    onClick={addToFavorites}
                  >
                    Save
                    <Heart className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            <button
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              onClick={togglePause}
            >
              {isPaused ? 'Resume Detection' : 'Pause Detection'}
              {isPaused ? <RefreshCw className="h-4 w-4" /> : <Loader className="h-4 w-4" />}
            </button>
          </div>
        </motion.div>
      )}

      {/* Color History */}
      {cameraStatus === 'ready' && history.length > 0 && (
        <div className="absolute bottom-6 left-90 -mx-2 -translate-x-1/1 z-10 bg-white/90 backdrop-blur-lg text-black rounded-xl p-4 shadow-xl">
          <h3 className="text-sm font-bold mb-2">Recent Colors</h3>
          <div className="flex gap-3 overflow-x-auto pb-1 max-w-xs">
            {history.map((c, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-lg shadow-sm cursor-pointer transition-transform hover:scale-101"
                  style={{ backgroundColor: c.hex }}
                  onClick={() => {
                    setColor(c.hex);
                    setColorName(c.name);
                    setIsPaused(true);
                  }}
                />
                <span className="text-xs mt-1 max-w-10 truncate">{c.hex}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PWA Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-lg text-black rounded-xl p-4 shadow-xl z-50 w-80"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold">Install App</h3>
              <button onClick={dismissInstall} className="text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1 mb-3">
              Install Color Detector for faster access and offline use
            </p>
            <div className="flex justify-end">
              <button 
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleInstall}
              >
                Install Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites Panel */}
      <button 
        className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur-lg rounded-full p-2 shadow-lg"
        onClick={() => setShowFavorites(!showFavorites)}
      >
        <Heart className={`h-6 w-6 ${showFavorites ? 'text-red-500' : 'text-gray-700'}`} />
      </button>

      <AnimatePresence>
        {showFavorites && (
          <motion.div
            className="absolute right-6 top-20 bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-xl z-20 max-w-xs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-black">Favorite Colors</h3>
              <button onClick={() => setShowFavorites(false)}>
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            
            {favorites.length === 0 ? (
              <p className="text-sm text-gray-500 my-2">No favorites yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {favorites.map((fav, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="w-full aspect-square rounded-lg shadow-sm cursor-pointer relative group"
                      style={{ backgroundColor: fav.hex }}
                      onClick={() => {
                        setColor(fav.hex);
                        setColorName(fav.name);
                        setIsPaused(true);
                      }}
                    >
                      <button 
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromFavorites(fav.hex);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <span 
                      className="text-xs mt-1 max-w-full truncate"
                      style={{ color: '#000000' }}
                    >
                      {fav.hex}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}