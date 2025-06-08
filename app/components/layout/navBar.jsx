"use client"
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { IoIosNotifications, IoMdClose } from "react-icons/io";
import { FaUser, FaSignOutAlt, FaBell, FaUserCircle, FaBars } from "react-icons/fa";
import { useSelector } from "react-redux";
import ThemeToggle from "../ui/ThemeToggle";
import LanguageToggle from "../ui/LanguageToggle";
import { useLanguage } from "../providers/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Dynamically import Avatar to prevent SSR hydration mismatch
const Avatar = dynamic(() => import("@mui/material/Avatar"), { ssr: false });

export default function Navbar({ setSidebarOpen, sidebarOpen }) {
  const userRole = useSelector((state) => state.userRole.isAdmin);
  const { t, isRTL } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Track scroll position for navbar styling
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProfile = (e) => {
    e.stopPropagation();
    setProfileOpen(!profileOpen);
    setNotificationsOpen(false);
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setNotificationsOpen(!notificationsOpen);
    setProfileOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  // Sample notifications
  const notifications = [
    { id: 1, message: "New attendance record added", time: "5 min ago" },
    { id: 2, message: "System update completed", time: "1 hour ago" },
    { id: 3, message: "Weekly report available", time: "Yesterday" },
  ];

  return (
    <header 
      className={`fixed w-full top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-r from-[var(--secondary-dark)] via-[#23243a] to-[var(--secondary-dark)]
        ${scrolled ? 'py-2 shadow-2xl' : 'py-4 shadow-lg'} rounded-b-2xl`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center z-20"
        >
          {/* Toggle sidebar button on mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden mr-3 text-[var(--foreground)] hover:text-[var(--primary)]"
          >
            {sidebarOpen ? (
              <IoMdClose size={24} />
            ) : (
              <FaBars size={22} />
            )}
          </button>

          <Link href="/dashboard" className="flex items-center">
            <div className="flex items-center mr-2">
              <Image 
                src="/images/logo.png" 
                alt="FCAI Logo" 
                width={40} 
                height={40} 
                className="rounded-full"
              />
            </div>
            <h1 className="text-[var(--primary)] font-gugi text-2xl sm:text-3xl font-bold drop-shadow-lg tracking-wide hidden sm:block">
              FCAI Attendance System
            </h1>
          </Link>
        </motion.div>

        {/* Empty space in the middle */}
        <div className="flex-1"></div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3 z-20">
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          
          {/* Notifications */}
          <div className="dropdown-container relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleNotifications}
              className="relative p-2 text-[var(--foreground)] rounded-full hover:bg-[var(--secondary)] transition-colors"
              aria-label="Notifications"
            >
              <FaBell className="text-lg" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-[var(--primary)] rounded-full">
                {notifications.length}
              </span>
            </motion.button>
            
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-72 bg-[var(--secondary)] rounded-lg shadow-xl z-50 border border-[var(--neutral-light)] dropdown-container"
                  style={{ transform: 'translateX(0)' }}
                >
                  <div className="p-3 border-b border-[var(--neutral-light)]">
                    <h3 className="font-medium text-[var(--foreground)]">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(notification => (
                      <motion.div
                        key={notification.id}
                        className="p-3 border-b border-[var(--neutral-light)] hover:bg-[var(--secondary-light)] cursor-pointer"
                        whileHover={{ backgroundColor: 'var(--secondary-light)' }}
                      >
                        <p className="text-sm text-[var(--foreground)]">{notification.message}</p>
                        <p className="text-xs text-[var(--foreground-secondary)] mt-1">{notification.time}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-2 text-center">
                    <button className="text-sm text-[var(--primary)] hover:text-[var(--primary-light)] hover:underline">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* User Profile */}
          <div className="dropdown-container relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleProfile}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-[var(--secondary)] transition-colors"
            >
              <div className="hidden md:flex flex-col text-right mr-2">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {userRole ? "Admin" : "Instructor"}
                </p>
                <p className="text-xs text-[var(--foreground-secondary)]">
                  {userRole ? "Administrator" : "Faculty Member"}
                </p>
              </div>
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500">
                <FaUserCircle className="text-white text-3xl" />
              </span>
            </motion.button>
            
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-[var(--secondary)] rounded-lg shadow-xl z-50 border border-[var(--neutral-light)] dropdown-container"
                  style={{ transform: 'translateX(0)' }}
                >
                  <motion.div 
                    className="p-3 border-b border-[var(--neutral-light)] hover:bg-[var(--secondary-light)] cursor-pointer"
                    whileHover={{ backgroundColor: 'var(--secondary-light)' }}
                  >
                    <div className="flex items-center gap-3">
                      <FaUser className="text-[var(--primary)]" />
                      <span className="text-sm text-[var(--foreground)]">My Profile</span>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="p-3 cursor-pointer"
                    whileHover={{ backgroundColor: 'var(--secondary-light)' }}
                    onClick={handleLogout}
                  >
                    <div className="flex items-center gap-3">
                      <FaSignOutAlt className="text-red-400" />
                      <span className="text-sm text-red-400">Logout</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Mobile menu button */}
          <motion.button
            className="md:hidden text-[var(--foreground)] p-2"
            onClick={toggleMobileMenu}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <FaBars size={22} />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-[var(--secondary-dark)]/95 backdrop-blur-sm shadow-lg overflow-hidden rounded-b-xl"
          >
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--foreground-secondary)]">Theme:</span>
                <ThemeToggle />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--foreground-secondary)]">Language:</span>
                <LanguageToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 