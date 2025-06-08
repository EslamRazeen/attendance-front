"use client";
import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFilter, FaSave, FaEdit, FaUserGraduate, FaCheckCircle, FaTimesCircle, FaEnvelope, FaBuilding, FaGraduationCap, FaTrash, FaEye, FaPlus, FaBook, FaSearch, FaTimes } from "react-icons/fa";
import Link from 'next/link';
import { useStudentManagement } from '@/app/hooks/useStudentManagement';
import { LEVELS, DEPARTMENTS } from '@/app/hooks/constants';

const StudentsEditPage = () => {
  // Use the custom hook for student management
  const {
    selectedLevel,
    selectedDepartment,
    searchQuery,
    filterByCourse,
    showAdvancedFilters,
    editIndex,
    editData,
    status,
    selectedStudent,
    showStudentDetails,
    showAddCourseModal,
    selectedCourseId,
    deleteCourseId,
    isLoading,
    students,
    filteredStudents,
    courses,
    originalStudentData,
    setSelectedLevel,
    setSelectedDepartment,
    setSearchQuery,
    setFilterByCourse,
    setShowAdvancedFilters,
    handleEdit,
    handleViewDetails,
    handleChange,
    handleSave,
    handleDelete,
    handleAddCourse,
    handleRemoveCourse,
    resetFilters,
    setSelectedStudent,
    setShowStudentDetails,
    setShowAddCourseModal,
    setSelectedCourseId,
    setDeleteCourseId,
    setStatus,
    cancelEdit,
    updateLocalStudentCourses,
  } = useStudentManagement();

  const tableContainerRef = useRef(null);

  // Toggle advanced filters
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
    if (showAdvancedFilters) {
      // Reset advanced filters when hiding
      setFilterByCourse("");
    }
  };

  return (
    <motion.div className="w-full min-h-screen bg-gradient-to-br from-[#181c2a] to-[#232738] py-10 px-2 sm:px-8">
      {/* Header */}
      <motion.div
        className="flex items-center gap-4 mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/40 flex items-center justify-center shadow-lg border-4 border-blue-800/30">
          <FaUserGraduate className="text-blue-400 text-4xl" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Edit Students
            <span className="ml-2 px-2 py-0.5 rounded bg-blue-900/40 text-xs text-blue-300 font-semibold animate-fadeIn">Management</span>
          </h1>
          <p className="text-gray-400">View and edit student information by level and department</p>
        </div>
      </motion.div>
      
      {/* Filters Card */}
      <motion.div
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40 p-6 border border-blue-800/30 shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="flex flex-col items-center w-full md:w-1/2">
            <div className="mb-2 text-base font-bold text-blue-400 tracking-wide text-center">Level</div>
            <div className="flex flex-row gap-3 justify-center">
              {LEVELS.map((level) => (
                <motion.button
                  key={level}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 border border-transparent text-sm focus:outline-none ${selectedLevel === level ? "bg-blue-500 text-white shadow-lg scale-105" : "bg-[#181c2a] text-gray-200 hover:bg-blue-900/40 hover:border-blue-500"}`}
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
            <div className="mb-2 text-base font-bold text-purple-400 tracking-wide text-center">Department</div>
            <div className="flex flex-row gap-3 justify-center">
              {DEPARTMENTS.map((dept) => (
                <motion.button
                  key={dept}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 border border-transparent text-sm focus:outline-none ${selectedDepartment === dept ? "bg-purple-500 text-white shadow-lg scale-105" : "bg-[#181c2a] text-gray-200 hover:bg-purple-900/40 hover:border-purple-500"}`}
                  onClick={() => setSelectedDepartment(dept)}
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
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
        />
      </motion.div>
      
      {/* Search and Advanced Filter */}
      {(selectedLevel && selectedDepartment) && (
        <motion.div
          className="mt-8 bg-[#232738] rounded-xl p-4 sm:p-5 shadow-md border border-[#2a2f3e]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Box */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Search by name, email or ID..."
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            {/* Advanced Filters Toggle */}
            <div className="flex gap-2">
              <button 
                onClick={toggleAdvancedFilters}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${showAdvancedFilters ? "bg-blue-600 text-white" : "bg-[#1a1f2e] text-gray-300 hover:bg-[#2a2f3e]"}`}
              >
                <FaFilter />
                <span>Advanced Filters</span>
              </button>
              
              {(searchQuery || filterByCourse) && (
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-lg bg-[#1a1f2e] text-gray-300 hover:bg-[#2a2f3e] flex items-center gap-2"
                >
                  <FaTimes />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Advanced Filter Options */}
          {showAdvancedFilters && (
            <motion.div 
              className="mt-4 p-4 bg-[#1a1f2e] rounded-lg border border-[#2a2f3e]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Filter by Course</label>
                  <select
                    value={filterByCourse}
                    onChange={(e) => setFilterByCourse(e.target.value)}
                    className="w-full p-2 bg-[#232738] border border-[#2a2f3e] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Courses</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* Status Message */}
      <AnimatePresence>
        {status && (
          <motion.div
            className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg flex items-center gap-3 shadow-lg ${status.includes("failed") || status.includes("Failed") || status.includes("Error") || status.includes("error") ? "bg-red-900/90 text-red-100 border border-red-700" : "bg-green-900/90 text-green-100 border border-green-700"}`}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            {status.includes("failed") || status.includes("Failed") || status.includes("Error") || status.includes("error") ? (
              <FaTimesCircle className="text-red-300 text-xl flex-shrink-0" />
            ) : (
              <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
            )}
            <span className="font-medium">{status}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading State */}
      {isLoading && !filteredStudents.length ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Students Table */}
          {selectedLevel && selectedDepartment && (
            <div className="mt-6">
              {filteredStudents.length > 0 ? (
                <div className="bg-[#1a1f2e] rounded-xl overflow-hidden border border-[#2a2f3e] shadow-xl">
                  <div className="p-4 bg-[#232738] border-b border-[#2a2f3e] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                      Students
                      <span className="ml-2 text-sm text-gray-400">
                        ({filteredStudents.length} {filteredStudents.length === 1 ? "result" : "results"})
                      </span>
                    </h3>
                  </div>
                  
                  <div
                    ref={tableContainerRef}
                    className="overflow-x-auto relative"
                    style={{ maxHeight: "60vh" }}
                  >
                    <table className="w-full text-left">
                      <thead className="bg-[#232738] text-gray-400 text-xs uppercase sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Level</th>
                          <th className="px-6 py-3">Department</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2a2f3e]">
                        {filteredStudents.map((student, idx) => (
                          <tr
                            key={student._id}
                            className={`text-white bg-[#1a1f2e] hover:bg-[#232738] transition-colors ${
                              editIndex === idx ? "bg-blue-900/20" : ""
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap font-medium">
                              {editIndex === idx ? (
                                <input
                                  type="text"
                                  name="name"
                                  value={editData.name || ""}
                                  onChange={handleChange}
                                  className="bg-[#232738] border border-blue-500/30 rounded px-2 py-1 w-full text-white"
                                />
                              ) : (
                                student.name
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editIndex === idx ? (
                                <input
                                  type="email"
                                  name="email"
                                  value={editData.email || ""}
                                  onChange={handleChange}
                                  className="bg-[#232738] border border-blue-500/30 rounded px-2 py-1 w-full text-white"
                                />
                              ) : (
                                student.email
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editIndex === idx ? (
                                <select
                                  name="level"
                                  value={editData.level || ""}
                                  onChange={handleChange}
                                  className="bg-[#232738] border border-blue-500/30 rounded px-2 py-1 text-white"
                                >
                                  {LEVELS.map((level) => (
                                    <option key={level} value={level}>
                                      {level}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                student.level
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {student.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                              {editIndex === idx ? (
                                <>
                                  <button
                                    onClick={() => handleSave(student._id)}
                                    className="inline-flex items-center justify-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                                    disabled={isLoading}
                                  >
                                    <FaCheckCircle className="mr-1" /> Save
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="inline-flex items-center justify-center px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
                                  >
                                    <FaTimesCircle className="mr-1" /> Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEdit(idx)}
                                    className="inline-flex items-center justify-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                                  >
                                    <FaEdit className="mr-1" /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleViewDetails(student)}
                                    className="inline-flex items-center justify-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
                                  >
                                    <FaEye className="mr-1" /> View
                                  </button>
                                  <button
                                    onClick={() => handleDelete(student._id)}
                                    className="inline-flex items-center justify-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                                  >
                                    <FaTrash className="mr-1" /> Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : !isLoading ? (
                <div className="mt-12 text-center">
                  <div className="inline-block p-6 bg-[#232738] rounded-lg border border-[#2a2f3e] shadow-lg">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-blue-900/20 flex items-center justify-center mb-4">
                        <FaUserGraduate className="text-blue-400 text-3xl" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No Students Found</h3>
                      <p className="text-gray-400 mb-4">
                        {searchQuery || filterByCourse
                          ? "No students match your search criteria. Try adjusting your filters."
                          : `No students found in Level ${selectedLevel}, ${selectedDepartment} department.`}
                      </p>
                      {(searchQuery || filterByCourse) && (
                        <button
                          onClick={resetFilters}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
                        >
                          <FaTimes />
                          <span>Clear Filters</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
      
      {/* Student Details Modal */}
      <AnimatePresence>
        {showStudentDetails && selectedStudent && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStudentDetails(false)}
          >
            <motion.div
              className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] shadow-2xl w-full max-w-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#2a2f3e]">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Student Details</h2>
                  <button
                    onClick={() => setShowStudentDetails(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                          <FaUserGraduate className="text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Name</div>
                          <div className="text-white font-medium">{selectedStudent.name}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-900/20 flex items-center justify-center flex-shrink-0">
                          <FaEnvelope className="text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Email</div>
                          <div className="text-white font-medium">{selectedStudent.email}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                          <FaGraduationCap className="text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Level</div>
                          <div className="text-white font-medium">{selectedStudent.level}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-900/20 flex items-center justify-center flex-shrink-0">
                          <FaBuilding className="text-pink-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Department</div>
                          <div className="text-white font-medium">{selectedStudent.department}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-white">Courses</h3>
                      <button
                        onClick={() => setShowAddCourseModal(true)}
                        className={`inline-flex items-center justify-center px-3 py-1 text-white text-sm rounded-md transition-colors ${
                          courses.filter((course) => !selectedStudent?.courses?.some((sc) => sc._id === course._id)).length > 0 
                            ? "bg-blue-600 hover:bg-blue-700" 
                            : "bg-blue-900/40 cursor-not-allowed"
                        }`}
                        disabled={courses.filter((course) => !selectedStudent?.courses?.some((sc) => sc._id === course._id)).length === 0}
                        title={
                          courses.filter((course) => !selectedStudent?.courses?.some((sc) => sc._id === course._id)).length === 0 
                            ? "No available courses to add" 
                            : "Add Course"
                        }
                      >
                        <FaPlus className="mr-1" /> Add Course
                      </button>
                    </div>
                    
                    {selectedStudent.courses?.length > 0 ? (
                      <div className="bg-[#232738] rounded-lg border border-[#2a2f3e] overflow-hidden">
                        <ul className="divide-y divide-[#2a2f3e]">
                          {selectedStudent.courses.map((studentCourse) => {
                            const course = courses.find(c => c._id === studentCourse._id);
                            return (
                              <li key={studentCourse._id} className="p-3 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                                    <FaBook className="text-indigo-400" />
                                  </div>
                                  <div>
                                    <div className="text-white font-medium">
                                      {studentCourse.courseName || studentCourse.name || course?.name || "Unknown Course"}
                                      {course?.courseCode && <span className="ml-1 text-xs text-gray-400">({course.courseCode})</span>}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {course?.department && <span className="mr-2">{course.department}</span>}
                                      <span>Course ID: {studentCourse._id}</span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setDeleteCourseId(studentCourse._id)}
                                  className="text-red-400 hover:text-red-500"
                                >
                                  <FaTrash />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#232738] rounded-lg border border-[#2a2f3e] text-center">
                        <div className="w-12 h-12 rounded-full bg-indigo-900/20 flex items-center justify-center mx-auto mb-2">
                          <FaBook className="text-indigo-400" />
                        </div>
                        <p className="text-gray-400">No courses assigned yet</p>
                        <button
                          onClick={() => setShowAddCourseModal(true)}
                          className={`mt-2 inline-flex items-center justify-center px-3 py-1 text-white text-sm rounded-md transition-colors ${
                            courses.filter((course) => !selectedStudent?.courses?.some((sc) => sc._id === course._id)).length > 0 
                              ? "bg-blue-600 hover:bg-blue-700" 
                              : "bg-blue-900/40 cursor-not-allowed"
                          }`}
                          disabled={courses.filter((course) => !selectedStudent?.courses?.some((sc) => sc._id === course._id)).length === 0}
                          title={
                            courses.filter((course) => !selectedStudent?.courses?.some((sc) => sc._id === course._id)).length === 0 
                              ? "No available courses to add" 
                              : "Add Course"
                          }
                        >
                          <FaPlus className="mr-1" /> Add Course
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add Course Modal */}
      <AnimatePresence>
        {showAddCourseModal && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddCourseModal(false)}
          >
            <motion.div
              className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#2a2f3e]">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Add Course</h2>
                  <button
                    onClick={() => setShowAddCourseModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Select Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full p-2 bg-[#232738] border border-[#2a2f3e] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a course</option>
                    {courses
                      .filter((course) => !selectedStudent?.courses?.some((sc) => sc._id === course._id))
                      .map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name || course.courseName} {course.courseCode ? `(${course.courseCode})` : ''} - {course.department}
                        </option>
                      ))}
                  </select>
                  
                  {courses.filter((course) => !selectedStudent?.courses?.some((sc) => sc._id === course._id)).length === 0 && (
                    <p className="mt-2 text-yellow-400 text-sm">
                      No available courses to add. The student is already enrolled in all available courses.
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddCourseModal(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCourse}
                    disabled={!selectedCourseId}
                    className={`px-4 py-2 rounded-lg text-white ${selectedCourseId ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-900/40 cursor-not-allowed"}`}
                  >
                    Add Course
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Confirm Delete Course Modal */}
      <AnimatePresence>
        {deleteCourseId && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteCourseId(null)}
          >
            <motion.div
              className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                    <FaTrash className="text-red-400 text-2xl" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Remove Course</h2>
                  <p className="text-gray-400">
                    Are you sure you want to remove this course from the student's profile?
                  </p>
                </div>
                
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setDeleteCourseId(null)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemoveCourse}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Remove Course
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentsEditPage; 