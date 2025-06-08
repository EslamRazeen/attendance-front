'use client';

import React from 'react';
import { useLanguage } from '@/app/components/providers/LanguageProvider';

export default function Loading() {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-80 backdrop-blur-sm">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-secondary border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-foreground-secondary font-medium">{t('loading')}</p>
      </div>
    </div>
  );
} 