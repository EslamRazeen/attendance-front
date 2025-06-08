"use client";

import React, { useCallback, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Tooltip,
  Legend
} from "recharts";

const InstructorPieChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const COLORS = ["#4ade80", "#f87171"];
  const RADIAN = Math.PI / 180;

  const renderActiveShape = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#1a1f2e"
          strokeWidth={1}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
          stroke="#1a1f2e"
          strokeWidth={1}
          opacity={0.5}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff" fontSize={14} fontWeight="bold">
          {`${payload.name}`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#fff" fontSize={12}>
          {`${value} actions`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={36} textAnchor={textAnchor} fill="#9ca3af" fontSize={12}>
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  // Handle pie chart hover
  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  // If no data or all values are 0, show a message
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  if (data.length === 0 || totalValue === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-400">No attendance data available</p>
      </div>
    );
  }

  // Custom tooltip that changes color based on the segment
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const color = data.payload.color;
      
      return (
        <div 
          className="custom-tooltip" 
          style={{ 
            backgroundColor: color === '#4ade80' ? 'rgba(22, 101, 52, 0.9)' : 'rgba(153, 27, 27, 0.9)',
            border: `1px solid ${color}`,
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: `0 4px 14px ${color}30`,
            backdropFilter: 'blur(4px)',
            color: '#fff',
            transition: 'all 0.2s ease'
          }}
        >
          <p className="font-bold" style={{ color: color, fontSize: '14px', marginBottom: '4px' }}>
            {data.name}
          </p>
          <p className="text-white text-sm">
            {data.value} actions
          </p>
          <p className="text-gray-300 text-xs mt-1">
            {`(${((data.value / totalValue) * 100).toFixed(1)}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer>
        <PieChart>
          <defs>
            <filter id="glow" height="300%" width="300%" x="-100%" y="-100%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#166534" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#166534" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#991b1b" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#991b1b" stopOpacity={0.7}/>
            </linearGradient>
          </defs>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
            paddingAngle={2}
            filter="url(#glow)"
            animationBegin={200}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || COLORS[index % COLORS.length]} 
                stroke="#1a1f2e"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconSize={12}
            iconType="circle"
            formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '14px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InstructorPieChart; 