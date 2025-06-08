"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { useLanguage } from "@/app/components/providers/LanguageProvider";
import { motion } from "framer-motion";

const AdminLineChart = ({ data }) => {
  const { t } = useLanguage();

  // ترتيب البيانات حسب التاريخ للرسم البياني
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  // تحويل النسب المئوية إلى أرقام إذا لم تكن كذلك بالفعل
  const processedData = sortedData.map(day => ({
    ...day,
    attendanceRate: typeof day.attendanceRate === 'number' 
      ? day.attendanceRate 
      : parseInt(day.attendanceRate) || 0
  }));

  // Custom tooltip for line chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg shadow-lg p-4">
          <p className="text-white font-medium text-sm mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <p style={{ color: entry.color }} className="text-xs font-medium">
                  {entry.name === 'Present' ? t('present') : entry.name === 'Absent' ? t('absent') : entry.name}: {entry.value}
                </p>
              </div>
            ))}
          </div>
          {payload[0] && payload[1] && (
            <div className="mt-2 pt-2 border-t border-[#2a2f3e]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <p className="text-xs font-medium text-blue-400">
                  {t('overallAttendanceRate')}: {payload[0].payload.attendanceRate}%
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer>
        <LineChart
          data={processedData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" vertical={false} />
          <XAxis 
            dataKey="day" 
            stroke="#6b7280" 
            tick={{ fill: '#9ca3af' }}
            axisLine={{ stroke: '#2a2f3e' }}
          />
          <YAxis 
            stroke="#6b7280" 
            tick={{ fill: '#9ca3af' }}
            axisLine={{ stroke: '#2a2f3e' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => {
              if (value === 'Present') return <span style={{ color: '#9ca3af' }}>{t('present')}</span>;
              if (value === 'Absent') return <span style={{ color: '#9ca3af' }}>{t('absent')}</span>;
              return <span style={{ color: '#9ca3af' }}>{value}</span>;
            }}
          />
          <Line
            type="monotone"
            dataKey="present"
            name="Present"
            stroke="#4ade80"
            strokeWidth={2}
            dot={{ fill: "#4ade80", r: 4 }}
            activeDot={{ r: 6, fill: "#4ade80", stroke: "#fff" }}
          />
          <Line
            type="monotone"
            dataKey="absent"
            name="Absent"
            stroke="#f87171"
            strokeWidth={2}
            dot={{ fill: "#f87171", r: 4 }}
            activeDot={{ r: 6, fill: "#f87171", stroke: "#fff" }}
          />
          <ReferenceLine y={0} stroke="#2a2f3e" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminLineChart; 