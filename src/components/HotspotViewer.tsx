'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HotspotButton from './HotspotButton';

interface HotspotViewerProps {
  hotspotsConfig: any;
  enabled?: boolean;
  onHotspotClick?: (type: string, data?: any) => void;
}

export default function HotspotViewer({ 
  hotspotsConfig, 
  enabled = true,
  onHotspotClick 
}: HotspotViewerProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  if (!enabled || !hotspotsConfig) {
    return null;
  }

  const handleHotspotClick = (type: string, data?: any) => {
    setSelectedHotspot(type);
    if (onHotspotClick) {
      onHotspotClick(type, data);
    }
  };

  const closeModal = () => {
    setSelectedHotspot(null);
  };

  const renderHotspots = () => {
    if (Array.isArray(hotspotsConfig)) {
      // Nouveau format avec hotspots personnalisés
      return hotspotsConfig.map((hotspot: any) => (
        <HotspotButton
          key={hotspot.id}
          type={hotspot.type}
          position={{
            x: hotspot.screenPosition.x / 100,
            y: hotspot.screenPosition.y / 100,
            z: 0
          }}
          onClick={() => handleHotspotClick(hotspot.type, hotspot)}
        />
      ));
    } else {
      // Format ancien avec positions fixes
      return Object.entries(hotspotsConfig).map(([type, position]: [string, any]) => (
        <HotspotButton
          key={type}
          type={type as 'allergens' | 'traceability' | 'pairings' | 'rating' | 'share'}
          position={position}
          onClick={() => handleHotspotClick(type, position)}
        />
      ));
    }
  };

  const getHotspotContent = (type: string, data?: any) => {
    switch (type) {
      case 'allergens':
        return {
          title: 'Informations sur les allergènes',
          content: data?.text || 'Informations sur les allergènes pour ce plat. Consultez votre serveur pour plus de détails.',
          icon: '⚠️'
        };
      case 'traceability':
        return {
          title: 'Traçabilité',
          content: data?.text || 'Informations sur la provenance et la traçabilité des ingrédients.',
          icon: '📍'
        };
      case 'pairings':
        return {
          title: 'Accords mets-boissons',
          content: data?.text || 'Découvrez nos recommandations de boissons pour accompagner ce plat.',
          icon: '🍷'
        };
      case 'rating':
        return {
          title: 'Noter ce plat',
          content: data?.text || 'Donnez votre avis sur ce plat et aidez les autres clients.',
          icon: '⭐'
        };
      case 'share':
        return {
          title: 'Partager',
          content: data?.text || 'Partagez ce plat avec vos amis et votre famille.',
          icon: '📲'
        };
      default:
        return {
          title: 'Information',
          content: data?.text || 'Informations supplémentaires sur ce plat.',
          icon: '❓'
        };
    }
  };

  return (
    <>
      {renderHotspots()}
      
      {/* Modal pour afficher les informations du hotspot */}
      <AnimatePresence>
        {selectedHotspot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md mx-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {(() => {
                const content = getHotspotContent(selectedHotspot, 
                  Array.isArray(hotspotsConfig) 
                    ? hotspotsConfig.find(h => h.type === selectedHotspot)
                    : null
                );
                
                return (
                  <div className="text-center">
                    <div className="text-4xl mb-4">{content.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {content.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {content.content}
                    </p>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 