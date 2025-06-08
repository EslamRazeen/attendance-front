'use client';

import React, { createContext, useState, useContext, useCallback } from 'react';
import ErrorNotification from '../ui/ErrorNotification';

// إنشاء سياق (context) لإدارة الأخطاء
const ErrorContext = createContext({
  showError: () => {},
  hideError: () => {},
  error: null,
});

// مزود سياق الأخطاء
export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);
  
  // عرض رسالة خطأ
  const showError = useCallback((message, duration = 5000) => {
    setError({ message, duration });
  }, []);
  
  // إخفاء رسالة الخطأ
  const hideError = useCallback(() => {
    setError(null);
  }, []);
  
  return (
    <ErrorContext.Provider value={{ showError, hideError, error }}>
      {children}
      <ErrorNotification
        message={error?.message}
        visible={!!error}
        onClose={hideError}
        duration={error?.duration}
      />
    </ErrorContext.Provider>
  );
};

// هوك (hook) لاستخدام سياق الأخطاء
export const useError = () => {
  const context = useContext(ErrorContext);
  
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  
  return context;
};

export default ErrorProvider; 