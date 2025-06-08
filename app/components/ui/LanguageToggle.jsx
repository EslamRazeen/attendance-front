'use client';

import React from 'react';
import { useLanguage } from '@/app/components/providers/LanguageProvider';
import { Languages } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LanguageToggle() {
  const { language } = useLanguage();
  
  // Return null to hide the component entirely
  // Or uncomment the button below to show "English Only"
  
  return (
    <motion.button 
      className="flex items-center gap-2 bg-[#232738] text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 cursor-default shadow-sm opacity-60"
      aria-label="English Only"
      whileHover={{ scale: 1.0 }}
    >
      <Languages size={18} className="text-primary" />
      <span className="text-xs font-medium">
        English Only
      </span>
    </motion.button>
  );
} 