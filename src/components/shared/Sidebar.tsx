'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  userRole: 'admin' | 'restaurateur';
  restaurantName?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ userRole, restaurantName, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/restaurants', label: 'Restaurants', icon: '🍽️' },
    { href: '/admin/models', label: 'Modèles 3D', icon: '🎨' },
    { href: '/admin/users', label: 'Utilisateurs', icon: '👥' },
    { href: '/admin/analytics', label: 'Analytiques', icon: '📊' },
    { href: '/admin/settings', label: 'Paramètres', icon: '⚙️' },
  ];

  const restaurantNavItems = [
    { href: '/restaurant/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: restaurantName ? `/menu/${restaurantName.toLowerCase().replace(/\s+/g, '-')}` : '/menu', label: 'Menu Client', icon: '👁️' },
    { href: '/insights', label: 'Insights', icon: '📈' },
    { href: '/restaurant/settings', label: 'Paramètres', icon: '⚙️' },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : restaurantNavItems;

  const SidebarContent = () => (
    <motion.div
      initial={false}
      animate={isCollapsed ? { width: '80px' } : { width: '280px' }}
      className="h-full bg-white border-r border-neutral-200 shadow-soft flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <motion.div
            initial={false}
            animate={isCollapsed ? { opacity: 0 } : { opacity: 1 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-soft">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">COBI</h1>
              <p className="text-sm text-neutral-500">
                {userRole === 'admin' ? 'Admin Panel' : restaurantName}
              </p>
            </div>
          </motion.div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-100 text-primary-700 shadow-soft' 
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <motion.span
                  initial={false}
                  animate={isCollapsed ? { opacity: 0, width: 0 } : { opacity: 1, width: 'auto' }}
                  className="font-medium text-sm whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200">
        <motion.div
          initial={false}
          animate={isCollapsed ? { opacity: 0 } : { opacity: 1 }}
          className="text-center"
        >
          <p className="text-xs text-neutral-500">
            © 2024 COBI Platform
          </p>
        </motion.div>
      </div>
    </motion.div>
  );

  // Mobile overlay
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 h-full z-50 w-80"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar - toujours visible
  return (
    <div className="fixed left-0 top-0 h-full z-30 w-80">
      <SidebarContent />
    </div>
  );
} 