'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "@/app/components/ui/SplashScreen";
import Welcome from "./welcome/Welcome";

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
