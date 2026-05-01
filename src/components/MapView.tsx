import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Layers, Satellite, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const MapView = () => {
  const { t } = useLanguage();
  const [activeLayer, setActiveLayer] = useState<'standard' | 'satellite'>('satellite');
  const [isScanning, setIsScanning] = useState(false);

  const startScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 group bg-[#080a0c]">
      {/* Search Bar Mimic */}
      <div className="absolute top-6 left-6 right-6 z-10 flex gap-2">
        <div className="flex-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
          <Search size={18} className="text-cyan-400" />
          <input 
            type="text" 
            placeholder="Search location to extract leads..." 
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-zinc-700 font-medium"
          />
        </div>
        <button 
          onClick={startScan}
          className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-cyan-400 transition-all cyan-glow"
        >
          <Zap size={18} />
          Extract
        </button>
      </div>

      {/* Map Content */}
      <div className={`w-full h-full transition-opacity duration-1000 ${activeLayer === 'satellite' ? 'bg-[#080a0c]' : 'bg-[#101316]'}`}>
        {/* Abstract satellite-like grid */}
        <div className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)', 
            backgroundSize: '30px 30px' 
          }} 
        />

        {/* Contour lines simulation */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
          <path d="M0,100 Q150,50 300,125 T600,75 T1000,150" stroke="#06b6d4" fill="none" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M0,200 Q200,250 450,175 T1000,225" stroke="#06b6d4" fill="none" strokeWidth="0.5" />
        </svg>
        
        {/* Moving scan line */}
        {isScanning && (
          <motion.div 
            initial={{ translateY: '-100%' }}
            animate={{ translateY: '1000%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 right-0 h-1 bg-cyan-500/50 shadow-[0_0_20px_#06b6d4]"
          />
        )}

        {/* Floating Pins */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="absolute"
              style={{ 
                top: `${30 + Math.random() * 40}%`, 
                left: `${15 + Math.random() * 70}%` 
              }}
            >
              <div className="relative group">
                <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/90 border border-white/10 rounded text-[9px] font-mono text-cyan-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  LOCK_{i + 1} DIST: 0.2km
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Layer Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button 
          onClick={() => setActiveLayer('satellite')}
          className={`p-3 rounded-xl backdrop-blur-md border transition-all ${activeLayer === 'satellite' ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-black/40 text-zinc-500 border-white/10 hover:text-white'}`}
        >
          <Satellite size={18} />
        </button>
        <button 
          onClick={() => setActiveLayer('standard')}
          className={`p-3 rounded-xl backdrop-blur-md border transition-all ${activeLayer === 'standard' ? 'bg-cyan-500 text-black border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-black/40 text-zinc-500 border-white/10 hover:text-white'}`}
        >
          <Layers size={18} />
        </button>
      </div>

      {/* Overlay Status */}
      <div className="absolute left-6 bottom-6 flex items-center gap-4 px-4 py-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-500/50 font-black">Satellite Uplink</span>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-tighter">DECRYPTING... [OK]</span>
        </div>
        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#06b6d4]" />
      </div>
    </div>
  );
};

export default MapView;
