'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useTheme } from './ThemeProvider';
import { useLanguage } from './LanguageProvider';
import { motion } from 'framer-motion';
import { IoMdMenu, IoMdClose } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';

export default function Header({ showToggle = true }) {
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // التحقق من حالة تسجيل الدخول
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    }
  }, []);

  // التحقق مما إذا كان المستخدم في لوحة التحكم أو صفحة تسجيل الدخول
  const isDashboard = pathname && pathname.includes('/dashboard');
  const isLoginPage = pathname && (pathname.includes('/auth/login') || pathname === '/');
  const shouldShowSimplifiedHeader = isDashboard || isLoginPage;

  // Effect to track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // تسجيل الخروج
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('isInstructor');
      localStorage.removeItem('sessionId');
      setIsLoggedIn(false);
      router.push('/auth/login');
    }
  };

  // إذا كان المستخدم في لوحة التحكم أو صفحة تسجيل الدخول، لا تعرض الهيدر بشكل كامل
  if (shouldShowSimplifiedHeader) {
    return (
      <header 
        className={`modern-navbar w-full fixed top-0 left-0 z-20 transition-all duration-300 ${
          scrolled ? 'py-2 shadow-lg' : 'py-4'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link href="/" className="navbar-brand flex items-center">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/images/logo.png"
                  alt="FCAI Logo"
                  width={50}
                  height={50}
                  className={`${isRTL ? "ml-3" : "mr-3"} transition-all ${scrolled ? 'scale-90' : 'scale-100'}`}
                />
              </motion.div>
              <h1 className={`text-primary text-xl md:text-2xl font-gugi transition-all ${scrolled ? 'scale-95' : 'scale-100'}`}>
                {t('fcaiAttendance')}
              </h1>
            </Link>
          </motion.div>
          
          {/* Desktop Navigation - Only show language and theme toggles */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link href="/" className="navbar-item text-foreground hover:text-primary">
                  {isRTL ? "الرئيسية" : "Home"}
                </Link>
              </motion.div>
              
              {/* عرض زر Dashboard فقط إذا كان المستخدم مسجل الدخول وليس في صفحة تسجيل الدخول */}
              {isLoggedIn && !isLoginPage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Link href="/dashboard" className="navbar-item text-foreground hover:text-primary">
                    {isRTL ? "لوحة التحكم" : "Dashboard"}
                  </Link>
                </motion.div>
              )}
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <LanguageToggle />
              {showToggle && <ThemeToggle />}
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <LanguageToggle />
              {showToggle && <ThemeToggle />}
            </motion.div>
          </div>
        </div>
      </header>
    );
  }

  // العرض العادي للهيدر في الصفحات الأخرى
  return (
    <header 
      className={`modern-navbar w-full fixed top-0 left-0 z-20 transition-all duration-300 ${
        scrolled ? 'py-2 shadow-lg' : 'py-4'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <Link href="/" className="navbar-brand flex items-center">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/images/logo.png"
                alt="FCAI Logo"
                width={50}
                height={50}
                className={`${isRTL ? "ml-3" : "mr-3"} transition-all ${scrolled ? 'scale-90' : 'scale-100'}`}
              />
            </motion.div>
            <h1 className={`text-primary text-xl md:text-2xl font-gugi transition-all ${scrolled ? 'scale-95' : 'scale-100'}`}>
              {t('fcaiAttendance')}
            </h1>
          </Link>
        </motion.div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link href="/" className="navbar-item text-foreground hover:text-primary">
                {isRTL ? "الرئيسية" : "Home"}
              </Link>
            </motion.div>
            
            {/* عرض زر Dashboard فقط إذا كان المستخدم مسجل الدخول */}
            {isLoggedIn && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link href="/dashboard" className="navbar-item text-foreground hover:text-primary">
                  {isRTL ? "لوحة التحكم" : "Dashboard"}
                </Link>
              </motion.div>
            )}
            
            {/* عرض زر تسجيل الدخول أو تسجيل الخروج حسب الحالة */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {!isLoggedIn ? (
                <Link href="/auth/login" className="navbar-item text-foreground hover:text-primary">
                  {isRTL ? "تسجيل الدخول" : "Login"}
                </Link>
              ) : (
                <button 
                  onClick={handleLogout} 
                  className="navbar-item text-foreground hover:text-primary"
                >
                  {isRTL ? "تسجيل الخروج" : "Logout"}
                </button>
              )}
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <LanguageToggle />
            {showToggle && <ThemeToggle />}
          </motion.div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-foreground focus:outline-none"
            >
              {mobileMenuOpen ? (
                <IoMdClose className="text-2xl" />
              ) : (
                <IoMdMenu className="text-2xl" />
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: mobileMenuOpen ? 'auto' : 0,
          opacity: mobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden"
      >
        <div className="flex flex-col items-center py-4 space-y-4 bg-background-secondary">
          <Link href="/" className="navbar-item text-foreground hover:text-primary w-full text-center" onClick={() => setMobileMenuOpen(false)}>
            {isRTL ? "الرئيسية" : "Home"}
          </Link>
          
          {/* عرض زر Dashboard في القائمة المتنقلة فقط إذا كان المستخدم مسجل الدخول */}
          {isLoggedIn && (
            <Link href="/dashboard" className="navbar-item text-foreground hover:text-primary w-full text-center" onClick={() => setMobileMenuOpen(false)}>
              {isRTL ? "لوحة التحكم" : "Dashboard"}
            </Link>
          )}
          
          {/* عرض زر تسجيل الدخول أو تسجيل الخروج في القائمة المتنقلة حسب الحالة */}
          {!isLoggedIn ? (
            <Link href="/auth/login" className="navbar-item text-foreground hover:text-primary w-full text-center" onClick={() => setMobileMenuOpen(false)}>
              {isRTL ? "تسجيل الدخول" : "Login"}
            </Link>
          ) : (
            <button 
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }} 
              className="navbar-item text-foreground hover:text-primary w-full text-center"
            >
              {isRTL ? "تسجيل الخروج" : "Logout"}
            </button>
          )}
          
          <div className="flex items-center gap-3 py-2">
            <LanguageToggle />
            {showToggle && <ThemeToggle />}
          </div>
        </div>
      </motion.div>
    </header>
  );
} 