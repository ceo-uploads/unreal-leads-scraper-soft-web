import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, CheckCircle, AlertTriangle, Info, Bell } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const closeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className="glass-panel p-5 rounded-2xl min-w-[300px] max-w-md flex items-start gap-4 border-white/10 shadow-2xl backdrop-blur-2xl relative overflow-hidden group">
                {/* Status Bar */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  n.type === 'success' ? 'bg-green-500' :
                  n.type === 'error' ? 'bg-red-500' :
                  n.type === 'warning' ? 'bg-yellow-500' :
                  'bg-cyan-500'
                }`} />
                
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  n.type === 'success' ? 'bg-green-500/10 text-green-500' :
                  n.type === 'error' ? 'bg-red-500/10 text-red-500' :
                  n.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-cyan-500/10 text-cyan-500'
                }`}>
                  {n.type === 'success' && <CheckCircle size={20} />}
                  {n.type === 'error' && <AlertTriangle size={20} />}
                  {n.type === 'warning' && <AlertTriangle size={20} />}
                  {n.type === 'info' && <Info size={20} />}
                </div>

                <div className="flex-1 pr-6 pt-0.5">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] italic text-zinc-500 mb-1">
                    {n.type} SIGNAL
                  </p>
                  <p className="text-sm font-medium text-white leading-relaxed">
                    {n.message}
                  </p>
                </div>

                <button 
                  onClick={() => closeNotification(n.id)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/5 text-zinc-600 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
