'use client';

import React, { createContext, useContext } from 'react';

// Create context
const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  isRTL: false,
  t: (key) => key,
});

// Hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Translations - only English now
const translations = {
  en: {
    // Common
    welcome: 'Welcome',
    login: 'Login',
    logout: 'Logout',
    loading: 'Loading...',
    fcaiAttendance: 'FCAI Attendance System',
    fullTitle: 'Electronic Attendance System for Faculty of Computers and AI',
    systemDescription: 'Track attendance effortlessly with our modern QR code system. Easy, secure, and efficient way to manage classroom participation.',
    
    // Login page
    username: 'Username',
    password: 'Password',
    enterUsername: 'Enter your username',
    enterPassword: 'Enter your password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loggingIn: 'Logging in...',
    welcomeBack: 'Welcome Back',
    pleaseSignIn: 'Please sign in to access your dashboard',
    continueWith: 'Or continue with',
    registerNow: 'Register now',
    dontHaveAccount: 'Don\'t have an account?',
    
    // QR code attendance
    qrCodeAttendance: 'QR Code Attendance',
    scanQrCode: 'Scan QR code to check in',
    attendanceTracking: 'Track attendance easily',
    
    // Form validation
    usernameRequired: 'Please enter a username',
    passwordRequired: 'Please enter a password',
    passwordTooShort: 'Password is too short',
    loginFailed: 'Login failed. Please check your credentials.',
    invalidRoleAccess: 'Access denied for this account type',
    
    // Dashboard
    adminDashboard: 'Admin Dashboard',
    instructorDashboard: 'Instructor Dashboard',
    totalStudents: 'Total Students',
    present: 'Present',
    absent: 'Absent',
    reportingPeriod: 'Reporting Period',
    forThePeriod: 'For the period:',
    weeklyAttendanceTrends: 'Weekly Attendance Trends',
    attendanceDistribution: 'Attendance Distribution',
    weeklySummary: 'Weekly Summary',
    dailyAttendance: 'Daily Attendance',
    refresh: 'Refresh',
    loadingData: 'Loading data...',
    errorLoadingData: 'Error Loading Data',
    serverConnectionError: 'Cannot connect to server',
    pleaseRefresh: 'Please refresh the page or contact support.',
    retry: 'Retry',
    noAttendanceData: 'No attendance data available. Please try again later.',
    last7Days: 'Last 7 Days',
    attendanceRate: 'Attendance Rate',
    
    // Weekly Summary
    totalPresent: 'Total Present',
    totalAbsent: 'Total Absent',
    overallAttendanceRate: 'Overall Attendance Rate',
    bestDay: 'Best Day',
    lowestDay: 'Lowest Day',
    
    // Daily Attendance
    date: 'Date',
    day: 'Day',
    rate: 'Rate',
    status: 'Status',
    good: 'Good',
    average: 'Average',
    poor: 'Poor',
    noData: 'No data',

    // New Dashboard Elements
    overview: 'Overview',
    details: 'Details',
    performanceSummary: 'Performance Summary',
    weeklyReport: 'Weekly Report',
    averageAttendance: 'Average Attendance',
    totalSessions: 'Total Sessions',
    weekly: 'Weekly'
  },
};

// Language provider component
export function LanguageProvider({ children }) {
  // Always use English
  const language = 'en';
  const isRTL = false;

  // These functions are kept for compatibility but don't actually change the language
  const setLanguage = () => {
    // No-op function - language stays English
    console.log("Language switching is disabled - using English only");
  };

  const toggleLanguage = () => {
    // No-op function - language stays English
    console.log("Language switching is disabled - using English only");
  };

  // Translation function - now only returns English translations
  const t = (key) => {
    return translations.en[key] || key;
  };

  // Ensure LTR direction is set
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', 'ltr');
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageProvider; 