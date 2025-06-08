import { useState, useCallback, useEffect } from 'react';
import { 
  useGetStudentsQuery,
  useGetStudentsByFilterQuery,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useAddCourseToStudentMutation,
  useRemoveCourseFromStudentMutation
} from '@/app/store/features/studentsApiSlice';
import { useGetCoursesQuery } from '@/app/store/features/coursesApiSlice';

export const useStudentManagement = (initialLevel = "", initialDepartment = "") => {
  // State
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [selectedDepartment, setSelectedDepartment] = useState(initialDepartment);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterByCourse, setFilterByCourse] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [status, setStatus] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [localStudents, setLocalStudents] = useState([]);
  const [localFilteredStudents, setLocalFilteredStudents] = useState([]);
  
  // Course modal states
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [deleteCourseId, setDeleteCourseId] = useState(null);
  
  // Add original student data state
  const [originalStudentData, setOriginalStudentData] = useState({});
  
  // RTK Query hooks - try to use normal query first for all students
  const { 
    data: allStudentsData, 
    isLoading: isLoadingAllStudents
  } = useGetStudentsQuery();
  
  // Also use filtered query if level and department are selected
  const { 
    data: filteredStudentsData, 
    isLoading: isLoadingFilteredStudents,
    refetch: refetchStudents
  } = useGetStudentsByFilterQuery(
    { level: selectedLevel, department: selectedDepartment },
    { skip: !selectedLevel || !selectedDepartment }
  );
  
  // Get courses with better error handling
  const { 
    data: coursesData, 
    isLoading: isLoadingCourses,
    isError: isCoursesError,
    error: coursesError 
  } = useGetCoursesQuery();
  
  // Mutations
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();
  const [addCourseToStudent, { isLoading: isAddingCourse }] = useAddCourseToStudentMutation();
  const [removeCourseFromStudent, { isLoading: isRemovingCourse }] = useRemoveCourseFromStudentMutation();
  
  // Fallback to manual fetch if RTK Query fails to load data
  useEffect(() => {
    // Only fetch if RTK Query isn't working and we don't have data yet
    if (!allStudentsData && !isLoadingAllStudents && localStudents.length === 0) {
      console.log("Fallback: Manual fetch of students data");
      fetch("https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode/studentInfo", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")?.replace(/"/g, "")}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            setLocalStudents(data.data);
          }
        })
        .catch(err => console.error("Error fetching students:", err));
    }
  }, [allStudentsData, isLoadingAllStudents, localStudents.length]);

  // Fallback to manual fetch for courses if RTK Query fails
  useEffect(() => {
    if (!coursesData && !isLoadingCourses) {
      console.log("Fallback: Manual fetch of courses data");
      fetch("https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode/courses", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")?.replace(/"/g, "")}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            // We don't have a state for this, but we'll log it
            console.log("Courses fetched manually:", data.data);
          }
        })
        .catch(err => console.error("Error fetching courses:", err));
    }
  }, [coursesData, isLoadingCourses]);
  
  // Debug logs
  useEffect(() => {
    console.log("RTK Query status - Students:", isLoadingAllStudents ? "loading" : (allStudentsData ? "success" : "no data"));
    console.log("RTK Query status - Filtered Students:", isLoadingFilteredStudents ? "loading" : (filteredStudentsData ? "success" : "no data"));
    console.log("RTK Query status - Courses:", isLoadingCourses ? "loading" : (coursesData ? "success" : "no data"));
  }, [allStudentsData, filteredStudentsData, coursesData, isLoadingAllStudents, isLoadingFilteredStudents, isLoadingCourses]);

  // Debug logs for courses
  useEffect(() => {
    if (isCoursesError) {
      console.error("Error loading courses:", coursesError);
    }
    if (coursesData) {
      console.log("Loaded courses:", coursesData);
    }
  }, [coursesData, isCoursesError, coursesError]);

  // Derived state - Use RTK Query data or fallback to local state
  const students = filteredStudentsData?.data || allStudentsData?.data || localStudents || [];
  const courses = coursesData?.data?.map(course => ({
    ...course,
    name: course.name || `Course ${course.code || course._id}`,
  })) || [];
  const isLoading = isLoadingAllStudents || isLoadingFilteredStudents || isLoadingCourses || 
    isUpdating || isDeleting || isAddingCourse || isRemovingCourse;
  
  // Filter students based on search query and course filter
  useEffect(() => {
    if (selectedLevel && selectedDepartment) {
      // Start with level and department filter
      let filtered = students.filter(
        (s) => s.level?.toString() === selectedLevel && 
               s.department?.toUpperCase() === selectedDepartment
      );
      
      // Apply search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (student) =>
            (student.name && student.name.toLowerCase().includes(query)) ||
            (student.email && student.email.toLowerCase().includes(query)) ||
            (student._id && student._id.toLowerCase().includes(query))
        );
      }
      
      // Apply course filter
      if (filterByCourse) {
        filtered = filtered.filter(
          (student) =>
            student.courses?.some((course) => course._id === filterByCourse)
        );
      }
      
      setLocalFilteredStudents(filtered);
    } else {
      setLocalFilteredStudents([]);
    }
  }, [students, selectedLevel, selectedDepartment, searchQuery, filterByCourse]);
  
  // Reset edit state when filtered students change
  useEffect(() => {
    setEditIndex(null);
    setEditData({});
  }, [students, searchQuery, filterByCourse]);
  
  // Reset status message after timeout
  useEffect(() => {
    if (status) {
      console.log("Status message set:", status);
      const timer = setTimeout(() => {
        console.log("Clearing status message:", status);
        setStatus("");
      }, 7000); // Increased from 5000 to 7000 ms
      return () => clearTimeout(timer);
    }
  }, [status]);
  
  // Get course name by ID
  const getCourseNameById = (courseId) => {
    // أولاً، ابحث في قائمة المقررات من API الخاص بالمقررات
    const course = courses.find(c => c._id === courseId);
    if (course) {
      // استخدم courseName أولاً ثم name إذا كان موجوداً
      const displayName = course.courseName || course.name || "Unknown Course";
      
      // إذا كان لدينا رمز المقرر، استخدمه كجزء من اسم المقرر
      const codePrefix = course.courseCode ? `${course.courseCode}: ` : '';
      
      // إضافة معلومات القسم إذا كانت متوفرة
      const deptSuffix = course.department ? ` (${course.department})` : '';
      
      return `${codePrefix}${displayName}${deptSuffix}`;
    }
    
    // إذا لم نجد في قائمة المقررات، ابحث في مقررات الطالب المختار إذا كان موجوداً
    if (selectedStudent && selectedStudent.courses) {
      const studentCourse = selectedStudent.courses.find(c => c._id === courseId);
      if (studentCourse) {
        const displayName = studentCourse.courseName || studentCourse.name || "Unknown Course";
        const codePrefix = studentCourse.courseCode ? `${studentCourse.courseCode}: ` : '';
        return `${codePrefix}${displayName}`;
      }
    }
    
    // إذا لم نجد المقرر في أي مكان، أعد معرف المقرر
    return `Course ID: ${courseId.substring(0, 8)}...`;
  };
  
  // Handle edit student
  const handleEdit = (idx) => {
    const studentToEdit = localFilteredStudents[idx];
    if (studentToEdit) {
      setEditIndex(idx);
      // Create a copy to prevent referencing issues
      const studentData = { ...studentToEdit };
      setEditData(studentData);
      // Store original data for comparison later
      setOriginalStudentData(studentData);
      setStatus("");
    }
  };
  
  // Handle view student details with course names
  const handleViewDetails = (student) => {
    // قم بالاستعلام عن بيانات الطالب مع المقررات
    fetch(`https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode/studentInfo/${student._id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")?.replace(/"/g, "")}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          console.log("Student details with courses:", data.data);
          
          // Enhance student courses with names
          const enhancedStudent = {
            ...data.data,
            courses: data.data.courses?.map(course => {
              // Get additional course info
              const courseInfo = courses.find(c => c._id === course._id);
              
              return {
                ...course,
                ...(courseInfo || {}),
                name: getCourseNameById(course._id),
                courseName: course.courseName || courseInfo?.courseName || getCourseNameById(course._id)
              };
            }) || []
          };
          
          setSelectedStudent(enhancedStudent);
          setShowStudentDetails(true);
        } else {
          // Fallback to the basic student data
          const enhancedStudent = {
            ...student,
            courses: student.courses?.map(course => {
              // Get additional course info
              const courseInfo = courses.find(c => c._id === course._id);
              
              return {
                ...course,
                ...(courseInfo || {}),
                name: getCourseNameById(course._id),
                courseName: course.courseName || courseInfo?.courseName || getCourseNameById(course._id)
              };
            }) || []
          };
          setSelectedStudent(enhancedStudent);
          setShowStudentDetails(true);
        }
      })
      .catch(err => {
        console.error("Error fetching student details:", err);
        // Fallback to the basic student data
        const enhancedStudent = {
          ...student,
          courses: student.courses?.map(course => {
            // Get additional course info
            const courseInfo = courses.find(c => c._id === course._id);
            
            return {
              ...course,
              ...(courseInfo || {}),
              name: getCourseNameById(course._id),
              courseName: course.courseName || courseInfo?.courseName || getCourseNameById(course._id)
            };
          }) || []
        };
        setSelectedStudent(enhancedStudent);
        setShowStudentDetails(true);
      });
  };
  
  // Handle change with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update with the new value
    setEditData(prev => ({ ...prev, [name]: value }));
    
    // For debugging
    console.log("Field changed:", name, "New value:", value, "Original value:", originalStudentData[name]);
  };
  
  // Reset edit state completely
  const cancelEdit = () => {
    setEditIndex(null);
    setEditData({});
    setOriginalStudentData({});
    setStatus("");
  };
  
  // Handle save student with better error handling
  const handleSave = async (studentId) => {
    if (!studentId || !editData) return;
    
    try {
      // Only include fields that have actually changed
      const updateData = {};
      
      if (editData.name !== originalStudentData.name) {
        updateData.name = editData.name;
      }
      
      if (editData.email !== originalStudentData.email) {
        updateData.email = editData.email;
      }
      
      if (editData.level !== originalStudentData.level) {
        updateData.level = editData.level;
      }

      // Don't update if nothing changed
      if (Object.keys(updateData).length === 0) {
        setStatus("No changes were made.");
        cancelEdit();
        return;
      }

      console.log("Updating student with data:", updateData);
      
      // Show loading status
      setStatus("Processing: Saving student data...");
      
      if (updateStudent) {
        const result = await updateStudent({ 
          studentId, 
          data: updateData
        }).unwrap();
        
        console.log("Update result:", result);
        
        if (result.error) {
          throw new Error(result.error);
        }
      } else {
        // Fallback to direct fetch
        const token = localStorage.getItem("token")?.replace(/"/g, "");
        const res = await fetch(
          `https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode/studentInfo/${studentId}`,
          {
            method: "PUT",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updateData),
          }
        );
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update student");
        }
      }
      
      // Set success status with clear message about what was updated
      const updatedFields = Object.keys(updateData).join(", ");
      setStatus(`Success! Updated student ${updatedFields} successfully.`);
      
      // Update local students array
      const updatedStudents = [...localStudents];
      const studentIndex = updatedStudents.findIndex(s => s._id === studentId);
      if (studentIndex !== -1) {
        updatedStudents[studentIndex] = { 
          ...updatedStudents[studentIndex], 
          ...updateData 
        };
        setLocalStudents(updatedStudents);
      }
      
      // Update filtered students array if it's in view
      const filteredIndex = localFilteredStudents.findIndex(s => s._id === studentId);
      if (filteredIndex !== -1) {
        const updatedFilteredStudents = [...localFilteredStudents];
        updatedFilteredStudents[filteredIndex] = {
          ...updatedFilteredStudents[filteredIndex],
          ...updateData
        };
        setLocalFilteredStudents(updatedFilteredStudents);
      }
      
      // Reset edit state
      cancelEdit();
      
      // Refresh data from server
      if (refetchStudents) {
        await refetchStudents();
      }
      
    } catch (err) {
      console.error("Error saving student:", err);
      setStatus(`Update failed: ${err.message || "Unknown error"}`);
    }
  };
  
  // Handle delete student
  const handleDelete = async (studentId) => {
    if (!studentId) return;
    
    // Get student name before deletion for better message
    const student = localStudents.find(s => s._id === studentId);
    const studentName = student?.name || "Student";
    
    if (window.confirm(`Are you sure you want to delete student "${studentName}"?`)) {
      try {
        // Show loading status
        setStatus("Processing: Deleting student...");
        
        if (deleteStudent) {
          // Use RTK Query mutation
          await deleteStudent(studentId).unwrap();
        } else {
          // Fallback to direct fetch
          const token = localStorage.getItem("token")?.replace(/"/g, "");
          const res = await fetch(
            `https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode/studentInfo/${studentId}`,
            {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${token}`
              },
            }
          );
          
          if (!res.ok) {
            throw new Error("Failed to delete student");
          }
        }
        
        setStatus(`Success! Student "${studentName}" deleted successfully.`);
        
        // Update local state
        setLocalStudents(localStudents.filter(s => s._id !== studentId));
        
        // Refresh data from server
        if (refetchStudents) {
          refetchStudents();
        }
        
      } catch (err) {
        console.error("Error deleting student:", err);
        setStatus(`Failed to delete student: ${err.message || "Unknown error"}`);
      }
    }
  };
  
  // Handle add course with enhanced error handling
  const handleAddCourse = async () => {
    if (!selectedCourseId || !selectedStudent?._id) {
      setStatus("Please select a course");
      return;
    }
    
    try {
      // Show loading status
      setStatus("Processing: Adding course to student...");
      
      console.log("Adding course:", selectedCourseId, "to student:", selectedStudent._id);
      
      if (addCourseToStudent) {
        const result = await addCourseToStudent({ 
          studentId: selectedStudent._id, 
          courseId: selectedCourseId 
        }).unwrap();
        
        console.log("Add course result:", result);
        
        if (result.error) {
          throw new Error(result.error);
        }
      } else {
        // Fallback to direct fetch
        const token = localStorage.getItem("token")?.replace(/"/g, "");
        const res = await fetch(
          "https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode/studentInfo/addCourse",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ 
              studentId: selectedStudent._id, 
              courseId: selectedCourseId 
            })
          }
        );
        
        if (!res.ok) {
          throw new Error("Failed to add course");
        }
      }
      
      setShowAddCourseModal(false);
      setSelectedCourseId("");
      
      // Get course name for message
      const courseName = getCourseNameById(selectedCourseId);
      setStatus(`Success! Course "${courseName}" added successfully.`);
      
      // Fetch updated student data
      fetch(`https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode/studentInfo/${selectedStudent._id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")?.replace(/"/g, "")}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            // Update with the fresh data from the server
            const updatedStudent = {
              ...data.data,
              courses: data.data.courses?.map(course => ({
                ...course,
                name: course.courseName || getCourseNameById(course._id)
              }))
            };
            setSelectedStudent(updatedStudent);
            
            // Update in localStudents
            const updatedStudents = [...localStudents];
            const studentIndex = updatedStudents.findIndex(s => s._id === selectedStudent._id);
            if (studentIndex !== -1) {
              updatedStudents[studentIndex] = {
                ...updatedStudents[studentIndex],
                courses: data.data.courses
              };
              setLocalStudents(updatedStudents);
            }
          } else {
            // Fallback to manual update if API call fails
            updateLocalStudentCourses(selectedCourseId, true);
          }
        })
        .catch(err => {
          console.error("Error fetching updated student data:", err);
          // Fallback to manual update if API call fails
          updateLocalStudentCourses(selectedCourseId, true);
        });
      
      // Refresh data from server
      if (refetchStudents) {
        await refetchStudents();
      }
      
    } catch (err) {
      console.error("Error adding course:", err);
      setStatus(`Failed to add course: ${err.message || "Unknown error"}`);
    }
  };
  
  // Helper to update student courses locally
  const updateLocalStudentCourses = (courseId, isAdding = true) => {
    if (!selectedStudent) return;
    
    if (isAdding) {
      // Get the complete course object
      const courseObj = courses.find(c => c._id === courseId);
      
      // Adding a course
      const newCourse = {
        _id: courseId,
        courseName: courseObj?.courseName || getCourseNameById(courseId),
        name: getCourseNameById(courseId),
        courseCode: courseObj?.courseCode,
        department: courseObj?.department,
        semester: courseObj?.semester
      };
      
      const updatedCourses = [
        ...(selectedStudent.courses || []), 
        newCourse
      ];
      
      setSelectedStudent({
        ...selectedStudent,
        courses: updatedCourses
      });
      
      // Update in localStudents
      const updatedStudents = [...localStudents];
      const studentIndex = updatedStudents.findIndex(s => s._id === selectedStudent._id);
      if (studentIndex !== -1) {
        updatedStudents[studentIndex] = {
          ...updatedStudents[studentIndex],
          courses: updatedCourses
        };
        setLocalStudents(updatedStudents);
      }
    } else {
      // Removing a course
      const updatedCourses = selectedStudent.courses?.filter(
        course => course._id !== courseId
      ) || [];
      
      setSelectedStudent({
        ...selectedStudent,
        courses: updatedCourses
      });
      
      // Update in localStudents
      const updatedStudents = [...localStudents];
      const studentIndex = updatedStudents.findIndex(s => s._id === selectedStudent._id);
      if (studentIndex !== -1) {
        updatedStudents[studentIndex] = {
          ...updatedStudents[studentIndex],
          courses: updatedCourses
        };
        setLocalStudents(updatedStudents);
      }
    }
  };
  
  // Handle remove course from student
  const handleRemoveCourse = async () => {
    if (!deleteCourseId || !selectedStudent?._id) return;
    
    try {
      // Show loading status
      setStatus("Processing: Removing course from student...");
      
      // Get course name before removal for better message
      const courseName = getCourseNameById(deleteCourseId);
      
      if (removeCourseFromStudent) {
        // Use RTK Query mutation
        await removeCourseFromStudent({ 
          studentId: selectedStudent._id, 
          courseId: deleteCourseId 
        }).unwrap();
      } else {
        // Fallback to direct fetch
        const token = localStorage.getItem("token")?.replace(/"/g, "");
        const res = await fetch(
          `https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode/studentInfo/removeCourse/${deleteCourseId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ 
              studentId: selectedStudent._id 
            })
          }
        );
        
        if (!res.ok) {
          throw new Error("Failed to remove course");
        }
      }
      
      setDeleteCourseId(null);
      setStatus(`Success! Course "${courseName}" removed successfully.`);
      
      // Fetch updated student data
      fetch(`https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode/studentInfo/${selectedStudent._id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")?.replace(/"/g, "")}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            // Update with the fresh data from the server
            const updatedStudent = {
              ...data.data,
              courses: data.data.courses?.map(course => ({
                ...course,
                name: course.courseName || getCourseNameById(course._id)
              }))
            };
            setSelectedStudent(updatedStudent);
            
            // Update in localStudents
            const updatedStudents = [...localStudents];
            const studentIndex = updatedStudents.findIndex(s => s._id === selectedStudent._id);
            if (studentIndex !== -1) {
              updatedStudents[studentIndex] = {
                ...updatedStudents[studentIndex],
                courses: data.data.courses
              };
              setLocalStudents(updatedStudents);
            }
          } else {
            // Fallback to manual update if API call fails
            updateLocalStudentCourses(deleteCourseId, false);
          }
        })
        .catch(err => {
          console.error("Error fetching updated student data:", err);
          // Fallback to manual update if API call fails
          updateLocalStudentCourses(deleteCourseId, false);
        });
      
      // Refresh data from server
      if (refetchStudents) {
        refetchStudents();
      }
      
    } catch (err) {
      console.error("Error removing course:", err);
      setStatus(`Failed to remove course: ${err.message || "Unknown error"}`);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilterByCourse("");
    setShowAdvancedFilters(false);
  };
  
  // Return values and functions
  return {
    // State
    selectedLevel,
    selectedDepartment,
    searchQuery,
    filterByCourse,
    showAdvancedFilters,
    editIndex,
    editData,
    status,
    selectedStudent,
    showStudentDetails,
    showAddCourseModal,
    selectedCourseId,
    deleteCourseId,
    isLoading,
    originalStudentData,
    
    // Data
    students,
    filteredStudents: localFilteredStudents,
    courses,
    
    // Actions
    setSelectedLevel,
    setSelectedDepartment,
    setSearchQuery,
    setFilterByCourse,
    setShowAdvancedFilters,
    handleEdit,
    handleViewDetails,
    handleChange,
    handleSave,
    handleDelete,
    handleAddCourse,
    handleRemoveCourse,
    resetFilters,
    setSelectedStudent,
    setShowStudentDetails,
    setShowAddCourseModal,
    setSelectedCourseId,
    setDeleteCourseId,
    setStatus,
    getCourseNameById,
    cancelEdit,
    updateLocalStudentCourses,
  };
}; 