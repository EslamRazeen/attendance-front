'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        
        if (!token) {
          // إذا لم يكن هناك توكن، قم بتوجيه المستخدم إلى صفحة تسجيل الدخول
          router.replace('/auth/login');
          return false;
        }
        
        // إذا كانت الصفحة تتطلب صلاحيات المدير، تحقق من ذلك
        if (adminOnly && !isAdmin) {
          router.replace('/dashboard/doctor'); // توجيه المستخدم إلى لوحة تحكم المحاضر
          return false;
        }
        
        return true;
      }
      return false;
    };

    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
    setIsLoading(false);
  }, [router, adminOnly]);

  // عرض شاشة التحميل أثناء التحقق من حالة تسجيل الدخول
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // عرض المحتوى فقط إذا كان المستخدم مصرح له
  return isAuthenticated ? children : null;
} 