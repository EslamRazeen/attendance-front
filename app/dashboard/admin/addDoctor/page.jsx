"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaCheck, FaUserPlus } from "react-icons/fa";
import Link from "next/link";
import { useAddInstructor } from "@/app/hooks/useAddInstructor";

// Import Step Components
import BasicInfo from "@/app/components/dashboard/admin/addDoctor/BasicInfo";
import ProfessionalInfo from "@/app/components/dashboard/admin/addDoctor/ProfessionalInfo";
import CourseSelection from "@/app/components/dashboard/admin/addDoctor/CourseSelection";

const AddDoctor = () => {
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 }
  };

  const {
    // State
    currentStep,
    newUser,
    errors,
    formSubmitted,
    successNotification,
    selectedDepartment,
    selectedLevel,
    filteredCourses,
    
    // Loading states
    isLoadingCourses,
    isAdding,
    
    // Actions
    handleInputChange,
    validateField,
    handleDepartmentSelect,
    handleRoleSelect,
    handleCourseSelect,
    handleNextStep,
    handlePrevStep,
    handleAddUser,
    clearFilters,
    
    // Constants
    levels,
    departments,
    roles
  } = useAddInstructor();

  return (
    <motion.div 
      className="w-full space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40 p-8 border border-blue-800/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Link href="/dashboard/admin" className="flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors group">
              <FaArrowLeft className="mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" /> Back to Instructors
            </Link>
            <h1 className="text-3xl font-bold text-white mb-3 flex items-center">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Add New Instructor
              </span>
            </h1>
            <p className="text-blue-200/80 max-w-lg">
              Create a new instructor account by filling out the required information in the following steps.
            </p>
          </div>
          
          {/* Steps indicator */}
          <div className="flex items-center space-x-3">
            {[1, 2, 3].map((step) => (
              <motion.div 
                key={step} 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === step 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' 
                    : currentStep > step 
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' 
                      : 'bg-[#1a1f2e] text-gray-400'
                } border ${
                  currentStep === step 
                    ? 'border-blue-400/50 shadow-md shadow-blue-500/20' 
                    : currentStep > step 
                      ? 'border-green-400/50 shadow-md shadow-green-500/20' 
                      : 'border-gray-700'
                }`}
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: currentStep >= step ? "0 0 10px rgba(59, 130, 246, 0.3)" : "none"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {currentStep > step ? <FaCheck className="text-sm" /> : <span>{step}</span>}
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: currentStep / 3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </motion.div>

      {/* Form Content */}
      <div className="bg-[#232738] rounded-xl p-6 shadow-lg border border-[#2a2f3e] overflow-hidden relative">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />

        <div className="relative">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <BasicInfo 
                newUser={newUser}
                handleInputChange={handleInputChange}
                validateField={validateField}
                errors={errors}
                formSubmitted={formSubmitted}
                pageVariants={pageVariants}
              />
            )}
            
            {currentStep === 2 && (
              <ProfessionalInfo 
                newUser={newUser}
                errors={errors}
                formSubmitted={formSubmitted}
                pageVariants={pageVariants}
                handleDepartmentSelect={handleDepartmentSelect}
                handleRoleSelect={handleRoleSelect}
                departments={departments}
                roles={roles}
              />
            )}
            
            {currentStep === 3 && (
              <CourseSelection 
                newUser={newUser}
                handleCourseSelect={handleCourseSelect}
                errors={errors}
                formSubmitted={formSubmitted}
                pageVariants={pageVariants}
                filteredCourses={filteredCourses}
                isLoadingCourses={isLoadingCourses}
                selectedDepartment={selectedDepartment}
                selectedLevel={selectedLevel}
                setSelectedDepartment={(dept) => handleDepartmentSelect(dept)}
                setSelectedLevel={(level) => setSelectedLevel(level)}
                clearFilters={clearFilters}
                levels={levels}
                departments={departments}
              />
            )}
          </AnimatePresence>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <motion.button
              onClick={handlePrevStep}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                currentStep === 1
                  ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                  : 'bg-[#1a1f2e] text-gray-300 hover:bg-[#2a2f3e] border border-[#2a2f3e] hover:border-blue-500/30'
              } transition-all`}
              whileHover={currentStep !== 1 ? { scale: 1.03, x: -3 } : {}}
              whileTap={currentStep !== 1 ? { scale: 0.97 } : {}}
              disabled={currentStep === 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Previous</span>
            </motion.button>
            
            {currentStep < 3 ? (
              <motion.button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md shadow-blue-500/20 border border-blue-500/50"
                whileHover={{ scale: 1.03, x: 3 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
            ) : (
              <motion.button
                onClick={handleAddUser}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-3 rounded-lg flex items-center gap-2 shadow-md shadow-green-500/20 border border-green-500/50"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <motion.div 
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <FaUserPlus className="text-base" />
                    <span>Add Instructor</span>
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* Error message */}
          {errors.submit && (
            <motion.div 
              className="mt-6 bg-red-900/30 border border-red-500/50 text-red-300 px-6 py-4 rounded-lg flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errors.submit}</span>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Success notification */}
      {successNotification && (
        <motion.div 
          className="fixed top-4 right-4 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 border border-green-500/50"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
      >
        <div className="bg-white/20 p-2 rounded-full">
          <FaCheck className="text-lg" />
        </div>
        <div>
          <h4 className="font-medium">Success!</h4>
          <p className="text-sm text-green-100">Instructor added successfully!</p>
        </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AddDoctor; 