import React from "react";
import { motion } from "framer-motion";
import { FaBuilding, FaUserTie } from "react-icons/fa";

const ProfessionalInfo = ({ 
  newUser, 
  errors, 
  formSubmitted, 
  pageVariants, 
  handleDepartmentSelect, 
  handleRoleSelect, 
  departments,
  roles
}) => {
  return (
    <motion.div
      key="step2"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.4 }}
      className="py-6"
    >
      <h2 className="text-2xl font-semibold text-white mb-8 flex items-center">
        <span className="bg-purple-600/20 text-purple-400 p-2 rounded-lg mr-3">2</span>
        Professional Information
      </h2>
      
      <div className="space-y-10">
        {/* Department */}
        <motion.div 
          className="form-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-gray-300 mb-3 text-lg font-medium flex items-center">
            <FaBuilding className="mr-2 text-blue-400" />
            Department
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {departments.map((dept, index) => (
              <motion.button
                key={dept}
                onClick={() => handleDepartmentSelect(dept)}
                className={`py-4 px-3 rounded-lg ${
                  newUser.lecturerDepartment === dept
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'bg-[#1a1f2e] text-gray-300 hover:bg-[#2a2f3e] border border-[#2a2f3e] hover:border-blue-500/30'
                } transition-all flex flex-col items-center gap-2`}
                whileHover={{ scale: 1.03, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  newUser.lecturerDepartment === dept
                    ? 'bg-white/20'
                    : 'bg-[#2a2f3e]'
                }`}>
                  {dept === "CS" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${newUser.lecturerDepartment === dept ? 'text-white' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                    </svg>
                  )}
                  {dept === "IS" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${newUser.lecturerDepartment === dept ? 'text-white' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm12 0H5v10h10V5z" clipRule="evenodd" />
                      <path d="M4 12h12v2H4v-2z" />
                      <path d="M4 9h12v2H4V9z" />
                      <path d="M4 6h12v2H4V6z" />
                    </svg>
                  )}
                  {dept === "AI" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${newUser.lecturerDepartment === dept ? 'text-white' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
                    </svg>
                  )}
                  {dept === "BIO" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${newUser.lecturerDepartment === dept ? 'text-white' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{dept}</span>
                {newUser.lecturerDepartment === dept && (
                  <motion.div 
                    className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
          {errors.lecturerDepartment && formSubmitted && (
            <motion.p 
              className="text-red-500 text-sm mt-2 flex items-center justify-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.lecturerDepartment}
            </motion.p>
          )}
        </motion.div>
        
        {/* Role */}
        <motion.div 
          className="form-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-gray-300 mb-3 text-lg font-medium flex items-center">
            <FaUserTie className="mr-2 text-purple-400" />
            Academic Role
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {roles.map((role, index) => (
              <motion.button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className={`py-5 px-4 rounded-lg relative ${
                  newUser.lecturerRole === role
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-500/20'
                    : 'bg-[#1a1f2e] text-gray-300 hover:bg-[#2a2f3e] border border-[#2a2f3e] hover:border-purple-500/30'
                } transition-all`}
                whileHover={{ scale: 1.03, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    newUser.lecturerRole === role
                      ? 'bg-white/20'
                      : 'bg-[#2a2f3e]'
                  }`}>
                    {role === "instructor" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${newUser.lecturerRole === role ? 'text-white' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4L3 9L12 14L21 9L12 4Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9V14.5L12 19.5L21 14.5V9" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 11.5V16" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16L17 16.5C17 17.6046 14.7614 18.5 12 18.5C9.23858 18.5 7 17.6046 7 16.5V16" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${newUser.lecturerRole === role ? 'text-white' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7H17" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12H17" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17H13" />
                      </svg>
                    )}
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-lg capitalize block">{role}</span>
                    <span className="text-xs opacity-70 block mt-1">
                      {role === "instructor" 
                        ? "Professor with teaching & research duties" 
                        : "Teaching assistant supporting professors"}
                    </span>
                  </div>
                </div>
                {newUser.lecturerRole === role && (
                  <motion.div 
                    className="absolute -top-1 -right-1 bg-purple-500 text-white p-1 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
          {errors.lecturerRole && formSubmitted && (
            <motion.p 
              className="text-red-500 text-sm mt-2 flex items-center justify-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.lecturerRole}
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfessionalInfo; 