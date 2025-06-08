import React from "react";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

const BasicInfo = ({ newUser, handleInputChange, validateField, errors, formSubmitted, pageVariants }) => {
  return (
    <motion.div
      key="step1"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.4 }}
      className="py-6"
    >
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
        <span className="bg-blue-600/20 text-blue-400 p-2 rounded-lg mr-3">1</span>
        Basic Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <motion.div 
          className="form-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-gray-300 mb-2 font-medium">Full Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              onBlur={(e) => validateField("name", e.target.value)}
              className={`bg-[#1a1f2e] text-white py-3 pl-10 pr-4 rounded-lg border ${
                errors.name ? 'border-red-500' : 'border-[#2a2f3e] group-hover:border-blue-500/50'
              } w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
              placeholder="Enter full name"
            />
          </div>
          {errors.name && (
            <motion.p 
              className="text-red-500 text-sm mt-1 flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.name}
            </motion.p>
          )}
        </motion.div>
        
        {/* Email */}
        <motion.div 
          className="form-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-gray-300 mb-2 font-medium">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              onBlur={(e) => validateField("email", e.target.value)}
              className={`bg-[#1a1f2e] text-white py-3 pl-10 pr-4 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-[#2a2f3e] group-hover:border-purple-500/50'
              } w-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all`}
              placeholder="Enter email address"
            />
          </div>
          {errors.email && (
            <motion.p 
              className="text-red-500 text-sm mt-1 flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </motion.p>
          )}
        </motion.div>
        
        {/* Password */}
        <motion.div 
          className="form-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-gray-300 mb-2 font-medium">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-500 group-hover:text-green-400 transition-colors" />
            </div>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              onBlur={(e) => validateField("password", e.target.value)}
              className={`bg-[#1a1f2e] text-white py-3 pl-10 pr-4 rounded-lg border ${
                errors.password ? 'border-red-500' : 'border-[#2a2f3e] group-hover:border-green-500/50'
              } w-full focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all`}
              placeholder="Enter password"
            />
          </div>
          {errors.password && (
            <motion.p 
              className="text-red-500 text-sm mt-1 flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </motion.p>
          )}
        </motion.div>
        
        {/* Confirm Password */}
        <motion.div 
          className="form-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-gray-300 mb-2 font-medium">Confirm Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-500 group-hover:text-yellow-400 transition-colors" />
            </div>
            <input
              type="password"
              name="passwordConfirm"
              value={newUser.passwordConfirm}
              onChange={handleInputChange}
              onBlur={(e) => validateField("passwordConfirm", e.target.value)}
              className={`bg-[#1a1f2e] text-white py-3 pl-10 pr-4 rounded-lg border ${
                errors.passwordConfirm ? 'border-red-500' : 'border-[#2a2f3e] group-hover:border-yellow-500/50'
              } w-full focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all`}
              placeholder="Confirm password"
            />
          </div>
          {errors.passwordConfirm && (
            <motion.p 
              className="text-red-500 text-sm mt-1 flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.passwordConfirm}
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BasicInfo; 