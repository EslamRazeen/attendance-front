import React from "react";
import { motion } from "framer-motion";
import { FaBook, FaBuilding } from "react-icons/fa";

const CourseSelection = ({ 
  newUser, 
  handleCourseSelect, 
  errors, 
  formSubmitted, 
  pageVariants, 
  filteredCourses, 
  isLoadingCourses,
  selectedDepartment,
  selectedLevel,
  setSelectedDepartment,
  setSelectedLevel,
  clearFilters,
  levels,
  departments
}) => {
  return (
    <motion.div
      key="step3"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.4 }}
      className="py-6"
    >
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
        <span className="bg-green-600/20 text-green-400 p-2 rounded-lg mr-3">3</span>
        Course Assignment
      </h2>
      
      <div className="space-y-6">
        {/* Filters */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Level Filter */}
          <div className="form-group">
            <label className="block text-gray-300 mb-2 font-medium">Level</label>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <motion.button
                  key={level}
                  onClick={() => setSelectedLevel(prev => prev === level ? "" : level)}
                  className={`px-4 py-2 rounded-lg border ${
                    selectedLevel === level
                      ? 'bg-green-600/30 border-green-500/50 text-green-300 shadow-md shadow-green-500/10'
                      : 'bg-[#1a1f2e] border-[#2a2f3e] text-gray-300 hover:bg-[#2a2f3e] hover:border-green-500/30'
                  } transition-all text-sm flex items-center gap-2`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${selectedLevel === level ? 'text-green-400' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Level {level}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Department Filter */}
          <div className="form-group">
            <label className="block text-gray-300 mb-2 font-medium">Department</label>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <motion.button
                  key={dept}
                  onClick={() => setSelectedDepartment(prev => prev === dept ? "" : dept)}
                  className={`px-4 py-2 rounded-lg border ${
                    selectedDepartment === dept
                      ? 'bg-blue-600/30 border-blue-500/50 text-blue-300 shadow-md shadow-blue-500/10'
                      : 'bg-[#1a1f2e] border-[#2a2f3e] text-gray-300 hover:bg-[#2a2f3e] hover:border-blue-500/30'
                  } transition-all text-sm flex items-center gap-2`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaBuilding className={selectedDepartment === dept ? 'text-blue-400' : 'text-gray-500'} />
                  {dept}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Course Selection */}
        <motion.div 
          className="form-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-between items-center mb-3">
            <label className="block text-gray-300 font-medium">Select Courses</label>
            <span className="text-sm bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
              {newUser.lecturerCourses.length} selected
            </span>
          </div>
          <div className="bg-[#1a1f2e] rounded-lg border border-[#2a2f3e] p-4 min-h-[250px] max-h-[350px] overflow-y-auto custom-scrollbar shadow-inner">
            {isLoadingCourses ? (
              <div className="flex items-center justify-center h-full py-12">
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-gray-400">Loading courses...</p>
                </div>
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredCourses.map((course, index) => (
                  <motion.button
                    key={course._id}
                    onClick={() => handleCourseSelect(course._id)}
                    className={`p-4 rounded-lg border ${
                      newUser.lecturerCourses.includes(course._id)
                        ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-blue-500/50 text-white shadow-md shadow-blue-500/10'
                        : 'bg-[#232738] border-[#2a2f3e] text-gray-300 hover:bg-[#2a2f3e] hover:border-blue-500/30'
                    } transition-all flex items-start gap-3 text-left`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                  >
                    <div className={`mt-1 p-2 rounded-lg ${
                      newUser.lecturerCourses.includes(course._id)
                        ? 'bg-blue-500/20'
                        : 'bg-[#1a1f2e]'
                    }`}>
                      <FaBook className={newUser.lecturerCourses.includes(course._id) ? 'text-blue-300' : 'text-gray-500'} />
                    </div>
                    <div>
                      <div className="font-medium">{course.courseName}</div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                        <span className="bg-[#1a1f2e] px-2 py-1 rounded border border-[#2a2f3e]">{course.department}</span>
                        <span className="bg-[#1a1f2e] px-2 py-1 rounded border border-[#2a2f3e]">Level {course.level}</span>
                      </div>
                    </div>
                    {newUser.lecturerCourses.includes(course._id) && (
                      <div className="absolute top-2 right-2 bg-blue-500/20 p-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                <motion.div 
                  className="bg-[#232738] p-4 rounded-full mb-4"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <FaBook className="text-4xl opacity-50" />
                </motion.div>
                <p className="text-center">No courses found. Try adjusting your filters.</p>
                <motion.button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-[#232738] text-blue-400 rounded-lg border border-blue-500/30 hover:bg-[#2a2f3e]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Filters
                </motion.button>
              </div>
            )}
          </div>
          {errors.courses && formSubmitted && (
            <motion.p 
              className="text-red-500 text-sm mt-2 flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.courses}
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CourseSelection; 