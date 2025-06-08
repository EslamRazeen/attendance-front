"use client";
import { useAddStudentsSheetMutation } from "@/app/store/features/attendanceApiSlice";
import { setData } from "@/app/store/slices/dataUploadReducer";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { FaUpload, FaSave, FaArrowLeft, FaFilter, FaTable } from "react-icons/fa";
import { IoCloudUpload, IoCheckmarkCircle, IoWarning, IoInformationCircle } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { LEVELS, DEPARTMENTS, isValidLevel, isValidDepartment } from "@/app/hooks/constants";

const DocumentUpload = () => {
  const [isRendered, setIsRendered] = useState(false);
  const fileInputRef = useRef(null);
  const uploadedData = useSelector((state) => state.dataUpload);
  const [addStudentsSheet] = useAddStudentsSheetMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  // State variables
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', or null
  const [statusMessage, setStatusMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  // Check if data exists
  const hasData = Array.isArray(uploadedData) && uploadedData.length > 0;

  useEffect(() => {
    setIsRendered(true);
  }, []);

  // Helper function for status messages
  const showStatusMessage = useCallback((status, message, duration = 3000) => {
    setUploadStatus(status);
    setStatusMessage(message);
    
    setTimeout(() => {
      setUploadStatus(null);
      setStatusMessage('');
    }, duration);
  }, []);

  // Format file size helper
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if filters are selected
  const areFiltersSelected = useCallback(() => {
    if (!selectedLevel || !selectedDepartment) {
      showStatusMessage("error", "Please select level and department before proceeding");
      return false;
    }
    return true;
  }, [selectedLevel, selectedDepartment, showStatusMessage]);

  // Validate the structure of Excel data
  const validateExcelColumns = (jsonData) => {
    const errors = [];
    
    // Check if data is empty
    if (jsonData.length === 0) {
      errors.push("The Excel file is empty. Please upload a file with data.");
      return errors;
    }
    
    // Validate required columns
    const requiredColumns = ['name', 'email', 'department', 'level'];
    const firstRow = jsonData[0];
    const headers = Object.keys(firstRow).map(key => key.toLowerCase());
    
    const missingColumns = requiredColumns.filter(col => 
      !headers.includes(col.toLowerCase())
    );
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    return errors;
  };

  // Validate the content of Excel data
  const validateExcelContent = (jsonData) => {
    const errors = [];
    
    // Validate data format for each row
    jsonData.forEach((row, index) => {
      // Email validation
      const emailKey = Object.keys(row).find(key => key.toLowerCase() === 'email');
      if (emailKey && row[emailKey]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row[emailKey])) {
          errors.push(`Invalid email format in row ${index + 1}: ${row[emailKey]}`);
        }
      }
      
      // Level validation
      const levelKey = Object.keys(row).find(key => key.toLowerCase() === 'level');
      if (levelKey && row[levelKey]) {
        const level = row[levelKey].toString();
        if (!isValidLevel(level)) {
          errors.push(`Invalid level in row ${index + 1}: ${level}. Must be one of: ${LEVELS.join(', ')}.`);
        }
      }
      
      // Department validation
      const deptKey = Object.keys(row).find(key => key.toLowerCase() === 'department');
      if (deptKey && row[deptKey]) {
        const dept = row[deptKey].toString().toUpperCase();
        if (!isValidDepartment(dept)) {
          errors.push(`Invalid department in row ${index + 1}: ${dept}. Must be one of: ${DEPARTMENTS.join(', ')}.`);
        }
      }
    });
    
    return errors;
  };

  // Combined validation function
  const validateExcelData = (jsonData) => {
    const structureErrors = validateExcelColumns(jsonData);
    if (structureErrors.length > 0) return structureErrors;
    
    const contentErrors = validateExcelContent(jsonData);
    
    // Limit the number of errors shown
    if (contentErrors.length > 5) {
      const remainingErrors = contentErrors.length - 5;
      return [...contentErrors.slice(0, 5), `... and ${remainingErrors} more errors`];
    }
    
    return contentErrors;
  };

  // Check if data matches selected filters
  const validateFiltersMatch = (jsonData) => {
    return !jsonData.some(row => {
      const rowLevel = (row.level || row.Level || row.LEVEL || '').toString();
      const rowDept = (row.department || row.Department || row.DEPARTMENT || '').toString().toUpperCase();
      return (rowLevel && rowLevel !== selectedLevel) || (rowDept && rowDept !== selectedDepartment);
    });
  };

  // Add missing level or department if needed
  const addMissingColumns = (jsonData) => {
    const hasLevel = jsonData.length > 0 && Object.keys(jsonData[0]).some(key => key.toLowerCase() === 'level');
    const hasDepartment = jsonData.length > 0 && Object.keys(jsonData[0]).some(key => key.toLowerCase() === 'department');

    return jsonData.map(row => {
      const newRow = { ...row };
      if (!hasLevel && selectedLevel) {
        newRow['level'] = selectedLevel;
      }
      if (!hasDepartment && selectedDepartment) {
        newRow['department'] = selectedDepartment;
      }
      return newRow;
    });
  };

  // Handle file upload click
  const handleUploadClick = (e) => {
    e.preventDefault();
    if (!areFiltersSelected()) return;
    fileInputRef.current?.click();
  };

  // Process Excel file
  const processExcelFile = (file) => {
    // Update file info
    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setIsUploading(true);
    setValidationErrors([]);
    
    // Check file extension
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setIsUploading(false);
      showStatusMessage("error", "Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Parse Excel data
        const binaryStr = e.target?.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let jsonData = XLSX.utils.sheet_to_json(sheet);

        // Validate filters match
        if (!validateFiltersMatch(jsonData)) {
          setIsUploading(false);
          showStatusMessage("error", "All rows in the sheet must have the same level and department as selected in the filters.", 4000);
          return;
        }

        // Add missing columns if needed
        jsonData = addMissingColumns(jsonData);

        // Validate the data
        const errors = validateExcelData(jsonData);
        
        if (errors.length > 0) {
          setValidationErrors(errors);
          setIsUploading(false);
          showStatusMessage("error", "Validation errors found in the Excel file");
          return;
        }

        // Store in Redux
        dispatch(setData(jsonData));
        setIsUploading(false);
        showStatusMessage("success", "File uploaded successfully!");
      } catch (error) {
        console.error("Error processing file:", error);
        setIsUploading(false);
        showStatusMessage("error", "Failed to process Excel file. Please check the file format.");
      }
    };

    reader.readAsBinaryString(file);
  };

  // Event handlers
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processExcelFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const handleFileSave = async () => {
    // Check if we have data to save
    if (!hasData) {
      showStatusMessage("error", "No data to save. Please upload an Excel file first.");
      return;
    }

    // Check if filters are selected
    if (!areFiltersSelected()) return;
    
    setIsUploading(true);
    
    try {
      await addStudentsSheet(uploadedData).unwrap();
      setIsUploading(false);
      showStatusMessage("success", "Data saved successfully to the database!");
    } catch (error) {
      console.error("Error saving data:", error);
      setIsUploading(false);
      showStatusMessage("error", "Failed to save data to the database. Please try again.");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const filterItemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300 }
    }
  };

  // Render components for different upload states
  const renderUploadAreaContent = () => {
    if (isUploading) {
      return (
        <div className="flex flex-col items-center">
          <motion.div
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-300 text-lg font-medium">Processing file...</p>
        </div>
      );
    } 
    
    if (uploadStatus === 'success') {
      return (
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <IoCheckmarkCircle className="text-green-500 text-6xl mb-4" />
          </motion.div>
          <p className="text-green-400 text-lg font-medium">{statusMessage || "File uploaded successfully!"}</p>
          {fileName && (
            <p className="text-gray-400 mt-2">{fileName} ({fileSize})</p>
          )}
        </div>
      );
    } 
    
    if (uploadStatus === 'error') {
      return (
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <IoWarning className="text-red-500 text-6xl mb-4" />
          </motion.div>
          <p className="text-red-400 text-lg font-medium">{statusMessage || "Error uploading file"}</p>
          <p className="text-gray-400 mt-2">Please try again with a valid Excel file</p>
        </div>
      );
    } 
    
    if (uploadStatus === 'warning') {
      return (
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <IoInformationCircle className="text-amber-500 text-6xl mb-4" />
          </motion.div>
          <p className="text-amber-400 text-lg font-medium">{statusMessage}</p>
        </div>
      );
    }
    
    return (
      <>
        <IoCloudUpload className="text-blue-400 text-6xl mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          {fileName ? fileName : "Drag & Drop Excel File Here"}
        </h3>
        {fileSize && <p className="text-gray-400 mb-4">File size: {fileSize}</p>}
        <p className="text-gray-400 mb-6">
          or
        </p>
        <motion.button
          onClick={handleUploadClick}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md shadow-blue-500/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaUpload />
          Browse Files
        </motion.button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx, .xls"
          className="hidden"
        />
        <p className="text-gray-500 text-sm mt-4">
          Supported formats: .xlsx, .xls
        </p>
      </>
    );
  };

  if (!isRendered) {
    return null;
  }

  return (
    <motion.div 
      className="p-6 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="mb-8 flex items-center"
        variants={itemVariants}
      >
        <motion.button
          onClick={() => router.push('/dashboard/admin/document')}
          className="mr-4 p-2 rounded-full bg-[#1a1f2e] hover:bg-[#2a2f3e] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowLeft className="text-gray-400" />
        </motion.button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Upload Excel Sheet
          </h1>
          <p className="text-gray-400">
            Upload student data via Excel spreadsheets for batch processing
          </p>
        </div>
      </motion.div>

      {/* Status Messages */}
      <AnimatePresence>
        {uploadStatus && (
          <motion.div 
            className={`mb-6 ${
              uploadStatus === "success" 
                ? "bg-green-500/20 border-green-500/30 text-green-200" 
                : "bg-red-500/20 border-red-500/30 text-red-200"
            } border px-4 py-3 rounded-lg flex items-center gap-3`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {uploadStatus === "success" ? (
              <IoCheckmarkCircle className="text-green-500 text-xl flex-shrink-0" />
            ) : (
              <IoWarning className="text-red-500 text-xl flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">{uploadStatus === "success" ? "Success" : "Error"}</p>
              <p className="text-sm">{statusMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Errors */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div 
            className="mb-6 bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <IoWarning className="text-red-500 text-xl flex-shrink-0" />
              <p className="font-medium">Validation Errors</p>
            </div>
            <ul className="list-disc pl-10 space-y-1 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Upload Area */}
        <motion.div 
          className="w-full lg:w-3/5"
          variants={itemVariants}
        >
          <motion.div
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center min-h-[300px] transition-all ${
              isDragging 
                ? 'border-blue-500 bg-blue-500/10' 
                : uploadStatus === 'success'
                ? 'border-green-500 bg-green-500/10'
                : uploadStatus === 'error'
                ? 'border-red-500 bg-red-500/10'
                : uploadStatus === 'warning'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-gray-600 hover:border-blue-500/50 hover:bg-[#1a1f2e]'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            variants={itemVariants}
            animate={
              isDragging 
                ? { scale: 1.02, borderColor: "#3b82f6" } 
                : uploadStatus === 'success'
                ? { scale: 1, borderColor: "#22c55e" }
                : uploadStatus === 'error'
                ? { scale: 1, borderColor: "#ef4444" }
                : uploadStatus === 'warning'
                ? { scale: 1, borderColor: "#f59e0b" }
                : { scale: 1, borderColor: "#4b5563" }
            }
          >
            {renderUploadAreaContent()}
          </motion.div>

          {/* File Preview */}
          {hasData && (
            <motion.div
              className="mt-8 bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] overflow-hidden"
              variants={itemVariants}
            >
              <div className="p-4 border-b border-[#2a2f3e] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaTable className="text-blue-400" />
                  <h3 className="text-white font-medium">Data Preview</h3>
                </div>
                <div className="text-gray-400 text-sm">
                  {uploadedData.length} rows
                </div>
              </div>
              <div className="p-4 overflow-x-auto max-h-[300px] custom-scrollbar">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-[#2a2f3e]">
                      {Object.keys(uploadedData[0]).map((header, index) => (
                        <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-[#1a1f2e]' : 'bg-[#232738]'}>
                        {Object.values(row).map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-3 text-sm text-gray-300">
                            {cell?.toString() || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {uploadedData.length > 5 && (
                      <tr>
                        <td colSpan={Object.keys(uploadedData[0]).length} className="px-4 py-3 text-center text-sm text-gray-400">
                          + {uploadedData.length - 5} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Right Column - Filters and Actions */}
        <motion.div 
          className="w-full lg:w-2/5 space-y-6"
          variants={itemVariants}
        >
          {/* Filters Section */}
          <motion.div 
            className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] p-6"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-6">
              <FaFilter className="text-blue-400" />
              <h3 className="text-white font-semibold">Data Filters</h3>
            </div>

            {/* Level Filter */}
            <div className="mb-6">
              <label className="block text-gray-400 mb-3 text-sm">
                Select Level
              </label>
              <div className="grid grid-cols-4 gap-3">
                {LEVELS.map((level, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedLevel === level
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-[#232738] text-blue-300 hover:bg-[#2a2f3e]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Level {level}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-gray-400 mb-3 text-sm">
                Select Department
              </label>
              <div className="grid grid-cols-4 gap-3">
                {DEPARTMENTS.map((dept) => (
                  <motion.button
                    key={dept}
                    onClick={() => setSelectedDepartment(dept)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedDepartment === dept
                        ? "bg-purple-600 text-white shadow-lg"
                        : "bg-[#232738] text-purple-300 hover:bg-[#2a2f3e]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {dept}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col gap-4"
            variants={itemVariants}
          >
            <motion.button
              onClick={handleFileSave}
              className={`w-full py-3 px-4 ${
                hasData 
                  ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              } rounded-lg flex items-center justify-center gap-3 font-medium shadow-md ${hasData ? 'shadow-green-500/20' : ''}`}
              whileHover={hasData ? { scale: 1.02 } : {}}
              whileTap={hasData ? { scale: 0.98 } : {}}
              disabled={isUploading || !hasData}
            >
              {isUploading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <FaSave className={hasData ? "" : "text-gray-500"} />
              )}
              {isUploading ? 'Saving...' : 'Save Excel Data'}
            </motion.button>
          </motion.div>

          {/* Tips Section */}
          <motion.div 
            className="bg-[#1a1f2e] rounded-xl border border-[#2a2f3e] p-6"
            variants={itemVariants}
          >
            <h3 className="text-white font-semibold mb-4">Tips</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <div className="min-w-[20px] mt-1">•</div>
                <p>Make sure your Excel file has the correct column headers</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-[20px] mt-1">•</div>
                <p>Required columns: name, email, department, level, password</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-[20px] mt-1">•</div>
                <p>Select level and department before saving</p>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DocumentUpload; 