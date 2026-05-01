import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Globe, Terminal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/profile');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-[#020202]">
      <div className="fixed inset-0 pointer-events-none opacity-5" 
        style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '120px 120px' }} 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-[1px] bg-cyan-500/10 rounded-xl md:rounded-2xl rotate-1 md:rotate-2 shadow-2xl">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl md:rounded-2xl -rotate-1 md:-rotate-2 p-8 md:p-12 backdrop-blur-3xl shadow-inner shadow-white/5">
            <div className="flex flex-col items-center text-center mb-8 md:mb-12">
              <div className="w-16 h-16 bg-cyan-500 rounded-sm rotate-12 flex items-center justify-center text-black shadow-2xl mb-8 md:mb-10 cyan-glow">
                <Terminal size={32} className="-rotate-12" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight mb-2 text-white">{t('login')}</h2>
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] italic">
                {t('identityVerification')}
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-4 md:py-5 bg-white text-black font-black uppercase text-[10px] md:text-xs tracking-widest italic rounded-xl md:rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-white/5"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                {loading ? t('processing') : t('googleLogin')}
              </button>

              <div className="relative py-8 md:py-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[7px] md:text-[8px] uppercase font-black tracking-[0.4em] text-zinc-700 italic">
                  <span className="bg-[#0a0a0a] px-4 md:px-5">KEY_PROTOCOL</span>
                </div>
              </div>

              <div className="space-y-5 md:space-y-6">
                <div className="relative">
                  <label className="block text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2 md:mb-3 ml-2 italic">{t('emailAddress')}</label>
                  <input 
                    type="email" 
                    placeholder="example@mail.com"
                    className="w-full bg-white/2 border border-white/5 rounded-xl md:rounded-2xl px-5 md:px-6 py-4 md:py-5 outline-none focus:border-cyan-500/50 transition-all text-xs md:text-sm font-mono tracking-widest text-zinc-500"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2 md:mb-3 ml-2 italic">{t('accessKey')}</label>
                  <input 
                    type="password" 
                    placeholder="********"
                    className="w-full bg-white/2 border border-white/5 rounded-xl md:rounded-2xl px-5 md:px-6 py-4 md:py-5 outline-none focus:border-cyan-500/50 transition-all text-xs md:text-sm font-mono tracking-widest text-zinc-500"
                  />
                </div>
              </div>

              <button 
                disabled
                className="w-full py-5 md:py-6 bg-zinc-900 border border-white/10 text-zinc-700 font-black rounded-xl md:rounded-[24px] mt-6 md:mt-8 cursor-not-allowed text-[10px] uppercase tracking-[0.2em] italic"
              >
                {t('login')}
              </button>

              <div className="text-center mt-8 md:mt-10">
                <p className="text-[8px] md:text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em] italic opacity-50">
                  {language === 'en' ? 'Secure Protocol Active' : 'সিকিউর প্রোটোকল অ্যাক্টিভ'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
