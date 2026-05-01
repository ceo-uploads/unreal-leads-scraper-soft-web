import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Download, ShieldCheck, Globe, Users, Zap, Facebook, Youtube, Instagram, Twitter, Check, Database, Shield, Terminal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import { ref, get, set, push } from 'firebase/database';
import { rtdb } from '../services/firebase';
import { cn } from '../lib/utils';

const FeatureBadge = ({ icon: Icon, label }: any) => (
  <div className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/2 border border-white/5 hover:border-cyan-500/20 transition-all group">
    <Icon className="text-zinc-700 group-hover:text-cyan-500 transition-colors" size={24} />
    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 italic text-center leading-tight">{label}</span>
  </div>
);

const Home = () => {
  const { t, setLanguage, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trialStatus, setTrialStatus] = useState<'available' | 'used' | 'checking'>('checking');
  const [loadingTrial, setLoadingTrial] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (user) {
      get(ref(rtdb, `freeTrials/${user.uid}`)).then(snapshot => {
        setTrialStatus(snapshot.exists() ? 'used' : 'available');
      });
    } else {
      setTrialStatus('available');
    }
  }, [user]);

  const handleFreeTrial = async () => {
    if (!user) {
      showNotification(language === 'bn' ? 'অনুগ্রহ করে আগে লগইন করুন!' : 'Please login first!', 'warning');
      navigate('/login');
      return;
    }
    setLoadingTrial(true);
    try {
      await set(ref(rtdb, `freeTrials/${user.uid}`), {
        usedAt: Date.now(),
        email: user.email
      });
      
      const pass = Math.random().toString(36).slice(-10);
      const startDate = Date.now();
      const endDate = startDate + 24 * 60 * 60 * 1000;

      const subscription = {
        userId: user.uid,
        userEmail: user.email,
        packageId: 'free_trial',
        softwareUser: user.email,
        softwarePass: pass,
        startDate,
        endDate,
        status: 'active'
      };

      await push(ref(rtdb, `subscriptions/${user.uid}`), subscription);
      await push(ref(rtdb, 'softwareUsers'), {
        ...subscription,
        createdAt: Date.now()
      });
      setTrialStatus('used');
      showNotification(language === 'bn' ? 'ফ্রি ট্রায়াল চালু হয়েছে! আপনার প্রোফাইলে ক্রেডেনশিয়াল দেখুন।' : 'Free trial activated! Check your profile for credentials.', 'success');
      navigate('/profile');
    } catch (e) {
      console.error(e);
      showNotification('Error activating trial', 'error');
    }
    setLoadingTrial(false);
  };

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  return (
    <div className="relative pb-32">
      {/* Language Toggle */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
        <button 
          onClick={toggleLang}
          className="px-4 py-2 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black hover:bg-white/10 transition-colors uppercase tracking-[0.2em] italic text-cyan-400"
        >
          {language === 'en' ? 'বাংলা' : 'English'}
        </button>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-12 relative overflow-hidden">
        {/* Background contour SVG */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 1000 1000" className="w-full h-full">
            <path d="M0,500 Q250,300 500,500 T1000,500" stroke="#06b6d4" fill="none" strokeWidth="0.5" />
            <path d="M0,600 Q250,400 500,600 T1000,600" stroke="#06b6d4" fill="none" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 px-3 md:px-4 py-1.5 bg-cyan-500/5 border border-cyan-500/20 rounded-full text-cyan-400 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mb-6 md:mb-8 italic"
          >
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
            {language === 'en' ? 'SCALING EXTRACTION TOOL' : 'লিড সংগ্রহ শুরু করুন'}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-6 md:mb-8 italic uppercase leading-none"
          >
            <span className="text-white">UNREAL</span>{' '}
            <span className="text-cyan-500">LEADS</span>
            <span className="block text-[10px] md:text-xs not-italic font-black opacity-30 mt-2 tracking-[0.3em] md:tracking-[0.5em] uppercase text-white">BY UNREAL STUDIO</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto mb-10 md:mb-14 relative px-4"
          >
            <div className="absolute inset-x-0 -top-20 bottom-0 bg-cyan-500/10 blur-[120px] rounded-full opacity-30 pointer-events-none" />
            <p className="relative text-zinc-300 text-lg md:text-2xl leading-relaxed font-bold tracking-tight italic">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
                {t('heroSubtitle')}
              </span>
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2 md:gap-3">
               {[
                 { name: 'GOOGLE MAPS', color: 'text-blue-400' },
                 { name: 'WEBSITES', color: 'text-emerald-400' },
                 { name: 'FACEBOOK', color: 'text-blue-500' },
                 { name: 'INSTAGRAM', color: 'text-pink-500' },
                 { name: 'TIKTOK', color: 'text-zinc-500' },
                 { name: 'TWITTER/X', color: 'text-zinc-400' },
                 { name: 'SNAPCHAT', color: 'text-yellow-400' },
                 { name: 'TELEGRAM', color: 'text-sky-400' }
               ].map(p => (
                 <span key={p.name} className={cn(
                   "px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[7px] md:text-[9px] font-black tracking-[0.2em] italic",
                   p.color
                 )}>{p.name}</span>
               ))}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full sm:w-auto"
          >
            <button 
              onClick={() => navigate('/pricing')}
              className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-cyan-500 text-black font-black rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all cyan-glow uppercase text-[10px] md:text-xs tracking-widest italic"
            >
              {t('startExtracting')}
              <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('instructions');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-transparent text-white font-black rounded-xl flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 transition-all uppercase text-[10px] md:text-xs tracking-widest italic"
            >
              <Download size={16} />
              {t('howToUse')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Map Demo Section */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative glass-panel rounded-[30px] md:rounded-[40px] p-6 md:p-8 shadow-2xl overflow-hidden"
        >
          {/* Neon Corner Effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-[100px]" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-500 rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-[#020202] rounded-sm -rotate-45 flex items-center justify-center">
                  <Globe size={14} className="text-cyan-400" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-lg md:text-xl italic uppercase tracking-tight">{t('liveGrid')}</h3>
                <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-widest font-black italic">{t('globalNodes')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6 px-4 md:px-6 py-2 md:py-3 bg-white/5 border border-white/5 rounded-full w-full md:w-auto justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-[8px] md:text-[9px] font-mono text-cyan-400 uppercase">SYNC: 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-[8px] md:text-[9px] font-mono text-green-500 uppercase">UPLINK: OK</span>
              </div>
            </div>
          </div>
          
          <div className="h-[250px] sm:h-[350px] md:h-[500px] rounded-2xl overflow-hidden grayscale relative z-10 border border-white/5">
            <MapView />
          </div>
        </motion.div>
      </section>

      {/* Free Trial Highlight Section */}
      <section className="container mx-auto px-4 md:px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative group h-full"
        >
          {/* Exterior Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-[30px] md:rounded-[40px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative p-8 md:p-16 bg-[#0a0a0a] border border-white/10 rounded-[30px] md:rounded-[40px] overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-20 opacity-[0.03] rotate-12 -mr-10 -mt-10">
              <Zap size={300} />
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
              <div className="max-w-2xl text-center lg:text-left">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6 italic"
                >
                  <Zap size={12} fill="currentColor" />
                  FREE_ACCESS_GRANTED
                </motion.div>
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6 text-white leading-none">
                  {t('unleashFree')}
                </h2>
                <p className="text-zinc-400 text-base md:text-xl font-medium mb-8 leading-relaxed italic">
                   {t('trialOffer')}
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">
                    <Check size={16} className="text-cyan-500" />
                    24H ACCESS
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">
                    <Check size={16} className="text-cyan-500" />
                    FULL PACK
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">
                    <Check size={16} className="text-cyan-500" />
                    FAST_ENGINE
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-full lg:w-auto">
                <button 
                  disabled={trialStatus !== 'available' || loadingTrial}
                  onClick={handleFreeTrial}
                  className={cn(
                    "w-full lg:w-auto px-12 md:px-16 py-6 md:py-8 bg-cyan-500 text-black font-black rounded-2xl md:rounded-[32px] text-sm md:text-lg uppercase tracking-[0.2em] italic transition-all shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden group",
                    trialStatus === 'used' ? "opacity-50 cursor-not-allowed grayscale" : "hover:scale-[1.02] active:scale-95 hover:bg-cyan-400 shadow-xl shadow-cyan-500/10"
                  )}
                >
                  <span className="relative z-10 flex items-center justify-center gap-4">
                    {trialStatus === 'used' ? t('trialExpired') : loadingTrial ? t('activating') : t('activateTrial')}
                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </span>
                </button>
                {trialStatus === 'available' && !loadingTrial && (
                  <p className="text-center mt-4 text-[8px] font-black text-zinc-700 uppercase tracking-widest italic opacity-50">
                    NO STRINGS ATTACHED. JUST EXTRACT.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Showcase / Capabilities */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-30" />
        
        <div className="container mx-auto px-6 relative z-10">
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center max-w-5xl mx-auto"
           >
              <div className="flex flex-wrap justify-center gap-2 mb-12">
                 {['Google Maps', 'Websites', 'Facebook', 'Instagram', 'TikTok', 'Twitter/X', 'Snapchat', 'Telegram'].map((platform) => (
                   <span key={platform} className="px-4 py-1.5 bg-white/2 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-cyan-400 hover:border-cyan-500/20 transition-all cursor-default">
                      {platform}
                   </span>
                 ))}
              </div>

              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 mb-12 leading-none md:leading-[0.9]">
                 Extract high-quality leads<br className="hidden md:block" /> 
                 <span className="text-cyan-500">automatically</span> from everywhere.
              </h2>
              
              <p className="text-zinc-500 text-sm md:text-base font-medium max-w-2xl mx-auto italic mb-20">
                 Our hyper-optimized extraction engine scans billions of nodes across social networks and business directories to deliver raw, verified, and fresh data in seconds.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                 <FeatureBadge icon={Database} label="Mass Scrape" />
                 <FeatureBadge icon={Shield} label="Safe & Encrypted" />
                 <FeatureBadge icon={Terminal} label="Auto-Extraction" />
                 <FeatureBadge icon={Zap} label="Ultra-Fast" />
              </div>
           </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard 
            icon={<ShieldCheck className="text-cyan-400" />}
            title={language === 'en' ? 'Verified Data' : 'ভেরিফাইড ডাটা'}
            description={language === 'en' ? 'Every lead is checked to ensure it is real, active and helpful for your sales.' : 'প্রতিটি লিড সঠিকভাবে যাচাই করা হয় যাতে আপনি সঠিক এবং কার্যকর তথ্য পান।'}
          />
          <FeatureCard 
            icon={<Zap className="text-cyan-400" />}
            title={language === 'en' ? 'Lightning Fast' : 'অফুরন্ত গতি'}
            description={language === 'en' ? 'Extract thousands of businesses in minutes. Time is money, save both.' : 'কয়েক মিনিটে হাজার হাজার ব্যবসার তথ্য সংগ্রহ করুন। সময় এবং অর্থ উভয়ই বাঁচান।'}
          />
          <FeatureCard 
            icon={<Users className="text-cyan-400" />}
            title={language === 'en' ? 'Social Ready' : 'সোশ্যাল রেডি'}
            description={language === 'en' ? 'Works perfectly with Google Maps, LinkedIn, and all major social sites.' : 'গুগল ম্যাপস, লিঙ্কডইন এবং সব বড় সোশ্যাল সাইট থেকে ডাটা সংগ্রহের জন্য উপযুক্ত।'}
          />
        </div>
      </section>

      {/* Instruction Section */}
      <section id="instructions" className="container mx-auto px-4 md:px-6 py-16 md:py-24 border-t border-white/5">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <p className="text-cyan-500 text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black italic mb-4">{t('easySteps')}</p>
          <h2 className="text-4xl md:text-7xl font-black mb-3 md:mb-4 italic uppercase tracking-tighter text-white">{language === 'en' ? 'Quick Start' : 'দ্রুত শুরু করুন'}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
          {/* Tutorials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 md:gap-8">
            <div className="bg-black border border-white/5 rounded-[30px] md:rounded-[40px] overflow-hidden aspect-video relative group shadow-2xl">
              <iframe 
                className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="English Tutorial"
                allowFullScreen
              />
              <div className="absolute top-4 left-4 md:top-6 md:left-6 px-4 py-2 bg-cyan-500 text-black rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest italic">{language === 'en' ? 'English Guide' : 'ইংরেজি গাইড'}</div>
            </div>
            
            <div className="bg-black border border-white/5 rounded-[30px] md:rounded-[40px] overflow-hidden aspect-video relative group shadow-2xl">
              <iframe 
                className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="Bangla Tutorial"
                allowFullScreen
              />
              <div className="absolute top-4 left-4 md:top-6 md:left-6 px-4 py-2 bg-cyan-500 text-black rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest italic">{language === 'bn' ? 'বাংলা গাইড' : 'Bangla Guide'}</div>
            </div>
          </div>

          {/* Text Instructions */}
          <div className="flex flex-col justify-center space-y-12 md:space-y-16">
            <InstructionStep 
              num="01" 
              title={t('step1Title')} 
              desc={t('step1Desc')} 
            />
            <InstructionStep 
              num="02" 
              title={t('step2Title')} 
              desc={t('step2Desc')} 
            />
            <InstructionStep 
              num="03" 
              title={t('step3Title')} 
              desc={t('step3Desc')} 
            />
          </div>
        </div>
      </section>

      {/* Footer / Socials */}
      <footer className="container mx-auto px-4 md:px-6 py-16 md:py-24 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-500 rounded-sm rotate-45 flex items-center justify-center">
                <div className="w-4 h-4 md:w-5 md:h-5 bg-[#020202] rounded-sm" />
              </div>
              <span className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">
                <span className="text-white">UNREAL</span>{' '}
                <span className="text-cyan-500">LEADS</span>
              </span>
            </div>
            <p className="text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] italic leading-relaxed">{t('footerDesc')}</p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-6 md:gap-10">
            <SocialLink href="https://facebook.com" icon={<Facebook size={24} />} label={t('allPlatforms')} />
            <SocialLink href="https://youtube.com" icon={<Youtube size={24} />} label="YouTube" />
            <SocialLink href="https://instagram.com" icon={<Instagram size={24} />} label="Instagram" />
            <SocialLink href="https://twitter.com" icon={<Twitter size={24} />} label="X Site" />
          </div>
        </div>
        
        <div className="mt-16 md:mt-24 text-center">
          <p className="text-[8px] md:text-[9px] font-mono text-zinc-700 uppercase tracking-[0.4em] md:tracking-[0.5em] italic">© 2026 UNREAL STUDIO | ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
};

const InstructionStep = ({ num, title, desc }: any) => (
  <div className="flex gap-8 group">
    <div className="text-5xl font-black text-zinc-900 group-hover:text-cyan-500 transition-colors uppercase tracking-tighter italic">{num}</div>
    <div>
      <h4 className="text-xl font-black mb-2 italic uppercase tracking-tight">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

const SocialLink = ({ href, icon, label }: any) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-zinc-700 hover:text-cyan-400 transition-all hover:scale-110 flex flex-col items-center gap-2"
  >
    {icon}
    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{label}</span>
  </a>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-panel p-8 md:p-10 rounded-[30px] md:rounded-[40px] hover:border-cyan-500/30 transition-all group"
  >
    <div className="w-12 h-12 md:w-14 md:h-14 bg-cyan-500/5 border border-cyan-500/10 rounded-xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-cyan-500/10 transition-colors">
      {icon}
    </div>
    <h4 className="text-lg md:text-xl font-black mb-3 md:mb-4 italic uppercase tracking-tight">{title}</h4>
    <p className="text-zinc-500 leading-relaxed text-xs md:text-sm font-medium">
      {description}
    </p>
  </motion.div>
);

const StatItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-2xl font-bold tracking-tighter mb-1">{value}</span>
    <span className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</span>
  </div>
);

export default Home;
