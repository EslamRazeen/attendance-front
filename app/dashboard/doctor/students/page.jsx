"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
// import { useGetAllAttendancesQuery } from "@/app/store/features/attendanceApiSlice"; // Old hook - Updated path
import { useGetStudentsByDateQuery } from "@/app/store/features/attendanceApiSlice"; // New hook for students - Updated path
import { useGetCourseSessionsQuery } from "@/app/store/features/sessionApiSlice"; // Hook for sessions - Updated path
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaUserGraduate,
  FaBookOpen,
  FaCalendarAlt,
  FaDownload,
} from "react-icons/fa";

// Helper function to format date to DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const Page = () => {
  const router = useRouter();
  const selectedCourse = useSelector((state) => state.selectedCourse.course);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, department, attendance
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [selectedDate, setSelectedDate] = useState(null); // New state for selected date
  const [formattedSessionDates, setFormattedSessionDates] = useState([]); // New state for formatted dates

  // Handle date selection
  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date === "" ? null : date); // Set to null if "All Dates" is selected
  };

  // Fetch sessions for the selected course
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = useGetCourseSessionsQuery(selectedCourse?._id || "", {
    skip: !selectedCourse?._id,
  });

  // Fetch student data based on selected date or all students
  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    error: studentsError,
    refetch: refetchStudents,
  } = useGetStudentsByDateQuery(
    { courseId: selectedCourse?._id || "", date: selectedDate ? formatDate(selectedDate) : null },
    {
      skip: !selectedCourse?._id, // Skip if courseId is not available
    }
  );

  // Combine loading and error states and define attendanceData immediately after hooks
  const isLoading = isLoadingSessions || isLoadingStudents;
  const error = sessionsError || studentsError;
  const attendanceData = studentsData; // Use studentsData from the new hook

  // Effect to process session data and format unique dates on the client
  useEffect(() => {
    if (sessionsData && Array.isArray(sessionsData)) {
      const uniqueDates = Array.from(new Set(sessionsData.map(session => new Date(session.createdAt).toDateString()))); // Get unique dates as strings
      
      const dates = uniqueDates
        .map(dateString => ({ // Map unique date strings to objects
            date: new Date(dateString), // Create Date object for sorting
            originalDate: new Date(dateString).toISOString(), // Store original date as ISO string for consistent value
            formattedDate: formatDate(dateString) // Format for display
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime()) // Sort by timestamp descending (latest first)
        .slice(0, 10); // Take latest 10 unique dates
        
      setFormattedSessionDates(dates);
    } else {
      setFormattedSessionDates([]);
    }
  }, [sessionsData]); // Rerun when sessionsData changes

  // تحويل البيانات للعرض وتطبيق البحث والتصفية والترتيب
  const getFilteredAndSortedStudents = () => {
    // Use attendanceData (which is studentsData) from the new hook
    if (!attendanceData || !Array.isArray(attendanceData)) return [];

    let filteredStudents = [...attendanceData];

    // The structure of items in filteredStudents is now the student object itself
    // if a date is selected, or the { student, studentAttendanc } object if no date

    // تطبيق البحث
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredStudents = filteredStudents.filter(
        (item) => {
            const student = selectedDate ? item : item.student; // Get the actual student object
            // Ensure student and its properties exist before accessing
            return student && (student.name?.toLowerCase().includes(term) || student.email?.toLowerCase().includes(term));
        }
      );
    }

    // تطبيق التصفية حسب القسم
    if (filterDepartment) {
      filteredStudents = filteredStudents.filter(
        (item) => {
            const student = selectedDate ? item : item.student; // Get the actual student object
             // Ensure student and department exist before accessing
            return student && student.department === filterDepartment;
        }
      );
    }

    // تطبيق الترتيب
    filteredStudents.sort((a, b) => {
      let valueA, valueB;

      // Adjust sorting based on whether a date is selected and access properties safely
      const studentA = selectedDate ? a : a?.student;
      const studentB = selectedDate ? b : b?.student;

      // Ensure student objects exist before accessing properties
      if (!studentA || !studentB) return 0;

      switch (sortBy) {
        case "name":
          valueA = studentA.name?.toLowerCase() || '';
          valueB = studentB.name?.toLowerCase() || '';
          break;
        case "department":
          valueA = studentA.department?.toLowerCase() || '';
          valueB = studentB.department?.toLowerCase() || '';
          break;
        case "attendance":
          // Only sort by attendance if no date is selected
          if (selectedDate) return 0;
          // Access studentAttendanc safely
          valueA = a?.studentAttendanc || 0;
          valueB = b?.studentAttendanc || 0;
          break;
        default:
          valueA = studentA.name?.toLowerCase() || '';
          valueB = studentB.name?.toLowerCase() || '';
      }

      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filteredStudents;
  };

  // استخراج قائمة الأقسام المتاحة للتصفية
  const getDepartments = () => {
    // Use attendanceData (which is studentsData) from the new hook for departments
    if (!attendanceData || !Array.isArray(attendanceData)) return [];
    const departments = new Set();
    attendanceData.forEach((item) => {
      const student = selectedDate ? item : item.student; // Get the actual student object
       // Ensure student exists before accessing department
      if (student?.department) {
        departments.add(student.department);
      }
    });
    return Array.from(departments);
  };

  // تبديل ترتيب العرض
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // تغيير معيار الترتيب
  const changeSortBy = (criteria) => {
    if (sortBy === criteria) {
      toggleSortOrder();
    } else {
      setSortBy(criteria);
      setSortOrder("asc");
    }
  };

  // Export data to Excel
  const handleExportToExcel = () => {
    if (filteredStudents.length === 0) {
      alert("No data to export!");
      return;
    }

    // Format data for export based on whether date is selected or not
    const exportData = filteredStudents.map(item => {
      const student = selectedDate ? item : item.student;
      const attendanceInfo = selectedDate ? "Present" : item.studentAttendanc;
      
      return {
        'Student ID': student?.studentID || (student?._id ? student._id.substring(0, 8) : ''),
        'Name': student?.name || '',
        'Email': student?.email || '',
        'Department': student?.department || '',
        'Level': student?.level || '',
        'Course': selectedCourse?.courseName || '',
        [selectedDate ? 'Status' : 'Attendance']: attendanceInfo
      };
    });

    // Convert JSON to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    // Write the file and trigger download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save the file with formatted date if date is selected
    const fileName = selectedDate 
      ? `${selectedCourse.courseName}_Students_${formatDate(selectedDate)}.xlsx`
      : `${selectedCourse.courseName}_Students.xlsx`;
    
    saveAs(data, fileName);
  };

  // إذا لم يتم اختيار مقرر، عرض رسالة
  if (!selectedCourse) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[400px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-[var(--secondary)] rounded-xl p-8 shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[var(--primary-light)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBookOpen className="text-[var(--primary)] text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">
            No Course Selected
          </h2>
          <p className="text-[var(--foreground-secondary)] mb-6">
            Please select a course to view student data
          </p>
          <motion.button
            onClick={() => router.push("/dashboard/doctor/subjects?from=students")}
            className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white py-3 px-6 rounded-lg w-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaBookOpen className="text-lg" />
            <span>Select Course</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-700 border-t-[var(--primary)] rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-gray-400">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[400px] flex justify-center items-center"
      >
        <div className="bg-red-900/20 text-red-400 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-medium mb-2">Error Loading Student Data</h2>
          <p>{error.message || "Failed to load student data. Please try again."}</p>
          <button
            onClick={refetchStudents}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  const filteredStudents = getFilteredAndSortedStudents();
  const departments = getDepartments();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Students List
        </h1>
        <p className="text-[var(--foreground-secondary)]">
          View and manage students enrolled in {selectedCourse.courseName} course
        </p>
      </motion.div>

      {/* معلومات المقرر */}
      <motion.div
        className="bg-[var(--secondary)] rounded-xl p-6 shadow-md border-l-4 border-[var(--primary)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              {selectedCourse.courseName}
            </h2>
            <div className="flex items-center gap-3">
              <span className="bg-[var(--background-secondary)] text-[var(--foreground-secondary)] text-sm px-2 py-1 rounded-full">
                {selectedCourse.department}
              </span>
              <span className="text-[var(--foreground-secondary)] text-sm">
                Level {selectedCourse.level}
              </span>
              <span className="text-[var(--foreground-secondary)] text-sm">
                Semester {selectedCourse.semester || "1"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
          <div className="bg-[var(--background-secondary)] px-3 py-1 rounded-full text-sm flex items-center">
            <FaUserGraduate className="mr-2 text-[var(--primary)]" />
            <span>{filteredStudents.length} Students</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* أدوات البحث والتصفية */}
      <motion.div
        className="bg-[var(--secondary)] rounded-xl p-4 sm:p-5 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex flex-wrap items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-[var(--foreground-secondary)]">
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
          </h3>
          <button
            onClick={handleExportToExcel}
            className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors"
            disabled={filteredStudents.length === 0}
          >
            <FaDownload className="text-xs" />
            <span>Export to Excel</span>
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          {/* البحث */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-[var(--foreground-secondary)] text-sm" />
            </div>
            <input
              type="text"
              className="w-full py-2 pl-10 pr-4 text-sm bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* تصفية حسب القسم */}
          <div className="md:w-1/4 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaFilter className="text-[var(--foreground-secondary)] text-sm" />
            </div>
            <select
              className="w-full py-2 pl-10 pr-4 text-sm bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent appearance-none"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* تصفية حسب التاريخ */}
          {formattedSessionDates.length > 0 && (
            <div className="relative md:w-1/4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaCalendarAlt className="text-[var(--foreground-secondary)] text-sm" />
              </div>
              <select
                value={selectedDate || ""} // Use empty string for "All Dates" option
                onChange={handleDateChange}
                className="w-full pl-10 pr-4 py-2 rounded-md bg-[var(--background-secondary)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm appearance-none"
              >
                <option value="">All Dates</option>
                {formattedSessionDates.map(session => (
                    <option key={session.originalDate} value={session.originalDate}>
                      {session.formattedDate}
                    </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--foreground-secondary)]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          )}

          {/* ترتيب */}
          <div className="md:w-1/4 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSort className="text-[var(--foreground-secondary)] text-sm" />
            </div>
            <select
              className="w-full py-2 pl-10 pr-4 text-sm bg-[var(--background-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent appearance-none"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split("-");
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="department-asc">Department (A-Z)</option>
              <option value="department-desc">Department (Z-A)</option>
              <option value="attendance-desc">Attendance (Highest First)</option>
              <option value="attendance-asc">Attendance (Lowest First)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* جدول الطلاب */}
      <motion.div
        className="bg-[var(--secondary)] rounded-xl shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[var(--primary)] scrollbar-track-transparent">
            <table className="min-w-full divide-y divide-[var(--border-color)]">
              <thead className="bg-[var(--background-secondary)]">
                <tr>
                  <th
                    scope="col"
                    className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider cursor-pointer"
                    onClick={() => changeSortBy("name")}
                  >
                    <div className="flex items-center">
                      <span>Name</span>
                      {sortBy === "name" && (
                        <span className="ml-1 sm:ml-2">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  {/* Hide Email column when filtering by date */}
                  {!selectedDate && (
                    <th
                      scope="col"
                      className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider hidden md:table-cell"
                    >
                      Email
                    </th>
                  )}
                  <th
                    scope="col"
                    className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider cursor-pointer hidden sm:table-cell"
                    onClick={() => changeSortBy("department")}
                  >
                    <div className="flex items-center">
                      <span>Dept</span>
                      {sortBy === "department" && (
                        <span className="ml-1 sm:ml-2">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                   <th
                    scope="col"
                    className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider hidden sm:table-cell"
                  >
                    Level
                  </th>
                   <th
                    scope="col"
                    className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider"
                  >
                    Course
                  </th>
                  <th
                    scope="col"
                    className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider cursor-pointer"
                     onClick={() => !selectedDate && changeSortBy("attendance")} // Only allow sorting by attendance if no date is selected
                  >
                    <div className="flex items-center">
                      <span>{selectedDate ? "Status" : "Att."}</span>
                       {sortBy === "attendance" && !selectedDate && (
                        <span className="ml-1 sm:ml-2">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--secondary)] divide-y divide-[var(--border-color)]">
                {filteredStudents.map((item) => {
                   // Consistently get the student object
                   const student = selectedDate ? item : item.student;

                   // Determine attendance info based on whether a date is selected
                   // For date filtered, assume presence if in the list
                   const attendanceInfo = selectedDate ? "Present" : item.studentAttendanc;

                   return (
                     <motion.tr
                       key={student?._id} // Use student._id for consistent key
                       className="hover:bg-[var(--background-secondary)] transition-colors"
                       initial={{ opacity: 0, y: 5 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.3 }}
                     >
                       <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-[var(--foreground)]">
                         <div className="flex flex-col sm:hidden">
                           <span>{student?.name}</span>
                           <span className="text-xs text-[var(--foreground-secondary)] mt-0.5">{student?.department}</span>
                         </div>
                         <span className="hidden sm:block">{student?.name}</span>
                       </td>
                        {/* Hide Email cell when filtering by date */}
                       {!selectedDate && (
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-[var(--foreground-secondary)] hidden md:table-cell">
                            {student?.email}
                          </td>
                       )}
                       <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-[var(--foreground-secondary)] hidden sm:table-cell">
                         <span className="px-1.5 sm:px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--background-secondary)] text-[var(--foreground)]">
                           {student?.department}
                         </span>
                       </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-[var(--foreground-secondary)] hidden sm:table-cell">
                          {student?.level}
                        </td>
                         <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-[var(--foreground-secondary)]">
                          {selectedCourse?.courseName}
                        </td>
                       <td className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm ${selectedDate ? (attendanceInfo === 'Present' ? 'text-green-500' : 'text-red-500') : 'text-[var(--foreground)]'}`}>
                         {attendanceInfo}
                       </td>
                     </motion.tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 sm:py-10 text-center text-xs sm:text-sm text-[var(--foreground-secondary)]">
            No student data available
          </div>
        )}
      </motion.div>

      {/* Mobile Pagination - Show for small screens only */}
      {filteredStudents.length > 10 && (
        <div className="mt-4 sm:mt-6 lg:hidden flex justify-center">
          <div className="inline-flex rounded-md shadow-sm">
            <button className="px-3 py-1 border border-[var(--border-color)] rounded-l-md text-xs text-[var(--foreground-secondary)] bg-[var(--secondary)] hover:bg-[var(--background-secondary)]">
              Previous
            </button>
            <button className="px-3 py-1 border-t border-b border-r border-[var(--border-color)] text-xs text-white bg-[var(--primary)]">
              1
            </button>
            <button className="px-3 py-1 border-t border-b border-r border-[var(--border-color)] text-xs text-[var(--foreground-secondary)] bg-[var(--secondary)] hover:bg-[var(--background-secondary)]">
              2
            </button>
            <button className="px-3 py-1 border-t border-b border-r border-[var(--border-color)] rounded-r-md text-xs text-[var(--foreground-secondary)] bg-[var(--secondary)] hover:bg-[var(--background-secondary)]">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page; 