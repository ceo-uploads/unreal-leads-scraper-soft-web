import React from 'react';
import { motion } from 'motion/react';
import { Shield, ExternalLink, Download, Search, Database, Lock, Terminal, Globe, Users, Zap, Mail, Map, Smartphone, MessageSquare, Fingerprint } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Vault = () => {
  const { t, language } = useLanguage();

  const vaultItems = [
    { 
      icon: Mail, 
      title: language === 'en' ? "Verified Emails" : "ভিেরিফাইড ইমেইল", 
      value: "48.2M", 
      desc: language === 'en' ? "Global verified business emails with high deliverability." : "প্রচুর লিডসহ গ্লোবাল ভেরিফাইড বিজনেস ইমেইল ডাটাবেস।",
      trend: "+142k Active"
    },
    { 
      icon: Users, 
      title: language === 'en' ? "Business Leads" : "বিজনেস লিডস", 
      value: "15.8M", 
      desc: language === 'en' ? "Cross-platform data mapping for high-intent business targets." : "বিভিন্ন প্ল্যাটফর্ম থেকে সংগৃহীত হাই-কোয়ালিটি বিজনেস ডাটা।",
      trend: "+8.4k Sync"
    },
    { 
      icon: Smartphone, 
      title: language === 'en' ? "Mobile Numbers" : "মোবাইল নম্বর", 
      value: "22.5M", 
      desc: language === 'en' ? "Direct contact channels with localized verification nodes." : "সরাসরি যোগাযোগের জন্য লোকাল ভেরিফাইড মোবাইল নম্বর।",
      trend: "+92k Ready"
    }
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-32">
      <div className="flex flex-col items-center text-center mb-16 md:mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-500 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mb-6 italic">
          <Lock size={12} fill="currentColor" />
          {t('identityVerification')}
        </div>
        <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-6 leading-none">
          {language === 'en' ? 'Data Vault' : 'ডাটা ভল্ট'}
        </h1>
        <p className="max-w-xl text-zinc-500 text-base md:text-lg font-medium px-4">
          {language === 'en' ? 'Encrypted lead repositories and live identity mapping streams.' : 'এনক্রিপ্টেড লিড রিপোজিটরি এবং লাইভ ডাটা ম্যাপিং সিস্টেম।'}
        </p>
      </div>

      {/* Vault Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
        {vaultItems.map((item, i) => (
          <VaultItem key={i} {...item} />
        ))}
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-8 md:p-10 glass-panel rounded-[30px] md:rounded-[40px] border-cyan-500/5 backdrop-blur-3xl"
        >
          <div className="flex items-center gap-6 mb-8 md:mb-10">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-cyan-500 rounded-sm rotate-45 flex items-center justify-center text-black shadow-2xl cyan-glow">
              <Database size={28} className="-rotate-45" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight">{language === 'en' ? 'Extraction Map' : 'ইন্টেলিজেন্স ম্যাপ'}</h3>
              <p className="text-[9px] md:text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">{language === 'en' ? 'Sync across data vectors' : 'ডাটা ভেক্টরের সাথে সিঙ্ক'}</p>
            </div>
          </div>

          <div className="space-y-5 md:space-y-6">
            <EntityItem label={language === 'en' ? "Business Name" : "ব্যবসার নাম"} count="100%" />
            <EntityItem label={language === 'en' ? "Location Details" : "অবস্থান ডিটেইলস"} count="100%" />
            <EntityItem label={language === 'en' ? "Email Mapping" : "ইমেইল ম্যাপিং"} count="84%" />
            <EntityItem label={language === 'en' ? "Owner Info" : "মালিকের তথ্য"} count="62%" />
            <EntityItem label={language === 'en' ? "Revenue Sync" : "রাজস্ব সিঙ্ক"} count="45%" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-8 md:p-10 bg-[#080a0c] border border-white/5 rounded-[30px] md:rounded-[40px] relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 md:p-10 opacity-5 text-cyan-500 italic font-black text-6xl group-hover:scale-110 transition-transform hidden md:block">SECURE</div>
          
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight mb-6 md:mb-8 flex items-center gap-4 text-white">
              <Fingerprint className="text-cyan-500" />
              {language === 'en' ? 'Deep Security' : 'ডাটা সিকিউরিটি'}
            </h3>
            
            <p className="text-zinc-500 text-sm md:text-base font-medium leading-relaxed mb-10 md:mb-12 italic">
              {language === 'en' ? 'Our unique system ensures zero duplication. Every lead is verified against 40M+ unique historical records for accuracy.' : 'আমাদের ইউনিক সিস্টেম জিরো ডুপ্লিকেশন নিশ্চিত করে। নির্ভুলতার জন্য প্রতিটি লিড ৪০ মিলিয়নের বেশি রেকর্ডের সাথে যাচাই করা হয়।'}
            </p>

            <div className="mt-auto">
              <div className="mb-6 md:mb-8 p-5 md:p-6 bg-white/2 rounded-[24px] md:rounded-[32px] border border-white/5 backdrop-blur-md">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[8px] md:text-[9px] font-black uppercase text-zinc-600 tracking-widest italic">{language === 'en' ? 'Accuracy Rate' : 'নির্ভুলতার হার'}</span>
                  <span className="text-[9px] md:text-[10px] font-mono font-black text-cyan-400 italic">98.4%</span>
                </div>
                <div className="w-full bg-zinc-900/50 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '98.4%' }}
                    transition={{ duration: 1.5, ease: 'circOut' }}
                    className="bg-cyan-500 h-full cyan-glow" 
                  />
                </div>
              </div>
              <button 
                disabled
                className="w-full py-4 md:py-5 bg-zinc-900 border border-white/10 text-zinc-600 font-black rounded-xl md:rounded-2xl cursor-not-allowed text-[10px] uppercase tracking-[0.2em] italic"
              >
                {language === 'en' ? 'SECURE CONNECTION' : 'সুরক্ষিত কানেকশন'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Kernel Feed */}
      <div className="mt-10 md:mt-12 p-8 md:p-10 glass-panel border-cyan-500/10 rounded-[30px] md:rounded-[40px]">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div className="flex items-center gap-4">
            <Terminal size={24} className="text-cyan-500" />
            <span className="font-black italic text-xs md:text-sm uppercase tracking-[0.2em] text-white">{language === 'en' ? 'Live Extraction Feed' : 'লাইভ এক্সট্রাকশন ফিড'}</span>
          </div>
          <div className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-[8px] md:text-[9px] font-black tracking-widest italic flex items-center gap-2 md:gap-3 border border-cyan-500/20">
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
            {language === 'en' ? 'LIVE' : 'লাইভ'}
          </div>
        </div>
        <div className="space-y-3 font-mono text-[9px] md:text-[10px] text-zinc-600 h-40 md:h-48 overflow-hidden relative">
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#020202] to-transparent pointer-events-none" />
          <p className="tracking-tighter opacity-60">{`[04:22:11] Scanning: "New York" -> (142 sources)`}</p>
          <p className="text-cyan-500/40 tracking-tighter italic font-bold">[04:22:12] IdentMap: Profile sync successful</p>
          <p className="tracking-tighter opacity-60">{`[04:22:14] Verify: office@dentistny.com -> OK`}</p>
          <p className="tracking-tighter opacity-60">[04:22:15] Extraction stored in Secure Vault</p>
          <p className="tracking-tighter opacity-60">[04:22:18] Global search detected: "Real Estate CA"</p>
          <p className="text-blue-500/40 tracking-tighter italic font-bold">[04:22:20] Indexing: 4,201 new leads mapped</p>
          <p className="tracking-tighter opacity-60">{`[04:22:22] Scanning: "London" -> (89 sources)`}</p>
          <p className="tracking-tighter opacity-60">{`[04:22:25] Verify: hello@shopldn.co.uk -> OK`}</p>
          <p className="tracking-tighter opacity-60">[04:22:28] Task: Extraction cycle completed.</p>
        </div>
      </div>
    </div>
  );
};

const VaultItem = ({ icon: Icon, title, value, desc, trend }: any) => (
  <div className="p-6 md:p-10 glass-panel border-white/5 rounded-[24px] md:rounded-[40px] hover:border-cyan-500/40 transition-all group backdrop-blur-3xl relative overflow-hidden">
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform hidden md:block">
       <Icon size={80} />
    </div>
    <div className="w-10 h-10 md:w-14 md:h-14 bg-white/2 border border-white/10 group-hover:bg-cyan-500 transition-all group-hover:text-black rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-10 text-zinc-600 group-hover:cyan-glow">
      <Icon size={20} className="md:w-6 md:h-6" />
    </div>
    <p className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1 md:mb-2 italic truncate">{title}</p>
    <div className="flex items-baseline gap-2 md:gap-3 mb-3 md:mb-4">
      <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter text-white">{value}</h3>
      <span className="text-[7px] md:text-[9px] font-mono font-black text-cyan-500/70 uppercase tracking-widest italic">{trend}</span>
    </div>
    <p className="text-[10px] md:text-sm text-zinc-500 font-medium leading-relaxed italic line-clamp-2 md:line-clamp-none">{desc}</p>
  </div>
);

const EntityItem = ({ label, count }: any) => (
  <div className="flex items-center justify-between py-3 md:py-4 border-b border-white/5 last:border-0 group">
    <span className="text-xs md:text-sm font-medium text-zinc-500 group-hover:text-zinc-200 transition-colors uppercase tracking-tight italic">{label}</span>
    <span className="text-xs md:text-sm font-mono font-bold text-cyan-500 tracking-widest">{count}</span>
  </div>
);

export default Vault;
