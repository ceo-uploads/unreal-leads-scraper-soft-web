import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Shield, Clock, CreditCard, Banknote, Bitcoin, Smartphone, Send, ArrowRight, Video, Zap, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { ref, get, set, push } from 'firebase/database';
import { rtdb } from '../services/firebase';
import { SoftwarePackage, PaymentRequest } from '../types';
import { cn } from '../lib/utils';

const packages: SoftwarePackage[] = [
  { id: '1w', name: { en: '1 Week', bn: '১ সপ্তাহ' }, duration: '1 Week', priceUSD: 10, priceBDT: 1200, features: ['Full Scrapping', 'Realtime Verification', 'All Social Platforms'] },
  { id: '3w', name: { en: '3 Weeks', bn: '৩ সপ্তাহ' }, duration: '3 Weeks', priceUSD: 20, priceBDT: 2400, features: ['All 1 Week features', 'Identity Mapping', 'Advanced Filtering'] },
  { id: '1m', name: { en: '1 Month', bn: '১ মাস' }, duration: '1 Month', priceUSD: 25, priceBDT: 3000, features: ['All 3 Weeks features', 'Big Data Ready', 'Priority Support'] },
  { id: '2m', name: { en: '2 Months', bn: '২ মাস' }, duration: '2 Months', priceUSD: 40, priceBDT: 4800, features: ['Full Suite Access', 'Database Exports', 'Future Updates'] },
  { id: '3m', name: { en: '3 Months', bn: '৩ মাস' }, duration: '3 Months', priceUSD: 60, priceBDT: 7200, features: ['Extended Support', 'Custom Delivery', 'Bulk Verification'] },
  { id: '6m', name: { en: '6 Months', bn: '৬ মাস' }, duration: '6 Months', priceUSD: 100, priceBDT: 12000, features: ['Enterprise Access', 'Multi-Node Support', 'Priority Dev Access'] },
  { id: '1y', name: { en: '1 Year', bn: '১ বছর' }, duration: '1 Year', priceUSD: 160, priceBDT: 19200, features: ['Complete Sovereignty', 'Lifetime Support Base', 'All Premium Modules'] },
];

const Pricing = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState<SoftwarePackage | null>(null);
  const [trialStatus, setTrialStatus] = useState<'available' | 'used' | 'checking'>('checking');
  const [loadingTrial, setLoadingTrial] = useState(false);

  const packages: SoftwarePackage[] = [
    { 
      id: '1w', 
      name: { en: '1 Week', bn: '১ সপ্তাহ' }, 
      duration: language === 'bn' ? '১ সপ্তাহ' : '1 Week', 
      priceUSD: 10, 
      priceBDT: 1200, 
      features: [
        'G-Map + Website Scraper', 
        'FB/Insta/TT Vectors',
        t('verificationDesc'), 
        '24/7 Access Nodes'
      ] 
    },
    { 
      id: '3w', 
      name: { en: '3 Weeks', bn: '৩ সপ্তাহ' }, 
      duration: language === 'bn' ? '৩ সপ্তাহ' : '3 Weeks', 
      priceUSD: 20, 
      priceBDT: 2400, 
      features: [
        'G-Map + Social Suite', 
        'X/Snap/Tele Inbuilt',
        '4M+ USA Leads Access',
        t('verificationDesc'),
        t('supportDesc')
      ] 
    },
    { 
      id: '1m', 
      name: { en: '1 Month', bn: '১ মাস' }, 
      duration: language === 'bn' ? '১ মাস' : '1 Month', 
      priceUSD: 25, 
      priceBDT: 3000, 
      features: [
        'Full Enterprise Suite', 
        'All 10+ Platform Vectors', 
        '4M+ Verified Leads DB',
        t('verificationDesc'), 
        t('supportDesc')
      ] 
    },
    { 
      id: '1y', 
      name: { en: '1 Year', bn: '১ বছর' }, 
      duration: language === 'bn' ? '১ বছর' : '1 Year', 
      priceUSD: 160, 
      priceBDT: 19200, 
      features: [
        'Infinite Extraction Nodes', 
        'Global Realtime Sync', 
        'Full 4M+ Leads Suite',
        'Advanced X/Twitter Scraper',
        t('verificationDesc'), 
        t('supportDesc')
      ] 
    },
  ];

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
      showNotification(language === 'bn' ? 'ট্রায়াল চালু করতে সমস্যা হয়েছে' : 'Error activating trial', 'error');
    }
    setLoadingTrial(false);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-32">
      <div className="flex flex-col items-center text-center mb-12 md:mb-20">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-6 italic"
        >
          {t('paidPackages')}
        </motion.div>
        <h1 className="text-5xl md:text-6xl lg:text-8xl font-black italic uppercase tracking-tighter mb-4 md:mb-6 leading-none">
          {t('pricingTitle')}
        </h1>
        <p className="max-w-2xl text-zinc-500 text-base md:text-lg font-medium px-4">
          {t('pricingSubtitle')}
        </p>
      </div>

      {/* Free Trial Banner */}
      <motion.div 
        layout
        className="mb-12 md:mb-20 p-8 md:p-16 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-[30px] md:rounded-[50px] text-black shadow-[0_0_80px_rgba(6,182,212,0.15)] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 hidden lg:block group-hover:scale-110 transition-transform duration-1000">
          <Zap size={240} />
        </div>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 relative z-10 text-center lg:text-left">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/10 rounded-full text-[9px] font-black uppercase tracking-widest italic text-black/60 mb-4">
              <Zap size={12} /> Free Trial
            </div>
            <h3 className="text-4xl md:text-6xl font-black italic uppercase mb-4 leading-none">{t('getFreeTrial')}</h3>
            <p className="text-black/80 font-bold leading-relaxed max-w-xl text-base md:text-xl italic">
              {t('freeTrialDescription')}
            </p>
          </div>
          <div className="w-full lg:w-auto">
            <button 
              disabled={trialStatus !== 'available' || loadingTrial}
              onClick={handleFreeTrial}
              className={cn(
                "w-full lg:w-auto px-12 md:px-16 py-6 md:py-8 bg-black text-white font-black rounded-2xl md:rounded-[32px] transition-all shadow-2xl uppercase text-sm md:text-lg tracking-widest italic relative overflow-hidden",
                trialStatus === 'used' ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
              )}
            >
              {trialStatus === 'used' ? t('trialExpired') : loadingTrial ? t('activating') : t('activateTrial')}
            </button>
            <p className="text-center mt-4 text-[8px] md:text-[9px] font-black text-black/40 uppercase tracking-widest italic">{language === 'bn' ? 'ভেরিফিকেশন পিন প্রয়োজন (২৪ ঘণ্টা)' : 'VERIFICATION PIN REQUIRED (24H)'}</p>
          </div>
        </div>
      </motion.div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {packages.map((pkg) => (
          <motion.div
            key={pkg.id}
            whileHover={{ y: -5 }}
            className="p-8 md:p-10 glass-panel rounded-[30px] md:rounded-[40px] flex flex-col hover:border-cyan-500/50 transition-all group"
          >
            <div className="mb-8 md:mb-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight">{pkg.name[language]}</h3>
                <div className="bg-cyan-500/10 text-cyan-500 text-[9px] px-3 py-1 rounded-full border border-cyan-500/20 font-black tracking-widest uppercase">
                  {pkg.duration}
                </div>
              </div>
              
              <div className="flex items-baseline gap-1">
                {language === 'bn' ? (
                  <>
                    <span className="text-4xl md:text-5xl font-black tracking-tighter">{pkg.priceBDT}</span>
                    <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">BDT</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl md:text-5xl font-black tracking-tighter">${pkg.priceUSD}</span>
                    <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">USD</span>
                  </>
                )}
              </div>
              <div className="text-cyan-500/60 font-mono text-xs mt-2 italic">
                {language === 'bn' ? `≈ $${pkg.priceUSD} USD` : `≈ ${pkg.priceBDT} BDT`}
              </div>
            </div>

            <ul className="mb-8 md:mb-10 space-y-3 md:y-4 flex-1">
              {pkg.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-[10px] md:text-[11px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/30" />
                  {f}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => setShowPayment(pkg)}
              className="w-full py-4 md:py-5 bg-white/5 border border-white/5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] group-hover:bg-cyan-500 group-hover:text-black transition-all group-hover:cyan-glow italic"
            >
              {t('purchaseNow')}
            </button>
          </motion.div>
        ))}

        {/* Lifetime Package */}
        <div className="p-8 md:p-10 bg-[#020202] border border-zinc-900 rounded-[30px] md:rounded-[40px] flex flex-col justify-center items-center text-center">
          <Shield size={40} className="text-zinc-800 mb-6 md:mb-8" />
          <h3 className="text-xl md:text-2xl font-black italic uppercase mb-2 tracking-tight">{t('lifetimeAccess')}</h3>
          <p className="text-zinc-600 text-[10px] md:text-xs font-medium mb-8 md:mb-10">{t('enterpriseDesc')}</p>
          <a href="https://wa.me/8801333294862" className="w-full py-4 md:py-5 bg-zinc-900 border border-white/5 text-zinc-400 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all italic">
            {t('contactAgent')}
          </a>
        </div>
      </div>

      {/* Info Panel */}
      <div className="mt-16 md:mt-20 glass-panel p-6 md:p-10 rounded-[30px] md:rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 border-cyan-500/10">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-cyan-500/5 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
            <Globe size={28} />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black italic uppercase">{t('globalNetwork')}</h3>
            <p className="text-zinc-500 text-xs md:text-sm font-medium">{t('globalNetworkDesc')}</p>
          </div>
        </div>
        <div className="flex gap-8 md:gap-4 w-full md:w-auto justify-center md:justify-end border-t border-white/5 pt-6 md:pt-0 md:border-0">
          <div className="text-right">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">{t('extractionNodes')}</p>
            <p className="text-2xl md:text-3xl font-mono text-cyan-500 tracking-tighter">142,091</p>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <div className="text-right">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">{t('totalEntities')}</p>
            <p className="text-2xl md:text-3xl font-mono text-cyan-500 tracking-tighter">40.2M</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <PaymentModal 
            package={showPayment} 
            onClose={() => setShowPayment(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const PaymentModal = ({ package: pkg, onClose }: { package: SoftwarePackage, onClose: () => void }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { showNotification } = useNotification();
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'nsave' | 'gpay' | 'binance'>('bkash');
  const [formData, setFormData] = useState({
    accountNumber: '',
    trxId: '',
    deliveryContact: user?.email || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return showNotification(t('login'), 'warning');
    if (!formData.accountNumber || !formData.trxId || !formData.deliveryContact) {
      showNotification(language === 'bn' ? 'সবগুলো ঘর পূরণ করুন' : 'Please fill all fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const request: PaymentRequest = {
        id: Math.random().toString(36).slice(2, 9),
        userId: user.uid,
        userEmail: user.email!,
        packageId: pkg.id,
        method,
        accountNumber: formData.accountNumber,
        trxId: formData.trxId,
        amount: pkg.priceBDT,
        currency: (method === 'binance' || method === 'gpay') ? 'USD' : 'BDT',
        status: 'pending',
        createdAt: Date.now(),
        deliveryContact: formData.deliveryContact
      };

      await push(ref(rtdb, 'paymentRequests'), request);
      showNotification(language === 'bn' ? 'পেমেন্ট রিকোয়েস্ট পাঠানো হয়েছে! ২৪ ঘণ্টার মধ্যে আপনার পণ্য পৌঁছে যাবে।' : 'Payment request submitted! Your product will be delivered within 24 hours.', 'success');
      onClose();
    } catch (e) {
      console.error(e);
      showNotification('Error submitting payment', 'error');
    }
    setSubmitting(false);
  };

  const getInstructions = () => {
    switch (method) {
      case 'bkash': return { num: '01XXXXXXXXX', type: 'bKash', msg: language === 'bn' ? 'শুধুমাত্র সেন্ড মানি করুন' : 'Only Send Money' };
      case 'nagad': return { num: '01XXXXXXXXX', type: 'Nagad', msg: language === 'bn' ? 'শুধুমাত্র সেন্ড মানি করুন' : 'Only Send Money' };
      case 'nsave': return { num: '@unreal_ntag', type: 'Nsave', msg: 'Standard Delivery' };
      case 'gpay': return { num: 'gpay_id', type: 'Google Pay', msg: 'International Payment' };
      case 'binance': return { num: 'BEP20_ADDRESS_XYZ', type: 'USDT', msg: 'Crypto Payment' };
    }
  };

  const instruction = getInstructions();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#020202]/95 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl glass-panel rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl border-white/5"
      >
        <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">
          {/* Method Selection */}
          <div className="w-full md:w-64 bg-black/50 p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/5 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-hide">
            <h4 className="hidden md:block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-8 italic">{t('paymentMethod')}</h4>
            {[
              { id: 'bkash', icon: Smartphone, label: 'bKash' },
              { id: 'nagad', icon: Banknote, label: 'Nagad' },
              { id: 'nsave', icon: CreditCard, label: 'Nsave' },
              { id: 'gpay', icon: CreditCard, label: 'GPay' },
              { id: 'binance', icon: Bitcoin, label: 'Binance' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id as any)}
                className={cn(
                  "flex-shrink-0 md:flex-shrink flex items-center gap-3 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl transition-all text-[10px] md:text-xs uppercase tracking-widest italic whitespace-nowrap",
                  method === m.id ? "bg-cyan-500 text-black font-black cyan-glow" : "text-zinc-600 hover:bg-white/5"
                )}
              >
                <m.icon size={16} />
                <span className="hidden md:inline">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Payment Form */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-black/20">
            <div className="flex justify-between items-start mb-8 md:mb-10">
              <div>
                <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight mb-1">{t('checkoutTitle')}</h3>
                <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-widest opacity-60">
                  {pkg.name[language]} - {language === 'bn' ? `${pkg.priceBDT} BDT` : `$${pkg.priceUSD}`}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Account Display */}
            <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-[24px] md:rounded-[32px] p-6 md:p-8 mb-8 md:mb-10 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest italic">{instruction.type} TERMINAL</span>
              </div>
              <div className="flex items-center justify-between gap-4 relative z-10">
                <code className="text-lg md:text-2xl font-mono text-white tracking-widest italic truncate">{instruction.num}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(instruction.num);
                    showNotification(language === 'bn' ? 'কপি হয়েছে!' : 'Copied!', 'success');
                  }}
                  className="p-3 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 transition-all cyan-glow flex-shrink-0"
                >
                  <CreditCard size={18} />
                </button>
              </div>
              <p className="mt-4 text-[9px] md:text-[10px] text-cyan-500/40 font-bold italic tracking-wide relative z-10">
                * {instruction.msg}.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <div>
                <label className="block text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2 ml-2 italic">{t('accountNumber')}</label>
                <input 
                  type="text" 
                  value={formData.accountNumber}
                  onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl px-5 py-4 md:py-5 outline-none focus:border-cyan-500/50 transition-all text-xs md:text-sm font-mono tracking-widest"
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2 ml-2 italic">{t('trxId')}</label>
                <input 
                  type="text" 
                  value={formData.trxId}
                  onChange={e => setFormData({...formData, trxId: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl px-5 py-4 md:py-5 outline-none focus:border-cyan-500/50 transition-all text-xs md:text-sm font-mono tracking-widest uppercase"
                  placeholder="TRX123456"
                />
              </div>
              <div>
                <label className="block text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2 ml-2 italic">{t('deliveryContact')}</label>
                <input 
                  type="text" 
                  value={formData.deliveryContact}
                  onChange={e => setFormData({...formData, deliveryContact: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl px-5 py-4 md:py-5 outline-none focus:border-cyan-500/50 transition-all text-xs md:text-sm font-mono tracking-widest"
                  placeholder="WHATSAPP_OR_EMAIL"
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-5 md:py-6 bg-cyan-500 text-black font-black rounded-2xl md:rounded-[24px] mt-4 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 uppercase text-[10px] md:text-xs tracking-widest italic"
              >
                {submitting ? t('processing') : t('submitRequest')}
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Pricing;
