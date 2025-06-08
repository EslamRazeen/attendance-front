"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useLanguage } from "@/app/components/providers/LanguageProvider";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress } from '@mui/material';

const AdminDailyAttendance = ({ data }) => {
  const { t, isRTL } = useLanguage();

  // ترتيب البيانات من الأحدث إلى الأقدم لعرضها في الجدول
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // ترتيب تنازلي (من الأحدث إلى الأقدم)
  });

  return (
    <motion.div 
      className="bg-[#232738] rounded-xl p-5 shadow-md relative border border-[#2a2f3e]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-medium mb-4 text-gray-300">{t('dailyAttendance')}</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[#2a2f3e]">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('date')}</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('day')}</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('present')}</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('absent')}</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('rate')}</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((day, index) => {
              // تأكد من أن معدل الحضور هو رقم
              const attendanceRate = typeof day.attendanceRate === 'number' 
                ? day.attendanceRate 
                : parseInt(day.attendanceRate) || 0;
              
              const totalStudents = day.present + day.absent;
              
              return (
                <tr 
                  key={index} 
                  className={`border-b border-[#2a2f3e] hover:bg-[#2a2f3e]/50 transition-colors ${
                    index % 2 === 0 ? 'bg-[#1e2233]/30' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-sm text-gray-300">{day.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-300">{day.day}</td>
                  <td className="py-3 px-4">
                    <span className="text-green-400 font-medium">{day.present}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-red-400 font-medium">{day.absent}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-[#1a1f2e] rounded-full h-2 mr-2">
                        <div 
                          className={`h-full rounded-full ${
                            attendanceRate >= 70 ? 'bg-green-500' : 
                            attendanceRate >= 40 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${attendanceRate}%` }}
                        />
                      </div>
                      <span className="text-gray-300 text-sm">{attendanceRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {totalStudents > 0 ? (
                      <div className="flex items-center">
                        {attendanceRate >= 70 ? (
                          <FaCheckCircle className={`text-green-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        ) : (
                          <FaTimesCircle className={`text-red-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        )}
                        <span className={`text-sm ${
                          attendanceRate >= 70 ? 'text-green-400' : 
                          attendanceRate >= 40 ? 'text-yellow-400' : 
                          'text-red-400'
                        }`}>
                          {attendanceRate >= 70 ? t('good') : 
                           attendanceRate >= 40 ? t('average') : 
                           t('poor')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">{t('noData')}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AdminDailyAttendance; 