"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaInbox, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaCommentAlt, FaImage, FaCalendarAlt, FaUserGraduate, FaBook } from "react-icons/fa";
import Image from "next/image";
import { useGetInstructorApologiesQuery } from "@/app/Redux/features/attendanceApiSlice"; // Will be created
import { skipToken } from "@reduxjs/toolkit/query";
import { format } from "date-fns";
import { useSelector } from "react-redux"; // Import useSelector

// Helper function to construct the full image URL - reusing from messages page
const getFullImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
    return null; // Return null if path is invalid or empty
  }

  // Check if it's already an absolute URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a relative path, construct the full URL
  const baseUrl = "https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/"; // Base URL for your application
  const cleanedPath = imagePath.replace(/\\/g, '/'); // Replace backslashes with forward slashes

  try {
    // Use URL constructor for robust path concatenation
    return new URL(cleanedPath, baseUrl).href;
  } catch (e) {
    console.error("Error constructing image URL:", e, "Path:", imagePath);
    return null; // Return null if URL construction fails
  }
};

const InstructorApologiesPage = () => {
  const [apologies, setApologies] = useState([]);
  const [filteredApologies, setFilteredApologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApology, setSelectedApology] = useState(null); // For modal details
  const [showModal, setShowModal] = useState(false);
  
  // New state for filters
  const [courseFilter, setCourseFilter] = useState('all'); // 'all' or specific course name
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch instructor's courses from Redux store (set during login)
  const instructorCourses = useSelector((state) => state.userRole.instructorCourses);

  // Assuming you have a way to get the instructor's token for authorization
  // For now, we'll assume the API handles auth via cookies/headers from login
  // If not, you'd need to retrieve it from local storage or context here.
  const { data: fetchedApologies, isLoading, isError, error: fetchError } = useGetInstructorApologiesQuery(); // This hook will fetch data for the logged-in instructor

  useEffect(() => {
    if (fetchedApologies) {
      // Filter for accepted apologies by default
      let currentFiltered = fetchedApologies.filter(apology => apology.status === 'accepted');

      if (courseFilter !== 'all') {
        currentFiltered = currentFiltered.filter(apology => 
          apology.course?.courseName?.toLowerCase().includes(courseFilter.toLowerCase())
        );
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        currentFiltered = currentFiltered.filter(apology => 
          apology.student?.name?.toLowerCase().includes(query) ||
          apology.student?.email?.toLowerCase().includes(query) ||
          apology.course?.courseName?.toLowerCase().includes(query)
        );
      }
      
      setApologies(fetchedApologies); // Keep all fetched apologies for unfiltered view
      setFilteredApologies(currentFiltered);
    }
    
    setLoading(isLoading); // Only depend on apologies loading
    setError(fetchError); // Only depend on apologies fetch error

  }, [fetchedApologies, isLoading, isError, fetchError, courseFilter, searchQuery]);

  const handleViewDetails = (apology) => {
    setSelectedApology(apology);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApology(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock />;
      case "accepted":
        return <FaCheckCircle />;
      case "rejected":
        return <FaTimesCircle />;
      default:
        return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    hover: { scale: 1.03, boxShadow: "0 8px 24px rgba(37, 99, 235, 0.15)" },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <FaClock className="text-blue-400 text-5xl animate-spin" />
        <p className="ml-4 text-white text-lg">Loading accepted apologies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[500px] text-red-500">
        <FaTimesCircle className="text-5xl mb-4" />
        <p className="text-lg">Error: {error.message || "Failed to fetch accepted apologies"}</p>
      </div>
    );
  }

  // Use instructorCourses for the dropdown options
  const coursesForDropdown = instructorCourses && Array.isArray(instructorCourses)
    ? [...new Set(instructorCourses.map(course => course.courseName))].filter(Boolean) // Use courseName for display
    : [];

  return (
    <motion.div
      className="p-6 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="mb-8 flex items-center"
        variants={itemVariants}
      >
        <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mr-4">
          <FaBook className="text-purple-400 text-3xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Accepted Student Apologies
          </h1>
          <p className="text-gray-400">View and manage accepted student absence apologies for your courses</p>
        </div>
      </motion.div>

      {/* Filters and Search Bar */}
      <motion.div
        className="bg-[#1a1f2e] p-6 rounded-xl border border-[#2a2f3e] mb-6 flex flex-col md:flex-row gap-4 items-center justify-between"
        variants={itemVariants}
      >
        {/* Search Input */}
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by student or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 rounded-lg bg-[#2a2f3e] text-white border border-[#3b4152] focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <FaUserGraduate className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Course Filter */}
        <div className="relative w-full md:w-auto">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full md:w-48 p-2 pl-4 pr-10 rounded-lg bg-[#2a2f3e] text-white border border-[#3b4152] focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              backgroundSize: "1.5em 1.5em",
            }}
          >
            <option value="all">All Courses</option>
            {coursesForDropdown.map((courseName) => (
              <option key={courseName} value={courseName}>
                {courseName}
              </option>
            ))}
          </select>
        </div>
        {/* Display Filtered Apologies Count */}
        <div className="text-gray-400 text-sm md:text-base mt-4 md:mt-0">
          Total Apologies: <span className="font-semibold text-white">{filteredApologies.length}</span>
        </div>
      </motion.div>

      {/* Apologies List */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {filteredApologies.length > 0 ? (
          filteredApologies.map((apology) => (
            <motion.div
              key={apology._id}
              className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              variants={cardVariants}
              whileHover="hover"
              onClick={() => handleViewDetails(apology)}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mr-3">
                  <FaUserGraduate className="text-purple-400 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{apology.student?.name}</h3>
                  <p className="text-gray-400 text-sm">{apology.student?.department} - Level {apology.student?.level}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-300 flex items-center text-sm mb-1"><FaBook className="mr-2 text-blue-400" /> Course: <span className="font-medium text-white ml-1">{apology.course?.courseName}</span></p>
                <p className="text-gray-300 flex items-center text-sm"><FaCommentAlt className="mr-2 text-gray-400" /> Description: <span className="font-medium text-white ml-1">{apology.description}</span></p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apology.status)} flex items-center`}>
                  {getStatusIcon(apology.status)} <span className="ml-1">{apology.status.charAt(0).toUpperCase() + apology.status.slice(1)}</span>
                </span>
                <span className="flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  {apology.createdAt ? format(new Date(apology.createdAt.replace(/\s*\[PM.*?\]\s*/g, '')), 'MMM dd, yyyy [at] h:mm a') : 'N/A'}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="col-span-full text-center py-10 bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FaInbox className="text-6xl mb-4 text-purple-400" />
            <p className="text-xl">No accepted apologies found.</p>
            <p className="text-sm mt-2">Adjust your filters or check back later.</p>
          </motion.div>
        )}
      </motion.div>

      {/* Apology Details Modal */}
      <AnimatePresence>
        {showModal && selectedApology && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] shadow-2xl w-full max-w-2xl transform scale-95 opacity-0"
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center"><FaEye className="mr-3 text-blue-400" /> Apology Details</h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTimesCircle className="text-2xl" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Student Info */}
                  <div className="bg-[#2a2f3e] p-4 rounded-lg border border-[#3b4152]">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center"><FaUserGraduate className="mr-2 text-purple-400" /> Student Info</h3>
                    <p className="text-gray-300">Name: <span className="font-medium text-white">{selectedApology.student?.name}</span></p>
                    <p className="text-gray-300">Email: <span className="font-medium text-white">{selectedApology.student?.email}</span></p>
                    <p className="text-gray-300">Level: <span className="font-medium text-white">{selectedApology.student?.level}</span></p>
                    <p className="text-gray-300">Department: <span className="font-medium text-white">{selectedApology.student?.department}</span></p>
                  </div>

                  {/* Apology Content */}
                  <div className="bg-[#2a2f3e] p-4 rounded-lg border border-[#3b4152]">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center"><FaCommentAlt className="mr-2 text-green-400" /> Apology Content</h3>
                    <p className="text-gray-300">Course: <span className="font-medium text-white">{selectedApology.course?.courseName}</span></p>
                    <p className="text-gray-300">Description: <span className="font-medium text-white">{selectedApology.description}</span></p>
                    <p className="text-gray-300 flex items-center">Status: 
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${getStatusColor(selectedApology.status)} flex items-center`}>
                        {getStatusIcon(selectedApology.status)} <span className="ml-1">{selectedApology.status.charAt(0).toUpperCase() + selectedApology.status.slice(1)}</span>
                      </span>
                    </p>
                    <p className="text-gray-300 text-xs flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-500" />
                      Submitted: {
                        selectedApology.createdAt ?
                          format(
                            new Date(selectedApology.createdAt.replace(/ \\[PM\\d+\\]/g, '')), // Remove [PM...] part
                            "MMM dd, yyyy 'at' p"
                          ) :
                          'N/A'
                      }
                    </p>
                    {selectedApology.seenAt && (
                      <p className="text-gray-300 text-xs flex items-center gap-1">
                        <FaEye className="text-gray-500" />
                        Seen: {format(new Date(selectedApology.seenAt), "PPP 'at' p")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Attachment */}
                {selectedApology.attachment && ( 
                  <div className="bg-[#2a2f3e] p-4 rounded-lg border border-[#3b4152] mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center"><FaImage className="mr-2 text-red-400" /> Attachment</h3>
                    <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden">
                      <Image
                        src={getFullImageUrl(selectedApology.attachment)}
                        alt="Apology Attachment"
                        layout="fill"
                        objectFit="contain"
                        className="rounded-lg"
                        onError={(e) => { e.target.src = '/path/to/placeholder-image.jpg'; }} // Fallback image
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InstructorApologiesPage; 