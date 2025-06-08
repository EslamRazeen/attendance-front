"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from "@/app/components/providers/LanguageProvider";

const AdminWeeklySummary = ({ data }) => {
  const { t, isRTL } = useLanguage();
  
  // Calculate totals
  const totalPresent = data.reduce((sum, day) => sum + day.present, 0);
  const totalAbsent = data.reduce((sum, day) => sum + day.absent, 0);
  const totalStudents = totalPresent + totalAbsent;
  
  // Calculate overall attendance rate
  const overallRate = totalStudents > 0 
    ? Math.round((totalPresent / totalStudents) * 100) 
    : 0;
    
  // Find the day with highest attendance
  const highestAttendanceDay = [...data]
    .filter(day => day.present > 0 || day.absent > 0)
    .sort((a, b) => {
      const rateA = typeof a.attendanceRate === 'number' ? a.attendanceRate : parseInt(a.attendanceRate) || 0;
      const rateB = typeof b.attendanceRate === 'number' ? b.attendanceRate : parseInt(b.attendanceRate) || 0;
      return rateB - rateA;
    })[0];
  
  // Find the day with lowest attendance
  const lowestAttendanceDay = [...data]
    .filter(day => day.present > 0 || day.absent > 0)
    .sort((a, b) => {
      const rateA = typeof a.attendanceRate === 'number' ? a.attendanceRate : parseInt(a.attendanceRate) || 0;
      const rateB = typeof b.attendanceRate === 'number' ? b.attendanceRate : parseInt(b.attendanceRate) || 0;
      return rateA - rateB;
    })[0];

  // تحويل التواريخ إلى تنسيق أكثر قراءة
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // الحصول على أول وآخر تاريخ بعد الترتيب
  const sortedDates = [...data].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  const firstDate = sortedDates.length > 0 ? sortedDates[0].date : '';
  const lastDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1].date : '';

  return (
    <motion.div 
      className="bg-[#232738] rounded-xl p-5 shadow-md relative border border-[#2a2f3e]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-medium mb-4 text-white">{t('weeklySummary')}</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">{t('totalStudents')}</span>
          <span className="text-white font-medium">{totalStudents}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">{t('totalPresent')}</span>
          <span className="text-green-400 font-medium">{totalPresent}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">{t('totalAbsent')}</span>
          <span className="text-red-400 font-medium">{totalAbsent}</span>
        </div>
        
        <div className="h-px bg-[#2a2f3e] my-2"></div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">{t('overallAttendanceRate')}</span>
          <span className={`font-medium ${overallRate >= 70 ? 'text-green-400' : overallRate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {overallRate}%
          </span>
        </div>
        
        {highestAttendanceDay && (
          <div className="flex justify-between items-center">
            <span className="text-[var(--foreground-secondary)]">{t('bestDay')}</span>
            <div className="text-right">
              <span className="text-white font-medium block">{highestAttendanceDay.day}</span>
              <span className="text-green-400 text-sm">
                {typeof highestAttendanceDay.attendanceRate === 'number' 
                  ? `${highestAttendanceDay.attendanceRate}%` 
                  : highestAttendanceDay.attendanceRate}
              </span>
            </div>
          </div>
        )}
        
        {lowestAttendanceDay && (
          <div className="flex justify-between items-center">
            <span className="text-[var(--foreground-secondary)]">{t('lowestDay')}</span>
            <div className="text-right">
              <span className="text-white font-medium block">{lowestAttendanceDay.day}</span>
              <span className="text-red-400 text-sm">
                {typeof lowestAttendanceDay.attendanceRate === 'number' 
                  ? `${lowestAttendanceDay.attendanceRate}%` 
                  : lowestAttendanceDay.attendanceRate}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-[#2a2f3e]">
        <div className="text-xs text-gray-400">{t('reportingPeriod')}</div>
        <div className="text-sm text-white">{firstDate} - {lastDate}</div>
      </div>
    </motion.div>
  );
};

export default AdminWeeklySummary; 