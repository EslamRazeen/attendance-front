"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { MdOutlineDashboard, MdPeopleAlt, MdSubject } from "react-icons/md";
import { FaFolder, FaClipboardList, FaBars, FaTimes, FaArrowUp, FaChartBar, FaUserCircle, FaSignOutAlt, FaBookReader, FaUsers, FaFileAlt, FaHome, FaCog, FaChevronLeft, FaChevronRight, FaUserShield, FaChalkboardTeacher, FaUserGraduate, FaFileMedicalAlt, FaTasks, FaQrcode, FaCommentDots } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";
import { FaMessage } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";
import { BsClipboard2Check } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { setInstructorRole } from "@/app/store/slices/userRole";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { hydrate } from "@/app/store/slices/selectedCourseSlice";

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const router = useRouter();
  const pathname = usePathname();
  const userRole = useSelector((state) => state.userRole.isAdmin);
  const selectedCourse = useSelector((state) => state.selectedCourse?.course);
  const dispatch = useDispatch();
  const [activeLink, setActiveLink] = useState("");
  
  // Define sidebar items first so we can use them in the effect
  const sidebarItems = userRole ? [
    { icon: <MdOutlineDashboard />, label: "Dashboard", href: "/dashboard/admin/home" },
    { icon: <MdPeopleAlt />, label: "Instructors", href: "/dashboard/admin" },
    { icon: <FaFolder />, label: "Documents", href: "/dashboard/admin/document" },
    { icon: <FaUserGraduate />, label: "Edit Students", href: "/dashboard/admin/document/studentsEdit" },
    { icon: <FaArrowUp />, label: "My Grade", href: "/dashboard/admin/myGrade" },
    { icon: <FaMessage />, label: "Messages", href: "#" },
  ] : [
    { icon: <MdOutlineDashboard />, label: "Dashboard", href: "/dashboard" },
    { icon: <MdSubject />, label: "Subjects", href: "/dashboard/doctor/subjects" },
    { icon: <SlCalender />, label: "Take Attendance", href: "/dashboard/doctor/takeAttendance" },
    { icon: <BsClipboard2Check />, label: "Manual Attendance", href: "/dashboard/doctor/manualAttendance" },
    { icon: <MdPeopleAlt />, label: "Students", href: "/dashboard/doctor/students" },
    { icon: <MdPeopleAlt />, label: "Apology for attendance", href: "/dashboard/doctor/apology" },
    { icon: <FaMessage />, label: "Messages", href: "/dashboard/doctor/messages" },
  ];
  
  // Set active link based on current path
  useEffect(() => {
    // Check exact matches first
    const exactMatch = sidebarItems.find(item => pathname === item.href);
    if (exactMatch) {
      setActiveLink(exactMatch.label);
      return;
    }
    
    // Then check path includes for nested routes
    for (const item of sidebarItems) {
      // Skip items with # as href
      if (item.href === "#") continue;
      
      // Check if pathname includes the item's href and the href is not just "/"
      // to avoid matching everything with the dashboard root
      if (pathname.includes(item.href) && item.href !== "/dashboard") {
        setActiveLink(item.label);
        return;
      }
    }
    
    // Special case for dashboard root path
    if (pathname === "/dashboard" || pathname === "/dashboard/doctor") {
      setActiveLink("Dashboard");
    }
  }, [pathname, sidebarItems]);

  // handle logout 
  const handleLogout = () => {
    // مسح جميع بيانات المستخدم من التخزين المحلي
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isInstructor");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("selectedCourse");
    
    // توجيه المستخدم إلى صفحة تسجيل الدخول
    router.push("/auth/login");
  }

  // إغلاق السايدبار عند اختيار عنصر في وضع الموبايل
  const handleLinkClick = (label) => {
    setActiveLink(label);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Animation variants
  const sidebarVariants = {
    open: { 
      x: 0,
      boxShadow: "10px 0px 50px rgba(0,0,0,0.2)"
    },
    closed: { 
      x: "-100%" 
    }
  };

  const overlayVariants = {
    open: { opacity: 0.5 },
    closed: { opacity: 0 }
  };

  // Hydrate selected course from localStorage on component mount
  useEffect(() => {
    dispatch(hydrate());
  }, [dispatch]);

  return (
    <>
      {/* Dark overlay for mobile */}
      {isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              className="fixed inset-0 bg-black z-20 lg:hidden"
              style={{ display: isOpen ? "block" : "none" }}
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>
      )}

      {/* Sidebar */}
      <motion.div 
        className={`sidebar fixed top-0 left-0 h-screen bg-[var(--secondary-dark)] pt-20 shadow-lg z-30
          ${isMobile ? 'w-[280px]' : 'w-64'}`}
        initial={isMobile ? "closed" : "open"}
        animate={isMobile ? (isOpen ? "open" : "closed") : "open"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Close button - only show on mobile */}
        {isMobile && (
          <button 
            className="absolute top-4 right-4 text-[var(--foreground)] hover:text-red-500 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <FaTimes size={20} />
          </button>
        )}

        <div className="flex flex-col h-full p-4 overflow-y-auto custom-scrollbar">
          <div className="flex-1 flex flex-col gap-2">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => handleLinkClick(item.label)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
                  ${activeLink === item.label 
                    ? "bg-[var(--primary)] text-white" 
                    : "text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"}`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xl"
                >
                  {item.icon}
                </motion.div>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 mt-4 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <IoLogOut className="text-xl" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
