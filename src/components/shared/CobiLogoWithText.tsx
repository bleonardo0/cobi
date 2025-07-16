import React from 'react';
import CobiLogo from './CobiLogo';

interface CobiLogoWithTextProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CobiLogoWithText({ size = 'md', className = '' }: CobiLogoWithTextProps) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const logoSizes = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <CobiLogo size={logoSizes[size]} />
      <h1 className={`${textSizes[size]} font-bold text-slate-700`}>
        Cobi
      </h1>
    </div>
  );
} 