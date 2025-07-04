'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  fallbackHref?: string;
  className?: string;
  title?: string;
  children?: React.ReactNode;
}

export default function BackButton({ 
  fallbackHref = '/restaurant/dashboard', 
  className = "text-gray-500 hover:text-gray-700 transition-colors",
  title = "Retour",
  children 
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Vérifie s'il y a un historique de navigation
    if (typeof window !== 'undefined' && window.history.length > 1) {
      // Utilise l'historique du navigateur pour préserver la position de scroll
      window.history.back();
    } else {
      // Fallback vers une URL spécifique
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={className}
      title={title}
    >
      {children || (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      )}
    </button>
  );
} 