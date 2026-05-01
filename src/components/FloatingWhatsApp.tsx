import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

const FloatingWhatsApp = () => {
  return (
    <motion.a
      href="https://wa.me/8801333294862"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed right-4 md:right-6 bottom-28 md:bottom-32 z-40 w-14 h-14 md:w-16 md:h-16 bg-cyan-600 rounded-full flex items-center justify-center text-black shadow-2xl cursor-pointer cyan-glow"
    >
      <MessageCircle size={28} className="md:w-8 md:h-8" fill="currentColor" />
    </motion.a>
  );
};

export default FloatingWhatsApp;
