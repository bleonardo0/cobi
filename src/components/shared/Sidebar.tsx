'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CobiLogo from './CobiLogo';

interface SidebarProps {
  userRole: 'admin' | 'restaurateur';
  restaurantName?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ userRole, restaurantName, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détection mobile avec un hook useEffect pour éviter les problèmes SSR
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    { href: '/insights', label: 'Statistiques', icon: '📈' },
    { href: '/restaurant/settings', label: 'Paramètres', icon: '⚙️' },
    { href: '/restaurant/feedback', label: 'Nous contacter', icon: '💬' },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : restaurantNavItems;

  const SidebarContent = () => (
    <motion.div
      initial={false}
      animate={isCollapsed ? { width: '80px' } : { width: '320px' }}
      className="h-full bg-white border-r border-neutral-200 shadow-soft flex flex-col"
    >
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-neutral-200">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <motion.div
            initial={false}
            animate={isCollapsed ? { opacity: 0 } : { opacity: 1 }}
            className="flex items-center space-x-3"
          >
            <CobiLogo size="md" className="lg:w-10 lg:h-10 shadow-soft" />
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-neutral-900">COBI</h1>
              <p className="text-xs lg:text-sm text-neutral-500 truncate">
                {userRole === 'admin' ? 'Admin Panel' : restaurantName || 'Restaurant'}
              </p>
            </div>
          </motion.div>
          
          {/* Bouton collapse seulement sur desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:block p-2 rounded-lg hover:bg-neutral-100 transition-colors ${isCollapsed ? 'absolute right-4 top-4' : ''}`}
          >
            <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>

          {/* Bouton fermer sur mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-6 space-y-1 lg:space-y-2 overflow-y-auto">
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
                <span className="text-lg lg:text-xl flex-shrink-0">{item.icon}</span>
                <motion.span
                  initial={false}
                  animate={isCollapsed ? { opacity: 0, width: 0 } : { opacity: 1, width: 'auto' }}
                  className="font-medium text-sm lg:text-base whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 lg:p-4 border-t border-neutral-200">
        <motion.div
          initial={false}
          animate={isCollapsed ? { opacity: 0 } : { opacity: 1 }}
          className="text-center"
        >
          <p className="text-xs text-neutral-500">
            © 2025 COBI Platform
          </p>
        </motion.div>
      </div>
    </motion.div>
  );

  // Rendu mobile avec overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 h-full z-50 w-80 max-w-[90vw] lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Rendu desktop - sidebar fixe
  return (
    <div className={`hidden lg:block fixed left-0 top-0 h-full z-30 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-80'}`}>
      <SidebarContent />
    </div>
  );
} 