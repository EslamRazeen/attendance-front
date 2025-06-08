"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Checkbox from "@mui/material/Checkbox";
import Link from "next/link";
import { useDispatch } from "react-redux";
import Header from "@/app/components/layout/Header";
import { FaUserAlt, FaLock, FaSignInAlt, FaEye, FaEyeSlash, FaUserTie, FaUserGraduate } from "react-icons/fa";
import { motion } from "framer-motion";
import { useLanguage } from "@/app/components/providers/LanguageProvider";
import {
  setToken,
  setAdminRole,
  setInstructorRole,
  setLecturerRole,
  setInstructorCourses,
} from "@/app/store/slices/userRole";
import { useLoginMutation } from "@/app/store/features/authApiSlice";

export default function Page() {
  const router = useRouter();
  const [login, { error, isLoading }] = useLoginMutation();
  const [user, setUser] = useState({ password: "", username: "" });
  const dispatch = useDispatch();
  const [role, setRole] = useState("instructor");
  const [shake, setShake] = useState(false);
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "", general: "" });
  const { t, isRTL } = useLanguage();
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animation states
  const [activeInput, setActiveInput] = useState(null);
  const [filled, setFilled] = useState({ username: false, password: false });

  useEffect(() => {
    setVisible(true);
    // Check if fields are filled
    setFilled({
      username: user.username.trim() !== "",
      password: user.password.trim() !== "",
    });
    
    // التحقق من حجم الشاشة
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  useEffect(() => {
    // Update filled state when user inputs change
    setFilled({
      username: user.username.trim() !== "",
      password: user.password.trim() !== "",
    });
  }, [user.username, user.password]);

  const handleRoleChange = (event) => {
    const selectedRole = event.target.value;
    setRole(selectedRole);
    selectedRole === "admin"
      ? dispatch(setAdminRole())
      : dispatch(setInstructorRole());
  };

  const handleInputsChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = { username: "", password: "", general: "" };
    let isValid = true;

    if (!user.username.trim()) {
      newErrors.username = t('usernameRequired');
      isValid = false;
    }

    if (!user.password) {
      newErrors.password = t('passwordRequired');
      isValid = false;
    } else if (user.password.length < 4) {
      newErrors.password = t('passwordTooShort');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    // Input validation
    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    try {
      // Include the selected role in the login request
      const loginData = {
        ...user,
        role: role // Include the selected role
      };
      
      console.log("Attempting login with data:", loginData);
      
      const response = await login(loginData).unwrap();
      
      console.log("Login Response:", response);

      // Check if the response has the expected structure
      if (!response || !response.data) {
        console.error("Invalid response structure:", response);
        throw new Error("Received invalid response from server");
      }

      // Check if the role from the server matches the selected role
      const serverRole = response.data.role === "lecturer" ? "instructor" : "admin";
      
      console.log("Server role:", serverRole, "Selected role:", role);
      
      // If roles don't match, show an error
      if (serverRole !== role) {
        setErrors({
          ...errors,
          general: t('invalidRoleAccess') || "لا تملك صلاحية الوصول بهذا النوع من الحسابات"
        });
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
      
      const lecturerRole =
        response.data.lecturerRole === "instructour" ? "instructor" : "assistant";

      if (response.token) {
        console.log("Setting token in Redux store");
        dispatch(setToken(response.token));
        // Also store token in localStorage for persistence
        localStorage.setItem("token", JSON.stringify(response.token));
      } else {
        console.warn("No token received in response");
      }
      
      dispatch(setLecturerRole(lecturerRole));

      // Save instructor courses if available in the response
      if (serverRole === "instructor" && response.data.lecturerCourses) {
        console.log("Saving instructor courses:", response.data.lecturerCourses);
        dispatch(setInstructorCourses(response.data.lecturerCourses));
      }

      console.log("Login successful:", loginData, response);

      if (serverRole === "admin") {
        dispatch(setAdminRole());
        router.push("/dashboard");
      } else {
        dispatch(setInstructorRole());
        router.push("/dashboard/doctor");
      }
    } catch (err) {
      console.error("Login error details:", err);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      // تحسين رسائل الخطأ للمستخدم
      let errorMessage = t('loginFailed') || "فشل تسجيل الدخول";
      
      if (err.status === 401) {
        errorMessage = "اسم المستخدم أو كلمة المرور غير صحيحة";
      } else if (err.status === 403) {
        errorMessage = "ليس لديك صلاحية الوصول";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // إضافة معلومات إضافية للتصحيح
      console.log("Error message:", errorMessage);
      console.log("Error status:", err.status);
      
      setErrors({
        ...errors,
        general: errorMessage
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-3 py-6 sm:px-6 sm:py-12">
      <Header />
      
      <div className="container mx-auto flex flex-col md:flex-row rounded-xl overflow-hidden shadow-xl max-w-5xl">
        {/* Left panel - Login form */}
        <motion.div 
          className="w-full md:w-1/2 bg-[var(--card-bg)] p-6 sm:p-8 md:p-10 lg:p-12"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full max-w-md mx-auto">
            <div className="mb-6 sm:mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--foreground)]">
                {isRTL ? "مرحباً بك" : "Welcome Back"}
              </h1>
              <p className="mt-2 text-sm md:text-base text-[var(--foreground-secondary)]">
                {isRTL ? "يرجى تسجيل الدخول للوصول إلى حسابك" : "Please sign in to access your account"}
              </p>
            </div>
            
            {/* Error message */}
            {errors.general && (
              <motion.div 
                className="p-3 mb-5 text-sm text-white bg-red-500 rounded-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {errors.general}
              </motion.div>
            )}
            
            <div className="space-y-5 md:space-y-6">
              {/* Username field */}
              <div>
                <label className="block mb-2 text-sm font-medium text-[var(--foreground)]">
                  {isRTL ? "اسم المستخدم" : "Username"}
                </label>
                <div 
                  className={`relative ${shake ? 'animate-shake' : ''}`}
                >
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaUserAlt className="text-[var(--foreground-secondary)] text-sm" />
                  </div>
                  <input
                    type="text"
                    className={`w-full py-3 pl-10 pr-4 text-base text-[var(--foreground)] bg-[var(--card-bg)] border ${
                      errors.username ? 'border-red-500' : activeInput === 'username' ? 'border-[var(--primary)]' : 'border-[var(--border-color)]'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent`}
                    name="username"
                    value={user.username}
                    onChange={handleInputsChange}
                    placeholder={t('enterUsername')}
                    onFocus={() => setActiveInput('username')}
                    onBlur={() => setActiveInput(null)}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                )}
              </div>
              
              {/* Password field */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">
                    {isRTL ? "كلمة المرور" : "Password"}
                  </label>
                </div>
                <div 
                  className={`relative ${shake ? 'animate-shake' : ''}`}
                >
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaLock className="text-[var(--foreground-secondary)] text-sm" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full py-3 pl-10 pr-12 text-base text-[var(--foreground)] bg-[var(--card-bg)] border ${
                      errors.password ? 'border-red-500' : activeInput === 'password' ? 'border-[var(--primary)]' : 'border-[var(--border-color)]'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent`}
                    name="password"
                    value={user.password}
                    onChange={handleInputsChange}
                    placeholder={t('enterPassword')}
                    onFocus={() => setActiveInput('password')}
                    onBlur={() => setActiveInput(null)}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-colors"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-sm sm:text-base" />
                    ) : (
                      <FaEye className="text-sm sm:text-base" />
                    )}
                  </button>
                </div>
                <div className="flex justify-between mt-2">
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password}</p>
                  )}
                  <Link href="/auth/reset" className="text-sm text-[var(--primary)] hover:text-[var(--primary-light)] ml-auto">
                    {t('forgotPassword')}
                  </Link>
                </div>
              </div>
              
              {/* Role selection with improved design */}
              <div>
                <label className="block mb-2 text-sm font-medium text-[var(--foreground)]">
                  {isRTL ? "نوع الحساب" : "Account Type"}
                </label>
                <RadioGroup
                  aria-labelledby="user-role-group"
                  name="user-role"
                  value={role}
                  onChange={handleRoleChange}
                  className="flex p-1 bg-[var(--background-secondary)] rounded-lg"
                  row
                >
                  <FormControlLabel
                    value="admin"
                    control={
                      <Radio 
                        sx={{
                          '&.Mui-checked': { color: 'var(--primary)' },
                          padding: { xs: '6px', sm: '8px' },
                          '& .MuiSvgIcon-root': {
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                          },
                        }}
                      />
                    }
                    label={
                      <div className="flex items-center gap-2">
                        <FaUserTie className={`text-base ${role === 'admin' ? 'text-[var(--primary)]' : 'text-[var(--foreground-secondary)]'}`} />
                        <span className={`text-sm text-[var(--foreground)] ${role === 'admin' ? 'font-medium' : ''}`}>
                          {isRTL ? "مسؤول" : "Admin"}
                        </span>
                      </div>
                    }
                    className={`flex-1 m-0 ${role === 'admin' ? 'bg-[var(--card-bg)] shadow-sm rounded-lg' : ''}`}
                    sx={{
                      margin: 0,
                      padding: { xs: '2px 8px 2px 4px', sm: '4px 10px 4px 6px' },
                      borderRadius: '6px',
                      justifyContent: 'center',
                    }}
                  />
                  <FormControlLabel
                    value="instructor"
                    control={
                      <Radio 
                        sx={{
                          '&.Mui-checked': { color: 'var(--primary)' },
                          padding: { xs: '6px', sm: '8px' },
                          '& .MuiSvgIcon-root': {
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                          },
                        }}
                      />
                    }
                    label={
                      <div className="flex items-center gap-2">
                        <FaUserGraduate className={`text-base ${role === 'instructor' ? 'text-[var(--primary)]' : 'text-[var(--foreground-secondary)]'}`} />
                        <span className={`text-sm text-[var(--foreground)] ${role === 'instructor' ? 'font-medium' : ''}`}>
                          {isRTL ? "محاضر" : "Instructor"}
                        </span>
                      </div>
                    }
                    className={`flex-1 m-0 ${role === 'instructor' ? 'bg-[var(--card-bg)] shadow-sm rounded-lg' : ''}`}
                    sx={{
                      margin: 0,
                      padding: { xs: '2px 8px 2px 4px', sm: '4px 10px 4px 6px' },
                      borderRadius: '6px',
                      justifyContent: 'center',
                    }}
                  />
                </RadioGroup>
              </div>
              
              {/* Remember me */}
              <div className="flex items-center py-1">
                <Checkbox 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: "var(--foreground-secondary)",
                    '&.Mui-checked': { color: "var(--primary)" },
                    padding: "0",
                    marginRight: "8px",
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.2rem', sm: '1.5rem' },
                    },
                  }}
                />
                <label className="text-sm text-[var(--foreground-secondary)]">
                  {t('rememberMe')}
                </label>
              </div>
              
              {/* Login button */}
              <motion.button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 bg-[var(--primary)] text-white text-base font-medium rounded-lg transition duration-200 hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm sm:text-base">{t('loggingIn')}</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FaSignInAlt className="mr-2 text-sm sm:text-base" />
                    <span className="text-sm sm:text-base">{t('login')}</span>
                  </div>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        {/* Right panel - Image (hidden on mobile) */}
        <motion.div 
          className="hidden md:block w-1/2 relative overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 50 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="absolute inset-0">
            <Image
              src="/images/login2.jpg"
              alt="Login Background"
              fill
              sizes="50vw"
              priority
              className="object-cover"
              style={{
                filter: `grayscale(var(--image-grayscale)) opacity(var(--image-opacity))`
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
