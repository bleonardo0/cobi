'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModelRevision } from '@/types/history';
import { Model3D } from '@/types/model';
import { useModelHistory } from '@/hooks/useModelHistory';
import { usePermissions } from '@/hooks/useAuth';
import { formatFileSize } from '@/lib/utils';

interface ModelHistoryProps {
  model: Model3D;
  isOpen: boolean;
  onClose: () => void;
}

export default function ModelHistory({ model, isOpen, onClose }: ModelHistoryProps) {
  const [selectedRevision, setSelectedRevision] = useState<ModelRevision | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  
  const { revisions, isLoading, createRevision, restoreRevision, deleteRevision } = useModelHistory(model.id);
  const permissions = usePermissions();

  const handleRestore = async (revision: ModelRevision) => {
    if (!permissions.canEditModel) return;

    try {
      setIsRestoring(true);
      setRestoreError(null);
      
      await restoreRevision(revision.id);
      
      // Fermer le modal après restoration
      onClose();
      
      // Recharger la page pour voir les changements
      window.location.reload();
      
    } catch (error) {
      console.error('Error restoring revision:', error);
      setRestoreError(error instanceof Error ? error.message : 'Erreur lors de la restauration');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCreateRevision = async () => {
    if (!permissions.canEditModel) return;

    try {
      const versionName = prompt('Nom de cette version (optionnel):');
      const changeNote = prompt('Note de changement (optionnel):');
      
      await createRevision(model, changeNote || undefined, versionName || undefined);
    } catch (error) {
      console.error('Error creating revision:', error);
      alert('Erreur lors de la création de la révision');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Historique de {model.name}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {revisions.length} révision{revisions.length > 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex space-x-2">
                {permissions.canEditModel && (
                  <button
                    onClick={handleCreateRevision}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    📸 Créer une révision
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement de l'historique...</p>
                </div>
              ) : revisions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun historique</h3>
                  <p className="text-gray-600 mb-4">
                    Ce modèle n'a pas encore d'historique de révisions.
                  </p>
                  {permissions.canEditModel && (
                    <button
                      onClick={handleCreateRevision}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      📸 Créer la première révision
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {revisions.map((revision, index) => (
                    <motion.div
                      key={revision.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border rounded-lg p-4 ${
                        revision.isActive ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                      } hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start justify-between">
                        {/* Revision Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              revision.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              v{revision.versionNumber} {revision.isActive && '(Actuelle)'}
                            </span>
                            
                            {revision.versionName && (
                              <span className="text-sm font-medium text-gray-900">
                                {revision.versionName}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📅 {formatDate(revision.createdAt)}</p>
                            <p>👤 Par {revision.createdBy}</p>
                            
                            {revision.changeNote && (
                              <p className="text-gray-800 font-medium">
                                💬 {revision.changeNote}
                              </p>
                            )}
                          </div>

                          {/* Snapshot Info */}
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Taille:</span>
                              <span className="ml-1 font-medium">
                                {formatFileSize(revision.snapshot.fileSize)}
                              </span>
                            </div>
                            
                            {revision.snapshot.category && (
                              <div>
                                <span className="text-gray-500">Catégorie:</span>
                                <span className="ml-1 font-medium">{revision.snapshot.category}</span>
                              </div>
                            )}
                            
                            {revision.snapshot.price && (
                              <div>
                                <span className="text-gray-500">Prix:</span>
                                <span className="ml-1 font-medium">{revision.snapshot.price}€</span>
                              </div>
                            )}

                            <div>
                              <span className="text-gray-500">Formats:</span>
                              <span className="ml-1 font-medium">
                                {[
                                  revision.snapshot.glbUrl && 'GLB',
                                  revision.snapshot.usdzUrl && 'USDZ'
                                ].filter(Boolean).join(' + ') || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2 ml-4">
                          {!revision.isActive && permissions.canEditModel && (
                            <button
                              onClick={() => setSelectedRevision(revision)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              👁️ Voir
                            </button>
                          )}
                          
                          {!revision.isActive && permissions.canEditModel && (
                            <button
                              onClick={() => handleRestore(revision)}
                              disabled={isRestoring}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              🔄 Restaurer
                            </button>
                          )}
                          
                          {revision.isActive && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm text-center">
                              ✓ Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      {revision.snapshot.tags && revision.snapshot.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {revision.snapshot.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {restoreError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{restoreError}</p>
                  <button
                    onClick={() => setRestoreError(null)}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Revision Preview Modal */}
      {selectedRevision && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                Aperçu v{selectedRevision.versionNumber}
              </h3>
              <button
                onClick={() => setSelectedRevision(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informations</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nom:</span>
                      <span className="ml-2 font-medium">{selectedRevision.snapshot.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Taille:</span>
                      <span className="ml-2 font-medium">{formatFileSize(selectedRevision.snapshot.fileSize)}</span>
                    </div>
                    {selectedRevision.snapshot.category && (
                      <div>
                        <span className="text-gray-500">Catégorie:</span>
                        <span className="ml-2 font-medium">{selectedRevision.snapshot.category}</span>
                      </div>
                    )}
                    {selectedRevision.snapshot.price && (
                      <div>
                        <span className="text-gray-500">Prix:</span>
                        <span className="ml-2 font-medium">{selectedRevision.snapshot.price}€</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRevision.snapshot.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedRevision.snapshot.description}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleRestore(selectedRevision)}
                    disabled={isRestoring}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isRestoring ? 'Restauration...' : '🔄 Restaurer cette version'}
                  </button>
                  
                  <button
                    onClick={() => setSelectedRevision(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 