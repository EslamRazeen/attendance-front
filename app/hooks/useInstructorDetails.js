import { useState } from 'react';
import { 
  useGetInstructorStatsQuery, 
  useAddCourseToInstructorMutation,
  useDeleteCourseFromInstructorMutation
} from '@/app/store/features/usersApiSlice';
import { useGetCoursesQuery } from '@/app/store/features/coursesApiSlice';
import { useInstructorManagement } from './useInstructorManagement';

export const useInstructorDetails = (instructorId) => {
  // State
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [deleteCourseId, setDeleteCourseId] = useState(null);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  
  // API queries using RTK Query
  const { data: instructorStats, isLoading: statsLoading, error: statsError } = 
    useGetInstructorStatsQuery(instructorId, { skip: !instructorId });

  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesQuery();
  
  // Instructor management for getting lecturer by ID
  const { isLoading, fetchError, getInstructorById } = useInstructorManagement();
  
  // Mutations for course management
  const [addCourseToInstructor, { 
    isLoading: addCourseLoading, 
    error: addCourseError,
    reset: resetAddCourse
  }] = useAddCourseToInstructorMutation();
  
  const [deleteCourseFromInstructor, { 
    isLoading: deleteCourseLoading,
    error: deleteCourseError,
    reset: resetDeleteCourse
  }] = useDeleteCourseFromInstructorMutation();
  
  // Get the instructor data
  const instructor = getInstructorById(instructorId);
  
  // Get courses data with proper error handling
  const courses = coursesData?.data || [];
  
  // Handler for adding a course to instructor
  const handleAddCourse = async () => {
    if (!selectedCourseId || !instructorId) return;
    
    try {
      await addCourseToInstructor({ 
        userId: instructorId, 
        courseId: selectedCourseId 
      }).unwrap();
      
      setShowAddCourseModal(false);
      setSelectedCourseId('');
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.data?.message || 'Failed to add course'
      };
    }
  };
  
  // Handler for deleting a course from instructor
  const handleDeleteCourse = async () => {
    if (!deleteCourseId || !instructorId) return;
    
    try {
      await deleteCourseFromInstructor({ 
        userId: instructorId,
        courseId: deleteCourseId
      }).unwrap();
      
      setDeleteCourseId(null);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.data?.message || 'Failed to delete course'
      };
    }
  };
  
  return {
    // Data
    instructor,
    instructorStats,
    courses,
    
    // State
    selectedCourseId,
    showAddCourseModal,
    deleteCourseId,
    selectedCourseDetails,
    
    // Loading states
    isLoading,
    statsLoading,
    coursesLoading,
    addCourseLoading,
    deleteCourseLoading,
    
    // Errors
    fetchError,
    statsError,
    addCourseError,
    deleteCourseError,
    
    // Actions
    setSelectedCourseId,
    setShowAddCourseModal,
    setDeleteCourseId,
    setSelectedCourseDetails,
    handleAddCourse,
    handleDeleteCourse,
    resetAddCourse,
    resetDeleteCourse
  };
}; 