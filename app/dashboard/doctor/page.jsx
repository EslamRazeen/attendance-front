"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaFilter, FaChalkboardTeacher, FaBookOpen, FaCalendarCheck, FaCalendarTimes, FaUserGraduate, FaSync, FaChartLine, FaChevronDown, FaBook, FaChartBar, FaUsers, FaTasks, FaQrcode, FaCommentDots, FaSignOutAlt, FaUniversity, FaExclamationCircle, FaSpinner } from "react-icons/fa";
import InstructorDashCard from "@/app/components/dashboard/doctor/InstructorDashCard";
import InstructorPieChart from "@/app/components/dashboard/doctor/InstructorPieChart";
import InstructorLineChart from "@/app/components/dashboard/doctor/InstructorLineChart";
import { useGetCoursesQuery } from "@/app/store/features/coursesApiSlice";
import { useGetDoctorDashboardDataMutation } from "@/app/store/features/dashboardApiSlice";
import { useSelector } from "react-redux";

const InstructorDashboard = () => {
  // State for filters
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("this week");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const dropdownRef = React.useRef(null);

  // Get instructor courses from Redux
  const instructorCourses = useSelector((state) => state.userRole.instructorCourses);
  
  // Log Redux state for debugging
  useEffect(() => {
    console.log("Instructor courses from Redux:", instructorCourses);
  }, [instructorCourses]);

  // Get courses data
  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesQuery();
  
  // Log courses data for debugging
  useEffect(() => {
    if (coursesData) {
      console.log("All courses from API:", coursesData);
    }
  }, [coursesData]);

  // Get dashboard data mutation
  const [getDashboardData, { isLoading: dashboardLoading, isError, error }] = useGetDoctorDashboardDataMutation();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260, 
        damping: 20 
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter courses to only show instructor's courses
  const filteredCourses = React.useMemo(() => {
    if (!coursesData || !coursesData.data) {
      console.log("No courses data available");
      return [];
    }
    
    // Get instructor course IDs
    const instructorCourseIds = instructorCourses.map(course => course._id);
    console.log("Instructor course IDs:", instructorCourseIds);
    
    // If no instructor courses are set, return all courses
    if (instructorCourseIds.length === 0) {
      console.log("No instructor courses found, using all courses");
      return coursesData.data;
    }
    
    // Filter courses to only include instructor's courses
    const filtered = coursesData.data.filter(course => instructorCourseIds.includes(course._id));
    console.log("Filtered courses for instructor:", filtered);
    return filtered;
  }, [coursesData, instructorCourses]);

  // Set initial selected course when courses are loaded
  useEffect(() => {
    if (filteredCourses.length > 0 && !selectedCourse) {
      console.log("Setting initial course:", filteredCourses[0]);
      setSelectedCourse(filteredCourses[0]);
    }
  }, [filteredCourses, selectedCourse]);

  // Fetch dashboard data when course or time range changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedCourse || !selectedCourse._id) {
        console.log("No course selected or course ID missing");
        return;
      }
      
      console.log("Fetching dashboard data for course:", selectedCourse.courseName, "ID:", selectedCourse._id);
      
      try {
        const response = await getDashboardData({
          courseId: selectedCourse._id,
          range: selectedTimeRange
        }).unwrap();
        
        console.log("Dashboard data received:", response);
        setDashboardData(response);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    
    fetchDashboardData();
  }, [selectedCourse, selectedTimeRange, getDashboardData]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle course select
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setIsDropdownOpen(false);
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!dashboardData) return null;
    
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalAttendance = 0;
    let items = [];
    
    if (dashboardData.type === 'week' && dashboardData.days) {
      items = dashboardData.days;
    } else if (dashboardData.type === 'month' && dashboardData.weeks) {
      items = dashboardData.weeks;
    }
    
    // Calculate totals
    items.forEach(item => {
      totalPresent += item.present;
      totalAbsent += item.absent;
    });
    
    // Calculate overall attendance rate
    const total = totalPresent + totalAbsent;
    const attendanceRate = total > 0 ? Math.round((totalPresent / total) * 100) : 0;
    
    // Calculate average attendance rate
    const avgAttendanceRate = items.length > 0 
      ? Math.round(items.reduce((sum, item) => sum + item.attendanceRate, 0) / items.length)
      : 0;
    
    return {
      totalPresent,
      totalAbsent,
      attendanceRate,
      avgAttendanceRate
    };
  };

  // Prepare pie chart data
  const preparePieChartData = () => {
    const summary = calculateSummary();
    if (!summary) return [];
    
    return [
      {
        name: "Present",
        value: summary.totalPresent,
        color: "#4ade80"
      },
      {
        name: "Absent",
        value: summary.totalAbsent,
        color: "#f87171"
      }
    ];
  };

  // Prepare line chart data
  const prepareLineChartData = () => {
    if (!dashboardData) return [];
    
    if (dashboardData.type === 'week' && dashboardData.days) {
      return dashboardData.days;
    } else if (dashboardData.type === 'month' && dashboardData.weeks) {
      return dashboardData.weeks;
    }
    
    return [];
  };

  // Loading state
  if (coursesLoading || (dashboardLoading && !dashboardData)) {
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
          Loading dashboard data...
        </motion.p>
      </div>
    );
  }

  // Error state
  if (isError || (!coursesLoading && filteredCourses.length === 0)) {
    return (
      <motion.div 
        className="bg-red-900/20 border border-red-500 p-6 rounded-xl text-red-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex items-center mb-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-red-900/30 p-3 rounded-full mr-4">
            <FaSync className="text-red-500 text-xl" />
          </div>
          <h3 className="font-bold text-xl">Error Loading Dashboard</h3>
        </motion.div>
        
        <motion.p 
          className="mb-2 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {error?.message || "Failed to load dashboard data. Please try again."}
        </motion.p>
        
        {filteredCourses.length === 0 && (
          <motion.p 
            className="mt-2 text-red-300/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            No courses are assigned to you. Please contact the administrator.
          </motion.p>
        )}
        
        <motion.button 
          onClick={() => window.location.reload()}
          className="mt-6 bg-red-800/30 hover:bg-red-800/50 text-white py-3 px-6 rounded-lg transition-colors flex items-center"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaSync className="mr-2" /> Retry
        </motion.button>
      </motion.div>
    );
  }

  // Calculate summary
  const summary = calculateSummary();
  const pieChartData = preparePieChartData();
  const lineChartData = prepareLineChartData();

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-white">Instructor Dashboard</h2>
          <p className="text-gray-400 text-sm">Attendance statistics and analytics</p>
        </motion.div>

        <motion.div 
          className="flex flex-wrap gap-3"
          variants={itemVariants}
        >
          {/* Course Filter Dropdown */}
          <div className="relative z-10" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center justify-between bg-[#1a1f2e] text-white px-3 py-2 rounded-md border border-[#2a2f3e] text-sm focus:outline-none focus:ring-2 focus:ring-[#7950f2] focus:border-transparent min-w-[160px]"
            >
              <span className="truncate max-w-[120px]">
                {selectedCourse ? selectedCourse.courseName : "Select Course"}
              </span>
              <FaChevronDown className={`ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute mt-2 w-full bg-[#1a1f2e] border border-[#2a2f3e] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto z-20"
                >
                  {coursesLoading ? (
                    <div className="px-4 py-3 text-center text-gray-400">
                      <div className="inline-block h-4 w-4 border-2 border-t-2 border-gray-500 rounded-full animate-spin mr-2"></div>
                      Loading courses...
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="px-4 py-3 text-center text-gray-400">
                      No courses available
                    </div>
                  ) : (
                    filteredCourses.map((course, index) => (
                      <motion.button
                        key={course._id}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        onClick={() => handleCourseSelect(course)}
                        className={`w-full text-left px-4 py-2 hover:bg-[#2a2f3e] text-white transition-colors duration-150 ${
                          selectedCourse && selectedCourse._id === course._id ? 'bg-[#2a2f3e] border-l-4 border-[#7950f2]' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="truncate">{course.courseName}</span>
                          {selectedCourse && selectedCourse._id === course._id && (
                            <span className="ml-auto text-[#7950f2]">✓</span>
                          )}
                        </div>
                      </motion.button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Time Range Filter */}
          <div className="relative">
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-[#1a1f2e] text-white px-3 py-2 rounded-md border border-[#2a2f3e] text-sm focus:outline-none focus:ring-2 focus:ring-[#7950f2] focus:border-transparent appearance-none pr-8"
              disabled={dashboardLoading}
          >
              <option value="this week">This Week</option>
              <option value="this month">This Month</option>
          </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              {dashboardLoading ? (
                <div className="h-4 w-4 border-2 border-t-2 border-blue-400 rounded-full animate-spin"></div>
              ) : (
                <FaChevronDown className="text-gray-400" />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {dashboardLoading && dashboardData && (
        <div className="fixed top-4 right-4 bg-blue-900/70 text-blue-200 py-2 px-4 rounded-lg flex items-center z-50">
          <div className="animate-spin h-4 w-4 border-2 border-blue-200 border-t-transparent rounded-full mr-2"></div>
          Refreshing data...
        </div>
      )}

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        <InstructorDashCard 
            title="Attendance Rate"
          value={`${summary?.attendanceRate || 0}%`}
          percentage={`${summary?.avgAttendanceRate || 0}% avg`}
          isIncrease={summary?.attendanceRate >= 70}
          icon={<FaChartLine className="text-blue-400" size={20} />}
          color="bg-blue-900"
          />
        <InstructorDashCard 
          title="Present"
          value={summary?.totalPresent || 0}
          percentage={`${summary?.attendanceRate || 0}%`}
          isIncrease={summary?.attendanceRate >= 50}
          icon={<FaCalendarCheck className="text-green-400" size={20} />}
          color="bg-green-900"
        />
        <InstructorDashCard 
          title="Absent"
          value={summary?.totalAbsent || 0}
          percentage={`${100 - (summary?.attendanceRate || 0)}%`}
            isIncrease={false}
          icon={<FaCalendarTimes className="text-red-400" size={20} />}
          color="bg-red-900"
          />
      </motion.div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 bg-[#232738] rounded-xl p-5 shadow-md"
          variants={itemVariants}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-300">
              {selectedTimeRange === "this week" ? "Daily Attendance" : "Weekly Attendance"}
            </h3>
            <div className="text-sm text-gray-400">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> Present
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mx-1 ml-3"></span> Absent
            </div>
          </div>
          {lineChartData.length > 0 ? (
            <InstructorLineChart data={lineChartData} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No attendance data available
            </div>
          )}
        </motion.div>
        
        <motion.div
          className="bg-[#232738] rounded-xl p-5 shadow-md"
          variants={itemVariants}
        >
          <h3 className="text-lg font-medium mb-4 text-gray-300">Attendance Distribution</h3>
          {pieChartData.length > 0 && pieChartData.some(item => item.value > 0) ? (
            <InstructorPieChart data={pieChartData} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No attendance data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        <Link href="/dashboard/doctor/takeAttendance">
          <div className="bg-[#7950f2] hover:bg-[#6c40e0] text-white p-4 rounded-xl flex items-center gap-3 transition-colors">
            <div className="bg-white/20 p-3 rounded-lg">
              <FaCalendarCheck size={20} />
            </div>
            <div>
              <h4 className="font-medium">Take Attendance</h4>
              <p className="text-xs opacity-80">QR code or manual</p>
            </div>
          </div>
        </Link>
        
        <Link href="/dashboard/doctor/students">
          <div className="bg-[#232738] hover:bg-[#2a2f3e] text-white p-4 rounded-xl flex items-center gap-3 transition-colors border border-[#2a2f3e]">
            <div className="bg-blue-900/30 p-3 rounded-lg">
              <FaUserGraduate className="text-blue-400" size={20} />
            </div>
              <div>
              <h4 className="font-medium">Students</h4>
              <p className="text-xs text-gray-400">View all students</p>
            </div>
                </div>
        </Link>
        
        <Link href="/dashboard/doctor/subjects">
          <div className="bg-[#232738] hover:bg-[#2a2f3e] text-white p-4 rounded-xl flex items-center gap-3 transition-colors border border-[#2a2f3e]">
            <div className="bg-green-900/30 p-3 rounded-lg">
              <FaBookOpen className="text-green-400" size={20} />
            </div>
            <div>
              <h4 className="font-medium">Courses</h4>
              <p className="text-xs text-gray-400">Manage your courses</p>
            </div>
          </div>
        </Link>
        
        <Link href="/dashboard/doctor/manualAttendance">
          <div className="bg-[#232738] hover:bg-[#2a2f3e] text-white p-4 rounded-xl flex items-center gap-3 transition-colors border border-[#2a2f3e]">
            <div className="bg-yellow-900/30 p-3 rounded-lg">
              <FaChalkboardTeacher className="text-yellow-400" size={20} />
            </div>
            <div>
              <h4 className="font-medium">Manual Records</h4>
              <p className="text-xs text-gray-400">Edit attendance records</p>
              </div>
        </div>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default InstructorDashboard;
