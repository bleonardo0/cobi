'use client';

import { useState, useEffect } from 'react';
import ModelViewer from '@/components/ModelViewer';

export default function TestUSDZPage() {
  const [selectedTest, setSelectedTest] = useState<string>('');

  // URLs de test USDZ
  const testModels = [
    {
      name: 'Apple - Toy Robot (Référence)',
      url: 'https://developer.apple.com/augmented-reality/quick-look/models/toyrobot/toy_robot_vintage.usdz',
      description: 'Modèle USDZ officiel d\'Apple'
    },
    {
      name: 'Apple - Retro TV',
      url: 'https://developer.apple.com/augmented-reality/quick-look/models/retrotv/tv_retro.usdz',
      description: 'TV rétro d\'Apple'
    },
    {
      name: 'Apple - Gramophone',
      url: 'https://developer.apple.com/augmented-reality/quick-look/models/gramophone/gramophone.usdz',
      description: 'Gramophone d\'Apple'
    }
  ];

  const [deviceInfo, setDeviceInfo] = useState<any>({});

  useEffect(() => {
    // Détecter les informations du device
    setDeviceInfo({
      userAgent: navigator.userAgent,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
      isWebKit: 'WebKitAppearance' in document.documentElement.style,
      supportsAR: 'xr' in navigator,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test de Compatibilité USDZ</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            {/* Device Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Informations Device</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>iOS:</span>
                  <span className={deviceInfo.isIOS ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {deviceInfo.isIOS ? '✅ Oui' : '❌ Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Safari:</span>
                  <span className={deviceInfo.isSafari ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {deviceInfo.isSafari ? '✅ Oui' : '❌ Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>WebKit:</span>
                  <span className={deviceInfo.isWebKit ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {deviceInfo.isWebKit ? '✅ Oui' : '❌ Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Support AR:</span>
                  <span className={deviceInfo.supportsAR ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {deviceInfo.supportsAR ? '✅ Oui' : '❌ Non'}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Models */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Modèles de Test</h2>
              
              <div className="space-y-3">
                {testModels.map((model, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTest(model.url)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTest === model.url
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">{model.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* USDZ Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">À propos d'USDZ</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Format développé par Apple</li>
                <li>• Optimisé pour iOS et Safari</li>
                <li>• Support AR natif sur iOS 12+</li>
                <li>• Compatibilité limitée sur autres navigateurs</li>
              </ul>
            </div>

            {/* Quick Look Test */}
            {selectedTest && deviceInfo.isIOS && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Test Quick Look iOS</h3>
                <a
                  href={selectedTest}
                  rel="ar"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  📱 Ouvrir en AR (iOS)
                </a>
              </div>
            )}
          </div>

          {/* Model Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {selectedTest ? (
                <div>
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Aperçu du modèle USDZ</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Via model-viewer (compatibilité variable selon le navigateur)
                    </p>
                  </div>
                  
                  <div className="h-96">
                    <ModelViewer
                      src={selectedTest}
                      alt="Test USDZ"
                      className="w-full h-full"
                    />
                  </div>

                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        URL: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedTest}</code>
                      </div>
                      
                      <div className="flex space-x-2">
                        <a
                          href={selectedTest}
                          download
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          📥 Télécharger
                        </a>
                        {deviceInfo.isIOS && (
                          <a
                            href={selectedTest}
                            rel="ar"
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            📱 Quick Look
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
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
                    <p className="text-gray-600">Sélectionnez un modèle USDZ pour le tester</p>
                  </div>
                </div>
              )}
            </div>

            {/* Browser Compatibility Info */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2">Compatibilité Navigateurs</h3>
              <div className="text-sm text-yellow-800 space-y-1">
                <div className="flex justify-between">
                  <span>Safari (iOS/macOS):</span>
                  <span className="text-green-600 font-medium">✅ Excellent</span>
                </div>
                <div className="flex justify-between">
                  <span>Chrome/Firefox:</span>
                  <span className="text-orange-600 font-medium">⚠️ Limité</span>
                </div>
                <div className="flex justify-between">
                  <span>Edge:</span>
                  <span className="text-orange-600 font-medium">⚠️ Limité</span>
                </div>
              </div>
              <p className="text-xs text-yellow-700 mt-2">
                Pour une meilleure expérience USDZ, utilisez Safari sur iOS/macOS ou convertissez en GLB/GLTF pour les autres navigateurs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 