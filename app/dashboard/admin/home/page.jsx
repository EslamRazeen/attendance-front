"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUsers, FaUserCheck, FaUserTimes, FaCalendarAlt, FaSync, FaArrowUp, FaChartLine, FaChartPie, FaTimesCircle } from "react-icons/fa";
import AdminDashCard from "@/app/components/dashboard/admin/AdminDashCard";
import AdminLineChart from "@/app/components/dashboard/admin/AdminLineChart";
import AdminPieChart from "@/app/components/dashboard/admin/AdminPieChart";
import AdminWeeklySummary from "@/app/components/dashboard/admin/AdminWeeklySummary";
import AdminDailyAttendance from "@/app/components/dashboard/admin/AdminDailyAttendance";
import { useLanguage } from "@/app/components/providers/LanguageProvider";
import { useDashboardAdmin } from "@/app/hooks/useDashboardAdmin";

const DashHome = () => {
  const { t, isRTL } = useLanguage();
  const {
    attendanceData,
    loading,
    error,
    activeTab,
    showRefreshAnimation,
    setActiveTab,
    handleRefresh,
    calculateSummaryData,
    preparePieChartData,
  } = useDashboardAdmin();

  // Debug
  useEffect(() => {
    console.log("Dashboard page mounted/updated");
    console.log("Attendance Data:", attendanceData);
    console.log("Loading state:", loading);
    console.log("Error state:", error);
  }, [attendanceData, loading, error]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20, 
        duration: 0.5 
      }
    }
  };

  const tabVariants = {
    inactive: { 
      opacity: 0.7,
      scale: 0.95,
      backgroundColor: "rgba(26, 31, 46, 0.5)"
    },
    active: { 
      opacity: 1,
      scale: 1,
      backgroundColor: "rgba(42, 47, 62, 0.8)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
    }
  };

  const refreshIconVariants = {
    static: { rotate: 0 },
    rotating: { 
      rotate: 360, 
      transition: { 
        duration: 1,
        ease: "linear",
        repeat: Infinity 
      } 
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <motion.div
          className="rounded-full h-16 w-16 border-4 border-t-4 border-blue-500 mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.p 
          className="text-gray-300 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {t('loadingData') || 'Loading data...'}
        </motion.p>
      </div>
    );
  }

  if (error && !attendanceData) {
    return (
      <motion.div 
        className="bg-red-900/20 border border-red-500 p-6 rounded-xl text-red-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex items-center mb-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-red-900/30 p-3 rounded-full mr-4">
            <FaTimesCircle className="text-red-500 text-xl" />
          </div>
          <h3 className="font-bold text-xl">{t('errorLoadingData') || 'Error Loading Data'}</h3>
        </motion.div>
        
        <motion.p 
          className="mb-2 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {error || t('serverConnectionError') || 'Server connection error'}
        </motion.p>
        
        <motion.p 
          className="mt-2 text-red-300/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {t('pleaseRefresh') || 'Please refresh the page'}
        </motion.p>
        
        <motion.button 
          onClick={handleRefresh}
          className="mt-6 bg-red-800/30 hover:bg-red-800/50 text-white py-3 px-6 rounded-lg transition-colors flex items-center"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaSync className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> {t('retry') || 'Retry'}
        </motion.button>
      </motion.div>
    );
  }

  if (!attendanceData || !attendanceData.days) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-6 text-[var(--foreground)]">{t('adminDashboard') || 'Admin Dashboard'}</h1>
        <div className="bg-[#232738] rounded-xl p-6 shadow-md">
          <p className="text-[var(--foreground-secondary)]">{t('noAttendanceData') || 'No attendance data available'}</p>
          <motion.button 
            onClick={handleRefresh}
            className="mt-4 bg-blue-800/30 hover:bg-blue-800/50 text-[var(--foreground)] py-2 px-4 rounded-lg transition-colors flex items-center"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaSync className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> {t('retry') || 'Retry'}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const summary = calculateSummaryData();
  const pieChartData = preparePieChartData();
    
  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40 p-4 sm:p-6 border border-blue-800/30"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div>
            <motion.h1 
              className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {t('adminDashboard') || 'Admin Dashboard'}
            </motion.h1>
            <motion.p 
              className="text-xs sm:text-sm text-blue-200/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {t('last 7 Days') || 'Last 7 Days'} • {attendanceData.startDate} - {attendanceData.endDate}
            </motion.p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 mt-2 md:mt-0">
            <div className="bg-[#232738] text-white py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg border border-[#2a2f3e] min-w-[120px] sm:min-w-[160px] flex items-center justify-center">
              <span className="text-xs sm:text-sm text-center">{t('All Courses') || 'All Courses'}</span>
            </div>
            
            <motion.button
              onClick={handleRefresh}
              className="flex items-center bg-white/10 hover:bg-white/20 text-white py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.03, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                variants={refreshIconVariants}
                animate={showRefreshAnimation ? "rotating" : "static"}
                className="text-xs sm:text-sm"
              >
                <FaSync className={`${isRTL ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2'}`} />
              </motion.div>
              <span className="text-xs sm:text-sm">{t('refresh') || 'Refresh'}</span>
            </motion.button>
          </div>
        </div>
        
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
        />
      </motion.div>
      
      <motion.div 
        className="flex flex-wrap gap-2"
        variants={itemVariants}
      >
        <motion.button
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 bg-[#232738] ${activeTab === 'overview' ? 'text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('overview')}
          variants={tabVariants}
          animate={activeTab === 'overview' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaChartLine className="text-blue-400 text-xs sm:text-sm" />
          {t('overview') || 'Overview'}
        </motion.button>
        
        <motion.button
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 bg-[#232738] ${activeTab === 'details' ? 'text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('details')}
          variants={tabVariants}
          animate={activeTab === 'details' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaChartPie className="text-purple-400 text-xs sm:text-sm" />
          {t('details') || 'Details'}
        </motion.button>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
        variants={itemVariants}
      >
        <AdminDashCard 
          title={t('attendanceRate') || 'Attendance Rate'}
          value={`${summary.overallAttendanceRate}%`}
          icon={<FaChartLine className="text-blue-400" size={20} />}
          color="bg-blue-900"
          subtitle={t('forThePeriod') || 'For the period'} 
          animate={true}
          isIncrease={summary.overallAttendanceRate >= 70}
          percentage={summary.overallAttendanceRate >= 70 ? (t('good') || 'Good') : summary.overallAttendanceRate >= 50 ? (t('average') || 'Average') : (t('poor') || 'Poor')}
        />
        <AdminDashCard 
          title={t('present') || 'Present'}
          value={summary.totalPresent}
          percentage={`${summary.totalAttendanceRate}%`}
          isIncrease={summary.totalAttendanceRate >= 50}
          icon={<FaUserCheck className="text-green-400" size={20} />}
          color="bg-green-900"
          animate={true}
        />
        <AdminDashCard 
          title={t('absent') || 'Absent'}
          value={summary.totalAbsent}
          percentage={`${100 - summary.totalAttendanceRate}%`}
          isIncrease={false}
          icon={<FaUserTimes className="text-red-400" size={20} />}
          color="bg-red-900"
          animate={true}
        />
        <AdminDashCard 
          title={t('reportingPeriod') || 'Reporting Period'}
          value={t('last7Days') || 'Last 7 Days'}
          icon={<FaCalendarAlt className="text-purple-400" size={20} />}
          color="bg-purple-900"
          subtitle={`${attendanceData.startDate} - ${attendanceData.endDate}`}
          animate={true}
        />
      </motion.div>
      
      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <motion.div 
                className="lg:col-span-2 bg-[#232738] rounded-xl p-3 sm:p-5 shadow-md border border-[#2a2f3e] overflow-hidden relative"
                variants={itemVariants}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                />
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 relative gap-2">
                  <h3 className="text-base sm:text-lg font-medium text-gray-300">{t('weeklyAttendanceTrends') || 'Weekly Attendance Trends'}</h3>
                  <div className="text-xs sm:text-sm text-gray-400 flex flex-wrap gap-3">
                    <span className="inline-flex items-center">
                      <span className="inline-block w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-green-500 mr-1"></span> {t('present') || 'Present'}
                    </span>
                    <span className="inline-flex items-center">
                      <span className="inline-block w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-red-500 mr-1"></span> {t('absent') || 'Absent'}
                    </span>
                  </div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="min-h-[200px] sm:min-h-[300px]"
                >
                  <AdminLineChart data={attendanceData.days} />
                </motion.div>
              </motion.div>
              
              <motion.div
                className="bg-[#232738] rounded-xl p-3 sm:p-5 shadow-md border border-[#2a2f3e] overflow-hidden relative"
                variants={itemVariants}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                />
                
                <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 text-gray-300 relative">{t('attendanceDistribution') || 'Attendance Distribution'}</h3>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="min-h-[180px] sm:min-h-[220px]"
                >
                  <AdminPieChart data={pieChartData} />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
                transition={{ duration: 0.2 }}
              >
                <AdminWeeklySummary data={attendanceData.days} />
              </motion.div>
              
              <motion.div 
                className="lg:col-span-2" 
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
                transition={{ duration: 0.2 }}
              >
                <AdminDailyAttendance data={attendanceData.days} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className="bg-[#232738] rounded-xl p-4 sm:p-5 shadow-md border border-[#2a2f3e] overflow-hidden relative"
        variants={itemVariants}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-medium text-gray-300">{t('performanceSummary') || 'Performance Summary'}</h3>
          <div className="bg-blue-900/30 text-blue-300 py-1 px-2 sm:px-3 rounded-full text-xs font-medium self-start sm:self-auto">
            {t('weeklyReport') || 'Weekly Report'}
          </div>
        </div>
        
        <div className="relative">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs sm:text-sm text-gray-400">{t('overallAttendanceRate') || 'Overall Attendance Rate'}</span>
                <span className="text-xs sm:text-sm font-medium text-white">{summary.overallAttendanceRate}%</span>
              </div>
              <div className="w-full bg-[#1a1f2e] rounded-full h-2 sm:h-2.5 mb-3 sm:mb-4">
                <motion.div 
                  className="bg-blue-600 h-2 sm:h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${summary.overallAttendanceRate}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <motion.div 
                className="bg-[#1a1f2e]/50 rounded-lg p-3 sm:p-4 border border-[#2a2f3e]/50"
                whileHover={{ y: -5, backgroundColor: "rgba(42, 47, 62, 0.5)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">{t('bestDay') || 'Best Day'}</p>
                    <p className="text-white font-medium mt-1 text-xs sm:text-sm">{attendanceData.days.sort((a, b) => parseInt(b.attendanceRate) - parseInt(a.attendanceRate))[0].day}</p>
                  </div>
                  <div className="bg-green-900/30 p-1.5 sm:p-2 rounded-lg">
                    <FaArrowUp className="text-green-400 text-xs sm:text-sm" />
                  </div>
                </div>
                <p className="text-green-400 text-base sm:text-lg font-bold mt-2">{attendanceData.days.sort((a, b) => parseInt(b.attendanceRate) - parseInt(a.attendanceRate))[0].attendanceRate}%</p>
              </motion.div>
              
              <motion.div 
                className="bg-[#1a1f2e]/50 rounded-lg p-3 sm:p-4 border border-[#2a2f3e]/50"
                whileHover={{ y: -5, backgroundColor: "rgba(42, 47, 62, 0.5)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">{t('averageAttendance') || 'Average Attendance'}</p>
                    <p className="text-white font-medium mt-1 text-xs sm:text-sm">{t('weekly') || 'Weekly'}</p>
                  </div>
                  <div className="bg-blue-900/30 p-1.5 sm:p-2 rounded-lg">
                    <FaChartLine className="text-blue-400 text-xs sm:text-sm" />
                  </div>
                </div>
                <p className="text-blue-400 text-base sm:text-lg font-bold mt-2">{summary.overallAttendanceRate}%</p>
              </motion.div>
              
              <motion.div 
                className="bg-[#1a1f2e]/50 rounded-lg p-3 sm:p-4 border border-[#2a2f3e]/50"
                whileHover={{ y: -5, backgroundColor: "rgba(42, 47, 62, 0.5)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">{t('totalSessions') || 'Total Sessions'}</p>
                    <p className="text-white font-medium mt-1 text-xs sm:text-sm">{t('weekly') || 'Weekly'}</p>
                  </div>
                  <div className="bg-purple-900/30 p-1.5 sm:p-2 rounded-lg">
                    <FaCalendarAlt className="text-purple-400 text-xs sm:text-sm" />
                  </div>
                </div>
                <p className="text-purple-400 text-base sm:text-lg font-bold mt-2">{attendanceData.days.length}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashHome; 