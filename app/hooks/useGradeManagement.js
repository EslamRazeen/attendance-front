import { useState, useEffect, useCallback } from 'react';
import { useGetGradeLevelDataQuery, useUpdateStudentGradeMutation } from '@/app/store/features/dashboardApiSlice';
import { LEVELS, DEPARTMENTS } from '@/app/hooks/constants';

export const useGradeManagement = () => {
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [displayedStudents, setDisplayedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [status, setStatus] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [allStudents, setAllStudents] = useState([]); // Save all students data

  // RTK Query hooks
  const { 
    data: studentsData, 
    isLoading, 
    isFetching,
    isError,
    refetch
  } = useGetGradeLevelDataQuery(
    { level: selectedLevel, department: null }, // Get all students for this level without department filter
    { 
      skip: !selectedLevel,
      refetchOnMountOrArgChange: true
    }
  );
  
  const [updateStudentGrade, { isLoading: isUpdating }] = useUpdateStudentGradeMutation();

  // Effect to refresh data when level or departments change
  useEffect(() => {
    if (selectedLevel) {
      refetch();
    }
  }, [selectedLevel, refetch]);

  // Store all students data
  useEffect(() => {
    if (studentsData && studentsData.data) {
      console.log("Raw student data received:", studentsData.data.length, "students");
      setAllStudents(studentsData.data);
    }
  }, [studentsData]);

  // Filter students based on selected level and departments
  useEffect(() => {
    if (!allStudents.length) {
      setFilteredStudents([]);
      setDisplayedStudents([]);
      return;
    }

    console.log("Filtering students by level:", selectedLevel, "and departments:", selectedDepartments);
    
    // Filter students by level first
    let filtered = allStudents.filter(student => 
      student.level === selectedLevel
    );
    
    console.log("After level filter:", filtered.length, "students");
    
    // Then filter by departments if selected
    if (selectedDepartments.length > 0) {
      filtered = filtered.filter(student => 
        selectedDepartments.includes(student.department?.toUpperCase())
      );
      console.log("After department filter:", filtered.length, "students");
    }
    
    setFilteredStudents(filtered);
    setDisplayedStudents(filtered);
    
    // Reset selection when filters change
    setSelectedStudents([]);
    setSelectAll(false);
  }, [allStudents, selectedLevel, selectedDepartments]);

  // Filter students based on search query
  useEffect(() => {
    if (!filteredStudents.length) return;

    if (!searchQuery.trim()) {
      setDisplayedStudents(filteredStudents);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results = filteredStudents.filter(student => 
      (student.name?.toLowerCase().includes(query)) ||
      (student.email?.toLowerCase().includes(query)) ||
      (student._id?.toLowerCase().includes(query))
    );
    
    console.log("Search results:", results.length, "students");
    setDisplayedStudents(results);
  }, [searchQuery, filteredStudents]);

  // Handle selecting all students
  useEffect(() => {
    if (selectAll) {
      setSelectedStudents(displayedStudents.map(student => student._id));
    } else if (selectedStudents.length === displayedStudents.length && displayedStudents.length > 0) {
      // If we just unchecked "Select All", clear selections
      setSelectedStudents([]);
    }
  }, [selectAll, displayedStudents]);

  // Toggle student selection
  const toggleStudentSelection = useCallback((studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  }, []);

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    setSelectAll(prev => !prev);
  }, []);

  // Toggle department selection
  const toggleDepartment = useCallback((dept) => {
    setSelectedDepartments(prev => {
      if (prev.includes(dept)) {
        return prev.filter(d => d !== dept);
      } else {
        return [...prev, dept];
      }
    });
    setSelectedStudents([]);
    setSelectAll(false);
  }, []);

  // Handle select level with cleanup
  const handleSelectLevel = useCallback((level) => {
    setSelectedLevel(level);
    setSelectedStudents([]);
    setSelectAll(false);
  }, []);

  // Calculate next level
  const getNextLevel = useCallback((currentLevel) => {
    const current = parseInt(currentLevel, 10);
    if (isNaN(current) || current >= 4) return "Graduate";
    return (current + 1).toString();
  }, []);

  // Handle upgrade students
  const handleUpgradeStudents = useCallback(async () => {
    if (displayedStudents.length === 0) {
      setStatus("No students available to upgrade.");
      return;
    }

    // Get IDs of students to upgrade (selected ones)
    if (selectedStudents.length === 0) {
      setStatus("Please select at least one student to upgrade.");
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
      const result = await updateStudentGrade({
        studentIds: selectedStudents,
        level: selectedLevel,
        newLevel: nextLevel
      }).unwrap();
      
      setStatus(`Successfully upgraded ${selectedStudents.length} students to level ${nextLevel}`);
      
      // Remove upgraded students from all lists
      const updatedAllStudents = allStudents.filter(student => 
        !selectedStudents.includes(student._id)
      );
      setAllStudents(updatedAllStudents);
      
      setFilteredStudents(prev => 
        prev.filter(student => !selectedStudents.includes(student._id))
      );
      setDisplayedStudents(prev => 
        prev.filter(student => !selectedStudents.includes(student._id))
      );
      
      // Clear selections
      setSelectedStudents([]);
      setSelectAll(false);
      
      // Refresh data after upgrade
      setTimeout(() => {
        refetch();
      }, 1000);
    } catch (error) {
      console.error("Error upgrading students:", error);
      setStatus(error.message || "Failed to upgrade students. Please try again.");
    } finally {
      setUpgrading(false);
    }
  }, [displayedStudents, selectedStudents, selectedLevel, getNextLevel, updateStudentGrade, refetch, allStudents]);

  // Clear search and filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setDisplayedStudents(filteredStudents);
  }, [filteredStudents]);

  return {
    // State
    selectedLevel,
    selectedDepartments,
    selectedStudents,
    filteredStudents: displayedStudents, // Return displayed students instead of filtered
    searchQuery,
    selectAll,
    status,
    
    // Loading states
    loading: isLoading || isFetching,
    upgrading: isUpdating || upgrading,
    hasError: isError,
    
    // Actions
    setSelectedLevel: handleSelectLevel,
    setSearchQuery,
    toggleDepartment,
    toggleStudentSelection,
    toggleSelectAll,
    handleUpgradeStudents,
    handleClearFilters,
    
    // Utilities
    getNextLevel,
    
    // Constants
    levels: LEVELS,
    departments: DEPARTMENTS
  };
}; 