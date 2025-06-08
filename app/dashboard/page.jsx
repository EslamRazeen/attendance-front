'use client';

import React, { useEffect } from "react";
import DashHome from "./admin/home/page";
import ProtectedRoute from "@/app/components/layout/ProtectedRoute";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  
  useEffect(() => {
    // التحقق من صلاحيات المدير
    if (typeof window !== 'undefined') {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      if (!isAdmin) {
        router.replace('/dashboard/doctor'); // توجيه المستخدم إلى لوحة تحكم المحاضر
      }
    }
  }, [router]);

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="dashboard">
        <DashHome />
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
