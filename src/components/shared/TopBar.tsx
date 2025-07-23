'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { useDashboardLanguage } from '@/contexts/DashboardLanguageContext';
// import DarkModeToggle from './DarkModeToggle';

interface TopBarProps {
  userRole: 'admin' | 'restaurateur';
  userName?: string;
  restaurantName?: string;
  actions?: React.ReactNode;
  onToggleSidebar?: () => void;
}

export default function TopBar({ 
  userRole, 
  userName, 
  restaurantName, 
  actions,
  onToggleSidebar 
}: TopBarProps) {
  const { t, language } = useDashboardLanguage();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'fr') {
      if (hour < 12) return 'Bonjour';
      if (hour < 18) return 'Bon après-midi';
      return 'Bonsoir';
    } else {
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    }
  };

  const getWelcomeMessage = () => {
    if (userRole === 'admin') {
      return `${getGreeting()}, ${userName || 'Admin'}`;
    }
    return `${getGreeting()}, ${restaurantName || 'Restaurant'}`;
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-neutral-200 shadow-soft sticky top-0 z-30"
    >
      <div className="px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Mobile menu button and Welcome Message */}
          <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0">
            {/* Mobile menu button */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
              >
                <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            {/* Welcome Message */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="min-w-0 flex-1"
            >
              <h1 className="text-lg lg:text-2xl font-semibold text-neutral-900 truncate">
                {getWelcomeMessage()}
              </h1>
              <p className="text-xs lg:text-sm text-neutral-500 mt-1 hidden sm:block">
                {userRole === 'admin' 
                  ? (language === 'fr' ? 'Gérez vos restaurants et modèles 3D' : 'Manage your restaurants and 3D models')
                  : (language === 'fr' ? 'Gérez votre menu et vos modèles 3D' : 'Manage your menu and 3D models')
                }
              </p>
            </motion.div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            {/* Custom Actions */}
            {actions && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-2 lg:space-x-3"
              >
                {actions}
              </motion.div>
            )}

            {/* Notifications */}
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-warning-500 rounded-full"></span>
            </motion.button>

            {/* User Menu */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-neutral-700">
                    {userRole === 'admin' ? 'Admin' : restaurantName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {userRole === 'admin' 
                      ? (language === 'fr' ? 'Administrateur' : 'Administrator')
                      : (language === 'fr' ? 'Restaurateur' : 'Restaurant Owner')
                    }
                  </p>
                </div>
                
                {/* Clerk UserButton */}
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: {
                        width: '40px',
                        height: '40px'
                      }
                    }
                  }}
                  afterSignOutUrl="/sign-in"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
} 