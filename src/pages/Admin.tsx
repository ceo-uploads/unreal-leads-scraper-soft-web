import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CreditCard, 
  Settings, 
  BarChart3, 
  ShieldCheck, 
  Search, 
  CheckCircle, 
  XCircle,
  Database,
  Lock,
  ArrowRight,
  Clock,
  Terminal,
  Filter,
  Activity,
  AlertCircle,
  LogOut,
  Key,
  Check,
  X
} from 'lucide-react';
import { rtdb } from '../services/firebase';
import { ref, onValue, update, push, get } from 'firebase/database';
import { PaymentRequest, SoftwarePackage } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const Admin = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [softwareUsers, setSoftwareUsers] = useState<any[]>([]);
  const [showManualModal, setShowManualModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'payments' | 'users' | 'software' | 'licenses' | 'history'>('stats');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      const stored = localStorage.getItem('admin_session');
      if (stored) setIsAdminAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAdminAuthenticated) {
      const paymentsRef = ref(rtdb, 'paymentRequests');
      onValue(paymentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPayments(Object.keys(data).map(key => ({ ...data[key], id: key } as PaymentRequest)));
        }
      });

      const usersRef = ref(rtdb, 'users');
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUsers(Object.keys(data).map(key => ({ ...data[key], id: key })));
        }
      });

      const softwareUsersRef = ref(rtdb, 'softwareUsers');
      onValue(softwareUsersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSoftwareUsers(Object.keys(data).map(key => ({ ...data[key], id: key })));
        }
      });
    }
  }, [isAdminAuthenticated]);

  const handleAdminLogin = () => {
    if (adminPass === '366720') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('admin_session', 'true');
      showNotification('Admin Access Authorized', 'success');
    } else {
      showNotification('Access Denied: Invalid Key', 'error');
    }
  };

  const approvePayment = async (request: PaymentRequest) => {
    try {
      await update(ref(rtdb, `paymentRequests/${request.id}`), { 
        status: 'approved',
        processedAt: Date.now()
      });
      
      const pass = Math.random().toString(36).slice(-10);
      const pkgMap: Record<string, number> = {
        '1w': 7, '3w': 21, '1m': 30, '2m': 60, '3m': 90, '6m': 180, '1y': 365, 'free_trial': 1
      };
      
      const durationDays = pkgMap[request.packageId] || 30;
      const startDate = Date.now();
      const endDate = startDate + durationDays * 24 * 60 * 60 * 1000;

      const subscription = {
        userId: request.userId,
        userEmail: request.userEmail,
        packageId: request.packageId,
        softwareUser: request.userEmail,
        softwarePass: pass,
        startDate,
        endDate,
        status: 'active'
      };

      await push(ref(rtdb, `subscriptions/${request.userId}`), subscription);
      await push(ref(rtdb, 'softwareUsers'), {
        ...subscription,
        createdAt: Date.now(),
        approvedBy: 'admin'
      });
      showNotification(`Authorized: ${request.userEmail} Node Activated`, 'success');
    } catch (e) {
      console.error(e);
      showNotification('Authorization Failed', 'error');
    }
  };

  const rejectPayment = async (requestId: string) => {
    await update(ref(rtdb, `paymentRequests/${requestId}`), { 
      status: 'rejected',
      processedAt: Date.now()
    });
    showNotification('Uplink Request Rejected', 'warning');
  };

  const manageLicense = async (licenseId: string, action: 'block' | 'activate' | 'delete') => {
    const licenseRef = ref(rtdb, `softwareUsers/${licenseId}`);
    try {
      if (action === 'delete') {
        if (confirm('Permanently delete this license?')) {
          await update(licenseRef, { status: 'deleted' }); // Soft delete or remove? Let's do soft for history
          showNotification('License Purged', 'success');
        }
      } else {
        await update(licenseRef, { status: action === 'block' ? 'blocked' : 'active' });
        showNotification(action === 'block' ? 'Access Terminated' : 'Access Restored', 'info');
      }
    } catch (e) {
      showNotification('Update Failed', 'error');
    }
  };

  const toggleUserTrial = async (userId: string, currentStatus: boolean) => {
    try {
      await update(ref(rtdb, `users/${userId}`), { freeTrialUsed: !currentStatus });
      showNotification(currentStatus ? 'Trial Slot Opened' : 'Trial Slot Consumed', 'success');
    } catch (e) {
      showNotification('Update Failed', 'error');
    }
  };

  const createManualLicense = async (data: any) => {
    try {
      const subscription = {
        userId: data.platformUserId || 'manual_override',
        userEmail: data.email,
        packageId: data.packageId,
        softwareUser: data.email,
        softwarePass: Math.random().toString(36).slice(-10),
        startDate: Date.now(),
        endDate: Date.now() + (data.days * 24 * 60 * 60 * 1000),
        status: 'active'
      };

      await push(ref(rtdb, 'softwareUsers'), {
        ...subscription,
        createdAt: Date.now(),
        approvedBy: 'admin_manual',
        announcedTo: data.platformUserId || null
      });

      if (data.platformUserId && data.platformUserId !== 'manual_override') {
        await push(ref(rtdb, `subscriptions/${data.platformUserId}`), subscription);
      }

      showNotification('Manual License Created', 'success');
      setShowManualModal(false);
    } catch (e) {
      console.error(e);
      showNotification('Creation Failed', 'error');
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202] p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#06b6d4]/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm p-[1px] bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl shadow-2xl relative z-10"
        >
          <div className="bg-[#0a0a0a] p-8 md:p-12 rounded-[23px]">
            <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-10 mx-auto shadow-[0_0_50px_rgba(6,182,212,0.1)]">
              <Lock className="text-cyan-400" size={36} />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-center text-white">
              Core Security
            </h2>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-10 text-center italic">Biometric Placeholder</p>
            <div className="space-y-4">
              <input 
                type="password" 
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
                placeholder="ACCESS_KEY"
                className="w-full bg-white/2 border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-cyan-500/50 transition-all font-mono tracking-[0.5em] text-sm text-center italic"
              />
              <button 
                onClick={handleAdminLogin}
                className="w-full py-5 bg-cyan-500 text-black font-black italic uppercase tracking-widest rounded-2xl hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 text-[10px]"
              >
                AUTHORIZE_SESSION
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white flex">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #06b6d4 1px, transparent 0)', backgroundSize: '40px 40px' }} 
      />

      {/* Persistent Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#050505] border-r border-white/5 transition-transform duration-500 lg:translate-x-0 lg:static",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 px-4 mb-16">
              <div className="w-10 h-10 bg-cyan-500 rounded-sm rotate-12 flex items-center justify-center shadow-xl cyan-glow">
                <ShieldCheck className="text-black -rotate-12" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">Admin.OS</h1>
                <p className="text-[8px] text-cyan-500 font-black uppercase tracking-widest italic">Stable Build v4.2</p>
              </div>
            </div>
            
            <nav className="space-y-3">
              <AdminNavItem active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={Activity} label="Core Stats" />
              <AdminNavItem active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={CreditCard} label="Payment Uplinks" count={payments.filter(p => p.status === 'pending').length} />
              <AdminNavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Fleet Ledger" />
              <AdminNavItem active={activeTab === 'licenses'} onClick={() => setActiveTab('licenses')} icon={Key} label="Credential DB" count={softwareUsers.filter(l => l.status !== 'deleted').length} />
              <AdminNavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={Database} label="Transaction History" />
              <AdminNavItem active={activeTab === 'software'} onClick={() => setActiveTab('software')} icon={Terminal} label="Kernel Control" />
            </nav>
          </div>
          
          <div className="space-y-4">
             <div className="px-6 py-4 bg-white/2 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 italic">Active Nodes</p>
                <p className="text-sm font-mono text-cyan-500/80 italic">14.2k Online</p>
             </div>
             <button 
                onClick={() => { localStorage.removeItem('admin_session'); window.location.reload(); }}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-red-500/10 text-red-500/60 hover:bg-red-500/5 hover:text-red-400 transition-all text-[10px] font-black uppercase tracking-widest italic"
              >
                <LogOut size={16} />
                Terminate Session
              </button>
          </div>
        </div>
      </div>

      {/* Main Surface */}
      <div className="flex-1 min-h-screen relative">
        <header className="lg:hidden h-20 bg-black/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
           <h1 className="text-lg font-black italic uppercase tracking-tight">Admin Console</h1>
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/5 rounded-xl">
              <Settings size={20} className={cn("transition-transform", isSidebarOpen && "rotate-90")} />
           </button>
        </header>

        <main className="p-6 md:p-12 lg:p-20 max-w-7xl mx-auto">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] italic">System Status: Optimal</span>
                 </div>
                 <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
                    {activeTab === 'stats' && "Analytics Overview"}
                    {activeTab === 'payments' && "Pending Approvals"}
                    {activeTab === 'users' && "User Directory"}
                    {activeTab === 'licenses' && "Credential Ledger"}
                    {activeTab === 'history' && "Log Terminal"}
                    {activeTab === 'software' && "Kernel Monitor"}
                 </h2>
              </div>
              <div className="flex items-center gap-4">
                 <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all">Export Logs</button>
                 <div className="h-10 w-[1px] bg-white/10 mx-2 hidden sm:block" />
                 <div className="text-right hidden sm:block">
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest italic">Clock Cycle</p>
                    <p className="text-xl font-mono text-white italic">{new Date().toLocaleTimeString().split(' ')[0]}</p>
                 </div>
              </div>
           </div>

           <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'stats' && <StatsView payments={payments} users={users} />}
          {activeTab === 'payments' && (
             <PaymentsView 
                payments={payments.filter(p => 
                  p.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  p.trxId?.toLowerCase().includes(searchTerm.toLowerCase())
                )} 
                onApprove={approvePayment} 
                onReject={rejectPayment} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
             />
          )}
          {activeTab === 'users' && (
            <UsersView 
              users={users.filter(u => 
                u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
              )} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              onToggleTrial={toggleUserTrial}
            />
          )}
          {activeTab === 'history' && (
            <HistoryView 
              payments={payments.filter(p => p.status !== 'pending')} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
          )}
          {activeTab === 'licenses' && (
            <>
              <LicensesView 
                licenses={softwareUsers.filter(l => 
                  l.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  l.softwareUser?.toLowerCase().includes(searchTerm.toLowerCase())
                )} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                onAdd={() => setShowManualModal(true)}
                onManage={manageLicense}
              />
              <AnimatePresence>
                {showManualModal && (
                  <ManualLicenseModal 
                    users={users}
                    onClose={() => setShowManualModal(false)}
                    onSubmit={createManualLicense}
                  />
                )}
              </AnimatePresence>
            </>
          )}
                {activeTab === 'software' && <SoftwareView />}

                {/* Dashboard Activity Stream */}
                {activeTab === 'stats' && (
                  <div className="mt-12 p-8 md:p-12 glass-panel border-white/5 rounded-[40px] relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-4">
                        <Activity className="text-cyan-500" />
                        Activity Stream
                      </h3>
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest italic font-black">Live Logs</span>
                    </div>
                    <div className="space-y-6">
                      <RecentActivityItem user="alex_v" action="License Sync" time="2m ago" status="OK" />
                      <RecentActivityItem user="maria.dev" action="Uplink Req" time="14m ago" status="PENDING" />
                      <RecentActivityItem user="system" action="Kernel Sweep" time="1h ago" status="OK" />
                      <RecentActivityItem user="zark_node" action="Data Export" time="2h ago" status="OK" />
                    </div>
                  </div>
                )}
              </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const AdminNavItem = ({ icon: Icon, label, active, onClick, count }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group relative overflow-hidden",
      active ? "bg-cyan-500 text-black font-black italic cyan-glow" : "text-zinc-500 hover:bg-white/2 hover:text-zinc-300"
    )}
  >
    <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.15em] italic relative z-10 transition-colors">
      <Icon size={18} className={cn(active ? "text-black" : "text-zinc-600 group-hover:text-cyan-500")} />
      {label}
    </div>
    {count > 0 && (
      <span className={cn(
        "w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-black relative z-10 italic",
        active ? "bg-black text-cyan-500" : "bg-red-500/80 text-white"
      )}>
        {count}
      </span>
    )}
  </button>
);

const StatsView = ({ payments, users }: any) => {
  const approvedPayments = payments.filter((p: any) => p.status === 'approved');
  const totalRevenue = approvedPayments.reduce((acc: number, curr: any) => acc + curr.amount, 0);

  const data = [
    { name: '04.19', revenue: 4000 },
    { name: '04.20', revenue: 3000 },
    { name: '04.21', revenue: 5000 },
    { name: '04.22', revenue: 2780 },
    { name: '04.23', revenue: 1890 },
    { name: '04.24', revenue: 2390 },
    { name: '04.25', revenue: 3490 },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="FLEET_ENTITIES" value={users.length} icon={Users} color="text-cyan-500" />
        <StatCard label="ACCUMULATED_SYNC" value={`${totalRevenue} BDT`} icon={CreditCard} color="text-cyan-400" />
        <StatCard label="PENDING_UPLINKS" value={payments.filter((p: any) => p.status === 'pending').length} icon={Clock} color="text-red-500" />
      </div>

      <div className="p-10 glass-panel border-white/5 rounded-[40px]">
        <div className="flex items-center justify-between mb-10">
           <h3 className="text-2xl font-black italic uppercase italic tracking-tight italic">Extraction Revenue Analytics</h3>
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                 <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">License Sales</span>
              </div>
           </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" stroke="#333" fontSize={10} fontStyle="italic" dy={10} />
              <YAxis stroke="#333" fontSize={10} fontStyle="italic" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020202', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const PaymentsView = ({ payments, onApprove, onReject, searchTerm, setSearchTerm }: any) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row items-center justify-between px-4 mb-8 gap-6">
       <div>
         <h2 className="text-2xl font-black italic uppercase italic tracking-tight italic">Uplink Queue</h2>
         <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest italic">Node Requests</p>
       </div>
       <div className="relative group w-full md:w-80">
         <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-cyan-500" size={16} />
         <input 
           type="text" 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           placeholder="SEARCH TRANSACTIONS..." 
           className="w-full bg-white/2 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs font-mono tracking-widest outline-none focus:border-cyan-500 focus:bg-white/5 transition-all text-white italic" 
         />
       </div>
    </div>
    <div className="grid grid-cols-1 gap-6">
      {payments.filter((p: any) => p.status === 'pending').map((p: any) => (
        <div key={p.id} className="p-10 glass-panel border-white/5 rounded-[40px] flex flex-col md:flex-row justify-between items-start md:items-center gap-10 hover:border-cyan-500/20 transition-all group">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="px-5 py-2 bg-cyan-500 text-black rounded-sm text-[9px] font-black uppercase tracking-[0.2em] italic cyan-glow">{p.method} NODE</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase italic opacity-60 tracking-wider">REF_ID: #{p.id}</span>
            </div>
            <div>
              <h4 className="text-xl font-bold tracking-tight italic mb-1">{p.userEmail}</h4>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em] italic">Contact Terminal: <span className="text-cyan-400">{p.deliveryContact}</span></p>
            </div>
            <div className="flex flex-wrap gap-8 pt-4">
               <div className="space-y-1">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black italic">Target Package</p>
                  <p className="text-sm font-black italic text-zinc-300">{p.packageId.toUpperCase()}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black italic">Transaction Key</p>
                  <p className="text-sm font-mono text-cyan-500 italic tracking-widest">{p.trxId}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black italic">Sync Amount</p>
                  <p className="text-sm font-black italic text-zinc-300">{p.amount} BDT</p>
               </div>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={() => onReject(p.id)} className="flex-1 md:flex-initial px-8 py-5 bg-red-500/5 text-red-500/60 border border-red-500/10 rounded-2xl hover:bg-red-500/10 hover:text-red-400 transition-all">
              <XCircle size={24} />
            </button>
            <button onClick={() => onApprove(p)} className="flex-1 md:flex-initial flex items-center justify-center gap-4 px-10 py-5 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-all cyan-glow italic uppercase text-xs tracking-widest">
              <CheckCircle size={22} />
              AUTHORIZE
            </button>
          </div>
        </div>
      ))}
    </div>
    {payments.filter((p: any) => p.status === 'pending').length === 0 && (
      <div className="py-32 text-center text-zinc-800 font-black italic uppercase tracking-[0.4em] text-sm flex flex-col items-center gap-6">
        <Database size={48} className="opacity-20" />
        Queue Depleted - All Uplinks Verified
      </div>
    )}
  </div>
);

const UsersView = ({ users, searchTerm, setSearchTerm, onToggleTrial }: any) => (
  <div className="p-10 glass-panel border-white/5 rounded-[40px]">
    <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
      <div>
         <h3 className="text-2xl font-black italic uppercase italic tracking-tight italic mb-1 text-white">Fleet Ledger</h3>
         <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black italic">{users.length} Verified Extraction Node Operators</p>
      </div>
      <div className="relative group w-full md:w-80">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-cyan-500" size={16} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="QUERY ENTITY DB..." 
          className="w-full bg-white/2 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs font-mono tracking-widest outline-none focus:border-cyan-500 focus:bg-white/5 transition-all text-white italic" 
        />
      </div>
    </div>
    <div className="space-y-4">
      {users.map((u: any) => (
        <div key={u.id} className="flex items-center justify-between p-6 bg-white/2 rounded-3xl border border-white/5 hover:border-cyan-500/20 transition-all group">
          <div className="flex items-center gap-8">
            <div className="w-14 h-14 bg-[#0a0a0a] rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-cyan-500/30 transition-all text-zinc-700 group-hover:text-cyan-500 overflow-hidden">
               {u.photoURL ? (
                 <img src={u.photoURL} alt="" className="w-full h-full object-cover opacity-80" />
               ) : (
                 <Users size={24} />
               )}
            </div>
            <div>
              <p className="font-bold text-lg tracking-tight italic text-zinc-200 mb-0.5 group-hover:text-white transition-colors">{u.displayName}</p>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest italic">{u.email}</p>
              <div className="flex items-center gap-3 mt-1.5 font-mono">
                <span className="text-[8px] text-zinc-600 uppercase tracking-widest">ID: {u.uid.slice(0, 10)}</span>
                <span className="text-zinc-800">•</span>
                <span className="text-[8px] text-zinc-600 uppercase tracking-widest">Last Seen: {new Date(u.lastSeen).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => onToggleTrial(u.id, u.freeTrialUsed)}
               className={cn(
                 "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest italic border transition-all",
                 u.freeTrialUsed 
                   ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20" 
                   : "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
               )}
             >
               {u.freeTrialUsed ? 'RESET_TRIAL' : 'CONSUME_TRIAL'}
             </button>
             <button className="w-12 h-12 flex items-center justify-center bg-white/2 border border-white/5 rounded-2xl text-zinc-600 hover:bg-cyan-500 hover:text-black hover:cyan-glow transition-all">
               <ArrowRight size={18} />
             </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HistoryView = ({ payments, searchTerm, setSearchTerm }: any) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row items-center justify-between px-4 mb-8 gap-6">
       <div>
         <h2 className="text-2xl font-black italic uppercase italic tracking-tight italic">Processed Payments</h2>
         <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest italic">Decision Logs</p>
       </div>
       <div className="relative group w-full md:w-80">
         <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-cyan-500" size={16} />
         <input 
           type="text" 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           placeholder="SEARCH LOGS..." 
           className="w-full bg-white/2 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs font-mono tracking-widest outline-none focus:border-cyan-500 focus:bg-white/5 transition-all text-white italic" 
         />
       </div>
    </div>
    <div className="grid grid-cols-1 gap-4">
      {payments.sort((a: any, b: any) => (b.processedAt || 0) - (a.processedAt || 0)).map((p: any) => (
        <div key={p.id} className="p-8 bg-white/2 border border-white/5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:bg-white/5 transition-all">
          <div className="flex items-center gap-6">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center border",
              p.status === 'approved' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
            )}>
              {p.status === 'approved' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight italic text-zinc-200">{p.userEmail}</p>
              <div className="flex items-center gap-3 mt-1 font-mono">
                <span className="text-[8px] text-zinc-600 uppercase tracking-widest">{p.packageId}</span>
                <span className="text-zinc-800">•</span>
                <span className="text-[8px] text-zinc-600 uppercase tracking-widest">{p.amount} BDT</span>
                <span className="text-zinc-800">•</span>
                <span className="text-[8px] text-zinc-500 italic">{new Date(p.processedAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[9px] font-mono text-zinc-500 tracking-widest italic mb-1 uppercase">{p.trxId}</p>
             <span className={cn(
               "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-sm",
               p.status === 'approved' ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"
             )}>
               {p.status}
             </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LicensesView = ({ licenses, searchTerm, setSearchTerm, onAdd, onManage }: any) => (
  <div className="space-y-10">
    <div className="p-10 glass-panel border-white/5 rounded-[40px]">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-2xl font-black italic uppercase italic tracking-tight italic">Credential Ledger</h2>
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest italic">{licenses.filter((l: any) => l.status !== 'deleted').length} Active Licenses</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-cyan-500" size={16} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="FILTER CREDENTIALS..." 
              className="w-full bg-white/2 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs font-mono tracking-widest outline-none focus:border-cyan-500 focus:bg-white/5 transition-all text-white italic" 
            />
          </div>
          <button 
            onClick={onAdd}
            className="w-full sm:w-auto px-8 py-4 bg-cyan-500 text-black font-black italic uppercase tracking-widest rounded-2xl hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 text-[10px]"
          >
            Create Manual
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {licenses.filter((l: any) => l.status !== 'deleted').map((l: any) => (
          <div key={l.id} className={cn(
            "p-8 bg-white/2 border rounded-[30px] transition-all relative overflow-hidden group",
            l.status === 'blocked' ? "border-red-500/30 opacity-60" : "border-white/5 hover:border-cyan-500/20"
          )}>
            <div className={cn(
              "absolute top-0 right-0 px-6 py-2 text-[10px] font-black italic uppercase tracking-widest",
              l.status === 'blocked' ? 'bg-red-500 text-white' : 
              l.status === 'active' ? 'bg-green-500/10 text-green-500' :
              l.packageId === 'free_trial' ? 'bg-amber-500/10 text-amber-500' : 'bg-cyan-500/10 text-cyan-500'
            )}>
              {l.status === 'blocked' ? 'ACCESS_REVOKED' : 
               l.status === 'active' ? 'ACTIVE_SESSION' : 
               l.packageId}
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center border border-white/5 group-hover:text-cyan-500">
                      <Key size={20} />
                   </div>
                   <div>
                      <p className="text-lg font-black italic text-zinc-200 uppercase tracking-tight truncate max-w-[150px]">{l.softwareUser}</p>
                      <p className="text-[9px] font-mono text-zinc-600 uppercase italic tracking-widest">{l.packageId}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   {l.status === 'blocked' ? (
                     <button onClick={() => onManage(l.id, 'activate')} className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20" title="Reactivate">
                        <CheckCircle size={16} />
                     </button>
                   ) : (
                     <button onClick={() => onManage(l.id, 'block')} className="p-3 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500/20" title="Block">
                        <Lock size={16} />
                     </button>
                   )}
                   <button onClick={() => onManage(l.id, 'delete')} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20" title="Delete">
                      <X size={16} />
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 italic">Software User</p>
                    <p className="text-[10px] font-mono text-cyan-500 truncate">{l.softwareUser}</p>
                 </div>
                 <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 italic">Software Pass</p>
                    <p className="text-[10px] font-mono text-cyan-500 truncate">{l.softwarePass}</p>
                 </div>
              </div>

              <div className="space-y-3 pt-2">
                 <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest italic">
                    <span>Activation Data</span>
                    <span className="text-zinc-300">{new Date(l.startDate).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest italic">
                    <span>Expiration Lock</span>
                    <span className="text-zinc-300">{new Date(l.endDate).toLocaleString()}</span>
                 </div>
                 <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-4">
                    <div 
                      className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                      style={{ width: `${Math.max(0, Math.min(100, ((Date.now() - l.startDate) / (l.endDate - l.startDate)) * 100))}%` }}
                    />
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SoftwareView = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
    <div className="p-10 bg-[#080a0c] border border-cyan-500/10 rounded-[40px] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-10 opacity-5 text-cyan-500 italic font-black text-6xl">KERNEL</div>
      <h3 className="text-2xl font-black italic uppercase italic tracking-tight italic mb-10 flex items-center gap-4 relative z-10 text-white">
        <Terminal className="text-cyan-500" />
        Terminal Mainframe
      </h3>
      <div className="bg-black/80 rounded-3xl p-10 font-mono text-[10px] space-y-4 text-zinc-500 border border-white/5 relative z-10 italic shadow-2xl">
        <p className="text-cyan-500 tracking-tighter flex items-center gap-4">
           <span className="w-1 h-3 bg-cyan-500 rounded-full animate-pulse" />
           [SYS] PROTOCOL_STATUS: OPTIMIZED_OVERRIDE
        </p>
        <p className="tracking-tighter opacity-60">[MEM] Buffer Usage: 48,201 entities cached [OK]</p>
        <p className="tracking-tighter opacity-60">[SCR] Scraper engine v4.2 stable - 99.8% Efficiency</p>
        <p className="tracking-tighter opacity-60">[NET] Global geolocation mesh responder: 22ms latency</p>
        <p className="tracking-tighter opacity-60 font-black text-zinc-400 mt-6">[LOG] Initializing entity verification sweep...</p>
        <div className="pt-8 flex items-center gap-4">
          <div className="flex gap-1">
             <div className="w-4 h-1 bg-cyan-500 rounded-full animate-pulse" />
             <div className="w-4 h-1 bg-cyan-500/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
             <div className="w-4 h-1 bg-cyan-500/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <span className="text-cyan-500/50 text-[9px] uppercase tracking-widest font-black">CORE STEADY</span>
        </div>
      </div>
    </div>
    
    <div className="p-10 glass-panel border-white/5 rounded-[40px]">
      <h3 className="text-2xl font-black italic uppercase italic tracking-tight mb-10 text-white">Network Metrics</h3>
      <div className="space-y-10">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
               <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black italic">Entity Extractions</p>
               <p className="text-2xl font-mono text-white italic tracking-tighter">142,501 <span className="text-[10px] text-cyan-500/40">/ DAILY</span></p>
            </div>
            <span className="text-cyan-500 font-mono font-black italic text-sm">65%</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              className="bg-cyan-500 h-full cyan-glow" 
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
               <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black italic">Global Node Coverage</p>
               <p className="text-2xl font-mono text-white italic tracking-tighter">84.2% <span className="text-[10px] text-blue-500/40">/ PEAK</span></p>
            </div>
            <span className="text-blue-500 font-mono font-black italic text-sm">84%</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '84%' }}
              className="bg-blue-500 h-full shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
            />
          </div>
        </div>

        <div className="flex gap-4 pt-10">
           <div className="flex-1 p-6 bg-white/2 rounded-[24px] border border-white/5">
              <p className="text-[8px] text-zinc-600 uppercase tracking-widest font-black mb-2">Node Latency</p>
              <p className="text-xl font-mono text-cyan-500">12ms</p>
           </div>
           <div className="flex-1 p-6 bg-white/2 rounded-[24px] border border-white/5">
              <p className="text-[8px] text-zinc-600 uppercase tracking-widest font-black mb-2">Validator Load</p>
              <p className="text-xl font-mono text-cyan-500">2.1%</p>
           </div>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="p-10 glass-panel border-white/5 rounded-[40px] group hover:border-cyan-500/30 transition-all relative overflow-hidden backdrop-blur-3xl">
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
       <Icon size={80} />
    </div>
    <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center mb-10 bg-white/2 border border-white/10 group-hover:bg-cyan-500 group-hover:text-black transition-all group-hover:cyan-glow", color)}>
      <Icon size={28} />
    </div>
    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 italic group-hover:text-zinc-400">{label}</p>
    <p className="text-3xl font-black italic tracking-tighter uppercase text-white">{value}</p>
  </div>
);

const RecentActivityItem = ({ user, action, time, status }: any) => (
  <div className="flex items-center justify-between p-5 bg-white/2 border border-white/5 rounded-2xl hover:border-cyan-500/10 transition-all group">
     <div className="flex items-center gap-6">
        <div className="w-10 h-10 bg-[#0a0a0a] rounded-xl flex items-center justify-center border border-white/5 group-hover:text-cyan-500">
           <Activity size={18} />
        </div>
        <div>
           <p className="text-sm font-black italic text-zinc-200 uppercase tracking-tight">{action}</p>
           <p className="text-[9px] font-mono text-zinc-600 uppercase italic tracking-widest">{user} • {time}</p>
        </div>
     </div>
     <span className={cn(
        "text-[9px] font-black italic uppercase px-3 py-1 rounded-sm tracking-widest",
        status === 'OK' ? "bg-cyan-500/10 text-cyan-500" : "bg-amber-500/10 text-amber-500"
     )}>
        {status}
     </span>
  </div>
);

const ManualLicenseModal = ({ onClose, onSubmit, users }: any) => {
  const [data, setData] = useState({
    email: '',
    packageId: 'manual',
    days: 30,
    platformUserId: ''
  });
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = users.filter((u: any) => 
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(userSearch.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg p-1 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-[40px] relative z-10"
      >
        <div className="bg-[#0a0a0a] p-10 md:p-12 rounded-[39px] border border-white/5">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10 text-white flex items-center gap-4">
             <Key className="text-cyan-500" />
             Manual License
          </h2>
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic ml-4">Target Email (For Software)</label>
                <input 
                  type="email" 
                  value={data.email}
                  onChange={e => setData({...data, email: e.target.value})}
                  className="w-full bg-white/2 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500 transition-all font-mono text-sm italic"
                  placeholder="user@example.com"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic ml-4">Announce Package to user (Optional)</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                  <input 
                    type="text" 
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="w-full bg-white/2 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-cyan-500 transition-all font-mono text-xs italic"
                    placeholder="Search platform user..."
                  />
                  {userSearch && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#121212] border border-white/10 rounded-2xl z-20 space-y-1">
                      {filteredUsers.length > 0 ? filteredUsers.map((u: any) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setData({ ...data, platformUserId: u.id, email: u.email });
                            setUserSearch('');
                          }}
                          className="w-full p-3 text-left hover:bg-white/5 rounded-xl transition-all flex items-center justify-between"
                        >
                          <div>
                            <p className="text-[10px] font-black italic text-white uppercase">{u.displayName}</p>
                            <p className="text-[8px] font-mono text-zinc-600">{u.email}</p>
                          </div>
                          {data.platformUserId === u.id && <Check className="text-cyan-500" size={14} />}
                        </button>
                      )) : (
                        <p className="text-[8px] text-zinc-700 p-3 italic uppercase font-black text-center">No users found</p>
                      )}
                    </div>
                  )}
                </div>
                {data.platformUserId && (
                  <div className="flex items-center justify-between px-4 py-2 bg-cyan-500/5 border border-cyan-500/20 rounded-xl mt-2">
                    <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest italic">Linked to: {data.platformUserId}</span>
                    <button onClick={() => setData({...data, platformUserId: ''})} className="text-zinc-600 hover:text-red-500"><X size={12} /></button>
                  </div>
                )}
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic ml-4">Package ID</label>
                   <input 
                     type="text" 
                     value={data.packageId}
                     onChange={e => setData({...data, packageId: e.target.value})}
                     className="w-full bg-white/2 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500 transition-all font-mono text-sm italic"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic ml-4">Duration (Days)</label>
                   <input 
                     type="number" 
                     value={data.days}
                     onChange={e => setData({...data, days: parseInt(e.target.value)})}
                     className="w-full bg-white/2 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500 transition-all font-mono text-sm italic"
                   />
                </div>
             </div>

             <div className="flex gap-4 pt-6">
                <button 
                   onClick={onClose}
                   className="flex-1 py-5 bg-white/5 text-zinc-500 font-black italic uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all text-[10px]"
                >
                  Abort
                </button>
                <button 
                   onClick={() => onSubmit(data)}
                   className="flex-[2] py-5 bg-cyan-500 text-black font-black italic uppercase tracking-widest rounded-2xl hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 text-[10px]"
                >
                  Inject Payload
                </button>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Admin;
