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
  ResponsiveContainer
} from "recharts";

const InstructorLineChart = ({ data }) => {
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
                  {entry.name}: {entry.value}
                </p>
              </div>
            ))}
          </div>
          {payload[0] && payload[1] && (
            <div className="mt-2 pt-2 border-t border-[#2a2f3e]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <p className="text-xs font-medium text-blue-400">
                  Attendance Rate: {payload[0].payload.attendanceRate}%
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Format the x-axis label based on the data
  const formatXAxisLabel = (item) => {
    // For weekly data, show day name
    if (item.day) {
      return item.day;
    }
    // For monthly data, show week number
    if (item.week) {
      return item.week;
    }
    // Fallback to name property or the item itself
    return item.name || item;
  };

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" vertical={false} />
          <XAxis 
            dataKey={item => formatXAxisLabel(item)}
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
            formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InstructorLineChart; 