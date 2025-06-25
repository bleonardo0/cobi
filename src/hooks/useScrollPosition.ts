import { useEffect, useRef } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
}

export function useScrollPosition(key: string, shouldRestore: boolean = true) {
  const savedScrollPosition = useRef<ScrollPosition>({ x: 0, y: 0 });
  
  // Sauvegarder la position actuelle
  const saveScrollPosition = () => {
    const position = {
      x: window.scrollX,
      y: window.scrollY
    };
    savedScrollPosition.current = position;
    // Optionnel : sauvegarder dans sessionStorage pour persistance
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`scrollPosition_${key}`, JSON.stringify(position));
    }
  };

  // Restaurer la position sauvegardée
  const restoreScrollPosition = () => {
    if (!shouldRestore) return;
    
    let position = savedScrollPosition.current;
    
    // Essayer de récupérer depuis sessionStorage si disponible
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`scrollPosition_${key}`);
      if (saved) {
        try {
          position = JSON.parse(saved);
        } catch (e) {
          console.warn('Erreur lors de la restauration de la position de scroll:', e);
        }
      }
    }
    
    // Restaurer avec un petit délai pour s'assurer que le contenu est rendu
    setTimeout(() => {
      window.scrollTo({
        left: position.x,
        top: position.y,
        behavior: 'auto' // Pas d'animation pour la restauration
      });
    }, 100);
  };

  // Nettoyer la position sauvegardée
  const clearScrollPosition = () => {
    savedScrollPosition.current = { x: 0, y: 0 };
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`scrollPosition_${key}`);
    }
  };

  // Effect pour restaurer au montage si nécessaire
  useEffect(() => {
    if (shouldRestore) {
      restoreScrollPosition();
    }
    
    // Cleanup au démontage
    return () => {
      if (typeof window !== 'undefined') {
        // Optionnel : nettoyer après un certain temps
        setTimeout(() => {
          clearScrollPosition();
        }, 30000); // 30 secondes
      }
    };
  }, [key, shouldRestore]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition
  };
}

export default useScrollPosition; 