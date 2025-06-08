'use client';

import React from "react";
import ProtectedRoute from "@/app/components/layout/ProtectedRoute";
import PageTransition from "@/app/components/layout/PageTransition";
import { AnimatePresence } from "framer-motion";

export default function DoctorLayout({ children }) {
  return (
    <ProtectedRoute>
      <AnimatePresence mode="wait">
        <PageTransition>
          {children}
        </PageTransition>
      </AnimatePresence>
    </ProtectedRoute>
  );
} 