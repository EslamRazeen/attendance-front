"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/layout/Header";
import { FaUserAlt, FaLock, FaArrowLeft, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";
import { useLanguage } from "@/app/components/providers/LanguageProvider";

export default function PasswordReset() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [shake, setShake] = useState(false);
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({ email: "", general: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { t, isRTL } = useLanguage();
  
  // Animation states
  const [activeInput, setActiveInput] = useState(null);

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = { email: "", general: "" };
    let isValid = true;

    // Simple email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would typically call an API to send a password reset email
      // For now, we'll just simulate a successful response after a delay
      setTimeout(() => {
        setResetSent(true);
        setIsSubmitting(false);
      }, 1500);
    } catch (err) {
      console.error("Password reset error:", err);
      setErrors({
        ...errors,
        general: "Failed to send password reset email. Please try again."
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <Header />
      
      <div className="container mx-auto flex flex-col md:flex-row rounded-xl overflow-hidden shadow-xl max-w-6xl">
        {/* Left panel - Reset form */}
        <motion.div 
          className="w-full md:w-1/2 bg-[var(--card-bg)] p-8 md:p-12"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full max-w-md mx-auto">
            <div className="mb-6">
              <Link href="/auth/login" className="flex items-center text-[var(--foreground-secondary)] hover:text-[var(--primary)] mb-6">
                <FaArrowLeft className="mr-2" />
                <span>Back to Login</span>
              </Link>
              
              <h1 className="text-3xl font-bold text-[var(--foreground)]">
                {resetSent ? "Check Your Email" : "Reset Password"}
              </h1>
              <p className="mt-2 text-[var(--foreground-secondary)]">
                {resetSent 
                  ? "We&apos;ve sent you instructions to reset your password." 
                  : "Enter your email address and we&apos;ll send you instructions to reset your password."}
              </p>
            </div>
            
            {/* Error message */}
            {errors.general && (
              <motion.div 
                className="p-3 mb-6 text-sm text-white bg-red-500 rounded-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {errors.general}
              </motion.div>
            )}
            
            {!resetSent ? (
              <div className="space-y-6">
                {/* Email field */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--foreground)]">
                    Email Address
                  </label>
                  <div 
                    className={`relative ${shake ? 'animate-shake' : ''}`}
                  >
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaEnvelope className="text-[var(--foreground-secondary)]" />
                    </div>
                    <input
                      type="email"
                      className={`w-full py-3 pl-10 pr-4 text-[var(--foreground)] bg-[var(--card-bg)] border ${
                        errors.email ? 'border-red-500' : activeInput === 'email' ? 'border-[var(--primary)]' : 'border-[var(--border-color)]'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent`}
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Enter your email address"
                      onFocus={() => setActiveInput('email')}
                      onBlur={() => setActiveInput(null)}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                
                {/* Submit button */}
                <motion.button
                  onClick={handleResetPassword}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center py-3 px-4 bg-[var(--primary)] text-white font-medium rounded-lg transition duration-200 hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </div>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </motion.button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                  <p>We&apos;ve sent an email to <strong>{email}</strong> with instructions to reset your password.</p>
                </div>
                
                <div className="text-center text-[var(--foreground-secondary)] text-sm">
                  <p>Didn&apos;t receive the email? Check your spam folder or</p>
                  <button 
                    onClick={() => setResetSent(false)} 
                    className="text-[var(--primary)] hover:text-[var(--primary-light)] font-medium"
                  >
                    try again
                  </button>
                </div>
                
                <motion.button
                  onClick={() => router.push('/auth/login')}
                  className="w-full flex items-center justify-center py-3 px-4 bg-[var(--primary)] text-white font-medium rounded-lg transition duration-200 hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Return to Login
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Right panel - Image */}
        <motion.div 
          className="hidden md:block w-1/2 relative overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 50 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="absolute inset-0">
            <Image
              src="/images/reset.jpg"
              alt="Password Reset Background"
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
