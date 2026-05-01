import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

const Header = () => {
  const { language } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#020202]/50 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-500 rounded-sm rotate-12 flex items-center justify-center text-black shadow-lg cyan-glow group-hover:rotate-0 transition-all duration-500">
            <span className="font-black text-xs md:text-sm -rotate-12 group-hover:rotate-0 transition-all">UL</span>
          </div>
          <div className="flex flex-col">
            <div className="text-lg md:text-xl font-black italic tracking-tighter uppercase leading-none">
              <span className="text-white">UNREAL</span>{' '}
              <span className="text-cyan-500">LEADS</span>
            </div>
            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mt-1 italic">PREMIUM_EXTRACTION</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
           {/* Navigation links if needed */}
        </div>
      </div>
    </header>
  );
};

export default Header;
