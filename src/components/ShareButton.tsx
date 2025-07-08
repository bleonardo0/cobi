'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Model3D } from '@/types/model';

interface ShareButtonProps {
  model: Model3D;
  className?: string;
  showLabel?: boolean;
}

export default function ShareButton({ model, className = '', showLabel = true }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/menu/bella-vita?model=${model.slug}`;
    }
    return '';
  };

  const handleShare = async () => {
    if (isSharing) return;
    
    setIsSharing(true);
    const shareUrl = getShareUrl();
    
    const shareData = {
      title: `${model.name} - Bella Vita`,
      text: `Découvrez ${model.name} en 3D ! ${model.shortDescription || ''}`,
      url: shareUrl
    };

    try {
      // Utiliser navigator.share() si disponible
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('✅ Partage réussi');
      } else {
        // Fallback : copier le lien
        await navigator.clipboard.writeText(shareUrl);
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 2000);
        console.log('📋 Lien copié dans le presse-papiers');
      }
    } catch (error) {
      console.error('❌ Erreur de partage:', error);
      
      // Fallback ultime : ouvrir une nouvelle fenêtre
      if (error instanceof Error && error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setShowCopyFeedback(true);
          setTimeout(() => setShowCopyFeedback(false), 2000);
        } catch (clipboardError) {
          console.error('❌ Erreur clipboard:', clipboardError);
          // Dernier recours : sélectionner le texte
          alert(`Lien à copier: ${shareUrl}`);
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <motion.button
      onClick={handleShare}
      disabled={isSharing}
      className={`
        relative flex items-center justify-center
        px-4 py-2 rounded-lg font-medium
        bg-blue-600 hover:bg-blue-700 text-white
        transition-all duration-200
        ${isSharing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileHover={{ scale: isSharing ? 1 : 1.05 }}
      whileTap={{ scale: isSharing ? 1 : 0.95 }}
      aria-label={`Partager ${model.name}`}
    >
      <span className="text-lg mr-2">📲</span>
      {showLabel && (
        <span className="text-sm">
          {isSharing ? 'Partage...' : 'Partager'}
        </span>
      )}
      
      {/* Feedback de copie */}
      {showCopyFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-green-600 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50"
        >
          ✅ Lien copié !
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600"></div>
        </motion.div>
      )}
    </motion.button>
  );
} 