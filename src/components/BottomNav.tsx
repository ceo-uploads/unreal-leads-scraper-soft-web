import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Tag, User, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const BottomNav = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { to: '/', icon: Home, label: t('navHome') },
    { to: '/pricing', icon: Tag, label: t('navPricing') },
    { to: '/vault', icon: Database, label: t('navVault') },
    { to: user ? '/profile' : '/login', icon: User, label: t('navProfile') },
  ];

  return (
    <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] md:w-auto">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-around md:justify-center gap-1 md:gap-2 px-2 md:px-6 py-3 md:py-4 glass-panel border border-white/10 rounded-[24px] md:rounded-full shadow-2xl backdrop-blur-2xl"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-[18px] md:rounded-full transition-all duration-300 text-[9px] md:text-[10px] uppercase font-black tracking-[0.2em] italic",
              isActive ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 cyan-glow" : "text-zinc-500 hover:text-cyan-400 hover:bg-white/5"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} className="md:w-4 md:h-4" />
                <span className={cn("hidden lg:inline whitespace-nowrap", isActive && "inline")}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </motion.nav>
    </div>
  );
};

export default BottomNav;
