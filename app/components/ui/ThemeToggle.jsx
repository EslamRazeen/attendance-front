'use client';

import React from 'react';
import { useTheme } from '@/app/components/providers/ThemeProvider';
import { SunMoon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-300 focus:outline-none bg-[#232738] hover:bg-[#2c2f42] border border-gray-700 hover:border-[#7950f2]"
      whileHover={{ scale: 1.08, rotate: 8 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.span
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
        animate={{ rotate: 360, scale: 1, opacity: 1 }}
        exit={{ rotate: 0, scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex items-center justify-center"
      >
        <SunMoon
          size={20}
          className={isDark ? 'text-primary' : 'text-yellow-400'}
          strokeWidth={2.2}
        />
      </motion.span>
    </motion.button>
  );
} 