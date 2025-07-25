'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import FloatingActionButton from './FloatingActionButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'restaurateur';
  userName?: string;
  restaurantName?: string;
  restaurantSlug?: string;
  topBarActions?: React.ReactNode;
  className?: string;
  showFloatingButton?: boolean;
}

export default function DashboardLayout({
  children,
  userRole,
  userName,
  restaurantName,
  restaurantSlug,
  topBarActions,
  className = '',
  showFloatingButton = true
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        userRole={userRole} 
        restaurantName={restaurantName}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Top Bar */}
        <TopBar
          userRole={userRole}
          userName={userName}
          restaurantName={restaurantName}
          actions={topBarActions}
          onToggleSidebar={toggleSidebar}
        />

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`p-4 lg:p-6 ${className}`}
        >
          {children}
        </motion.main>
      </div>

      {/* Floating Action Button */}
      {showFloatingButton && <FloatingActionButton userRole={userRole} />}
    </div>
  );
} 