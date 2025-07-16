import React from 'react';

interface CobiLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CobiLogo({ size = 'md', className = '' }: CobiLogoProps) {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${dimensions[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Dégradés pour les formes géométriques */}
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        
        {/* Formes géométriques 3D superposées */}
        {/* Cube principal (fond) */}
        <path
          d="M30 25 L50 15 L70 25 L70 45 L50 55 L30 45 Z"
          fill="url(#grad1)"
          opacity="0.9"
        />
        
        {/* Face avant du cube */}
        <path
          d="M30 25 L50 15 L50 35 L30 45 Z"
          fill="url(#grad2)"
          opacity="0.8"
        />
        
        {/* Face droite du cube */}
        <path
          d="M50 15 L70 25 L70 45 L50 35 Z"
          fill="url(#grad3)"
          opacity="0.7"
        />
        
        {/* Forme géométrique secondaire (overlay) */}
        <path
          d="M20 35 L40 25 L60 35 L60 55 L40 65 L20 55 Z"
          fill="url(#grad4)"
          opacity="0.6"
        />
        
        {/* Petit accent géométrique */}
        <path
          d="M60 20 L75 15 L85 25 L85 35 L75 40 L60 35 Z"
          fill="url(#grad2)"
          opacity="0.8"
        />
        
        {/* Reflets pour l'effet 3D */}
        <path
          d="M32 27 L48 17 L48 20 L32 30 Z"
          fill="white"
          opacity="0.3"
        />
        
        <path
          d="M52 17 L68 27 L68 30 L52 20 Z"
          fill="white"
          opacity="0.2"
        />
        
        {/* Ombres pour la profondeur */}
        <path
          d="M30 45 L50 55 L50 58 L30 48 Z"
          fill="black"
          opacity="0.1"
        />
        
        <path
          d="M50 55 L70 45 L70 48 L50 58 Z"
          fill="black"
          opacity="0.15"
        />
      </svg>
    </div>
  );
} 