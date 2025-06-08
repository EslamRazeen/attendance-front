"use client";
import { useGetCoursesQuery } from "@/app/store/features/coursesApiSlice";
import { setSelectedCourse } from "@/app/store/slices/selectedCourseSlice";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaFilter, FaChalkboardTeacher, FaBookOpen } from "react-icons/fa";

const DoctorSubjects = () => {
  const router = useRouter();
  const { data, error, isLoading } = useGetCoursesQuery();
  const allCourses = data?.data || [];
  const selectedCourse = useSelector((state) => state.selectedCourse.course);
  const instructorCourses = useSelector((state) => state.userRole.instructorCourses);
  const dispatch = useDispatch();

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const levels = ["1", "2", "3", "4"];
  const departments = ["CS", "IS", "AI", "BIO"];
  const semesters = ["1", "2"];

  // تحويل الفصول الدراسية إلى الفئة المناسبة (1 أو 2)
  const getSemesterCategory = (semesterNumber) => {
    // تحويل الرقم إلى عدد صحيح للتأكد
    const semNum = parseInt(semesterNumber, 10);
    // إذا كان الرقم فردياً (1,3,5,7) فسيكون الناتج 1، وإذا كان زوجياً (2,4,6,8) فسيكون الناتج 0
    return semNum % 2 === 1 ? "1" : "2";
  };

  // فلترة المواد الدراسية للمدرس الحالي
  const instructorCoursesIds = useMemo(() => {
    return instructorCourses.map(course => course._id);
  }, [instructorCourses]);

  // الحصول على المواد الدراسية الخاصة بالمدرس فقط
  const FetchedCourses = useMemo(() => {
    console.log("Instructor courses from Redux:", instructorCourses);
    console.log("All courses from API:", allCourses);
    
    if (instructorCoursesIds.length === 0) {
      console.log("No instructor courses found in Redux, using all courses");
      // إذا لم تكن هناك مواد محفوظة للمدرس، استخدم جميع المواد (للتوافق مع النظام القديم)
      return allCourses;
    }
    
    // فلترة المواد حسب معرفات المواد المخزنة للمدرس
    const filteredCourses = allCourses.filter(course => instructorCoursesIds.includes(course._id));
    console.log("Filtered courses for instructor:", filteredCourses);
    return filteredCourses;
  }, [allCourses, instructorCoursesIds, instructorCourses]);

  // Memoized filtered courses
  const filteredCourses = useMemo(() => {
    return FetchedCourses.filter(
      (course) =>
        (!selectedDepartment || course.department === selectedDepartment) &&
        (!selectedLevel || course.level === selectedLevel) &&
        (!selectedSemester || getSemesterCategory(course.semester) === selectedSemester)
    );
  }, [FetchedCourses, selectedDepartment, selectedLevel, selectedSemester]);

  // handle select course
  const handleCourseSelect = (course) => {
    dispatch(setSelectedCourse(course));
    
    // Check if we're coming from the students page using URL query parameter
    const searchParams = new URLSearchParams(window.location.search);
    const fromPage = searchParams.get('from');
    
    // Redirect to the appropriate page based on where the user came from
    if (fromPage === 'students') {
      router.push("/dashboard/doctor/students");
    } else {
    router.push("/dashboard/doctor/takeAttendance");
    }
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex justify-center items-center">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-700 border-t-[#7950f2] rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-gray-400">Loading</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="min-h-[400px] flex justify-center items-center"
      >
        <div className="bg-red-900/20 text-red-400 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-medium mb-2">Error Loading Courses</h2>
          <p>{error.message || "Failed to load courses. Please try again later."}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <motion.h1 
          className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-1 sm:mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Your Assigned Courses
        </motion.h1>
        <motion.p 
          className="text-sm text-[var(--foreground-secondary)]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Select a course to manage attendance
        </motion.p>
      </div>
      
      <motion.div 
        className="mb-6 sm:mb-8 bg-[#232738] rounded-xl p-4 sm:p-5 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center mb-3 sm:mb-4 text-white">
          <FaFilter className="mr-2 text-sm sm:text-base" />
          <h2 className="text-base sm:text-lg font-medium">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Levels */}
          <div>
            <h3 className="text-xs sm:text-sm text-white mb-1.5 sm:mb-2">Level</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {levels.map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedLevel(level === selectedLevel ? "" : level)}
                  className={`py-1 sm:py-1.5 md:py-2 px-2 sm:px-2.5 md:px-3 rounded-md text-xs sm:text-sm transition-colors ${
                    selectedLevel === level 
                      ? "bg-[#7950f2] text-white" 
                      : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  Level {level}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Departments */}
          <div>
            <h3 className="text-xs sm:text-sm text-white mb-1.5 sm:mb-2">Department</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {departments.map((dept) => (
                <motion.button
                  key={dept}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDepartment(dept === selectedDepartment ? "" : dept)}
                  className={`py-1 sm:py-1.5 md:py-2 px-2 sm:px-2.5 md:px-3 rounded-md text-xs sm:text-sm transition-colors ${
                    selectedDepartment === dept 
                      ? "bg-[#7950f2] text-white" 
                      : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {dept}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Semesters */}
          <div>
            <h3 className="text-xs sm:text-sm text-white mb-1.5 sm:mb-2">Semester</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {semesters.map((sem) => (
                <motion.button
                  key={sem}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSemester(sem === selectedSemester ? "" : sem)}
                  className={`py-1 sm:py-1.5 md:py-2 px-2 sm:px-2.5 md:px-3 rounded-md text-xs sm:text-sm transition-colors ${
                    selectedSemester === sem 
                      ? "bg-[#7950f2] text-white" 
                      : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  Semester {sem}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-medium text-[var(--foreground)]">Available Courses</h2>
          
          {(selectedDepartment || selectedLevel || selectedSemester) && (
            <button 
              onClick={() => {
                setSelectedDepartment("");
                setSelectedLevel("");
                setSelectedSemester("");
              }}
              className="text-xs sm:text-sm text-[#7950f2] hover:text-[#9775fa] flex items-center gap-1"
            >
              <span>Clear filters</span>
            </button>
          )}
        </div>
        
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * (index % 9) }}
                whileHover={{ translateY: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <button
                  className="bg-[#232738] w-full h-full rounded-xl p-3 sm:p-4 md:p-5 text-left transition-all border-2 border-transparent hover:border-[#7950f2]/50 flex flex-col"
                  onClick={() => handleCourseSelect(course)}
                >
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-[#7950f2]/20 rounded-lg flex items-center justify-center">
                      <FaBookOpen className="text-[#7950f2] text-xs sm:text-sm md:text-base" />
                    </div>
                    <span className="text-2xs sm:text-xs bg-gray-700/50 text-gray-300 px-1.5 sm:px-2 py-0.5 rounded-full">
                      {course.department}
                    </span>
                  </div>
                  
                  <h3 className="text-sm sm:text-base md:text-lg font-medium text-white mb-1 line-clamp-2">{course.courseName}</h3>
                  <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-700 flex justify-between items-center">
                    <span className="text-2xs sm:text-xs text-gray-400">Level {course.level}</span>
                    <div className="flex flex-col items-end">
                      <span className="text-2xs sm:text-xs text-gray-400">Semester {course.semester || "1"}</span>
                      <span className="text-2xs sm:text-xs text-gray-400">
                        {getSemesterCategory(course.semester) === "1" ? "First Term" : "Second Term"}
                      </span>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        ) : instructorCoursesIds.length === 0 ? (
          <motion.div 
            className="bg-[#232738] rounded-xl p-5 sm:p-6 md:p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center">
              <FaChalkboardTeacher className="text-2xl sm:text-3xl md:text-4xl text-gray-600 mb-3" />
              <p className="text-sm text-[var(--foreground-secondary)] mb-2">
                You don't have any assigned courses yet.
              </p>
              <p className="text-xs sm:text-sm text-[var(--foreground-secondary)]">
                Please contact the administrator to assign courses to your account.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="bg-[#232738] rounded-xl p-5 sm:p-6 md:p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center">
              <FaChalkboardTeacher className="text-2xl sm:text-3xl md:text-4xl text-gray-600 mb-3" />
              <p className="text-sm text-[var(--foreground-secondary)] mb-2">
                No courses found matching your filters.
              </p>
              <button 
                onClick={() => {
                  setSelectedDepartment("");
                  setSelectedLevel("");
                  setSelectedSemester("");
                }}
                className="text-[#7950f2] hover:underline text-xs sm:text-sm"
              >
                Clear all filters
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DoctorSubjects;
