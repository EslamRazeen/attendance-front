'use client';

import { useState, useEffect } from 'react';
import Welcome from "./welcome/Welcome";
import dynamic from 'next/dynamic';

const SplashScreen = dynamic(() => import('./components/SplashScreen'), { ssr: false });

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash screen after content is loaded
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {showSplash && <SplashScreen />}
      {!showSplash && <Welcome />}
    </div>
  );
}
