'use client';

import { useState } from 'react';
import ModelViewer from '@/components/ModelViewer';

export default function TestHotspotsPage() {
  const [showCoordinates, setShowCoordinates] = useState(false);

  // Exemple de hotspots pour l'astronaute Google
  const astronautHotspots = [
    {
      id: 'helmet',
      position: '0 1.8 0.1',
      normal: '0 0 1',
      title: 'Casque d\'astronaute',
      description: 'Le casque spatial protège l\'astronaute contre le vide de l\'espace et fournit l\'oxygène nécessaire.',
      icon: '🪐'
    },
    {
      id: 'chest',
      position: '0 1.2 0.3',
      normal: '0 0 1',
      title: 'Panneau de contrôle',
      description: 'Ce panneau contient tous les contrôles vitaux pour la survie en apesanteur.',
      icon: '🎛️'
    },
    {
      id: 'backpack',
      position: '0 1.0 -0.3',
      normal: '0 0 -1',
      title: 'Système de survie',
      description: 'Le sac à dos contient les systèmes de support vie : oxygène, régulation thermique et communications.',
      icon: '🎒'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Test des Hotspots 3D</h1>
          <p className="text-gray-600 mb-4">
            Cette page démontre l'utilisation des hotspots interactifs sur les modèles 3D GLB.
            Cliquez sur les points bleus pulsants pour voir les informations.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Comment obtenir les coordonnées des hotspots :</h3>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Utilisez les outils de développement de votre navigateur (F12)</li>
              <li>2. Dans la console, tapez : <code className="bg-yellow-100 px-1 rounded">document.querySelector('model-viewer').getCameraOrbit()</code></li>
              <li>3. Déplacez le modèle 3D et utilisez <code className="bg-yellow-100 px-1 rounded">getCameraTarget()</code> pour les positions</li>
              <li>4. Ou utilisez des logiciels 3D comme Blender pour obtenir les coordonnées précises</li>
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Model Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Astronaute avec Hotspots</h2>
                <p className="text-sm text-gray-600">Cliquez sur les points pour découvrir les détails</p>
              </div>
              
              <div className="relative h-96 lg:h-[600px] bg-gradient-to-br from-gray-50 to-gray-100">
                <ModelViewer
                  src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
                  alt="Astronaute avec hotspots"
                  className="w-full h-full"
                  hotspots={astronautHotspots}
                />
              </div>
            </div>
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            {/* Hotspots List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Points d'intérêt
              </h2>
              
              <div className="space-y-3">
                {astronautHotspots.map((hotspot) => (
                  <div key={hotspot.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{hotspot.icon}</span>
                      <h3 className="font-medium text-gray-900">{hotspot.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{hotspot.description}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      Position: {hotspot.position}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Example */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Utilisation
              </h2>
              
              <button
                onClick={() => setShowCoordinates(!showCoordinates)}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {showCoordinates ? 'Masquer' : 'Voir'} le code
              </button>

              {showCoordinates && (
                <div className="bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
                  <pre className="text-gray-800">
{`<ModelViewer
  src="model.glb"
  alt="Mon modèle"
  hotspots={[
    {
      id: 'point1',
      position: '0 1.8 0.1',
      normal: '0 0 1',
      title: 'Titre',
      description: 'Description...',
      icon: '🪐'
    }
  ]}
/>`}
                  </pre>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Fonctionnalités
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-900">Points interactifs avec animation pulse</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-900">Tooltips avec titre et description</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-900">Icônes personnalisables</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-900">Support GLB/GLTF uniquement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 