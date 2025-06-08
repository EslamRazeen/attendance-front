"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaInbox, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaCommentAlt, FaImage, FaCalendarAlt, FaUserGraduate, FaBook } from "react-icons/fa";
import Image from "next/image";
import { useGetAllApologiesQuery, useUpdateApologyStatusMutation } from "@/app/Redux/features/attendanceApiSlice"; // Assuming these hooks exist or will be created
import { skipToken } from "@reduxjs/toolkit/query";
import { format } from "date-fns";

// Helper function to construct the full image URL
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

const ApologiesPage = () => {
  const [apologies, setApologies] = useState([]);
  const [filteredApologies, setFilteredApologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApology, setSelectedApology] = useState(null); // For modal details
  const [showModal, setShowModal] = useState(false);
  const [updateReason, setUpdateReason] = useState("");
  const [currentStatusToUpdate, setCurrentStatusToUpdate] = useState(""); // 'accepted' or 'rejected'

  // New state for filters and search
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'accepted', 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all'); // 'all', 'CS', 'IS', 'AI', 'BIO'

  const { data: fetchedApologies, isLoading, isError, error: fetchError, refetch } = useGetAllApologiesQuery();
  const [updateApologyStatus] = useUpdateApologyStatusMutation();

  const statuses = ['all', 'pending', 'accepted', 'rejected'];
  const departments = ['all', 'CS', 'IS', 'AI', 'BIO']; // Assuming these are the relevant departments

  useEffect(() => {
    if (fetchedApologies) {
      setApologies(fetchedApologies);
      // Apply filters whenever fetchedApologies or filter states change
      let currentFiltered = fetchedApologies;

      if (statusFilter !== 'all') {
        currentFiltered = currentFiltered.filter(apology => apology.status === statusFilter);
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        currentFiltered = currentFiltered.filter(apology => 
          apology.student?.name?.toLowerCase().includes(query) ||
          apology.student?.email?.toLowerCase().includes(query)
        );
      }

      if (departmentFilter !== 'all') {
        currentFiltered = currentFiltered.filter(apology => 
          apology.student?.department?.toUpperCase() === departmentFilter.toUpperCase()
        );
      }
      
      setFilteredApologies(currentFiltered);
    }
    if (isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
    if (isError) {
      setError(fetchError);
    } else {
      setError(null);
    }
  }, [fetchedApologies, isLoading, isError, fetchError, statusFilter, searchQuery, departmentFilter]); // Added filter states to dependencies

  const handleViewDetails = (apology) => {
    setSelectedApology(apology);
    setUpdateReason(apology.reason || "");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApology(null);
    setUpdateReason("");
    setCurrentStatusToUpdate("");
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedApology) return;
    setCurrentStatusToUpdate(status);
    setLoading(true);
    try {
      await updateApologyStatus({
        id: selectedApology._id,
        status: status,
        reason: updateReason,
      }).unwrap();

      // Instead of refetching, update the local state immediately
      setApologies(prevApologies =>
        prevApologies.map(apology =>
          apology._id === selectedApology._id
            ? { ...apology, status: status, reason: updateReason } // Update the specific apology
            : apology
        )
      );
      handleCloseModal();
    } catch (err) {
      console.error("Failed to update apology status:", err);
      setError("Failed to update apology status.");
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <FaClock className="text-blue-400 text-5xl animate-spin" />
        <p className="ml-4 text-white text-lg">Loading apologies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[500px] text-red-500">
        <FaTimesCircle className="text-5xl mb-4" />
        <p className="text-lg">Error: {error.message || "Failed to fetch apologies"}</p>
      </div>
    );
  }

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
        <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mr-4">
          <FaInbox className="text-blue-400 text-3xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Student Apologies
          </h1>
          <p className="text-gray-400">Review and manage student absence apologies</p>
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
            placeholder="Search by student name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 rounded-lg bg-[#2a2f3e] text-white border border-[#3b4152] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaUserGraduate className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === status ? getStatusColor(status).replace('/20', '') + ' shadow-md' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Department Filter */}
        <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${departmentFilter === dept ? 'bg-blue-600 shadow-md text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'}`}
            >
              {dept.toUpperCase()}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Apologies Grid */}
      {filteredApologies.length === 0 ? (
        <motion.div
          className="text-center p-10 bg-[#1a1f2e] rounded-xl border border-[#2a2f3e]"
          variants={itemVariants}
        >
          <FaInbox className="text-gray-500 text-6xl mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No apologies found matching your criteria.</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          <AnimatePresence>
            {filteredApologies.map((apology) => (
              <motion.div
                key={apology._id}
                className="bg-[#1a1f2e] p-5 rounded-xl border border-[#2a2f3e] cursor-pointer"
                variants={cardVariants}
                whileHover="hover"
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={() => handleViewDetails(apology)}
              >
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mr-4 flex-shrink-0">
                    <FaUserGraduate className="text-purple-400 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {apology.student?.name || "Unknown Student"}
                    </h3>
                    <p className="text-gray-400 text-sm">{(apology.student && apology.student.email) ? apology.student.email : "No Email"}</p>
                  </div>
                  <span
                    className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(apology.status)}`}
                  >
                    {getStatusIcon(apology.status)} {apology.status}
                  </span>
                </div>

                <p className="text-gray-300 mb-3 text-sm flex items-center gap-2">
                  <FaBook className="text-blue-400" />
                  Course: {apology.course?.courseName || "N/A"}
                </p>
                <p className="text-gray-300 mb-4 text-sm flex items-center gap-2">
                  <FaCommentAlt className="text-green-400" />
                  Description: {apology.description.substring(0, 70)}{apology.description.length > 70 ? "..." : ""}
                </p>

                {apology.image && getFullImageUrl(apology.image) && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4 border border-[#2a2f3e]">
                    <Image
                      src={getFullImageUrl(apology.image)}
                      alt="Apology Image"
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex justify-between items-center text-gray-500 text-xs">
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt /> {format(new Date(apology.createdAt), "PPP")}
                  </span>
                  {apology.seenByStaff && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <FaEye /> Seen
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Apology Details Modal */}
      <AnimatePresence>
        {showModal && selectedApology && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1a1f2e] p-6 rounded-xl max-w-2xl w-full relative border border-[#2a2f3e] shadow-lg"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-xl"
                onClick={handleCloseModal}
              >
                &times;
              </button>

              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FaInbox className="text-blue-400" /> Apology Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Student Info */}
                <div className="bg-[#232738] p-4 rounded-lg border border-[#2a2f3e]">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <FaUserGraduate className="text-purple-400" /> Student Info
                  </h3>
                  <p className="text-gray-300 text-sm">
                    <strong>Name:</strong> {selectedApology.student?.name || "N/A"}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <strong>Email:</strong> {selectedApology.student?.email || "N/A"}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <strong>Level:</strong> {selectedApology.student?.level || "N/A"}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <strong>Department:</strong> {selectedApology.student?.department || "N/A"}
                  </p>
                </div>

                {/* Apology Details */}
                <div className="bg-[#232738] p-4 rounded-lg border border-[#2a2f3e]">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <FaCommentAlt className="text-green-400" /> Apology Content
                  </h3>
                  <p className="text-gray-300 mb-2">
                    <strong>Course:</strong> {selectedApology.course?.courseName || "N/A"}
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong>Description:</strong> {selectedApology.description || "N/A"}
                  </p>
                  <p className="text-gray-300 mb-2 flex items-center gap-1">
                    <strong>Status:</strong>{" "}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(selectedApology.status)}`}>
                      {getStatusIcon(selectedApology.status)} {selectedApology.status}
                    </span>
                  </p>
                  {selectedApology.reason && (
                    <p className="text-gray-300 mb-2">
                      <strong>Reason:</strong> {selectedApology.reason}
                    </p>
                  )}
                   <p className="text-gray-300 text-xs flex items-center gap-1">
                    <FaCalendarAlt className="text-gray-500" />
                    Submitted: {format(new Date(selectedApology.createdAt), "PPP 'at' p")}
                  </p>
                  {selectedApology.seenAt && (
                    <p className="text-gray-300 text-xs flex items-center gap-1">
                      <FaEye className="text-gray-500" />
                      Seen: {format(new Date(selectedApology.seenAt), "PPP 'at' p")}
                    </p>
                  )}
                </div>
              </div>

              {selectedApology.image && getFullImageUrl(selectedApology.image) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <FaImage className="text-red-400" /> Attachment
                  </h3>
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border border-[#2a2f3e]">
                    <Image
                      src={getFullImageUrl(selectedApology.image)}
                      alt="Apology Attachment"
                      layout="fill"
                      objectFit="contain"
                      className="bg-gray-800"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                {selectedApology.status === "pending" && (
                  <>
                    <input
                      type="text"
                      placeholder="Add reason (optional)"
                      value={updateReason}
                      onChange={(e) => setUpdateReason(e.target.value)}
                      className="flex-grow p-2 rounded-lg bg-[#2a2f3e] text-white border border-[#3b4152] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleUpdateStatus("accepted")}
                      disabled={loading && currentStatusToUpdate === 'accepted'}
                      className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 font-medium"
                    >
                      {loading && currentStatusToUpdate === 'accepted' ? (
                        <FaClock className="animate-spin" />
                      ) : (
                        <FaCheckCircle />
                      )}{" "}
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("rejected")}
                      disabled={loading && currentStatusToUpdate === 'rejected'}
                      className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 font-medium"
                    >
                      {loading && currentStatusToUpdate === 'rejected' ? (
                        <FaClock className="animate-spin" />
                      ) : (
                        <FaTimesCircle />
                      )}{" "}
                      Reject
                    </button>
                  </>
                )}
                {selectedApology.status !== "pending" && (
                  <button
                    onClick={() => handleCloseModal()}
                    className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium"
                  >
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ApologiesPage; 