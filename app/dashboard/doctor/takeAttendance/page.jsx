"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { FaUserEdit, FaQrcode, FaUsers, FaClock, FaHourglassHalf, FaStopCircle, FaBookOpen } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCreateSessionMutation,
  useGetQrCodeMutation,
  useEndSessionMutation,
} from "@/app/store/features/sessionApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { setSessionId, clearSessionId } from "@/app/store/slices/sessionSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useError } from "@/app/components/layout/ErrorManager";
import { setSelectedCourseId } from "@/app/store/slices/selectedCourseSlice";
import { FaSync, FaCheckCircle, FaTimesCircle, FaMobileAlt, FaServer, FaWifi, FaExclamationTriangle } from "react-icons/fa";

const Page = () => {
  const selectedCourse = useSelector((state) => state.selectedCourse.course);
  const sessionId = useSelector((state) => state.session.sessionId);
  const [createSession, { isLoading: isCreatingSession }] = useCreateSessionMutation();
  const [getQrCode, { isLoading: isLoadingQrCode }] = useGetQrCodeMutation();
  const [endSession, { isLoading: isEndingSession }] = useEndSessionMutation();
  const [qrCode, setQrCode] = useState("");
  const [changeTime, setChangeTime] = useState({
    changeSpeed: 7,
    timeWorking: 30,
  });
  const [sessionActive, setSessionActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sessionTimer, setSessionTimer] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const { showError } = useError();

  // Create session
  const handleCreateSession = async () => {
    if (!selectedCourse) {
      alert("Please select a course first");
      return;
    }
    
    try {
      const response = await createSession({
        course: selectedCourse?._id,
        changeSpeed: changeTime.changeSpeed,
        timeWorking: changeTime.timeWorking,
      }).unwrap();
      
        dispatch(setSessionId(response.sessionId));
          setQrCode(response.qrCode);
        setSessionActive(true);
        setCountdown(changeTime.changeSpeed);
        
      // Add timer to automatically end the session after the specified time
        const timer = setTimeout(() => {
          handleEndSession();
      }, changeTime.timeWorking * 60 * 1000); // Convert minutes to milliseconds
        
        setSessionTimer(timer);
    } catch (err) {
      console.error("Failed to create session:", err);
      alert("Failed to create session. Please try again.");
    }
  };
  
  // End session
  const handleEndSession = async () => {
    if (!sessionId) return;
    
    try {
      console.log("Attempting to end session with ID:", sessionId);
      const response = await endSession(sessionId).unwrap();
      
      // Check if the response contains an error
      if (response && response.error) {
        console.log("Response with error:", response);
        // Can handle the error here if needed
      } else {
        console.log("Session ended successfully");
      }
    } catch (err) {
      console.error("Failed to end session:", err);
      // We don't show an alert to the user
    } finally {
      // Regardless of success or failure, update the UI
      setSessionActive(false);
      setQrCode("");
      dispatch(clearSessionId());
      
      // Cancel the timer if it exists
      if (sessionTimer) {
        clearTimeout(sessionTimer);
        setSessionTimer(null);
      }
    }
  };
  
  // Fetch QR code
  const fetchQrCode = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      console.log("Fetching QR code for session:", sessionId);
      const response = await getQrCode(sessionId).unwrap();
      console.log("QR code response:", response);
      
      if (response && response.qrCode) {
        console.log("QR code received, length:", response.qrCode.length);
        setQrCode(response.qrCode);
            setCountdown(changeTime.changeSpeed);
      } else {
        console.error("No QR code in response:", response);
      }
    } catch (err) {
      console.error("Failed to get QR code", err);
    }
  }, [getQrCode, sessionId, changeTime.changeSpeed]);

  // Countdown timer
  useEffect(() => {
    if (!sessionActive || countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [sessionActive, countdown]);

  // QR code refresh interval
  useEffect(() => {
    if (!sessionId || !sessionActive) return;
    
    // Fetch QR code immediately when session is activated
    fetchQrCode();
    
    const interval = setInterval(fetchQrCode, changeTime.changeSpeed * 1000);
    return () => clearInterval(interval);
  }, [fetchQrCode, changeTime.changeSpeed, sessionId, sessionActive]);
  
  // Clean up resources when leaving the page
  useEffect(() => {
    // Execute when component loads
    if (sessionId) {
      setSessionActive(true);
      fetchQrCode();
    }
    
    // Clean up when component unmounts
    return () => {
      if (sessionActive && sessionId) {
        // Try to end the session when leaving the page
        try {
          // Use an alternative method to end the session without waiting for the response
        endSession(sessionId)
          .then(() => {
            console.log("Session ended successfully on page leave");
          })
          .catch((err) => {
            console.error("Failed to end session on page leave:", err);
          });
        } catch (error) {
          console.error("Error during session cleanup:", error);
        }
        
        // Update local state anyway
        dispatch(clearSessionId());
      }
      
      // Cancel the timer if it exists
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
  }, []);

  // Handle input change
  const handleInputsChange = (e) => {
    const { name, value } = e.target;
    setChangeTime((prev) => ({ ...prev, [name]: Number(value) }));
  };

  // If no course is selected, show a message and redirect option
  if (!selectedCourse) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[400px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-[var(--secondary)] rounded-xl p-6 sm:p-8 shadow-md max-w-md w-full text-center mx-4 sm:mx-auto">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[var(--primary-light)]/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FaBookOpen className="text-[var(--primary)] text-xl sm:text-2xl" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-2 sm:mb-3">No Course Selected</h2>
          <p className="text-[var(--foreground-secondary)] text-sm sm:text-base mb-4 sm:mb-6">Please select a course before generating a QR code for attendance</p>
          <motion.button
            onClick={() => router.push('/dashboard/doctor/subjects')}
            className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg w-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaBookOpen className="text-base sm:text-lg" />
            <span className="text-sm sm:text-base">Select Course</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-1 sm:mb-2">Take Attendance</h1>
        <p className="text-sm sm:text-base text-[var(--foreground-secondary)]">Generate QR codes for student attendance</p>
      </motion.div>
      
      {/* Selected course information */}
      {selectedCourse && (
        <motion.div 
          className="bg-[var(--secondary)] rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-[var(--primary)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 sm:gap-0">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-1 sm:mb-2">{selectedCourse.courseName}</h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="bg-[var(--background-secondary)] text-[var(--foreground-secondary)] text-xs sm:text-sm px-2 py-0.5 sm:py-1 rounded-full">
                  {selectedCourse.department}
                </span>
                <span className="text-[var(--foreground-secondary)] text-xs sm:text-sm">
                  Level {selectedCourse.level}
                </span>
                <span className="text-[var(--foreground-secondary)] text-xs sm:text-sm">
                  Semester {selectedCourse.semester || "1"}
                </span>
              </div>
            </div>
            
            {sessionActive && (
              <div className="bg-green-900/30 text-green-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center self-start">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1.5 sm:mr-2 animate-pulse"></span>
                Session Active
              </div>
            )}
          </div>
          <div className="mt-3 sm:mt-4 text-right">
            <motion.button
              onClick={() => router.push('/dashboard/doctor/subjects')}
              className="text-[var(--primary)] hover:text-[var(--primary-light)] text-xs sm:text-sm flex items-center gap-1 ml-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBookOpen className="text-xs" />
              <span>Change Course</span>
            </motion.button>
          </div>
        </motion.div>
      )}
      
      {/* Action buttons and QR code generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column - Action buttons */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="bg-[var(--secondary)] rounded-xl p-4 sm:p-5 shadow-md">
            <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 text-[var(--foreground)]">Actions</h3>
            
            <div className="space-y-3">
              <Link href="/dashboard/doctor/manualAttendance">
                <motion.button 
                  className="w-full bg-[var(--background-secondary)] hover:bg-[var(--neutral-light)] text-[var(--foreground)] p-2.5 sm:p-3 rounded-lg flex items-center gap-2 sm:gap-3 transition-colors text-sm sm:text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaUserEdit className="text-[var(--primary)] text-sm sm:text-base flex-shrink-0" />
                  <span className="truncate">Manual Attendance</span>
                </motion.button>
              </Link>
              
              <Link href="/dashboard/doctor/students">
                <motion.button 
                  className="w-full bg-[var(--background-secondary)] hover:bg-[var(--neutral-light)] text-[var(--foreground)] p-2.5 sm:p-3 rounded-lg flex items-center gap-2 sm:gap-3 transition-colors text-sm sm:text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaUsers className="text-[var(--primary)] text-sm sm:text-base flex-shrink-0" />
                  <span className="truncate">Show Students</span>
                </motion.button>
              </Link>
              
              {!sessionActive ? (
                <motion.button
                  className="w-full p-2.5 sm:p-3 rounded-lg flex items-center gap-2 sm:gap-3 transition-colors bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm sm:text-base"
                  onClick={handleCreateSession}
                  disabled={isCreatingSession}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaQrcode className="text-sm sm:text-base flex-shrink-0" />
                  <span className="truncate">
                    {isCreatingSession 
                      ? "Generating..." 
                      : "Generate QR Code"
                    }
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  className="w-full p-2.5 sm:p-3 rounded-lg flex items-center gap-2 sm:gap-3 transition-colors bg-red-600/70 hover:bg-red-700 text-white text-sm sm:text-base"
                  onClick={handleEndSession}
                  disabled={isEndingSession}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaStopCircle className="text-sm sm:text-base flex-shrink-0" />
                  <span className="truncate">
                    {isEndingSession 
                      ? "Ending..." 
                      : "End Session"
                    }
                  </span>
                </motion.button>
              )}
            </div>
          </div>
          
          <div className="bg-[var(--secondary)] rounded-xl p-4 sm:p-5 shadow-md">
            <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 text-[var(--foreground)]">QR Code Settings</h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="flex items-center text-[var(--foreground-secondary)] mb-1.5 sm:mb-2 text-xs sm:text-sm">
                  <FaClock className="mr-2 text-[var(--primary)] text-xs sm:text-sm" />
                  Update Interval (seconds)
                </label>
                <input
                  type="number"
                  name="changeSpeed"
                  value={changeTime.changeSpeed}
                  onChange={handleInputsChange}
                  min="5"
                  max="60"
                  className="w-full bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="flex items-center text-[var(--foreground-secondary)] mb-1.5 sm:mb-2 text-xs sm:text-sm">
                  <FaHourglassHalf className="mr-2 text-[var(--primary)] text-xs sm:text-sm" />
                  Session Duration (minutes)
                </label>
                <input
                  type="number"
                  name="timeWorking"
                  value={changeTime.timeWorking}
                  onChange={handleInputsChange}
                  min="5"
                  max="120"
                  className="w-full bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-lg p-2 text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Mobile session controls - only visible on small screens */}
          {sessionActive && (
            <div className="lg:hidden bg-[var(--secondary)] rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  <span className="text-sm text-green-400">Active Session</span>
                </div>
                <span className="text-xs text-[var(--foreground-secondary)]">{countdown}s</span>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Right column - QR Code display */}
        <motion.div 
          className="lg:col-span-2 bg-[var(--secondary)] rounded-xl p-4 sm:p-5 shadow-md flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-4 text-[var(--foreground)]">QR Code</h3>
          <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mb-4 sm:mb-6 text-center max-w-xs">Students can scan this code to mark their attendance</p>
          
          {sessionActive ? (
            qrCode ? (
              <div className="flex flex-col items-center">
                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg mb-3 sm:mb-4">
                  <img 
                    src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                    alt="QR Code" 
                    width={250}
                    height={250}
                    className="rounded-md w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[250px] md:h-[250px]"
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <p className="text-[var(--foreground-secondary)] text-xs sm:text-sm">Code refreshes in <span className="font-medium text-[var(--primary)]">{countdown}s</span></p>
                  <button 
                    onClick={fetchQrCode} 
                    className="text-[var(--primary)] hover:bg-[var(--primary-light)]/10 text-xs sm:text-sm py-1 px-2 sm:px-3 rounded-md transition-colors"
                  >
                    Refresh QR Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-80 md:h-80 bg-white p-4 sm:p-6 rounded-lg shadow-xl flex items-center justify-center border-2 border-gray-100">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="rounded-full bg-slate-200 h-20 w-20 sm:h-28 sm:w-28 md:h-40 md:w-40 mb-3 sm:mb-4"></div>
                    <div className="h-2 sm:h-2.5 md:h-3 bg-slate-200 rounded w-16 sm:w-24 md:w-32 mb-2"></div>
                    <div className="h-2 sm:h-2.5 md:h-3 bg-slate-200 rounded w-24 sm:w-32 md:w-40"></div>
                  </div>
                </div>
                <p className="text-[var(--foreground-secondary)] text-xs sm:text-sm mt-3 sm:mt-4">Loading QR code...</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-80 md:h-80 bg-white/90 rounded-lg flex items-center justify-center mb-3 sm:mb-4 border-2 border-dashed border-gray-200">
                <FaQrcode className="text-gray-300 text-3xl sm:text-5xl md:text-7xl" />
              </div>
              <p className="text-[var(--foreground-secondary)] text-sm">No Active Session</p>
              <p className="text-[var(--foreground-secondary)] text-xs sm:text-sm mt-1 sm:mt-2 px-4">Generate a QR code to start a new attendance session<br className="hidden sm:inline" /> for your students</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
