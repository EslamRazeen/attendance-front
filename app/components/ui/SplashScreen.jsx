'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/app/components/providers/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newValue = prev + Math.floor(Math.random() * 10) + 2;
        return newValue > 100 ? 100 : newValue;
      });
    }, 120);

    if (loadingProgress === 100) {
      setTimeout(() => {
        setFadeOut(true);
      }, 600);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [loadingProgress]);

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Simple gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-950 z-0" />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo with simple animation */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/images/logo.png"
                alt="FCAI Logo"
                width={150}
                height={150}
                className="object-contain drop-shadow-lg"
              />
            </motion.div>

            {/* System name */}
            <motion.h1
              className="text-3xl font-bold mb-8 text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              FCAI Attendance System
            </motion.h1>

            {/* Simple loading bar */}
            <motion.div
              className="w-64 h-1.5 bg-blue-800 rounded-full overflow-hidden mb-4"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "16rem" }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div
                className="h-full bg-white rounded-full"
                style={{ width: `${loadingProgress}%` }}
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
              />
            </motion.div>

            {/* Loading text */}
            <motion.p
              className="text-blue-200 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {t('loading')} {loadingProgress}%
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 