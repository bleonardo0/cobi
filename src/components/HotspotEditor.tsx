'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModelViewer from '@/components/ModelViewer';

interface HotspotData {
  id: string;
  type: 'allergens' | 'traceability' | 'pairings' | 'rating' | 'share';
  position: { x: number; y: number; z: number };
  screenPosition: { x: number; y: number };
  label: string;
  text?: string;
  data?: any;
}

interface HotspotEditorProps {
  modelSrc: string;
  modelName: string;
  initialHotspots?: HotspotData[];
  onHotspotsChange: (hotspots: HotspotData[]) => void;
  className?: string;
}

export default function HotspotEditor({ 
  modelSrc, 
  modelName, 
  initialHotspots = [], 
  onHotspotsChange,
  className = '' 
}: HotspotEditorProps) {
  const [hotspots, setHotspots] = useState<HotspotData[]>(initialHotspots);
  const [selectedTool, setSelectedTool] = useState<'allergens' | 'traceability' | 'pairings' | 'rating' | 'share' | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingHotspot, setEditingHotspot] = useState<string | null>(null);
  const [tempText, setTempText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
    const loadModelViewer = async () => {
      try {
        await import('@google/model-viewer');
        setIsModelLoaded(true);
      } catch (error) {
        console.error('Erreur lors du chargement de model-viewer:', error);
      }
    };

    loadModelViewer();
  }, []);

  useEffect(() => {
    onHotspotsChange(hotspots);
  }, [hotspots, onHotspotsChange]);

  const getHotspotConfig = (type: string) => {
    switch (type) {
      case 'allergens':
        return {
          icon: '🛡️',
          label: 'Sécurité alimentaire',
          color: 'bg-red-500 hover:bg-red-600',
          borderColor: 'border-red-400'
        };
      case 'traceability':
        return {
          icon: '📍',
          label: 'Traçabilité',
          color: 'bg-green-500 hover:bg-green-600',
          borderColor: 'border-green-400'
        };
      case 'pairings':
        return {
          icon: '🍷',
          label: 'Accords mets-boissons',
          color: 'bg-purple-500 hover:bg-purple-600',
          borderColor: 'border-purple-400'
        };
      case 'rating':
        return {
          icon: '⭐',
          label: 'Notation',
          color: 'bg-yellow-500 hover:bg-yellow-600',
          borderColor: 'border-yellow-400'
        };
      case 'share':
        return {
          icon: '📤',
          label: 'Partage',
          color: 'bg-blue-500 hover:bg-blue-600',
          borderColor: 'border-blue-400'
        };
      default:
        return {
          icon: '❓',
          label: 'Hotspot',
          color: 'bg-gray-500 hover:bg-gray-600',
          borderColor: 'border-gray-400'
        };
    }
  };

  const handleModelClick = (event: React.MouseEvent) => {
    if (!selectedTool || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Créer un nouveau hotspot avec possibilité de texte
    const newHotspot: HotspotData = {
      id: `hotspot-${Date.now()}`,
      type: selectedTool,
      position: { x: 0, y: 0, z: 0 }, // Position 3D sera calculée plus tard si nécessaire
      screenPosition: { x, y },
      label: getHotspotConfig(selectedTool).label,
      text: '',
      data: {}
    };

    setHotspots(prev => [...prev, newHotspot]);
    
    // Ouvrir l'éditeur de texte pour le nouveau hotspot
    setEditingHotspot(newHotspot.id);
    setTempText('');
    setShowTextEditor(true);
    setSelectedTool(null); // Désélectionner l'outil après placement
  };

  const deleteHotspot = (id: string) => {
    setHotspots(prev => prev.filter(h => h.id !== id));
    setSelectedHotspot(null);
  };

  const updateHotspotText = (id: string, text: string) => {
    setHotspots(prev => prev.map(h => 
      h.id === id ? { ...h, text } : h
    ));
  };

  const saveHotspotText = () => {
    if (editingHotspot) {
      updateHotspotText(editingHotspot, tempText);
    }
    setShowTextEditor(false);
    setEditingHotspot(null);
    setTempText('');
  };

  const cancelTextEdit = () => {
    setShowTextEditor(false);
    setEditingHotspot(null);
    setTempText('');
  };

  const openTextEditor = (hotspotId: string) => {
    const hotspot = hotspots.find(h => h.id === hotspotId);
    if (hotspot) {
      setEditingHotspot(hotspotId);
      setTempText(hotspot.text || '');
      setShowTextEditor(true);
    }
  };

  const moveHotspot = (id: string, newPosition: { x: number; y: number }) => {
    setHotspots(prev => prev.map(h => 
      h.id === id 
        ? { ...h, screenPosition: newPosition }
        : h
    ));
  };

  const handleHotspotMouseDown = (e: React.MouseEvent, hotspotId: string) => {
    if (!isEditMode) return;
    
    e.stopPropagation();
    setSelectedHotspot(hotspotId);

    const startX = e.clientX;
    const startY = e.clientY;
    const hotspot = hotspots.find(h => h.id === hotspotId);
    if (!hotspot || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const startScreenX = hotspot.screenPosition.x;
    const startScreenY = hotspot.screenPosition.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const deltaScreenX = (deltaX / rect.width) * 100;
      const deltaScreenY = (deltaY / rect.height) * 100;
      
      const newX = Math.max(0, Math.min(100, startScreenX + deltaScreenX));
      const newY = Math.max(0, Math.min(100, startScreenY + deltaScreenY));
      
      moveHotspot(hotspotId, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Éditeur de hotspots</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isEditMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isEditMode ? 'Mode édition' : 'Mode visualisation'}
            </button>
            {hotspots.length > 0 && (
              <button
                onClick={() => setHotspots([])}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                Tout effacer
              </button>
            )}
          </div>
        </div>

        {/* Outils de placement */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {selectedTool 
              ? `Cliquez sur le modèle pour placer un hotspot "${getHotspotConfig(selectedTool).label}"` 
              : 'Sélectionnez un type de hotspot à placer :'
            }
          </p>
          {!selectedTool && (
            <p className="text-xs text-gray-500">
              💡 Après placement, vous pourrez personnaliser le texte de chaque hotspot
            </p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {(['allergens', 'traceability', 'pairings', 'rating', 'share'] as const).map((tool) => {
              const config = getHotspotConfig(tool);
              return (
                <button
                  key={tool}
                  onClick={() => setSelectedTool(selectedTool === tool ? null : tool)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    selectedTool === tool
                      ? `${config.color} text-white ${config.borderColor}`
                      : `bg-white text-gray-700 border-gray-200 hover:${config.color.replace('bg-', 'border-').replace(' hover:bg-red-600', '')}`
                  }`}
                >
                  <span>{config.icon}</span>
                  <span className="text-sm font-medium">{config.label}</span>
                </button>
              );
            })}
          </div>

          {selectedTool && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <p className="text-sm text-blue-800">
                ✨ Cliquez n'importe où sur le modèle pour placer le hotspot "{getHotspotConfig(selectedTool).label}"
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modèle 3D avec hotspots */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div 
          ref={containerRef}
          className="relative h-96 bg-gray-50 rounded-lg overflow-hidden cursor-crosshair"
          onClick={handleModelClick}
        >
          {isModelLoaded && (
            <ModelViewer
              src={modelSrc}
              alt={modelName}
              className="w-full h-full"
            />
          )}

          {/* Overlay des hotspots */}
          <div className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {hotspots.map((hotspot) => {
                const config = getHotspotConfig(hotspot.type);
                return (
                  <motion.div
                    key={hotspot.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute pointer-events-auto"
                    style={{
                      left: `${hotspot.screenPosition.x}%`,
                      top: `${hotspot.screenPosition.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="relative">
                      <button
                        className={`
                          w-10 h-10 rounded-full shadow-lg text-white text-lg
                          border-2 transition-all duration-200
                          ${config.color} ${config.borderColor}
                          ${selectedHotspot === hotspot.id ? 'ring-4 ring-blue-300' : ''}
                          ${isEditMode ? 'cursor-move' : 'cursor-pointer'}
                        `}
                        onMouseDown={(e) => handleHotspotMouseDown(e, hotspot.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isEditMode) {
                            console.log('Hotspot cliqué:', hotspot);
                          } else {
                            setSelectedHotspot(selectedHotspot === hotspot.id ? null : hotspot.id);
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (isEditMode) {
                            openTextEditor(hotspot.id);
                          }
                        }}
                        title={hotspot.label}
                      >
                        {config.icon}
                      </button>

                      {/* Menu contextuel pour édition */}
                      {isEditMode && selectedHotspot === hotspot.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-max"
                        >
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openTextEditor(hotspot.id);
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium px-2 py-1 hover:bg-blue-50 rounded text-left"
                            >
                              ✏️ Modifier le texte
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteHotspot(hotspot.id);
                              }}
                              className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded text-left"
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Label du hotspot */}
                      {!isEditMode && (
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap max-w-40 text-center">
                          {hotspot.text || hotspot.label}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {isEditMode 
              ? 'Mode édition : Cliquez et glissez pour déplacer les hotspots, double-cliquez pour éditer le texte'
              : 'Mode visualisation : Cliquez sur les hotspots pour voir leur fonction'
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {hotspots.length} hotspot{hotspots.length !== 1 ? 's' : ''} placé{hotspots.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Modal d'édition de texte */}
      <AnimatePresence>
        {showTextEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={cancelTextEdit}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ✏️ Modifier le texte du hotspot
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte à afficher
                  </label>
                  <textarea
                    value={tempText}
                    onChange={(e) => setTempText(e.target.value)}
                    placeholder="Entrez le texte à afficher sur ce hotspot..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ce texte s'affichera au lieu du nom du type de hotspot
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelTextEdit}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveHotspotText}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Résumé des hotspots */}
      {hotspots.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Hotspots configurés :</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {hotspots.map((hotspot) => {
              const config = getHotspotConfig(hotspot.type);
              return (
                <div
                  key={hotspot.id}
                  className="flex items-center space-x-2 bg-white p-2 rounded border"
                >
                  <span>{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-700 font-medium">{config.label}</span>
                    {hotspot.text && (
                      <p className="text-xs text-gray-500 truncate">"{hotspot.text}"</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteHotspot(hotspot.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 