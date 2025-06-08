"use client";

import React, { useState } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { motion } from "framer-motion";

const AdminDashCard = ({ title, value, percentage, isIncrease, icon, color, subtitle, animate = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // تأثيرات حركية متقدمة
  const cardVariants = {
    initial: { 
      scale: 0.98,
      opacity: 0,
      y: 20
    },
    animate: { 
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    },
    hover: {
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };
  
  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.3
      }
    },
    hover: { 
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: {
        duration: 0.5
      }
    }
  };
  
  const valueVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        delay: 0.3,
        duration: 0.5
      }
    }
  };
  
  const progressVariants = {
    initial: { width: 0 },
    animate: { 
      width: `${Math.min(value, 100)}%`,
      transition: {
        delay: 0.5,
        duration: 1
      }
    }
  };
  
  const pulseAnimation = {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse"
    }
  };

  return (
    <motion.div 
      className="p-5 bg-[#232738] rounded-xl shadow-md relative overflow-hidden h-full border border-[#2a2f3e]"
      variants={cardVariants}
      initial={animate ? "initial" : "animate"}
      animate="animate"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full relative z-10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-gray-400 text-xs uppercase tracking-wider font-medium">{title}</h3>
          {icon && (
            <motion.div 
              className={`flex items-center justify-center p-2.5 rounded-lg bg-opacity-20 ${color || 'bg-blue-900/30'}`}
              variants={iconVariants}
              animate={isHovered ? "hover" : "animate"}
            >
              {icon}
            </motion.div>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <motion.span 
            className="text-3xl font-bold text-white"
            variants={valueVariants}
          >
            {value}
          </motion.span>
          
          {percentage && (
            <motion.div 
              className={`flex items-center text-sm px-2 py-1 rounded-full ${
                isIncrease ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'
              }`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {isIncrease ? 
                <FaArrowUp className="mr-1 animate-pulse" /> : 
                <FaArrowDown className="mr-1 animate-pulse" />
              }
              {percentage}
            </motion.div>
          )}
        </div>
        
        {subtitle && (
          <motion.p 
            className="text-gray-400 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.5 }}
          >
            {subtitle}
          </motion.p>
        )}
        
        <div className="mt-4 pt-4 border-t border-[#2a2f3e]">
          <div className="h-1.5 bg-[#1a1f2e] rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${color || (isIncrease ? 'bg-green-500' : 'bg-red-500')}`}
              variants={progressVariants}
            />
          </div>
        </div>
      </div>
      
      <motion.div 
        className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 ${
          color ? `${color}/20` : (isIncrease ? 'bg-green-500/20' : 'bg-red-500/20')
        }`}
        style={{ backdropFilter: "blur(8px)" }}
        animate={isHovered ? pulseAnimation : {}}
      />
      
      {/* إضافة تأثير الإضاءة عند التحويم */}
      {isHovered && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/5 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
};

export default AdminDashCard; 