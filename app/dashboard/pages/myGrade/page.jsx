"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserGraduate, FaArrowUp, FaFilter, FaCheckCircle, FaTimesCircle, FaSpinner, FaSearch } from "react-icons/fa";

const levels = ["1", "2", "3", "4"];
const departments = ["CS", "IS", "AI", "BIO"];

const MyGradePage = () => {
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [status, setStatus] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpgradeConfirmModal, setShowUpgradeConfirmModal] = useState(false);

  // Fetch students based on selected level and departments
  useEffect(() => {
    if (!selectedLevel || selectedDepartments.length === 0) {
      setStudents([]);
      setFilteredStudents([]);
      return;
    }
    
    setLoading(true);
    fetch("https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode/studentInfo")
      .then((res) => res.json())
      .then((data) => {
        // Filter students by level and department
        const filteredStudents = (data.data || []).filter(
          (student) =>
            student.level?.toString() === selectedLevel &&
            selectedDepartments.includes(student.department?.toUpperCase())
        );
        setStudents(filteredStudents);
        setFilteredStudents(filteredStudents);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setStatus("Failed to load students. Please try again.");
        setStudents([]);
        setFilteredStudents([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedLevel, selectedDepartments]);

  // Filter students based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results = students.filter(student => 
      (student.name?.toLowerCase().includes(query)) ||
      (student.email?.toLowerCase().includes(query)) ||
      (student._id?.toLowerCase().includes(query))
    );
    
    setFilteredStudents(results);
  }, [searchQuery, students]);

  // Handle selecting all students
  useEffect(() => {
    if (selectAll) {
      setSelectedStudents(filteredStudents.map(student => student._id));
    } else if (selectedStudents.length === filteredStudents.length) {
      // If we just unchecked "Select All", clear selections
      setSelectedStudents([]);
    }
  }, [selectAll, filteredStudents]);

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  // Toggle department selection
  const toggleDepartment = (dept) => {
    if (selectedDepartments.includes(dept)) {
      setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
    } else {
      setSelectedDepartments([...selectedDepartments, dept]);
    }
    setSelectedStudents([]);
    setSelectAll(false);
  };

  // Calculate next level
  const getNextLevel = (currentLevel) => {
    const current = parseInt(currentLevel, 10);
    if (isNaN(current) || current >= 4) return "Graduate";
    return (current + 1).toString();
  };

  // Handle upgrade students
  const handleUpgradeStudents = async () => {
    setShowUpgradeConfirmModal(true);
  };

  const confirmAndProceedUpgrade = async () => {
    setShowUpgradeConfirmModal(false);

    if (filteredStudents.length === 0) {
      setStatus("No students available to upgrade.");
      return;
    }

    // Get IDs of students NOT selected
    const unselectedStudentIds = filteredStudents
      .filter(student => !selectedStudents.includes(student._id))
      .map(student => student._id);

    if (unselectedStudentIds.length === 0) {
      setStatus("Please leave at least one student unselected to upgrade.");
      return;
    }

    const nextLevel = getNextLevel(selectedLevel);
    if (nextLevel === "Graduate") {
      const confirmGraduate = window.confirm(
        "These students will be marked as graduates. This is typically a different process. Do you want to continue?"
      );
      if (!confirmGraduate) return;
    }
    
    setUpgrading(true);
    setStatus("");

    try {
      const token = localStorage.getItem("token")?.replace(/"/g, "");
      const res = await fetch(
        "https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode/updateMyGrade",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            studentIds: unselectedStudentIds,
            level: selectedLevel
          }),
        }
      );

      const data = await res.json();
      
      if (res.ok) {
        setStatus(`Successfully upgraded ${unselectedStudentIds.length} students to level ${nextLevel}`);
        
        // Remove upgraded students from the list
        const updatedStudents = students.filter(student => !unselectedStudentIds.includes(student._id));
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);
        
        // Clear selections
        setSelectedStudents([]);
        setSelectAll(false);
      } else {
        setStatus(`Error: ${data.message || "Failed to upgrade students"}`);
      }
    } catch (error) {
      console.error("Error upgrading students:", error);
      setStatus("Network error. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  // Clear search and filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilteredStudents(students);
  };

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
                  onClick={() => {
                    setSelectedLevel(level);
                    setSelectedStudents([]);
                    setSelectAll(false);
                  }}
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
                {loading ? "Loading students..." : `${filteredStudents.length - selectedStudents.length} out of ${filteredStudents.length} students will be upgraded`}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {filteredStudents.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1a1f2e] text-blue-300 rounded-lg hover:bg-[#1a1f2e]/80 transition-colors"
                >
                  {selectAll ? <FaTimesCircle /> : <FaCheckCircle />}
                  <span>{selectAll ? "Deselect All to Upgrade" : "Select All to Hold Back"}</span>
                </button>
              )}
              <button
                onClick={handleUpgradeStudents}
                disabled={upgrading || filteredStudents.length === 0}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                  (upgrading || filteredStudents.length === 0)
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
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
              Students in Level {selectedLevel} - {selectedDepartments.join(", ")}
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
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="text-blue-400 text-3xl animate-spin" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-[#1a1f2e]/50 p-8 rounded-lg text-center">
              <FaUserGraduate className="mx-auto text-4xl text-gray-500 mb-3 opacity-50" />
              <p className="text-gray-400">
                {searchQuery 
                  ? "No students found matching your search criteria" 
                  : selectedLevel && selectedDepartments.length > 0
                    ? "No students found in the selected level and departments"
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
                    className={`bg-[#1a1f2e] p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedStudents.includes(student._id)
                        ? "border-red-500 shadow-lg shadow-red-500/10"
                        : "border-green-500 shadow-lg shadow-green-500/10"
                    }`}
                    onClick={() => toggleStudentSelection(student._id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border-2 border-blue-800/30">
                          <span className="text-blue-300 font-medium">{student.name?.charAt(0).toUpperCase() || '?'}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{student.name}</h3>
                        <p className="text-gray-400 text-sm truncate">{student.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-900/30 text-indigo-300 text-xs font-medium border border-indigo-800/30">
                            Level {student.level}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-green-900/30 text-green-300 text-xs font-medium border border-green-800/30">
                            {student.department}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedStudents.includes(student._id)
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                        }`}>
                          {selectedStudents.includes(student._id) ? (
                            <FaTimesCircle className="text-sm" />
                          ) : (
                            <FaCheckCircle className="text-sm" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      {/* Custom Upgrade Confirmation Modal */}
      {showUpgradeConfirmModal && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#1a1f2e] p-6 rounded-xl max-w-md w-full mx-4 border border-blue-500/30 shadow-lg shadow-blue-500/10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                <FaArrowUp className="text-blue-500 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white">Confirm Upgrade</h3>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <p className="text-gray-300">
                Are you sure you want to upgrade these students to the next level?
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <motion.button
                className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowUpgradeConfirmModal(false)}
              >
                Cancel
              </motion.button>
              <motion.button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                whileHover={{ scale: 1.03, boxShadow: "0 5px 15px rgba(34, 197, 94, 0.2)" }}
                whileTap={{ scale: 0.97 }}
                onClick={confirmAndProceedUpgrade}
                disabled={upgrading}
              >
                {upgrading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Upgrading...
                  </>
                ) : (
                  <>
                    <FaArrowUp className="mr-2" /> Upgrade
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

export default MyGradePage; 