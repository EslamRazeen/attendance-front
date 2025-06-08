import React from 'react';
import { FaTrash } from 'react-icons/fa';

export const AddCourseModal = ({ 
  showModal, 
  onClose, 
  courses, 
  selectedCourseId,
  onSelectCourse,
  onSubmit,
  isLoading,
  error,
  success,
  instructorCourses
}) => {
  if (!showModal) return null;
  
  // Filter out courses that are already assigned to this instructor
  const availableCourses = courses.filter(
    course => !instructorCourses.some(c => c._id === course._id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#232738] p-8 rounded-xl shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-400 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold text-white mb-4">Assign Course to Instructor</h2>
        <select
          className="w-full p-2 rounded-lg bg-[#1a1f2e] text-white mb-4 border border-[#2a2f3e]"
          value={selectedCourseId}
          onChange={(e) => onSelectCourse(e.target.value)}
        >
          <option value="">Select a course</option>
          {availableCourses.map(course => (
            <option key={course._id} value={course._id}>
              {course.courseName} - {course.courseCode} ({course.department})
            </option>
          ))}
        </select>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        {success && <div className="text-green-400 mb-2">{success}</div>}
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mt-2 disabled:opacity-50"
          onClick={onSubmit}
          disabled={isLoading || !selectedCourseId}
        >
          {isLoading ? "Adding..." : "Add Course"}
        </button>
      </div>
    </div>
  );
};

export const DeleteCourseModal = ({
  courseId,
  onClose,
  onDelete,
  isLoading,
  error,
  courses
}) => {
  if (!courseId) return null;
  
  const courseName = courses.find(c => c._id === courseId)?.courseName || "this course";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#232738] p-8 rounded-xl shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-400 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Confirm Delete Course</h2>
        <div className="text-[var(--foreground-secondary)] mb-6">
          Are you sure you want to delete
          <span className="text-red-400 font-bold mx-1">"{courseName}"</span>
          from the instructor?
        </div>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600 transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            onClick={onDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2 animate-spin inline-block"></span>
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="mr-2" /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const CourseDetailsModal = ({
  courseDetails,
  onClose
}) => {
  if (!courseDetails) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#232738] p-8 rounded-xl shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-400 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold text-white mb-4">Course Details</h2>
        <div className="text-gray-200 space-y-2">
          <div><span className="font-semibold text-blue-300">Name:</span> {courseDetails.courseName}</div>
          <div><span className="font-semibold text-blue-300">Code:</span> {courseDetails.courseCode}</div>
          <div><span className="font-semibold text-blue-300">Department:</span> {courseDetails.department}</div>
          <div><span className="font-semibold text-blue-300">Level:</span> {courseDetails.level}</div>
          <div><span className="font-semibold text-blue-300">Semester:</span> {parseInt(courseDetails.semester) % 2 === 0 ? 2 : 1}</div>
          <div><span className="font-semibold text-blue-300">ID:</span> {courseDetails._id}</div>
        </div>
      </div>
    </div>
  );
};

export const DeleteInstructorModal = ({
  isOpen,
  onClose,
  onDelete,
  instructorName,
  isLoading,
  error
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#1a1f2e] p-6 rounded-xl max-w-md w-full mx-4 border border-red-500/30 shadow-lg shadow-red-500/10">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mr-4">
            <FaTrash className="text-red-500 text-xl" />
          </div>
          <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-gray-300">
            Are you sure you want to delete instructor <span className="text-white font-semibold">{instructorName}</span>? This action cannot be undone.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 mb-6 text-red-300 text-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-4">
          <button 
            className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            onClick={onDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="mr-2" /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 