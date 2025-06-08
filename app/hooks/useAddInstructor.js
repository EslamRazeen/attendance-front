import { useState, useMemo, useEffect } from 'react';
import { useAddStaffUserMutation, useGetAllUsersQuery } from "@/app/store/features/usersApiSlice";
import { useGetCoursesQuery } from "@/app/store/features/coursesApiSlice";
import { useRouter } from "next/navigation";

export const useAddInstructor = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    lecturerRole: "",
    lecturerDepartment: "",
    lecturerCourses: [],
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [successNotification, setSuccessNotification] = useState(false);

  // API hooks
  const { data: coursesData, isLoading: isLoadingCourses } = useGetCoursesQuery();
  const [addStaffUser, { isLoading: isAdding }] = useAddStaffUserMutation();
  const { data: allUsersData, isLoading: isLoadingUsers } = useGetAllUsersQuery();

  const FetchedCourses = coursesData?.data || [];

  // Filters for courses
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  
  // Memoized filtered courses
  const filteredCourses = useMemo(() => {
    return FetchedCourses.filter(
      (course) =>
        (!selectedDepartment || course.department === selectedDepartment) &&
        (!selectedLevel || course.level === selectedLevel)
    );
  }, [FetchedCourses, selectedDepartment, selectedLevel]);

  // Handle course selection
  const handleCourseSelect = (courseId) => {
    setNewUser((prev) => {
      const isAlreadySelected = prev.lecturerCourses.includes(courseId);
      return {
        ...prev,
        lecturerCourses: isAlreadySelected
          ? prev.lecturerCourses.filter((id) => id !== courseId)
          : [...prev.lecturerCourses, courseId],
      };
    });
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Remove validation while typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate field
  const validateField = (name, value) => {
    let errorMessage = "";
    
    switch (name) {
      case "name":
        if (!value.trim()) {
          errorMessage = "Name is required";
        } else if (value.trim().length < 3) {
          errorMessage = "Name must be at least 3 characters";
        }
        break;
        
      case "email":
        if (!value.trim()) {
          errorMessage = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errorMessage = "Email is invalid";
        }
        break;
        
      case "password":
        if (!value) {
          errorMessage = "Password is required";
        } else if (value.length < 6) {
          errorMessage = "Password must be at least 6 characters";
        }
        // Check password confirmation match if it exists
        if (newUser.passwordConfirm && value !== newUser.passwordConfirm) {
          setErrors(prev => ({
            ...prev,
            passwordConfirm: "Passwords do not match"
          }));
        } else if (newUser.passwordConfirm) {
          setErrors(prev => ({
            ...prev,
            passwordConfirm: ""
          }));
        }
        break;
        
      case "passwordConfirm":
        if (!value) {
          errorMessage = "Please confirm password";
        } else if (value !== newUser.password) {
          errorMessage = "Passwords do not match";
        }
        break;
        
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
    
    return !errorMessage;
  };

  // Handle department selection
  const handleDepartmentSelect = (dept) => {
    setNewUser(prev => ({
      ...prev,
      lecturerDepartment: dept
    }));
    setSelectedDepartment(dept);
  };

  // Handle role selection
  const handleRoleSelect = (role) => {
    setNewUser(prev => ({
      ...prev,
      lecturerRole: role
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate step 1
    if (currentStep === 1) {
      if (!validateField("name", newUser.name)) newErrors.name = errors.name || "Name is required";
      if (!validateField("email", newUser.email)) newErrors.email = errors.email || "Email is required";
      if (!validateField("password", newUser.password)) newErrors.password = errors.password || "Password is required";
      if (!validateField("passwordConfirm", newUser.passwordConfirm)) newErrors.passwordConfirm = errors.passwordConfirm || "Please confirm password";
    
      // Check if email already exists
      if (!newErrors.email && allUsersData && allUsersData.data) {
        const emailExists = allUsersData.data.some(
          (user) => user.email && user.email.toLowerCase() === newUser.email.toLowerCase()
        );
        if (emailExists) {
          newErrors.email = "This email is already in use";
        }
      }
    }
    
    // Validate step 2
    if (currentStep === 2) {
      if (!newUser.lecturerRole) newErrors.lecturerRole = "Role is required";
      if (!newUser.lecturerDepartment) newErrors.lecturerDepartment = "Department is required";
    }
    
    // Validate step 3
    if (currentStep === 3 && newUser.lecturerCourses.length === 0) {
      newErrors.courses = "Please select at least one course";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateForm()) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setFormSubmitted(true);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  // Handle form submission
  const handleAddUser = async () => {
    if (!validateForm()) {
      setFormSubmitted(true);
      return;
    }
    
    try {
      await addStaffUser(newUser).unwrap();
      setSuccessNotification(true);
      
      // Reset form after success
      setTimeout(() => {
        setSuccessNotification(false);
        router.push("/dashboard/admin");
      }, 2000);
    } catch (error) {
      console.error("Failed to add user:", error);

      // Extract error message if available
      const errorMessage = error?.data?.errors?.[0]?.msg || "An unexpected error occurred. Please try again.";
      setErrors(prev => ({ ...prev, submit: errorMessage }));
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedLevel("");
    setSelectedDepartment("");
  };

  return {
    // State
    currentStep,
    newUser,
    errors,
    formSubmitted,
    successNotification,
    selectedDepartment,
    selectedLevel,
    filteredCourses,
    
    // Loading states
    isLoadingCourses,
    isLoadingUsers,
    isAdding,
    
    // Actions
    handleInputChange,
    validateField,
    handleDepartmentSelect,
    handleRoleSelect,
    handleCourseSelect,
    handleNextStep,
    handlePrevStep,
    handleAddUser,
    clearFilters,
    setSelectedLevel,
    
    // Constants
    levels: ["1", "2", "3", "4"],
    departments: ["CS", "IS", "AI", "BIO"],
    roles: ["instructor", "assistant"]
  };
}; 