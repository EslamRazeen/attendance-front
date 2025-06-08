'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUserTie, FaEnvelope, FaBook, FaBuilding, FaEdit, 
  FaTrash, FaArrowLeft, FaCalendarAlt, FaGraduationCap, 
  FaChartBar, FaCheckCircle, FaTimesCircle, FaPercentage, FaPlus 
} from "react-icons/fa";
import { useLanguage } from "@/app/components/providers/LanguageProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useInstructorDetails } from "@/app/hooks/useInstructorDetails";
import { 
  AttendancePieChart, 
  AttendanceBarChart 
} from "@/app/components/dashboard/admin/instructorsDetails/AttendanceCharts";
import {
  AddCourseModal,
  DeleteCourseModal,
  CourseDetailsModal,
  DeleteInstructorModal
} from "@/app/components/dashboard/admin/instructorsDetails/ModalComponents";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    }
  },
  exit: { opacity: 0, y: -20 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 260, 
      damping: 20, 
      duration: 0.5 
    }
  }
};

const courseVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  },
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
    borderColor: "rgba(59, 130, 246, 0.5)",
    transition: { duration: 0.2 }
  }
};

const Details = () => {
  // Get URL params and router
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  
  // Internationalization
  const { t, isRTL } = useLanguage();
  
  // State for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  
  // Use our custom hook for instructor details management
  const {
    // Data
    instructor,
    instructorStats,
    courses,
    
    // State
    selectedCourseId,
    showAddCourseModal,
    deleteCourseId,
    selectedCourseDetails,
    
    // Loading states
    isLoading,
    statsLoading,
    coursesLoading,
    addCourseLoading,
    deleteCourseLoading,
    
    // Errors
    fetchError,
    statsError,
    addCourseError,
    deleteCourseError,
    
    // Actions
    setSelectedCourseId,
    setShowAddCourseModal,
    setDeleteCourseId,
    setSelectedCourseDetails,
    handleAddCourse,
    handleDeleteCourse
  } = useInstructorDetails(userId);
  
  // State for success messages
  const [addCourseSuccess, setAddCourseSuccess] = useState("");

  // Handle add course submission
  const onAddCourseSubmit = async () => {
    const result = await handleAddCourse();
    if (result?.success) {
      setAddCourseSuccess("Course added successfully!");
      // Reset success message after 3 seconds
      setTimeout(() => setAddCourseSuccess(""), 3000);
    }
  };
  
  // Handle delete course submission
  const onDeleteCourseSubmit = async () => {
    await handleDeleteCourse();
  };
  
  // Handle instructor deletion
  const onDeleteInstructor = async () => {
    try {
      setDeleteError(null);
      // Call the delete instructor function from the custom hook
      const result = await instructor.deleteInstructor(userId);
      if (result.success) {
        // Navigate back to instructors list on success
        router.push('/dashboard/admin');
      } else {
        // Show error message
        setDeleteError(result.error || 'Failed to delete instructor');
      }
    } catch (error) {
      console.error('Error during deletion:', error);
      setDeleteError('An unexpected error occurred. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <motion.div
          className="rounded-full h-16 w-16 border-4 border-t-4 border-blue-500 mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.p 
          className="text-gray-300 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading instructor data...
        </motion.p>
      </div>
    );
  }

  if (fetchError || !instructor) {
    return (
      <motion.div 
        className="bg-red-900/20 border border-red-500 p-6 rounded-xl text-red-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="font-bold text-xl mb-2">Error Loading Data</h3>
        <p className="mb-2">{fetchError?.error || "Instructor not found"}</p>
        <button 
          onClick={() => router.push('/dashboard/admin')}
          className="mt-4 bg-red-800/30 hover:bg-red-800/50 text-white py-2 px-4 rounded-lg transition-colors flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Instructors
        </button>
      </motion.div>
    );
  }

  // Check if item is new (less than a week old)
  const isNew = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffInDays < 7;
  };

  return (
    <motion.div 
      className="w-full space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div 
        className="flex items-center mb-6"
        variants={itemVariants}
      >
        <button 
          onClick={() => router.push('/dashboard/admin')}
          className="mr-4 bg-[#1a1f2e]/80 hover:bg-[#1a1f2e] text-white p-2 rounded-lg transition-colors"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Instructor Details</h1>
          <p className="text-gray-400">View and manage instructor information</p>
        </div>
      </motion.div>
      
      {/* Instructor Profile Card */}
      <motion.div
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40 p-6 border border-blue-800/30 shadow-xl"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-10">
          <motion.div 
            className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/40 flex items-center justify-center shadow-lg border-4 border-blue-800/30 animate-float"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          >
            <span className="text-blue-400 text-5xl font-extrabold animate-pulse select-none">
              {instructor.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight flex items-center gap-2">
              {instructor.name || 'Unknown'}
              <span className="ml-2 px-2 py-0.5 rounded bg-blue-900/40 text-xs text-blue-300 font-semibold animate-fadeIn">Instructor</span>
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-blue-900/20 text-blue-400 text-sm flex items-center cursor-pointer group" title="Copy Email" onClick={() => navigator.clipboard.writeText(instructor.email)}>
                <FaEnvelope className="mr-2" /> {instructor.email || 'N/A'}
                <span className="ml-1 opacity-0 group-hover:opacity-100 text-xs text-blue-200 transition-opacity">Copy</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-900/20 text-indigo-400 text-sm flex items-center">
                <FaUserTie className="mr-2" /> {instructor.lecturerRole || 'N/A'}
              </span>
              <span className="px-3 py-1 rounded-full bg-green-900/20 text-green-400 text-sm flex items-center">
                <FaBuilding className="mr-2" /> {instructor.lecturerDepartment || 'N/A'}
              </span>
              <span className="px-3 py-1 rounded-full bg-yellow-900/20 text-yellow-400 text-sm flex items-center">
                <FaGraduationCap className="mr-2" /> {instructor.lecturerCourses?.length || 0} Courses
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-xs">
              <span>User ID: <span className="text-gray-400 cursor-pointer group" title="Copy ID" onClick={() => navigator.clipboard.writeText(instructor._id)}>{instructor._id.slice(0, 8)}...<span className="ml-1 opacity-0 group-hover:opacity-100 text-xs text-blue-200 transition-opacity">Copy</span></span></span>
            </div>
          </div>
          <div className="flex flex-col gap-3 min-w-[120px]">
            <motion.button 
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-md group"
              whileHover={{ scale: 1.06, boxShadow: "0 8px 24px rgba(59,130,246,0.15)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => alert('Edit functionality to be implemented')}
            >
              <FaEdit className="mr-2" />
              <span>Edit</span>
            </motion.button>
            <motion.button 
              className="flex items-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-md group"
              whileHover={{ scale: 1.06, boxShadow: "0 8px 24px rgba(239,68,68,0.15)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDeleteConfirm(true)}
            >
              <FaTrash className="mr-2" />
              <span>Delete</span>
            </motion.button>
          </div>
        </div>
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
        />
      </motion.div>

      {/* Courses Section */}
      <motion.div 
        className="bg-[#232738] rounded-xl p-6 shadow-md border border-[#2a2f3e] overflow-hidden relative"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <FaBook className="mr-3 text-yellow-400" /> Assigned Courses
          </h3>
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md"
            onClick={() => setShowAddCourseModal(true)}
          >
            <FaPlus /> Add Course
          </button>
        </div>
        
        {/* Course List */}
        {instructor.lecturerCourses && instructor.lecturerCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {instructor.lecturerCourses.map((course, index) => {
                // Find course details from the full courses list
                const courseDetails = courses.find(c => c._id === course._id) || course;
                return (
                  <motion.div 
                    key={course._id}
                    className="bg-[#1a1f2e] p-4 rounded-xl border border-[#2a2f3e] transition-colors shadow-md group cursor-pointer relative overflow-hidden"
                    variants={courseVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FaBook className="text-yellow-400" />
                        <span className="text-sm text-blue-300 font-medium">Course {index + 1}</span>
                      </div>
                      <span className="text-xs text-gray-500">{course._id.substring(0, 8)}...</span>
                    </div>
                    <h4 className="text-gray-200 font-medium truncate" title={course.courseName}>{course.courseName}</h4>
                    <div className="mt-2 flex items-center text-xs text-gray-400 gap-2">
                      <FaCalendarAlt className="mr-1" /> Added recently
                      <button
                        className="ml-auto text-blue-400 hover:underline hover:text-blue-300 bg-transparent border-none outline-none"
                        onClick={() => setSelectedCourseDetails(courseDetails)}
                        title="Show Details"
                        type="button"
                      >
                        Show Details
                      </button>
                      <button
                        className="ml-2 text-red-500 hover:text-red-700 bg-transparent border-none outline-none"
                        title="Delete Course"
                        onClick={() => setDeleteCourseId(course._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            className="bg-[#1a1f2e]/50 p-6 rounded-lg text-center text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FaBook className="mx-auto text-3xl text-gray-500 mb-3 opacity-50" />
            <p>No courses assigned to this instructor</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
              onClick={() => setShowAddCourseModal(true)}
            >
              Assign Courses
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Statistics Section */}
      <motion.div 
        className="bg-[#232738] rounded-xl p-6 shadow-md border border-[#2a2f3e] overflow-hidden relative"
        variants={itemVariants}
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <FaChartBar className="mr-3 text-purple-400" /> Attendance Statistics
        </h3>
        {statsLoading ? (
          <motion.div 
            className="bg-[#1a1f2e]/50 p-6 rounded-lg flex items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="rounded-full h-10 w-10 border-4 border-t-4 border-purple-500 mb-0 animate-spin"
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="ml-4 text-gray-400">Loading statistics...</p>
          </motion.div>
        ) : statsError ? (
          <motion.div 
            className="bg-[#1a1f2e]/50 p-6 rounded-lg text-center text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p>Failed to load attendance statistics</p>
          </motion.div>
        ) : (
          <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <motion.div 
              className="bg-[#1a1f2e] p-5 rounded-xl border border-[#2a2f3e] transition-colors shadow-md group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)", scale: 1.04 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[var(--foreground-secondary)] font-medium">Present</h4>
                <span className="bg-green-900/30 p-2 rounded-lg">
                  <FaCheckCircle className="text-green-400" />
                </span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-green-400">{instructorStats?.present ?? 0}</p>
                <span className="text-xs text-green-400 font-semibold">actions</span>
              </div>
              <p className="text-xs text-[var(--foreground-secondary)] mt-2">Actions Present</p>
            </motion.div>
            <motion.div 
              className="bg-[#1a1f2e] p-5 rounded-xl border border-[#2a2f3e] transition-colors shadow-md group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)", scale: 1.04 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[var(--foreground-secondary)] font-medium">Absent</h4>
                <span className="bg-red-900/30 p-2 rounded-lg">
                  <FaTimesCircle className="text-red-400" />
                </span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-red-400">{instructorStats?.absent ?? 0}</p>
                <span className="text-xs text-red-400 font-semibold">actions</span>
              </div>
              <p className="text-xs text-[var(--foreground-secondary)] mt-2">Actions Absent</p>
            </motion.div>
            <motion.div 
              className="bg-[#1a1f2e] p-5 rounded-xl border border-[#2a2f3e] transition-colors shadow-md group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)", scale: 1.04 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[var(--foreground-secondary)] font-medium">Attendance Rate</h4>
                <span className="bg-purple-900/30 p-2 rounded-lg">
                  <FaPercentage className="text-purple-400" />
                </span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-purple-400">{instructorStats?.showQttendanceRate ?? "0%"}</p>
                <span className="text-xs text-purple-400 font-semibold">Rate</span>
              </div>
              <p className="text-xs text-[var(--foreground-secondary)] mt-2">Overall attendance</p>
            </motion.div>
          </div>
          
          {/* Charts Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Pie Chart Section */}
            <motion.div 
              className="bg-[#1a1f2e] p-4 sm:p-6 rounded-xl border border-[#2a2f3e] shadow-md animate-fadeIn overflow-hidden relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/5"></div>
              <div className="relative">
                <motion.h4 
                  className="text-base sm:text-lg text-white font-semibold mb-3 sm:mb-4 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <span className="w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full mr-2 sm:mr-3"></span>
                  Attendance Distribution
                </motion.h4>
                
                <div className="pt-2">
                  <AttendancePieChart 
                    data={[
                      { name: 'Present', value: instructorStats?.present ?? 0, color: '#4ade80' },
                      { name: 'Absent', value: instructorStats?.absent ?? 0, color: '#f87171' }
                    ]} 
                  />
                  
                  {(!instructorStats?.present && !instructorStats?.absent) && (
                    <div className="text-center text-[var(--foreground-secondary)] text-sm mt-4">
                      No attendance data available for this instructor
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center mt-2 sm:mt-4 gap-4 sm:gap-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs sm:text-sm text-[var(--foreground-secondary)]">Present</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                    <span className="text-xs sm:text-sm text-[var(--foreground-secondary)]">Absent</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Bar Chart Section */}
            <motion.div 
              className="bg-[#1a1f2e] p-6 rounded-xl border border-[#2a2f3e] shadow-md animate-fadeIn overflow-hidden relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/5 to-purple-900/5"></div>
              <div className="relative">
                <motion.h4 
                  className="text-lg text-white font-semibold mb-4 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <span className="w-2 h-8 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full mr-3"></span>
                  Present vs Absent
                </motion.h4>
                
                <div className="pt-2">
                  <AttendanceBarChart 
                    present={instructorStats?.present ?? 0} 
                    absent={instructorStats?.absent ?? 0} 
                  />
                  
                  {(!instructorStats?.present && !instructorStats?.absent) && (
                    <div className="text-center text-[var(--foreground-secondary)] text-sm mt-4">
                      No attendance data available for this instructor
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
          </>
        )}
      </motion.div>

      {/* Modals */}
      <AddCourseModal
        showModal={showAddCourseModal}
        onClose={() => setShowAddCourseModal(false)}
        courses={courses}
        selectedCourseId={selectedCourseId}
        onSelectCourse={setSelectedCourseId}
        onSubmit={onAddCourseSubmit}
        isLoading={addCourseLoading}
        error={addCourseError}
        success={addCourseSuccess}
        instructorCourses={instructor?.lecturerCourses || []}
      />
      
      <DeleteCourseModal
        courseId={deleteCourseId}
        onClose={() => setDeleteCourseId(null)}
        onDelete={onDeleteCourseSubmit}
        isLoading={deleteCourseLoading}
        error={deleteCourseError}
        courses={courses}
      />
      
      <CourseDetailsModal
        courseDetails={selectedCourseDetails}
        onClose={() => setSelectedCourseDetails(null)}
      />
      
      <DeleteInstructorModal
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onDelete={onDeleteInstructor}
        instructorName={instructor?.name || 'this instructor'}
        isLoading={false}
        error={deleteError}
      />
    </motion.div>
  );
};

export default Details; 