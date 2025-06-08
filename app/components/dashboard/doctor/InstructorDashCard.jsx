"use client";

import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { motion } from "framer-motion";

const InstructorDashCard = ({ title, value, percentage, isIncrease, icon, color }) => {
  // Determine if value is a percentage
  const isPercentage = typeof value === 'string' && value.includes('%');
  
  // Calculate the width for the progress bar
  const getProgressWidth = () => {
    if (isPercentage) {
      // Extract the number from percentage string
      const numValue = parseInt(value.replace('%', ''));
      return `${numValue}%`;
    } else if (typeof value === 'number') {
      // If it's a count, cap at 100
      return `${Math.min(value, 100)}%`;
    }
    return '0%';
  };

  return (
    <motion.div 
      className="p-5 bg-[#232738] rounded-xl shadow-md relative overflow-hidden h-full border border-[#2a2f3e]"
      whileHover={{ translateY: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[var(--foreground-secondary)] text-xs uppercase tracking-wider font-medium">{title}</h3>
          {icon && (
            <div className={`flex items-center justify-center p-2 rounded-lg bg-opacity-20 ${color || 'bg-blue-900/30'}`}>
              {icon}
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <motion.span 
            className="text-3xl font-bold text-[var(--foreground)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {value}
          </motion.span>
          
          {percentage && (
            <div 
              className={`flex items-center text-sm px-2 py-1 rounded-full ${
                isIncrease ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'
              }`}
            >
              {isIncrease ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              {percentage}
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-[#2a2f3e]">
          <div className="h-1.5 bg-[#1a1f2e] rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${color || (isIncrease ? 'bg-green-500' : 'bg-red-500')}`}
              initial={{ width: 0 }}
              animate={{ width: getProgressWidth() }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </div>
      </div>
      
      <div 
        className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10 ${
          color ? `${color}/10` : (isIncrease ? 'bg-green-500/10' : 'bg-red-500/10')
        }`}
        style={{ backdropFilter: "blur(8px)" }}
      />
    </motion.div>
  );
};

export default InstructorDashCard; 