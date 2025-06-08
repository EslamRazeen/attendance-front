'use client';

import React, { useMemo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaUserTie, FaEnvelope, FaBook, FaBuilding, FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown, FaPlus, FaEye, FaGraduationCap, FaChalkboardTeacher, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useInstructorManagement } from "@/app/hooks/useInstructorManagement";
import { useLanguage } from "@/app/components/providers/LanguageProvider";
import StatsCard from "@/app/components/ui/StatsCard";
import { useRouter } from "next/navigation";

const StaffPage = () => {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const tableContainerRef = useRef(null);
  const [isTableHovered, setIsTableHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // Use our custom hook for instructor management
  const {
    lecturers,
    currentLecturers,
    filteredLecturers,
    sortedLecturers,
    uniqueRoles,
    isLoading,
    fetchError,
    isDeleting,
    searchTerm,
    setSearchTerm,
    rowsPerPage,
    setRowsPerPage,
    currentPage,
    setCurrentPage,
    totalPages,
    indexOfFirstLecturer,
    indexOfLastLecturer,
    sortConfig,
    requestSort,
    paginate,
    roleFilter,
    setRoleFilter,
    deleteInstructor
  } = useInstructorManagement();

  // Calculate statistics for the StatsCards
  const stats = useMemo(() => {
    const totalInstructors = lecturers.length;
    
    // Count unique departments
    const departments = new Set();
    lecturers.forEach(lecturer => {
      if (lecturer.lecturerDepartment) {
        departments.add(lecturer.lecturerDepartment);
      }
    });
    
    // Count total courses
    let totalCourses = 0;
    lecturers.forEach(lecturer => {
      totalCourses += lecturer.lecturerCourses?.length || 0;
    });
    
    // Calculate average courses per instructor
    const avgCoursesPerInstructor = totalInstructors > 0 
      ? Math.round((totalCourses / totalInstructors) * 10) / 10
      : 0;
    
    return {
      totalInstructors,
      departments: departments.size,
      totalCourses,
      avgCoursesPerInstructor
    };
  }, [lecturers]);

  // Handle pagination
  const handlePageChange = (pageNumber) => {
    console.log(`Attempting to change to page: ${pageNumber}, current page: ${currentPage}, total pages: ${totalPages}`);
    
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      console.log(`Page change valid, setting page to: ${pageNumber}`);
      setCurrentPage(pageNumber);
    } else {
      console.log(`Invalid page change attempt: ${pageNumber} is out of range 1-${totalPages}`);
    }
  };

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
    exit: { opacity: 0, y: 20 }
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

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      }
    },
    hover: {
      backgroundColor: "rgba(59, 130, 246, 0.05)",
      transition: { duration: 0.2 }
    }
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <FaSort className="text-gray-400 ml-1" />;
    }
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-blue-500 ml-1" /> 
      : <FaSortDown className="text-blue-500 ml-1" />;
  };

  // Generate pagination numbers
  const paginationNumbers = useMemo(() => {
    const pages = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      // Near the start
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // In the middle
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages]);

  // Debug pagination state changes
  useEffect(() => {
    console.log(`Pagination state updated - Page: ${currentPage}, Rows: ${rowsPerPage}, Total: ${totalPages}`);
    console.log(`Showing items ${indexOfFirstLecturer + 1} to ${Math.min(indexOfLastLecturer, sortedLecturers.length)} of ${sortedLecturers.length}`);
    console.log(`Current lecturers count: ${currentLecturers.length}`);
  }, [currentPage, rowsPerPage, totalPages, indexOfFirstLecturer, indexOfLastLecturer, sortedLecturers.length, currentLecturers.length]);

  // Handle deletion of an instructor
  const handleDelete = async () => {
    try {
      if (!selectedInstructor) return;
      
      setDeleteError(null);
      const result = await deleteInstructor(selectedInstructor._id);
      
      if (result.success) {
        // Close modal after successful deletion
        setDeleteConfirm(false);
        setSelectedInstructor(null);
      } else {
        // Show error message
        setDeleteError(result.error || 'Failed to delete instructor');
      }
    } catch (error) {
      console.error('Error during deletion:', error);
      setDeleteError('An unexpected error occurred. Please try again.');
    }
  };

  // Handle mouse events for custom scrolling
  const handleMouseDown = (e) => {
    // Check if we're clicking near the scrollbar area
    const container = tableContainerRef.current;
    const { right } = container.getBoundingClientRect();
    const isNearScrollbar = right - e.clientX < 20; // 20px from the right edge
    
    if (isNearScrollbar) {
      setIsDragging(true);
      setStartY(e.pageY);
      setScrollTop(container.scrollTop);
      e.preventDefault(); // Prevent text selection
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = tableContainerRef.current;
    const y = e.pageY;
    const walk = (y - startY) * 2; // Scroll speed multiplier
    container.scrollTop = scrollTop + walk;
  };
  
  // Add and remove event listeners
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, startY, scrollTop]);

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
          Loading instructors data...
        </motion.p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <motion.div 
        className="bg-red-900/20 border border-red-500 p-6 rounded-xl text-red-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="font-bold text-xl mb-2">Error Loading Data</h3>
        <p className="mb-2">{fetchError.error || "Failed to fetch instructor data"}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-800/30 hover:bg-red-800/50 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="w-full space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40 p-8 border border-blue-800/30"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <motion.h1 
              className="text-3xl font-bold text-white mb-3 flex items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Instructors Management
              </span>
              <span className="ml-3 px-2 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-md border border-blue-500/30">
                {stats.totalInstructors} Total
              </span>
            </motion.h1>
            <motion.p 
              className="text-blue-200/80 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Manage and view all lecturer accounts. Add new instructors, edit their information, or remove them from the system.
            </motion.p>
          </div>
          
          <motion.button
            onClick={() => router.push('/dashboard/admin/addDoctor')}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-lg transition-all duration-300 backdrop-blur-sm shadow-lg shadow-blue-900/20 border border-blue-500/50"
            whileHover={{ scale: 1.03, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.97 }}
          >
            <FaPlus className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
            Add New Instructor
          </motion.button>
        </div>
        
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
        />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Instructors" 
          value={stats.totalInstructors} 
          icon={<FaUserTie size={24} className="text-blue-400" />} 
          color="blue" 
          description="Active teaching staff"
          className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-800/30 hover:shadow-blue-900/20"
        />
        <StatsCard 
          title="Departments" 
          value={stats.departments} 
          icon={<FaBuilding size={24} className="text-purple-400" />} 
          color="purple" 
          description="Academic departments"
          className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-800/30 hover:shadow-purple-900/20"
        />
        <StatsCard 
          title="Total Courses" 
          value={stats.totalCourses} 
          icon={<FaBook size={24} className="text-green-400" />} 
          color="green" 
          description="Assigned to instructors"
          className="bg-gradient-to-br from-green-900/30 to-green-800/10 border-green-800/30 hover:shadow-green-900/20"
        />
        <StatsCard 
          title="Avg. Courses" 
          value={stats.avgCoursesPerInstructor} 
          icon={<FaChalkboardTeacher size={24} className="text-yellow-400" />} 
          color="yellow" 
          description="Per instructor"
          className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border-yellow-800/30 hover:shadow-yellow-900/20"
        />
      </div>

      <motion.div 
        className="bg-[#232738] rounded-xl p-6 shadow-lg border border-[#2a2f3e] overflow-hidden relative mb-6"
        variants={itemVariants}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative group">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#1a1f2e] text-white py-2.5 pl-10 pr-4 rounded-lg border border-[#2a2f3e] w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:border-blue-500/30"
              />
            </div>
            
            <div className="relative group">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-purple-400 transition-colors" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#1a1f2e] text-white py-2.5 pl-10 pr-10 rounded-lg border border-[#2a2f3e] w-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:border-purple-500/30 appearance-none cursor-pointer"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-purple-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div 
          className="overflow-hidden rounded-lg border border-[#2a2f3e] shadow-inner bg-[#1a1f2e]/50 relative"
          onMouseEnter={() => setIsTableHovered(true)}
          onMouseLeave={() => setIsTableHovered(false)}
        >
          {isTableHovered && (
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-blue-500/20 to-transparent z-10 pointer-events-none" />
          )}
          <div 
            ref={tableContainerRef}
            className={`overflow-y-auto table-scrollbar custom-scrollbar px-1 ${isTableHovered ? 'scrollbar-visible' : ''}`} 
            style={{ 
              maxHeight: "650px",
              scrollbarWidth: "thin",
              scrollbarColor: "#3b82f6 #1e293b"
            }}
            onMouseDown={handleMouseDown}
          >
            <motion.table 
              className="w-full border-collapse"
              variants={tableVariants}
              initial="hidden"
              animate="visible"
            >
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#1a1f2e] border-b-2 border-blue-500/30 text-gray-300">
                  <th className="py-4 px-5 text-left font-semibold">
                    <button 
                      className="flex items-center focus:outline-none hover:text-blue-400 transition-colors"
                      onClick={() => requestSort('name')}
                    >
                      <FaUserTie className="mr-2 text-blue-400" />
                      Name {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="py-4 px-5 text-left font-semibold">
                    <button 
                      className="flex items-center focus:outline-none hover:text-purple-400 transition-colors"
                      onClick={() => requestSort('email')}
                    >
                      <FaEnvelope className="mr-2 text-purple-400" />
                      Email {getSortIcon('email')}
                    </button>
                  </th>
                  <th className="py-4 px-5 text-left font-semibold">
                    <button 
                      className="flex items-center focus:outline-none hover:text-indigo-400 transition-colors"
                      onClick={() => requestSort('role')}
                    >
                      <FaUserTie className="mr-2 text-indigo-400" />
                      Role {getSortIcon('role')}
                    </button>
                  </th>
                  <th className="py-4 px-5 text-left font-semibold">
                    <button 
                      className="flex items-center focus:outline-none hover:text-green-400 transition-colors"
                      onClick={() => requestSort('department')}
                    >
                      <FaBuilding className="mr-2 text-green-400" />
                      Department {getSortIcon('department')}
                    </button>
                  </th>
                  <th className="py-4 px-5 text-left font-semibold">
                    <button 
                      className="flex items-center focus:outline-none hover:text-yellow-400 transition-colors"
                      onClick={() => requestSort('courses')}
                    >
                      <FaBook className="mr-2 text-yellow-400" />
                      Courses {getSortIcon('courses')}
                    </button>
                  </th>
                  <th className="py-4 px-5 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2f3e]">
                <AnimatePresence>
                  {sortedLecturers.map((lecturer, index) => (
                    <motion.tr 
                      key={lecturer._id}
                      className="text-gray-300 hover:bg-[#2a2f3e]/50 transition-colors"
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, y: -10 }}
                      whileHover="hover"
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center mr-3 shadow-inner">
                            <span className="text-blue-300 font-medium text-lg">{lecturer.name?.charAt(0).toUpperCase() || '?'}</span>
                          </div>
                          <span className="font-medium text-white">{lecturer.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-gray-300">{lecturer.email || 'N/A'}</td>
                      <td className="py-4 px-5">
                        <span className="px-3 py-1.5 rounded-full bg-indigo-900/30 text-indigo-300 text-sm font-medium border border-indigo-800/30">
                          {lecturer.lecturerRole || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-3 py-1.5 rounded-full bg-green-900/30 text-green-300 text-sm font-medium border border-green-800/30">
                          {lecturer.lecturerDepartment || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center">
                          <span className="px-3 py-1.5 rounded-full bg-yellow-900/30 text-yellow-300 font-medium border border-yellow-800/30">
                            {lecturer.lecturerCourses ? lecturer.lecturerCourses.length : 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-3">
                          <motion.button 
                            className="p-2.5 rounded-lg bg-blue-900/30 text-blue-300 hover:bg-blue-800/50 border border-blue-800/30 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/dashboard/admin/details?id=${lecturer._id}`)}
                            title="View Details"
                          >
                            <FaEye />
                          </motion.button>
                          <motion.button 
                            className="p-2.5 rounded-lg bg-red-900/30 text-red-300 hover:bg-red-800/50 border border-red-800/30 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedInstructor(lecturer);
                              setDeleteConfirm(true);
                            }}
                            title="Delete Instructor"
                          >
                            <FaTrash />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                
                {sortedLecturers.length === 0 && (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <td colSpan="6" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FaSearch className="text-4xl text-gray-600" />
                        <p className="text-gray-500 text-lg">
                          {searchTerm || roleFilter ? 'No instructors found matching your search criteria' : 'No instructors available'}
                        </p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </tbody>
            </motion.table>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && selectedInstructor && (
        <motion.div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-[#1a1f2e] p-6 rounded-xl max-w-md w-full mx-4 border border-red-500/30 shadow-lg shadow-red-500/10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mr-4">
                <FaTrash className="text-red-500 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-gray-300">
                Are you sure you want to delete instructor <span className="text-white font-semibold">{selectedInstructor.name}</span>? This action cannot be undone.
              </p>
            </div>
            
            {deleteError && (
              <motion.div 
                className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 mb-6 text-red-300 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {deleteError}
                </div>
              </motion.div>
            )}
            
            <div className="flex justify-end gap-4">
              <motion.button 
                className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setDeleteConfirm(false);
                  setSelectedInstructor(null);
                  setDeleteError(null);
                }}
              >
                Cancel
              </motion.button>
              <motion.button 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                whileHover={{ scale: 1.03, boxShadow: "0 5px 15px rgba(239, 68, 68, 0.2)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2" /> Delete
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StaffPage; 