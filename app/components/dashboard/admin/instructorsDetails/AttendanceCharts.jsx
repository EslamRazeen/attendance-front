import React, { useState, useEffect, useCallback } from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Sector, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from "recharts";

// Helper functions for charts
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "L", x, y,
    "Z"
  ].join(" ");
}

export const AttendancePieChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const COLORS = ["#4ade80", "#f87171"];
  const RADIAN = Math.PI / 180;
  const [chartHeight, setChartHeight] = useState(280);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check screen size and adjust chart height
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setChartHeight(mobile ? 200 : 280);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const renderActiveShape = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    
    // Distance based on screen size
    const offset = isMobile ? 20 : 30;
    
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + offset) * cos;
    const my = cy + (outerRadius + offset) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    
    // Font size based on screen size
    const fontSize = isMobile ? 11 : 14;
    const smallFontSize = isMobile ? 9 : 12;

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
        {!isMobile && (
          <>
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff" fontSize={fontSize} fontWeight="bold">
              {`${payload.name}`}
            </text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#fff" fontSize={smallFontSize}>
              {`${value} actions`}
            </text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={36} textAnchor={textAnchor} fill="#9ca3af" fontSize={smallFontSize}>
              {`(${(percent * 100).toFixed(1)}%)`}
            </text>
          </>
        )}
      </g>
    );
  };

  // Handle pie chart hover
  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  // If no data or all values are zero
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  if (data.length === 0 || totalValue === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px]">
        <p className="text-[var(--foreground-secondary)] text-sm">No attendance data available</p>
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
            padding: isMobile ? '6px 10px' : '10px 14px',
            boxShadow: `0 4px 14px ${color}30`,
            backdropFilter: 'blur(4px)',
            color: '#fff',
            transition: 'all 0.2s ease'
          }}
        >
          <p className="font-bold" style={{ color: color, fontSize: isMobile ? '12px' : '14px', marginBottom: '4px' }}>
            {data.name}
          </p>
          <p className="text-white" style={{ fontSize: isMobile ? '11px' : '14px' }}>
            {data.value} Actions
          </p>
          <p className="text-[var(--foreground-secondary)]" style={{ fontSize: isMobile ? '10px' : '12px', marginTop: '1px' }}>
            {`(${((data.value / totalValue) * 100).toFixed(1)}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
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
          innerRadius={isMobile ? 40 : 60}
          outerRadius={isMobile ? 60 : 80}
          fill="#8884d8"
          dataKey="value"
          onMouseEnter={onPieEnter}
          paddingAngle={4}
          animationBegin={200}
          animationDuration={1000}
          filter="url(#glow)"
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
        <RechartsTooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const AttendanceBarChart = ({ present, absent }) => {
  const data = [
    { name: 'Present', value: present ?? 0, color: '#4ade80' },
    { name: 'Absent', value: absent ?? 0, color: '#f87171' }
  ];
  
  const [chartHeight, setChartHeight] = useState(280);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check screen size and adjust chart height
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setChartHeight(mobile ? 200 : 280);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  // If no data
  if (present === 0 && absent === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px]">
        <p className="text-[var(--foreground-secondary)] text-sm">No attendance data available</p>
      </div>
    );
  }

  // Custom tooltip that changes color based on the bar
  const CustomBarTooltip = ({ active, payload }) => {
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
            padding: '8px 12px',
            boxShadow: `0 4px 14px ${color}30`,
            backdropFilter: 'blur(4px)',
          }}
        >
          <p style={{ color: color, fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
            {data.name}
          </p>
          <p style={{ color: '#fff', fontSize: '14px' }}>
            {data.value} Actions
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginTop: '2px' }}>
            {`(${((data.value / (present + absent)) * 100).toFixed(1)}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
        <defs>
          <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity={0.9}/>
            <stop offset="100%" stopColor="#4ade80" stopOpacity={0.7}/>
          </linearGradient>
          <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity={0.9}/>
            <stop offset="100%" stopColor="#f87171" stopOpacity={0.7}/>
          </linearGradient>
          <filter id="glow" height="200%" width="200%" x="-50%" y="-50%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3e" vertical={false} opacity={0.3} />
        <XAxis 
          dataKey="name" 
          axisLine={{ stroke: '#2a2f3e' }}
          tick={{ fill: '#9ca3af', fontSize: 12 }}
        />
        <YAxis 
          axisLine={{ stroke: '#2a2f3e' }}
          tick={{ fill: '#9ca3af', fontSize: 12 }}
        />
        <RechartsTooltip 
          content={<CustomBarTooltip />} 
          cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
        />
        <Bar 
          dataKey="value" 
          radius={[4, 4, 0, 0]}
          barSize={60}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={entry.name === 'Present' ? 'url(#greenGradient)' : 'url(#redGradient)'} 
              stroke={entry.color}
              strokeWidth={1}
              filter="url(#glow)"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}; 