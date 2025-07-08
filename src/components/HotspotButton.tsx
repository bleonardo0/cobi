'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

interface HotspotButtonProps {
  type: 'allergens' | 'traceability' | 'pairings' | 'rating' | 'share';
  position: { x: number; y: number; z: number };
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export default function HotspotButton({ 
  type, 
  position, 
  onClick, 
  className = '',
  disabled = false 
}: HotspotButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getHotspotConfig = () => {
    switch (type) {
      case 'allergens':
        return {
          icon: '⚠️',
          label: 'Allergènes',
          color: 'bg-red-500 hover:bg-red-600',
          borderColor: 'border-red-400',
          textColor: 'text-red-700'
        };
      case 'traceability':
        return {
          icon: '📍',
          label: 'Traçabilité',
          color: 'bg-green-500 hover:bg-green-600',
          borderColor: 'border-green-400',
          textColor: 'text-green-700'
        };
      case 'pairings':
        return {
          icon: '🍷',
          label: 'Accords',
          color: 'bg-purple-500 hover:bg-purple-600',
          borderColor: 'border-purple-400',
          textColor: 'text-purple-700'
        };
      case 'rating':
        return {
          icon: '⭐',
          label: 'Noter',
          color: 'bg-yellow-500 hover:bg-yellow-600',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-700'
        };
      case 'share':
        return {
          icon: '📲',
          label: 'Partager',
          color: 'bg-blue-500 hover:bg-blue-600',
          borderColor: 'border-blue-400',
          textColor: 'text-blue-700'
        };
      default:
        return {
          icon: '❓',
          label: 'Hotspot',
          color: 'bg-gray-500 hover:bg-gray-600',
          borderColor: 'border-gray-400',
          textColor: 'text-gray-700'
        };
    }
  };

  const config = getHotspotConfig();

  const handleClick = () => {
    if (disabled) return;
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'hotspot_click',
        type: type,
        position: position
      });
    }
    
    // Vibration pour accessibilité sur mobile
    if (type === 'allergens' && navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    onClick();
  };

  return (
    <motion.button
      className={`
        absolute z-20 flex items-center justify-center
        w-10 h-10 rounded-full shadow-lg
        ${config.color} text-white
        border-2 ${config.borderColor}
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      animate={{
        scale: isHovered ? 1.05 : 1,
        boxShadow: isHovered 
          ? '0 8px 25px rgba(0, 0, 0, 0.3)' 
          : '0 4px 15px rgba(0, 0, 0, 0.2)'
      }}
      aria-label={`${config.label} - ${type === 'allergens' ? 'Informations sur les allergènes' : 
                    type === 'traceability' ? 'Informations sur la traçabilité' :
                    type === 'pairings' ? 'Voir les accords mets-boissons' :
                    type === 'rating' ? 'Noter ce plat' :
                    type === 'share' ? 'Partager ce plat' : 'Hotspot'}`}
    >
      <span className="text-lg">{config.icon}</span>
      
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`
              absolute -top-12 left-1/2 transform -translate-x-1/2
              px-3 py-1 rounded-lg text-sm font-medium
              bg-gray-900 text-white whitespace-nowrap
              shadow-lg z-30
            `}
          >
            {config.label}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
} 