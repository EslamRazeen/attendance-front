"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";
import { FaHome, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

const DashboardPath = () => {
  const pathname = usePathname();
  
  // Skip the first empty string from the split
  const pathSegments = pathname.split('/').filter(segment => segment);
  
  // Create breadcrumb items with proper paths
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    return {
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      path
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <div className="flex items-center text-sm">
        <Link 
          href="/dashboard" 
          className="text-[#7950f2] hover:text-[#9775fa] transition-colors flex items-center"
        >
          <FaHome className="mr-1" />
          <span>Home</span>
        </Link>
        
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={index}>
            <FaChevronRight className="mx-2 text-gray-500 text-xs" />
            
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-400">{breadcrumb.name}</span>
            ) : (
              <Link 
                href={breadcrumb.path} 
                className="text-[#7950f2] hover:text-[#9775fa] transition-colors"
              >
                {breadcrumb.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};

export default DashboardPath; 