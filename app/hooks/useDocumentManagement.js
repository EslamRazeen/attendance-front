import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
  useGetUploadedDataQuery,
  useSaveEditedDataMutation,
  useUploadDocumentMutation
} from '@/app/store/features/documentsApiSlice';

export const useDocumentManagement = () => {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Get data from redux store
  const uploadedData = useSelector((state) => state.dataUpload);
  
  // RTK Query hooks
  const { data: uploadedDataFromApi, isLoading: isLoadingData } = useGetUploadedDataQuery();
  const [saveEditedData, { isLoading: isSaving }] = useSaveEditedDataMutation();
  const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
  
  // Derived state
  const hasData = Array.isArray(uploadedData) && uploadedData.length > 0;
  
  // Calculate filtered data based on search term and filter
  const filteredData = useCallback(() => {
    if (!hasData) return [];
    
    return uploadedData.filter(item => {
      // Apply text search
      const matchesSearch = 
        !searchTerm || 
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.department && item.department.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Apply filter
      const matchesFilter = 
        selectedFilter === "all" || 
        (item.department && item.department.toLowerCase() === selectedFilter) ||
        (item.level && item.level.toString() === selectedFilter);
      
      return matchesSearch && matchesFilter;
    });
  }, [uploadedData, searchTerm, selectedFilter, hasData]);
  
  // Handle document upload
  const handleUpload = async (file) => {
    if (!file) return { success: false, error: "No file selected" };
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const result = await uploadDocument(formData).unwrap();
      setSuccess("Document uploaded successfully");
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.data?.message || "Failed to upload document";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle save
  const handleSave = async (data) => {
    if (!data) return { success: false, error: "No data to save" };
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await saveEditedData(data).unwrap();
      setSuccess("Data saved successfully");
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.data?.message || "Failed to save data";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset state
  const resetState = () => {
    setSearchTerm("");
    setSelectedFilter("all");
    setError(null);
    setSuccess(null);
  };
  
  // Return values and functions
  return {
    // State
    searchTerm,
    selectedFilter,
    isLoading: isLoading || isLoadingData || isSaving || isUploading,
    error,
    success,
    hasData,
    
    // Data
    uploadedData,
    filteredData: filteredData(),
    
    // Actions
    setSearchTerm,
    setSelectedFilter,
    handleUpload,
    handleSave,
    resetState,
  };
}; 