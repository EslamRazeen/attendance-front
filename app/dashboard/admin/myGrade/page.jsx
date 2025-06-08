"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserGraduate, FaArrowUp, FaFilter, FaCheckCircle, FaTimesCircle, FaSpinner, FaSearch } from "react-icons/fa";
import { useGradeManagement } from "@/app/hooks/useGradeManagement";

const MyGradePage = () => {
  const {
    // State
    selectedLevel,
    selectedDepartments,
    selectedStudents,
    filteredStudents,
    searchQuery,
    selectAll,
    status,
    
    // Loading states
    loading,
    upgrading,
    
    // Actions
    setSelectedLevel,
    setSearchQuery,
    toggleDepartment,
    toggleStudentSelection,
    toggleSelectAll,
    handleUpgradeStudents,
    handleClearFilters,
    
    // Utilities
    getNextLevel,
    
    // Constants
    levels,
    departments
  } = useGradeManagement();

  // Page animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      className="w-full min-h-screen bg-gradient-to-br from-[#181c2a] to-[#232738] py-10 px-2 sm:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex items-center gap-4 mb-10"
        variants={itemVariants}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/40 to-blue-500/40 flex items-center justify-center shadow-lg border-4 border-green-800/30">
          <FaArrowUp className="text-green-400 text-3xl" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Upgrade Student Levels
            <span className="ml-2 px-2 py-0.5 rounded bg-green-900/40 text-xs text-green-300 font-semibold animate-fadeIn">Management</span>
          </h1>
          <p className="text-gray-400">Promote students to the next academic level</p>
        </div>
      </motion.div>

      {/* Filters Card */}
      <motion.div
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-900/40 via-blue-900/40 to-green-900/40 p-6 border border-green-800/30 shadow-xl mb-8"
        variants={itemVariants}
      >
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="flex flex-col items-center w-full md:w-1/2">
            <div className="mb-2 text-base font-bold text-green-400 tracking-wide text-center">Current Level</div>
            <div className="flex flex-row gap-3 justify-center">
              {levels.map((level) => (
                <motion.button
                  key={level}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 border border-transparent text-sm focus:outline-none ${selectedLevel === level ? "bg-green-500 text-white shadow-lg scale-105" : "bg-[#181c2a] text-gray-200 hover:bg-green-900/40 hover:border-green-500"}`}
                  onClick={() => setSelectedLevel(level)}
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Level {level}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center w-full md:w-1/2">
            <div className="mb-2 text-base font-bold text-blue-400 tracking-wide text-center">Department (Multi-select)</div>
            <div className="flex flex-row gap-3 justify-center flex-wrap">
              {departments.map((dept) => (
                <motion.button
                  key={dept}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 border border-transparent text-sm focus:outline-none ${selectedDepartments.includes(dept) ? "bg-blue-500 text-white shadow-lg scale-105" : "bg-[#181c2a] text-gray-200 hover:bg-blue-900/40 hover:border-blue-500"}`}
                  onClick={() => toggleDepartment(dept)}
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {dept}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-green-500 animate-gradient"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
        />
      </motion.div>

      {/* Action Panel */}
      {selectedLevel && selectedDepartments.length > 0 && (
        <motion.div
          className="mb-6 p-5 bg-[#232738] rounded-xl border border-[#2a2f3e] shadow-md"
          variants={itemVariants}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-white">
                {loading ? "Loading students..." : `Selected ${selectedStudents.length} of ${filteredStudents.length} students`}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {filteredStudents.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1a1f2e] text-blue-300 rounded-lg hover:bg-[#1a1f2e]/80 transition-colors"
                >
                  {selectAll ? <FaTimesCircle /> : <FaCheckCircle />}
                  <span>{selectAll ? "Deselect All" : "Select All"}</span>
                </button>
              )}
              <button
                onClick={handleUpgradeStudents}
                disabled={upgrading || selectedStudents.length === 0}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                  selectedStudents.length > 0
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-600 text-gray-300 cursor-not-allowed"
                }`}
              >
                {upgrading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Upgrading...</span>
                  </>
                ) : (
                  <>
                    <FaArrowUp />
                    <span>Upgrade to Level {getNextLevel(selectedLevel)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Students List with Search */}
      {selectedLevel && selectedDepartments.length > 0 && (
        <motion.div
          className="bg-[#232738] rounded-xl p-6 shadow-md border border-[#2a2f3e] overflow-hidden"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FaUserGraduate className="mr-3 text-blue-400" />
              Students in Level {selectedLevel} {selectedDepartments.length > 0 ? `- ${selectedDepartments.join(", ")}` : ""}
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1a1f2e] text-gray-300 rounded-lg hover:bg-[#1a1f2e]/80 transition-colors"
                >
                  <FaTimesCircle />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {status && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-3 rounded-lg ${
                status.includes("Successfully") 
                  ? "bg-green-900/30 text-green-400 border border-green-800/50" 
                  : "bg-red-900/30 text-red-400 border border-red-800/50"
              }`}
            >
              {status}
            </motion.div>
          )}

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <FaSpinner className="text-blue-400 text-3xl animate-spin mb-4" />
              <p className="text-gray-400">Loading students from Level {selectedLevel}...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-[#1a1f2e]/50 p-8 rounded-lg text-center">
              <FaUserGraduate className="mx-auto text-4xl text-gray-500 mb-3 opacity-50" />
              <p className="text-gray-400">
                {searchQuery 
                  ? "No students found matching your search criteria" 
                  : selectedLevel && selectedDepartments.length > 0
                    ? `No students found in Level ${selectedLevel} with department${selectedDepartments.length > 1 ? 's' : ''} ${selectedDepartments.join(", ")}`
                    : "Please select a level and at least one department to view students"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredStudents.map((student) => (
                  <motion.div
                    key={student._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`relative bg-[#1a1f2e] border ${
                      selectedStudents.includes(student._id) 
                        ? "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                        : "border-[#2a2f3e]"
                    } rounded-xl p-5 hover:bg-[#1a1f2e]/80 transition-all cursor-pointer`}
                    onClick={() => toggleStudentSelection(student._id)}
                  >
                    <div className="absolute top-4 right-4">
                      <div className={`w-5 h-5 rounded-full ${
                        selectedStudents.includes(student._id)
                          ? "bg-blue-500"
                          : "bg-[#2a2f3e]"
                      } flex items-center justify-center`}>
                        {selectedStudents.includes(student._id) && (
                          <FaCheckCircle className="text-white text-xs" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${
                        student.name ? student.name.charAt(0).toLowerCase() : 'a'
                      } bg-blue-900/50 flex items-center justify-center text-white font-bold`}>
                        {student.name ? student.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-white text-base">{student.name || "Unknown Name"}</h3>
                        <p className="text-gray-400 text-sm truncate">{student.email || "No email available"}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center text-xs">
                      <div className="bg-blue-900/30 px-2 py-1 rounded text-blue-400">
                        Level {student.level || selectedLevel}
                      </div>
                      <div className="bg-green-900/30 px-2 py-1 rounded text-green-400">
                        {student.department || selectedDepartments[0]}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      {/* Show instructions if no level or department selected */}
      {(!selectedLevel || selectedDepartments.length === 0) && (
        <motion.div
          className="bg-[#232738] rounded-xl p-8 shadow-md border border-[#2a2f3e] text-center"
          variants={itemVariants}
        >
          <FaFilter className="mx-auto text-4xl text-blue-400 mb-4 opacity-60" />
          <h3 className="text-xl font-semibold text-white mb-2">Select Filters to View Students</h3>
          <p className="text-gray-400 max-w-lg mx-auto">
            Please select a level and at least one department above to view students available for upgrade.
          </p>
        </motion.div>
      )}

      {/* Success Toast Notification */}
      <AnimatePresence>
        {status && status.includes("Successfully") && (
          <motion.div
            className="fixed bottom-4 right-4 bg-green-900/90 border border-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              <span>{status}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyGradePage;