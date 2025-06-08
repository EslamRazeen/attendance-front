'use client';

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Header from "@/app/components/layout/Header";
import { motion } from "framer-motion";
import { useLanguage } from "@/app/components/providers/LanguageProvider";

export default function Welcome() {
  const [visible, setVisible] = useState(false);
  const { t, isRTL } = useLanguage();
  
  useEffect(() => {
    // تأخير ظهور العناصر لإنشاء تأثير التتابع
    setVisible(true);
  }, []);

  // عناصر زخرفية
  const decorativeCircles = [
    { size: '40rem', top: '-20%', left: '-10%', delay: 0, opacity: 0.05 },
    { size: '35rem', bottom: '-30%', right: '-15%', delay: 0.5, opacity: 0.07 },
    { size: '25rem', top: '50%', right: '10%', delay: 1, opacity: 0.04 },
  ];

  return (
    <div className="welcome-bg min-h-screen w-full relative overflow-hidden flex flex-col">
      {/* دوائر زخرفية للخلفية */}
      {decorativeCircles.map((circle, index) => (
        <div
          key={index}
          className="decorative-circle absolute rounded-full bg-primary animate-float"
          style={{
            width: circle.size,
            height: circle.size,
            top: circle.top,
            left: circle.left,
            right: circle.right,
            bottom: circle.bottom,
            opacity: circle.opacity,
            animationDelay: `${circle.delay}s`,
          }}
        />
      ))}
      
      {/* تم إزالة نمط خلفية pattern.svg */}
      
      {/* Header with site logo and theme toggle */}
      <Header />
      
      {/* Welcome content */}
      <motion.div 
        className="flex-grow flex flex-col items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-[var(--foreground)] text-5xl md:text-7xl font-bold mb-8 text-center drop-shadow-lg"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: visible ? 0 : 30, opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {t('welcome')}
        </motion.h1>
        
        <motion.p
          className="text-[var(--foreground-secondary)] text-xl mb-12 text-center max-w-xl"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: visible ? 0 : 30, opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {t('fullTitle')}
        </motion.p>
        
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.9 }}
          animate={{ y: visible ? 0 : 30, opacity: visible ? 1 : 0, scale: visible ? 1 : 0.9 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="relative"
        >
          <Link 
            href="/auth/login"
            className="btn-primary px-10 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>{t('login')}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}>
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
          </Link>
          
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-primary rounded-full opacity-30 blur-md -z-10"></div>
        </motion.div>
      </motion.div>
      
      {/* تمت إزالة عناصر الخلفية الزخرفية التي تستخدم dash.svg */}
    </div>
  );
}
