'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface FloatingActionButtonProps {
  userRole: 'admin' | 'restaurateur';
  className?: string;
}

export default function FloatingActionButton({ userRole, className = '' }: FloatingActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Ne pas afficher le bouton pour les admins
  if (userRole === 'admin') {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`fixed bottom-6 right-6 z-50 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href="/upload"
        className="group relative inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden min-w-[200px] border-2 border-white/20 hover:border-white/40"
        style={{ 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
        }}
      >
        {/* Icône */}
        <motion.svg
          className="w-5 h-5 relative z-10 flex-shrink-0 text-white drop-shadow-sm"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isHovered ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </motion.svg>
        
        {/* Texte */}
        <motion.span
          className="font-bold text-sm relative z-10 whitespace-nowrap text-white drop-shadow-sm"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
        >
          Ajouter un plat
        </motion.span>
        
        {/* Effet de vagues au hover */}
        <motion.div
          className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-full"
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Animation de pulse pour attirer l'attention */}
        <motion.div
          className="absolute inset-0 bg-white opacity-15 rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Effet de brillance */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 rounded-full"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />

        {/* Backdrop pour plus de contraste */}
        <div className="absolute inset-0 bg-black/10 rounded-full" />
      </Link>
    </motion.div>
  );
} 