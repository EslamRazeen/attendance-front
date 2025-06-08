"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FaFileUpload, FaFileAlt, FaEdit, FaSearch, FaFilter } from 'react-icons/fa';
import { HiDocumentReport } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { IoWarning } from 'react-icons/io5';

const Document = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 300, damping: 10 }
    }
  };

  return (
    <motion.div 
      className="p-3 sm:p-6 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div 
        className="mb-4 sm:mb-8"
        variants={itemVariants}
      >
        <h1 className="text-xl sm:text-3xl font-bold text-[var(--foreground)] mb-1 sm:mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Document Management
        </h1>
        <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">
          Upload, edit, and manage student documents and excel sheets
        </p>
      </motion.div>

      {/* Main Content Area */}
      <motion.div 
        className="flex justify-center"
        variants={containerVariants}
      >
        <motion.div
          className="bg-[#1a1f2e] p-4 sm:p-6 rounded-xl border border-[#2a2f3e] hover:border-blue-500/30 transition-colors w-full sm:w-2/3 md:w-1/2 lg:w-1/3 cursor-pointer"
          variants={cardVariants}
          whileHover="hover"
          onClick={() => router.push('/dashboard/pages/document/upload')}
        >
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-lg sm:text-xl">
              <FaFileUpload />
            </div>
          </div>
          <h3 className="text-base sm:text-xl font-semibold text-[var(--foreground)] mb-1">
            Upload Excel Sheet
          </h3>
          <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mb-3">
            Upload student data via Excel spreadsheets for batch processing
          </p>
          <div className="flex items-center text-blue-400 hover:text-blue-300 transition-colors text-xs sm:text-sm">
            Upload Now <span className="ml-2">&rarr;</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Document;
