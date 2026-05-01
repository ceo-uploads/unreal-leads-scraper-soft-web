import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, History, Package, LogOut, Shield, ExternalLink, Calendar, Clock, Download, CreditCard, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../services/firebase';
import { ActiveSubscription } from '../types';
import { cn } from '../lib/utils';

const Profile = () => {
  const { user, profile, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'logs'>('profile');
  const [subscriptions, setSubscriptions] = useState<ActiveSubscription[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const subRef = ref(rtdb, `subscriptions/${user.uid}`);
      const unsubSubs = onValue(subRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSubscriptions(Object.keys(data).map(key => ({ ...data[key], id: key })));
        }
      });

      const payRef = ref(rtdb, 'paymentRequests');
      const unsubPays = onValue(payRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const userPays = Object.keys(data)
            .map(key => ({ ...data[key], id: key }))
            .filter(p => p.userId === user.uid);
          setPayments(userPays);
        }
      });

      return () => {
        unsubSubs();
        unsubPays();
      };
    }
  }, [user]);

  const activeSub = subscriptions.find(s => s.status === 'active' || s.endDate > Date.now());

  // Unified logs
  const logs = [
    ...subscriptions.map(s => ({
      id: s.id,
      date: new Date(s.startDate).toLocaleDateString(),
      type: 'SUBSCRIPTION',
      title: `License: ${s.packageId.toUpperCase()}`,
      detail: `Expiry: ${new Date(s.endDate).toLocaleDateString()}`,
      status: s.endDate > Date.now() ? 'ACTIVE' : 'EXPIRED',
      rawDate: s.startDate
    })),
    ...payments.map(p => ({
      id: p.id,
      date: new Date(p.timestamp || Date.now()).toLocaleDateString(),
      type: 'PAYMENT',
      title: `Top-up: ${p.packageId.toUpperCase()}`,
      detail: `Trx: ${p.trxId.slice(0, 8)}...`,
      status: p.status.toUpperCase(),
      rawDate: p.timestamp || 0
    }))
  ].sort((a, b) => b.rawDate - a.rawDate);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRemainingTime = (endTime: number) => {
    const diff = endTime - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-32">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div className="w-full lg:w-80 glass-panel rounded-[30px] md:rounded-[40px] p-6 md:p-8 border-cyan-500/10">
          <div className="flex flex-col items-center text-center mb-8 md:mb-12">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-cyan-500 rounded-sm rotate-45 flex items-center justify-center text-black shadow-2xl mb-6 md:mb-10 cyan-glow">
              <User size={32} className="-rotate-45 md:scale-125" />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-2">{profile?.displayName || 'User'}</h3>
            <p className="text-zinc-600 text-[10px] md:text-xs font-mono uppercase tracking-widest">{profile?.email || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 md:gap-3">
            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
                "flex items-center justify-center lg:justify-start gap-3 px-4 md:px-6 py-4 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] italic transition-all active:scale-95",
                activeTab === 'profile' ? "bg-cyan-500 text-black cyan-glow" : "text-zinc-600 hover:bg-white/5"
              )}
            >
              <User size={16} />
              <span className="hidden sm:inline">{t('profile')}</span>
              <span className="sm:hidden">ME</span>
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={cn(
                "flex items-center justify-center lg:justify-start gap-3 px-4 md:px-6 py-4 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] italic transition-all active:scale-95",
                activeTab === 'logs' ? "bg-cyan-500 text-black cyan-glow" : "text-zinc-600 hover:bg-white/5"
              )}
            >
              <History size={16} />
              <span className="hidden sm:inline">{t('extractionLogs')}</span>
              <span className="sm:hidden">{t('logs')}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="col-span-2 lg:col-auto flex items-center justify-center lg:justify-start gap-3 px-4 md:px-6 py-4 rounded-xl md:rounded-2xl text-red-500/60 hover:bg-red-500/10 hover:text-red-400 transition-all font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] italic lg:mt-6"
            >
              <LogOut size={16} />
              {t('logout')}
            </button>
          </div>

          <div className="hidden lg:block mt-8 md:mt-12 p-5 md:p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-[24px] md:rounded-3xl text-center">
            <p className="text-[9px] font-black text-cyan-500/50 uppercase tracking-[0.3em] mb-2 italic">{t('status')}</p>
            <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-tighter">Verified Member [OK]</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 w-full space-y-6 md:space-y-8">
          {activeTab === 'profile' ? (
            <>
              {/* Active Products List */}
              <div className="space-y-6">
                {subscriptions.filter(s => s.status === 'active' && s.endDate > Date.now()).length > 0 ? (
                  subscriptions.filter(s => s.status === 'active' && s.endDate > Date.now()).map((sub) => (
                    <motion.div 
                      key={sub.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-8 md:p-10 bg-gradient-to-br from-[#080a0c] to-black border border-white/10 rounded-[30px] md:rounded-[40px] relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-10 opacity-10 text-cyan-500 rotate-12 hidden md:block">
                        <Package size={140} />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-4 mb-8 md:mb-10">
                          <div className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[9px] font-black tracking-[0.3em] uppercase italic">
                            {t('activeLicense')}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">ID: {sub.id.slice(-8).toUpperCase()}</div>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black italic uppercase mb-8 md:mb-10 tracking-tight leading-tight">
                          <span className="text-white">Unreal</span>{' '}
                          <span className="text-cyan-500">Leads</span> - {sub.packageId.toUpperCase()}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                          <StatusItem icon={Clock} label={t('timeLeft')} value={getRemainingTime(sub.endDate)} />
                          <StatusItem icon={Shield} label={t('userId')} value={sub.softwareUser} copyable />
                          <StatusItem icon={Shield} label={t('accessKey')} value={sub.softwarePass} copyable />
                          <StatusItem icon={Calendar} label={t('expiry')} value={new Date(sub.endDate).toLocaleDateString()} />
                        </div>

                        <div className="mt-10 md:mt-12 flex flex-col sm:flex-row flex-wrap gap-4 items-center">
                          <a 
                            href={sub.packageId === 'free_trial' 
                              ? "https://drive.google.com/drive/folders/1r3Z5kFUSGdjpYveJOQFBOywyVtN8AdZL?usp=sharing" 
                              : "https://drive.google.com/drive/folders/1H6L6OBRpfNxgKofT1IaOrDMKfU-UX2Jc?usp=sharing"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto"
                          >
                            <button className="w-full px-10 py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all uppercase text-[10px] tracking-widest italic">
                              <Download size={18} />
                              {t('download')}
                            </button>
                          </a>
                          <div className="px-5 py-2 bg-white/2 border border-white/5 rounded-xl flex items-center gap-3">
                             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                             <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">
                                {language === 'en' ? 'Windows Desktop App (EXE) : and explore' : 'উইন্ডোজ ডেক্সটপ অ্যাপ্লিকেশন (EXE)'}
                             </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-12 md:p-20 text-center glass-panel border-dashed border-white/10 rounded-[30px] md:rounded-[40px]">
                    <Package size={50} className="mx-auto text-zinc-800 mb-6" />
                    <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-zinc-600 mb-2">{t('noLicense')}</h3>
                    <p className="text-zinc-700 text-xs md:text-sm font-medium mb-8 md:mb-10 max-w-sm mx-auto">{t('purchaseMessage')}</p>
                    <button 
                      onClick={() => navigate('/pricing')}
                      className="w-full sm:w-auto px-12 py-5 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase text-[10px] tracking-widest italic cyan-glow"
                    >
                      {t('purchaseNow')}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* History Tab */
            <div className="p-8 md:p-10 glass-panel rounded-[30px] md:rounded-[40px] border-white/5 border-cyan-500/5">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
                  <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">{language === 'en' ? 'Transaction history' : 'পেমেন্ট ও কাজের হিস্টোরি'}</h3>
                  <span className="text-[9px] font-mono text-cyan-500/60 bg-cyan-500/5 border border-cyan-500/10 px-4 py-1.5 rounded-full uppercase tracking-[0.3em] font-black italic text-center">LIVE_SYNC</span>
               </div>
              <div className="space-y-4 md:space-y-6">
                {logs.length > 0 ? logs.map(log => (
                  <HistoryItem 
                    key={log.id}
                    date={log.date} 
                    task={log.title} 
                    result={log.detail} 
                    status={log.status} 
                    type={log.type}
                  />
                )) : (
                  <p className="text-center text-zinc-600 font-mono text-xs italic uppercase tracking-widest py-10">No history payloads found</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusItem = ({ icon: Icon, label, value, copyable }: any) => {
  const { showNotification } = useNotification();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    showNotification('Credential copied to buffer', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 group p-6 bg-white/2 border border-white/5 rounded-3xl hover:border-cyan-500/20 transition-all relative">
      <div className="flex items-center gap-2 text-zinc-600 group-hover:text-cyan-500 transition-colors">
        <Icon size={14} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{label}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm md:text-lg font-bold font-mono text-white italic truncate">{value}</p>
        {copyable && (
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-white/5 rounded-lg text-zinc-600 hover:text-cyan-400 transition-all"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
};

const HistoryItem = ({ date, task, result, status, type }: any) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/2 border border-white/5 rounded-3xl hover:border-cyan-500/20 transition-all group">
    <div className="flex items-center gap-6 mb-4 md:mb-0">
      <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-cyan-500/30 transition-all">
        {type === 'PAYMENT' ? (
          <CreditCard size={20} className="text-zinc-600 group-hover:text-cyan-400" />
        ) : (
          <Clock size={20} className="text-zinc-600 group-hover:text-cyan-400" />
        )}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
             "text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest",
             type === 'PAYMENT' ? "bg-cyan-500/10 text-cyan-500" : "bg-purple-500/10 text-purple-500"
          )}>
            {type}
          </span>
          <h4 className="text-sm font-black italic uppercase tracking-tight text-white">{task}</h4>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
          <span>{date}</span>
          <span className="w-1 h-1 bg-zinc-800 rounded-full" />
          <span className="text-zinc-400 uppercase italic tracking-widest">{result}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3 self-end md:self-center">
      <div className={cn(
        "w-1.5 h-1.5 rounded-full animate-pulse",
        status === 'OK' || status === 'ACTIVE' || status === 'APPROVED' ? "bg-cyan-500" : 
        status === 'REJECTED' ? "bg-red-500" : "bg-amber-500"
      )} />
      <span className={cn(
        "text-[9px] font-mono uppercase tracking-widest font-black italic",
        status === 'OK' || status === 'ACTIVE' || status === 'APPROVED' ? "text-cyan-400" : 
        status === 'REJECTED' ? "text-red-500" : "text-amber-500"
      )}>{status}</span>
    </div>
  </div>
);

export default Profile;
