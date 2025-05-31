'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import UploadForm from "@/components/UploadForm";
import { Model3D } from "@/types/model";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [uploadedModels, setUploadedModels] = useState<Model3D[]>([]);
  const router = useRouter();

  const handleUploadSuccess = (model: Model3D) => {
    setUploadedModels(prev => [...prev, model]);
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
                  Télécharger un modèle
                </h1>
                <p className="text-gray-600 mt-1">
                  Ajoutez vos modèles 3D USDZ, GLB ou GLTF à la galerie
                </p>
              </div>
            </div>
            
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Retour à la galerie
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Upload Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Upload Success */}
          {uploadedModels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-6"
            >
              <div className="flex items-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-green-800">
                  Téléchargement réussi !
                </h3>
              </div>
              
              <div className="space-y-3">
                {uploadedModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between bg-white rounded-lg p-4 border border-green-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{model.name}</p>
                        <p className="text-sm text-gray-500">
                          {model.mimeType.includes('usdz') ? 'USDZ' : 'GLB/GLTF'}
                        </p>
                      </div>
                    </div>
                    
                    <Link
                      href={`/models/${model.slug}`}
                      className="text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      Voir le modèle →
                    </Link>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Voir la galerie
                </button>
                <button
                  onClick={() => setUploadedModels([])}
                  className="flex-1 bg-white text-green-600 py-2 px-4 rounded-lg border border-green-200 hover:bg-green-50 transition-colors font-medium"
                >
                  Télécharger d'autres modèles
                </button>
              </div>
            </motion.div>
          )}

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Conseils pour de meilleurs résultats
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Formats recommandés :</h4>
                <ul className="space-y-1">
                  <li>• <strong>USDZ</strong> : Optimal pour la réalité augmentée sur iOS</li>
                  <li>• <strong>GLB</strong> : Format binaire compact pour le web</li>
                  <li>• <strong>GLTF</strong> : Format JSON avec assets séparés</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Images de prévisualisation :</h4>
                <ul className="space-y-1">
                  <li>• <strong>Optionnel</strong> : Ajoutez une image JPG, PNG ou WebP</li>
                  <li>• <strong>Recommandé</strong> : 400x300px ou ratio 4:3</li>
                  <li>• <strong>Taille max</strong> : 10MB par image</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Optimisation :</h4>
                <ul className="space-y-1">
                  <li>• Limitez la taille des fichiers (max 50MB)</li>
                  <li>• Optimisez les textures pour le web</li>
                  <li>• Réduisez le nombre de polygones si nécessaire</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Conseils :</h4>
                <ul className="space-y-1">
                  <li>• L'image de prévisualisation améliore l'apparence dans la galerie</li>
                  <li>• Sans image, le modèle 3D sera affiché directement</li>
                  <li>• Vous pouvez toujours ajouter une image plus tard</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
} 