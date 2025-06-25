'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Model3D } from "@/types/model";
import { formatFileSize } from "@/lib/utils";
import Link from "next/link";
import ModelViewer from "@/components/ModelViewer";

export default function ModelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const modelViewerRef = useRef<HTMLElement>(null);
  const [model, setModel] = useState<Model3D | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchModel(params.slug as string);
    }
  }, [params.slug]);

  useEffect(() => {
    // Charger model-viewer dynamiquement côté client
    import('@google/model-viewer').then(() => {
      console.log('model-viewer chargé');
    }).catch((error) => {
      console.error('Erreur lors du chargement de model-viewer:', error);
    });
  }, []);

  const fetchModel = async (slug: string) => {
    try {
      setIsLoading(true);
      // Ajouter un cache-bust pour forcer la récupération des données fraîches
      const response = await fetch(`/api/models?t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du modèle');
      }
      
      const data = await response.json();
      const foundModel = data.models.find((m: Model3D) => m.slug === slug);
      
      if (!foundModel) {
        setError('Modèle non trouvé');
        return;
      }
      
      console.log('📊 Modèle récupéré:', foundModel);
      setModel(foundModel);
    } catch (error) {
      console.error('Error fetching model:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleARClick = () => {
    if (modelViewerRef.current) {
      try {
        const modelViewer = modelViewerRef.current;
        
        if (typeof (modelViewer as any).activateAR === 'function') {
          (modelViewer as any).activateAR();
        } else {
          setTimeout(() => {
            if (typeof (modelViewer as any).activateAR === 'function') {
              (modelViewer as any).activateAR();
            } else {
              console.error('AR non disponible pour ce modèle');
              alert('La réalité augmentée n\'est pas disponible sur cet appareil ou navigateur.');
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Erreur lors de l\'activation AR:', error);
        alert('Impossible d\'activer la réalité augmentée. Assurez-vous d\'utiliser un appareil compatible.');
      }
    }
  };

  const handleResetView = () => {
    if (modelViewerRef.current) {
      try {
        const modelViewer = modelViewerRef.current as any;
        if (typeof modelViewer.resetTurntableRotation === 'function') {
          modelViewer.resetTurntableRotation();
        }
        if (typeof modelViewer.cameraControls?.reset === 'function') {
          modelViewer.cameraControls.reset();
        }
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
      }
    }
  };

  const handleDeleteModel = async () => {
    if (!model) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/models/${model.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to home page after successful deletion
        router.push('/');
      } else {
        alert('Erreur lors de la suppression: ' + (data.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du modèle');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du modèle...</p>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Modèle non trouvé
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Le modèle demandé n&apos;existe pas ou a été supprimé.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à la galerie
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
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
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {model.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  Modèle 3D • {(() => {
                    const formats = [];
                    if (model.glbUrl) formats.push('GLB');
                    if (model.usdzUrl) formats.push('USDZ');
                    if (formats.length === 0) {
                      return model.mimeType.includes('usdz') ? 'USDZ' : 'GLB/GLTF';
                    }
                    return formats.join(' + ');
                  })()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href={`/models/${model.slug}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Modifier
              </Link>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Model Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative h-96 lg:h-[600px] bg-gradient-to-br from-gray-50 to-gray-100">
                <ModelViewer
                  ref={modelViewerRef}
                  src={model.glbUrl || model.usdzUrl || model.url}
                  alt={model.name}
                  className="w-full h-full"
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                  }}
                />
              </div>
              
              {/* Controls */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Utilisez votre souris ou vos doigts pour explorer le modèle
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleResetView}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Info */}
          <div className="space-y-6">
            {/* Thumbnail Preview */}
            {model.thumbnailUrl && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Aperçu
                </h2>
                <img 
                  src={model.thumbnailUrl} 
                  alt={`Aperçu de ${model.name}`}
                  className="w-full rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Détails du modèle
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nom</label>
                  <p className="text-gray-900">{model.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Format(s)</label>
                  <p className="text-gray-900">
                    {(() => {
                      const formats = [];
                      if (model.glbUrl) formats.push('GLB/GLTF');
                      if (model.usdzUrl) formats.push('USDZ');
                      if (formats.length === 0) {
                        return model.mimeType.includes('usdz') ? 'USDZ' : 'GLB/GLTF';
                      }
                      return formats.join(' + ');
                    })()}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Taille</label>
                  <div className="text-gray-900">
                    {model.glbUrl && model.usdzUrl ? (
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">GLB:</span> {formatFileSize(model.glbFileSize || model.fileSize)}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">USDZ:</span> {formatFileSize(model.usdzFileSize || 0)}
                        </div>
                        <div className="text-xs text-gray-500 pt-1">
                          Total: {formatFileSize((model.glbFileSize || model.fileSize) + (model.usdzFileSize || 0))}
                        </div>
                      </div>
                    ) : (
                      <p>{formatFileSize(model.fileSize)}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Date d&apos;ajout</label>
                  <p className="text-gray-900">
                    {new Date(model.uploadDate).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Nom de fichier</label>
                  <p className="text-gray-900 text-sm break-all">{model.filename}</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Fonctionnalités
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-900">Rotation automatique</span>
                </div>
                
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-900">Contrôles de caméra</span>
                </div>
                
                {(model.usdzUrl || model.mimeType === 'model/vnd.usdz+zip') && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-600 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-900">Réalité augmentée (iOS/Safari)</span>
                  </div>
                )}
                
                {model.glbUrl && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-600 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-900">Hotspots interactifs</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-900">Téléchargement direct</span>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Partager
              </h2>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copier le lien
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmer la suppression
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le modèle &quot;{model.name}&quot; ? 
              Cette action est irréversible et supprimera définitivement le fichier et ses données.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteModel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Suppression...
                  </>
                ) : (
                  'Supprimer définitivement'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 