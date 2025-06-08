"use client";
import React, { useMemo, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Typography,
  Paper,
  Button,
  useMediaQuery,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { CiSearch } from "react-icons/ci";
import { FaFilter, FaSort, FaUserPlus, FaDownload, FaSortAmountDown, FaSortAmountUp, FaUserTimes, FaCheckCircle, FaExclamationTriangle, FaSync } from "react-icons/fa";
import { MdFilterList, MdFilterListOff } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  useAddStudentAttendanceMutation,
  useGetAllAttendancesQuery,
  useGetManualAttendanceQuery,
} from "@/app/store/features/attendanceApiSlice"; // Updated Redux import path
import { useTheme } from "@/app/components/providers/ThemeProvider"; // Updated ThemeProvider import path
import { Tooltip as MuiTooltip, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

// Add this helper function at the top of the file, outside the component
const getAttendanceStatus = (student) => {
  // Handle direct attendanceStatus field from new API format
  if (student && student.attendanceStatus) {
    return student.attendanceStatus;
  }
  
  // Handle older formats
  return student.studentAttendanc || 
         (student.student && student.student.attendanceStatus) || 
         "Not recorded";
};

// تعديل ظهور رسائل الحضور والغياب
const AttendanceButton = ({ onClick, color, icon, disabled, tooltipText, tooltipClass = "" }) => {
  const isDefaultTooltip = !tooltipText.includes("Already");
  
  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${
          disabled ? 
          'bg-gray-700/20 text-gray-500 cursor-not-allowed' : 
          `${color} text-white hover:shadow-lg hover:-translate-y-0.5`
        } ${tooltipClass}`}
      >
        {icon}
      </button>
      
      {/* Status indicator that will be displayed on hover without tooltips */}
      {disabled && (
        <div className={`absolute right-0 -top-10 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium 
          ${tooltipText.includes("present") ? "bg-green-600" : "bg-red-600"} text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
          {tooltipText}
        </div>
      )}
    </div>
  );
};

// تولتيب مخصص حديث للحضور
const CustomTooltip = styled(({ className, ...props }) => (
  <MuiTooltip
    {...props}
    arrow
    placement="top"
    classes={{ popper: className }}
    enterDelay={100}
    leaveDelay={100}
    TransitionProps={{ timeout: 0 }}
  />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    fontWeight: 500,
    fontSize: 14,
    borderRadius: 10,
    boxShadow: '0 4px 16px 0 #22c55e33',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    letterSpacing: 0.2,
  },
}));

// تولتيب مخصص حديث للغياب
const CustomTooltipAbsent = styled(({ className, ...props }) => (
  <MuiTooltip
    {...props}
    arrow
    placement="top"
    classes={{ popper: className }}
    enterDelay={100}
    leaveDelay={100}
    TransitionProps={{ timeout: 0 }}
  />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)',
    color: '#fff',
    fontWeight: 500,
    fontSize: 14,
    borderRadius: 10,
    boxShadow: '0 4px 16px 0 #ef444433',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    letterSpacing: 0.2,
  },
}));

export default function AttendanceTable({ allowMarkAbsent = false }) {
  const [isRendered, setIsRendered] = useState(false);
  const sessionId = useSelector((state) => state.session.sessionId);
  const lecturerRole = useSelector((state) => state.userRole.isInstructor);
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("token")?.replace(/"/g, "")
      : null;
  
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [storedCourse, setStoredCourse] = useState({});
  
  // Initialize client-side state
  useEffect(() => {
    setIsRendered(true);
    
    if (typeof window !== "undefined") {
      const course = JSON.parse(localStorage.getItem("selectedCourse") || "{}");
      setStoredCourse(course);
    }
  }, []);
  
  const courseId = storedCourse._id;
  
  // Debug the course ID
  useEffect(() => {
    if (courseId) {
      console.log("Using course ID in AttendanceTable:", courseId);
    } else {
      console.warn("No course ID available in AttendanceTable");
    }
  }, [courseId]);
  
  // Fetch attendance data - use different queries based on context
  const { 
    data: allAttendanceData, 
    error: allAttendanceError, 
    isLoading: isLoadingAllAttendance,
    refetch: refetchAllAttendance
  } = useGetAllAttendancesQuery(
    courseId,
    {
      skip: !courseId || (allowMarkAbsent && sessionId), // Skip if in manual mode with active session
    }
  );
  
  // Fetch manual attendance data for current session
  const { 
    data: manualAttendanceData, 
    error: manualAttendanceError, 
    isLoading: isLoadingManualAttendance,
    refetch: refetchManualAttendance
  } = useGetManualAttendanceQuery(
    sessionId,
    {
      skip: !courseId || !allowMarkAbsent, // Only fetch when in manual mode with active course
    }
  );
  
  // Refetch data when sessionId changes
  useEffect(() => {
    if (courseId && allowMarkAbsent && refetchManualAttendance) {
      console.log("Course or session changed, refetching manual attendance data");
      refetchManualAttendance();
    }
  }, [sessionId, courseId, allowMarkAbsent, refetchManualAttendance]);
  
  // Debug logs
  useEffect(() => {
    if (allowMarkAbsent) {
      console.log("Manual attendance mode active with session ID:", sessionId);
      console.log("Manual attendance data:", manualAttendanceData);
    } else {
      console.log("Regular attendance mode active");
      console.log("All attendance data:", allAttendanceData);
    }
  }, [allowMarkAbsent, sessionId, manualAttendanceData, allAttendanceData]);
  
  // Determine which data to use
  const data = allowMarkAbsent ? manualAttendanceData : allAttendanceData;
  const error = allowMarkAbsent ? manualAttendanceError : allAttendanceError;
  const isLoading = allowMarkAbsent ? isLoadingManualAttendance : isLoadingAllAttendance;
  const refetch = allowMarkAbsent ? refetchManualAttendance : refetchAllAttendance;
  
  // Debug the final data being used
  useEffect(() => {
    console.log("Final data being used:", data);
    if (data?.students) {
      console.log("Students array:", data.students);
      console.log("Number of students:", data.students.length || 0);
    } else {
      console.warn("No students data available or data structure is incorrect");
      // Try to diagnose the issue
      if (!data) {
        console.error("Data is null or undefined");
      } else {
        console.error("Data structure doesn't contain students array:", Object.keys(data));
      }
    }
    
    // Log any errors
    if (error) {
      console.error("Error fetching attendance data:", error);
      // Extract and log more details about the error
      if (error.status) {
        console.error(`Error status: ${error.status}`);
      }
      if (error.message) {
        console.error(`Error message: ${error.message}`);
      }
      if (error.data) {
        console.error("Error data:", error.data);
      }
    }
  }, [data, error]);
  
  // Add a retry mechanism for data fetching
  useEffect(() => {
    if (error && refetch) {
      // Wait 3 seconds before retrying (increased from 2s)
      const retryTimer = setTimeout(() => {
        console.log("Retrying data fetch due to error");
        refetch();
      }, 3000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [error, refetch]);
  
  const [addStudentAttendance, { isLoading: isLoadingAdding }] =
    useAddStudentAttendanceMutation();

  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sorting and filtering states
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [availableDepartments, setAvailableDepartments] = useState([]);
  
  const users = data?.students || [];
  const isSmallScreen = useMediaQuery("(max-width:930px)");

  // Extract unique departments for filter dropdown
  useEffect(() => {
    if (Array.isArray(users) && users.length > 0) {
      const departments = [...new Set(users.map(user => 
        user?.student?.department || "Unknown"
      ))];
      setAvailableDepartments(departments);
    }
  }, [users]);

  // Filter users based on search term and filters
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    return users.filter((user) => {
      // Text search filter
      const name = user?.student?.name?.toLowerCase() || "";
      const department = user?.student?.department?.toLowerCase() || "";
      const id = user?.student?.studentID ? String(user?.student?.studentID) : 
                (user?.student?._id ? String(user?.student?._id).substring(0, 8) : "");
      const textMatch = 
        name.includes(searchTerm.toLowerCase()) ||
        department.includes(searchTerm.toLowerCase()) ||
        id.includes(searchTerm);
      
      // Get the attendance status using our helper function
      const status = getAttendanceStatus(user);
      
      // Status filter
      const statusMatch = 
        statusFilter === "all" || 
        (statusFilter === "present" && status === "present") ||
        (statusFilter === "absent" && status !== "present");
      
      // Department filter
      const deptMatch = 
        departmentFilter === "all" || 
        user?.student?.department === departmentFilter;
      
      return textMatch && statusMatch && deptMatch;
    });
  }, [searchTerm, users, statusFilter, departmentFilter]);

  // Sort users
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let fieldA, fieldB;
      
      switch (sortField) {
        case "id":
          fieldA = a?.student?.studentID || a?.student?._id?.substring(0, 8) || "";
          fieldB = b?.student?.studentID || b?.student?._id?.substring(0, 8) || "";
          break;
        case "name":
          fieldA = a?.student?.name || "";
          fieldB = b?.student?.name || "";
          break;
        case "department":
          fieldA = a?.student?.department || "";
          fieldB = b?.student?.department || "";
          break;
        case "status":
          fieldA = getAttendanceStatus(a) || "";
          fieldB = getAttendanceStatus(b) || "";
          break;
        default:
          fieldA = a?.student?.name || "";
          fieldB = b?.student?.name || "";
      }
      
      // Compare the fields based on sort direction
      if (sortDirection === "asc") {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });
  }, [filteredUsers, sortField, sortDirection]);

  // Handle sort click
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter menu handlers
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setDepartmentFilter("all");
    handleFilterClose();
  };

  // Export data to Excel
  const handleExportToExcel = () => {
    if (users.length === 0) {
      alert("No data to export!");
      return;
    }

    // Format data for export
    const exportData = sortedUsers.map(user => ({
      'Student ID': user.student?.studentID || (user.student?._id ? user.student._id.substring(0, 8) : ''),
      'Name': user.student?.name || '',
      'Department': user.student?.department || '',
      'Level': user.student?.level || '',
      'Attendance Status': getAttendanceStatus(user)
    }));

    // Convert JSON to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    // Write the file and trigger download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save the file
    saveAs(data, `${storedCourse.courseName || 'Course'}_Attendance.xlsx`);
  };

  // Add user attendance
  const handleAddUserAttendance = async (row, status = "present") => {
    console.log("Marking attendance for student:", row);
    
    // Check if student data exists
    if (!row || !row.student || !row.student._id) {
      window.alert("Student data is unavailable or invalid");
      console.error("Invalid student data:", row);
      return;
    }
    
    // Check if session ID exists
    if (!sessionId) {
      window.alert("No active session. Please create a session first.");
      return;
    }
    
    // Get current attendance status
    const currentStatus = getAttendanceStatus(row);
    
    // Check if student is already marked with the same status
    if (currentStatus === status) {
      window.alert(`Student ${row.student?.name || ''} is already marked ${status}`);
      return;
    }

    const statusMessage = status === "present" ? "present" : "absent";
    
    // No confirmation dialog for any status
      try {
        const newAttendance = {
          student: row.student?._id,
          sessionID: sessionId,
          attendanceStatus: status,
          sessionType: lecturerRole === "instructor" ? "lecture" : "section",
          timestamp: new Date().toISOString()
        };

        console.log("Sending attendance data:", newAttendance);

        // Validate data before sending
        if (!newAttendance.student || !newAttendance.sessionID) {
          throw new Error("Incomplete attendance data");
        }

        const response = await addStudentAttendance({
          courseId: storedCourse._id || courseId,
          newUser: newAttendance,
        });

        console.log("Attendance response:", response);

      // No success message alert for any status
        
        // Refresh data 
        if (refetch) {
          console.log("Refetching attendance data");
          refetch();
        }
      } catch (err) {
        console.error("Failed to add attendance:", err);
        window.alert(`Failed to record attendance: ${err.message || "Unexpected error occurred"}`);
    }
  };
  
  if (!isRendered) return null;
  
  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          backgroundColor: "var(--secondary)",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid var(--border-color)",
          color: "var(--foreground)",
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)] mb-4"></div>
          <Typography variant="h6" sx={{ color: 'var(--foreground)', mb: 1 }}>
            Loading attendance data...
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)', textAlign: 'center' }}>
            Please wait while we fetch the student information.
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  if (error) {
    return (
      <div className="text-error text-center p-4 bg-red-50 rounded-lg">
        Error fetching attendance data: {error.message}
      </div>
    );
  }

  // If we're in manual attendance mode with no active session, show a message
  if (allowMarkAbsent && !sessionId) {
    return (
      <div className="text-center p-8 bg-[var(--secondary)] rounded-lg border border-[var(--border-color)]">
        <h3 className="text-xl font-medium text-[var(--foreground)] mb-2">No Active Session</h3>
        <p className="text-[var(--foreground-secondary)] mb-4">
          Please create a session first to view and manage student attendance.
        </p>
      </div>
    );
  }

  // Calculate stats for the summary
  const totalStudents = users.length;
  const presentStudents = users.filter(user => getAttendanceStatus(user) === "present").length;
  const absentStudents = totalStudents - presentStudents;
  const attendanceRate = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;

  // If there's an error or no data, show an error message
  if (error || (!isLoading && (!data || !data.students))) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          backgroundColor: "var(--secondary)",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid var(--border-color)",
          color: "var(--foreground)",
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <FaExclamationTriangle size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
          <Typography variant="h6" sx={{ color: 'var(--foreground)', mb: 1 }}>
            Unable to load attendance data
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)', mb: 2, textAlign: 'center', maxWidth: '80%' }}>
            {error?.message || "There was an error loading student attendance data. This could be due to a connection issue or the data API being temporarily unavailable."}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)', mb: 3, textAlign: 'center', fontSize: '0.85rem' }}>
            Error code: {error?.status || 'unknown'} <br />
            {error?.originalStatus && `Original status: ${error.originalStatus}`}
          </Typography>
          <Button
            onClick={() => refetch && refetch()}
            variant="contained"
            startIcon={<FaSync />}
            sx={{
              backgroundColor: 'var(--primary)',
              '&:hover': { backgroundColor: 'var(--primary-dark)' },
              borderRadius: '8px',
              boxShadow: 'none',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Try Again
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <div className="container mx-auto px-0 sm:px-4 py-6 bg-[#0a0e17] min-h-screen">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative bg-gradient-to-br from-[#1a1f2e] to-[#131824] p-6 rounded-xl border border-[#2a2f3e] hover:border-blue-500/30 shadow-[0_10px_25px_-12px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_35px_-16px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-all duration-300"
          whileHover={{ y: -5 }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-300/70 text-xs uppercase tracking-wider font-semibold mb-1">Total Students</p>
              <h3 className="text-4xl font-bold text-white bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">{totalStudents}</h3>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/20">
              <svg className="w-6 h-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 h-2 w-full bg-blue-900/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative bg-gradient-to-br from-[#1a1f2e] to-[#131824] p-6 rounded-xl border border-[#2a2f3e] hover:border-green-500/30 shadow-[0_10px_25px_-12px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_35px_-16px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-all duration-300"
          whileHover={{ y: -5 }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-300/70 text-xs uppercase tracking-wider font-semibold mb-1">Present</p>
              <h3 className="text-4xl font-bold text-white bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">{presentStudents}</h3>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/20">
              <svg className="w-6 h-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 h-2 w-full bg-green-900/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(presentStudents / Math.max(totalStudents, 1)) * 100}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full bg-gradient-to-r from-green-400 to-green-500"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative bg-gradient-to-br from-[#1a1f2e] to-[#131824] p-6 rounded-xl border border-[#2a2f3e] hover:border-red-500/30 shadow-[0_10px_25px_-12px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_35px_-16px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-all duration-300"
          whileHover={{ y: -5 }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-red-300/70 text-xs uppercase tracking-wider font-semibold mb-1">Absent</p>
              <h3 className="text-4xl font-bold text-white bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">{absentStudents}</h3>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/20">
              <svg className="w-6 h-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 h-2 w-full bg-red-900/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(absentStudents / Math.max(totalStudents, 1)) * 100}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full bg-gradient-to-r from-red-400 to-red-500"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="relative bg-gradient-to-br from-[#1a1f2e] to-[#131824] p-6 rounded-xl border border-[#2a2f3e] hover:border-purple-500/30 shadow-[0_10px_25px_-12px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_35px_-16px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-all duration-300"
          whileHover={{ y: -5 }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-300/70 text-xs uppercase tracking-wider font-semibold mb-1">Attendance Rate</p>
              <h3 className="text-4xl font-bold text-white bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">{attendanceRate}%</h3>
            </div>
            <div className="ml-3 w-16 h-16 relative">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(167, 139, 250, 0.2)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="100, 100"
                />
                <motion.path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${attendanceRate}, 100` }}
                  transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <div className="mt-4 h-2 w-full bg-purple-900/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${attendanceRate}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full bg-gradient-to-r from-purple-400 to-purple-500"
            />
          </div>
        </motion.div>
      </div>
      
      <Box sx={{ width: "100%" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
        <Paper
            elevation={0}
          sx={{
            width: "100%",
            mb: 2,
              backgroundColor: "#0d111c",
              color: "white",
            borderRadius: "1rem",
            overflow: "hidden",
              border: "1px solid #2a2f3e",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "4px",
              background: "linear-gradient(to right, var(--primary), var(--primary-dark))",
            }
          }}
        >
          {/* Toolbar with search and filters */}
            <div className="p-4 sm:p-6 bg-[#1a1f2e] border-b border-[#2a2f3e]">
              <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
                <div className="relative w-full md:w-[350px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                <input
                    type="text"
                    placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#0d111c] text-white placeholder-gray-400 w-full py-2.5 pl-10 pr-4 rounded-md border border-[#2a2f3e] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Department Filter - hide on extra small screens */}
                <div className="relative w-full md:w-[250px] hidden sm:block">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="bg-[#0d111c] text-white w-full py-2.5 pl-10 pr-10 rounded-md border border-[#2a2f3e] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none transition-all"
                  >
                    <option value="all">All Departments</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Sort Filter - hide on extra small screens */}
                <div className="relative w-full md:w-[200px] hidden sm:block">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <select
                    value={`${sortField}-${sortDirection}`}
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split('-');
                      setSortField(field);
                      setSortDirection(direction);
                    }}
                    className="bg-[#0d111c] text-white w-full py-2.5 pl-10 pr-10 rounded-md border border-[#2a2f3e] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none transition-all"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="id-asc">ID (Ascending)</option>
                    <option value="id-desc">ID (Descending)</option>
                    <option value="department-asc">Department (A-Z)</option>
                    <option value="status-asc">Status (Present First)</option>
                    <option value="status-desc">Status (Absent First)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Export Button */}
                <div className="w-full md:w-auto md:ml-auto">
                  <button
                    onClick={handleExportToExcel}
                    className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white py-2.5 px-6 rounded-md transition-all flex items-center justify-center gap-2 hover:shadow-lg"
                  >
                    <FaDownload size={16} />
                    <span>Export</span>
                  </button>
                </div>
              </div>
              
              {/* Status Filter Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    statusFilter === "all"
                      ? "bg-primary text-white"
                      : "bg-[#2a2f3e] text-gray-300 hover:bg-[#3a3f4e]"
                  }`}
                >
                  All Students
                </button>
                <button
                  onClick={() => setStatusFilter("present")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    statusFilter === "present"
                      ? "bg-success text-white"
                      : "bg-[#2a2f3e] text-gray-300 hover:bg-[#3a3f4e]"
                  }`}
                >
                  Present
                </button>
                <button
                  onClick={() => setStatusFilter("absent")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    statusFilter === "absent"
                      ? "bg-error text-white"
                      : "bg-[#2a2f3e] text-gray-300 hover:bg-[#3a3f4e]"
                  }`}
                >
                  Absent
                </button>
                
                {departmentFilter !== "all" && (
                  <div className="flex items-center bg-[#2a2f3e] text-white px-4 py-1.5 rounded-full text-sm">
                    <span className="mr-2">Department: {departmentFilter}</span>
                    <button
                      onClick={() => setDepartmentFilter("all")}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

          {/* Table */}
          <div className="w-full overflow-x-hidden">
            <TableContainer 
              sx={{ 
                maxHeight: "calc(100vh - 300px)", 
                minHeight: "400px",
                overflowX: "hidden",
                "&::-webkit-scrollbar": {
                  width: "10px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#1a1f2e",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "var(--primary)",
                  borderRadius: "5px",
                  border: "2px solid #1a1f2e",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "var(--primary-dark)",
                },
                scrollbarWidth: "thin",
                scrollbarColor: "var(--primary) #1a1f2e"
              }}
            >
              <Table
                stickyHeader
                aria-labelledby="tableTitle"
                sx={{ 
                  minWidth: { xs: 350, sm: 650 },
                  tableLayout: "fixed",
                  "& .MuiTableCell-root": {
                    padding: { xs: "12px 8px", sm: "14px 16px" },
                  }
                }}
                size="small"
              >
                <TableHead>
                  <TableRow>
                    <TableCell 
                      onClick={() => handleSort("id")}
                      sx={{ 
                        fontWeight: "bold", 
                        backgroundColor: "#1a1f2e",
                        color: "white",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        "&:hover": { backgroundColor: "#2a2f3e" },
                        py: 3,
                        borderBottom: "2px solid var(--primary)",
                        width: { xs: "80px", sm: "100px" },
                        fontSize: { xs: '0.75rem', sm: '0.85rem' }
                      }}
                    >
                      <div className="flex items-center">
                        Student ID
                        {sortField === "id" && (
                          <span className="ml-1 transition-transform duration-300">
                            {sortDirection === "asc" ? <FaSortAmountUp size={14} /> : <FaSortAmountDown size={14} />}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort("name")}
                      sx={{ 
                        fontWeight: "bold", 
                        backgroundColor: "#1a1f2e",
                        color: "white",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        "&:hover": { backgroundColor: "#2a2f3e" },
                        py: 3,
                        borderBottom: "2px solid var(--primary)",
                        width: { xs: "120px", sm: "auto" },
                        fontSize: { xs: '0.75rem', sm: '0.85rem' }
                      }}
                    >
                      <div className="flex items-center">
                        Name
                        {sortField === "name" && (
                          <span className="ml-1 transition-transform duration-300">
                            {sortDirection === "asc" ? <FaSortAmountUp size={14} /> : <FaSortAmountDown size={14} />}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell 
                      align="center" 
                      onClick={() => handleSort("department")}
                      sx={{ 
                        fontWeight: "bold", 
                        backgroundColor: "#1a1f2e",
                        color: "white",
                        display: { xs: 'none', sm: 'table-cell' },
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        "&:hover": { backgroundColor: "#2a2f3e" },
                        py: 3,
                        borderBottom: "2px solid var(--primary)",
                        width: { xs: "100px", sm: "150px" },
                        fontSize: { xs: '0.75rem', sm: '0.85rem' }
                      }}
                    >
                      <div className="flex items-center justify-center">
                        Department
                        {sortField === "department" && (
                          <span className="ml-1 transition-transform duration-300">
                            {sortDirection === "asc" ? <FaSortAmountUp size={14} /> : <FaSortAmountDown size={14} />}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell 
                      align="center" 
                      onClick={() => handleSort("status")}
                      sx={{ 
                        fontWeight: "bold", 
                        backgroundColor: "#1a1f2e",
                        color: "white",
                        display: { xs: 'none', md: 'table-cell' },
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        "&:hover": { backgroundColor: "#2a2f3e" },
                        py: 3,
                        borderBottom: "2px solid var(--primary)",
                        width: { xs: "100px", sm: "150px" },
                        fontSize: { xs: '0.75rem', sm: '0.85rem' }
                      }}
                    >
                      <div className="flex items-center justify-center">
                        Status
                        {sortField === "status" && (
                          <span className="ml-1 transition-transform duration-300">
                            {sortDirection === "asc" ? <FaSortAmountUp size={14} /> : <FaSortAmountDown size={14} />}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell 
                      align="center" 
                      sx={{ 
                        fontWeight: "bold", 
                        backgroundColor: "#1a1f2e",
                        color: "white",
                        py: 3,
                        borderBottom: "2px solid var(--primary)",
                        width: { xs: "100px", sm: "150px" },
                        fontSize: { xs: '0.75rem', sm: '0.85rem' }
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedUsers.length > 0 ? (
                    sortedUsers
                      .filter((row) => row.student)
                      .map((row, index) => {
                        // Get the status using our helper function
                        const status = getAttendanceStatus(row);
                        
                        return (
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            component={TableRow}
                            key={row._id || row.student._id}
                            hover
                            sx={{ 
                              cursor: "pointer",
                              backgroundColor: "#0d111c",
                              "&:nth-of-type(odd)": {
                                backgroundColor: "#0a0e17"
                              },
                              "&:hover": {
                                backgroundColor: "#151b29",
                                "& .MuiTableCell-root": {
                                  borderLeft: {
                                    xs: "none",
                                    sm: "3px solid var(--primary)"
                                  }
                                }
                              },
                              transition: "all 0.2s ease",
                              borderRadius: "8px",
                              overflow: "hidden"
                            }}
                          >
                            <TableCell 
                              component="th" 
                              scope="row" 
                              sx={{ 
                                color: "white", 
                                py: 2.5, 
                                borderBottom: "1px solid #2a2f3e",
                                borderLeft: {
                                  xs: "none",
                                  sm: "3px solid transparent"
                                },
                                transition: "all 0.2s ease"
                              }}
                            >
                              <div className="font-medium">{row.student.studentID || row.student._id?.substring(0, 8)}</div>
                            </TableCell>
                            <TableCell sx={{ 
                              color: "white", 
                              py: 2.5, 
                              borderBottom: "1px solid #2a2f3e",
                              borderLeft: {
                                xs: "none",
                                sm: "3px solid transparent"
                              },
                              transition: "all 0.2s ease"
                            }}>
                              <div className="font-medium">{row.student.name}</div>
                            </TableCell>
                            <TableCell 
                              align="center" 
                              sx={{ 
                                color: "white",
                                display: { xs: 'none', sm: 'table-cell' },
                                py: 2.5,
                                borderBottom: "1px solid #2a2f3e",
                                borderLeft: {
                                  xs: "none",
                                  sm: "3px solid transparent"
                                },
                                transition: "all 0.2s ease"
                              }}
                            >
                              <span className="bg-[#2a2f3e] text-gray-300 px-3 py-1 rounded-md text-sm">
                                {row.student?.department || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell 
                              align="center" 
                              sx={{ 
                                display: { xs: 'none', md: 'table-cell' },
                                py: 2.5,
                                borderBottom: "1px solid #2a2f3e",
                                borderLeft: {
                                  xs: "none",
                                  sm: "3px solid transparent"
                                },
                                transition: "all 0.2s ease"
                              }}
                            >
                              <span 
                                className={`px-3 py-1 rounded-md text-sm font-medium ${
                                  status === "present" 
                                    ? "bg-green-900/30 text-green-400" 
                                    : status === "absent" 
                                    ? "bg-red-900/30 text-red-400" 
                                    : "bg-gray-800 text-gray-400"
                                }`}
                              >
                                {status === "present" ? "Present" : status === "absent" ? "Absent" : "Not recorded"}
                              </span>
                            </TableCell>
                            <TableCell align="center" sx={{ 
                              py: 2,
                              borderBottom: "1px solid #2a2f3e",
                              borderLeft: {
                                xs: "none",
                                sm: "3px solid transparent"
                              },
                              transition: "all 0.2s ease"
                            }}>
                              <div className="flex gap-2 justify-center">
                                <div className="relative group">
                                  <button
                                      onClick={() => handleAddUserAttendance(row, "present")}
                                      disabled={isLoadingAdding || status === "present"}
                                    className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${
                                      status === "present" ? 
                                      'bg-gray-700/20 text-gray-500 cursor-not-allowed' : 
                                      'bg-green-600 text-white hover:shadow-lg hover:-translate-y-0.5'
                                    }`}
                                    >
                                      <FaUserPlus />
                                  </button>
                                  
                                  {status === "present" && (
                                    <div className="absolute z-50 left-1/2 -translate-x-1/2 -bottom-12 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium 
                                      bg-green-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border border-green-500">
                                      <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-green-600 rotate-45 border-t border-l border-green-500"></div>
                                      Already present
                                    </div>
                                  )}
                                </div>
                                
                                {allowMarkAbsent && (
                                  <div className="relative group">
                                    <button
                                        onClick={() => handleAddUserAttendance(row, "absent")}
                                        disabled={isLoadingAdding || status === "absent"}
                                      className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${
                                        status === "absent" ? 
                                        'bg-gray-700/20 text-gray-500 cursor-not-allowed' : 
                                        'bg-red-600 text-white hover:shadow-lg hover:-translate-y-0.5'
                                      }`}
                                      >
                                        <FaUserTimes />
                                    </button>
                                    
                                    {status === "absent" && (
                                      <div className="absolute z-50 left-1/2 -translate-x-1/2 -bottom-12 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium 
                                        bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border border-red-500">
                                        <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-red-600 rotate-45 border-t border-l border-red-500"></div>
                                        Already marked absent
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 12, color: "gray", backgroundColor: "#0d111c", borderBottom: "1px solid #2a2f3e" }}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col items-center justify-center"
                        >
                          <div className="w-16 h-16 rounded-full bg-[#1a1f2e] flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M9.5 13.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm5 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-10 8a7 7 0 1114 0H4.5z" />
                            </svg>
                          </div>
                          <Typography variant="body1" sx={{ fontWeight: "medium", mb: 1, color: "white", fontSize: "1.1rem" }}>
                            No students found
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7, color: "gray" }}>
                            Try adjusting your search criteria or filters
                          </Typography>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Paper>
        </motion.div>
      </Box>
    </div>
  );
} 