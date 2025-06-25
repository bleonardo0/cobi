'use client';

import { useState, useRef, useEffect } from 'react';
import ModelViewer from '@/components/ModelViewer';

export default function TestSimple() {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [modelHistory, setModelHistory] = useState<string[]>([]);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const modelViewerRef = useRef<HTMLElement>(null);

  // Test models - using working URLs
  const testModels = [
    {
      name: 'Astronaut (Google - Référence)',
      url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
      description: 'Modèle de référence Google qui fonctionne toujours'
    },
    {
      name: 'Duck (Three.js)',
      url: 'https://threejs.org/examples/models/gltf/Duck/glTF/Duck.gltf',
      description: 'Modèle de test Three.js classique'
    },
    {
      name: 'iPhone (Apple USDZ)',
      url: 'https://modelviewer.dev/shared-assets/models/iPhone.usdz',
      description: 'Test USDZ pour iOS AR'
    },
    {
      name: 'Werewolf (Problématique)',
      url: 'https://cwrivrxejzesoyszhggz.supabase.co/storage/v1/object/public/models-3d/models/Werewolf_Warrior-1748705750086-r7afwr-1748708260428-gfsxd2.glb',
      description: 'URL potentiellement cassée - test de récupération'
    }
  ];

  // Add debug logging
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setDebugLogs(prev => [logEntry, ...prev.slice(0, 19)]); // Keep last 20 logs
  };

  useEffect(() => {
    // Set default model
    if (!selectedModel && testModels.length > 0) {
      setSelectedModel(testModels[0].url);
      addDebugLog(`Default model set: ${testModels[0].name}`);
    }
  }, []);

  const handleModelChange = (url: string) => {
    addDebugLog(`🔄 Changing model to: ${url}`);
    
    // Add to history if not already there
    if (url && !modelHistory.includes(url)) {
      setModelHistory(prev => [url, ...prev.slice(0, 4)]); // Keep last 5
    }
    
    setSelectedModel(url);
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      addDebugLog(`📝 Custom URL submitted: ${customUrl.trim()}`);
      handleModelChange(customUrl.trim());
      setCustomUrl('');
    }
  };

  const clearLogs = () => {
    setDebugLogs([]);
    addDebugLog('🧹 Debug logs cleared');
  };

  const testUrl = async (url: string) => {
    addDebugLog(`🔍 Testing URL accessibility: ${url}`);
    try {
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      addDebugLog(`✅ URL test result: ${response.status || 'no-cors mode'}`);
    } catch (error) {
      addDebugLog(`❌ URL test failed: ${error}`);
    }
  };

  const currentModel = testModels.find(m => m.url === selectedModel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-teal-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-teal-800">Test Simple - ModelViewer</h1>
              <p className="text-teal-600 text-sm">Test de récupération et de robustesse</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm">
                ✅ Stable
              </span>
              <a 
                href="/test" 
                className="text-teal-600 hover:text-teal-800 font-medium"
              >
                ← Retour aux tests
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Controls */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Model Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sélection du modèle
              </h3>
              
              <div className="space-y-3">
                {testModels.map((model, index) => (
                  <div key={index} className="space-y-2">
                    <button
                      onClick={() => handleModelChange(model.url)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedModel === model.url
                          ? 'border-teal-500 bg-teal-50 text-teal-800'
                          : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                      }`}
                    >
                      <div className="font-medium">{model.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {model.description}
                      </div>
                    </button>
                    <button
                      onClick={() => testUrl(model.url)}
                      className="w-full text-xs text-gray-500 hover:text-teal-600 py-1"
                    >
                      🔍 Tester l'URL
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom URL */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                URL personnalisée
              </h3>
              
              <form onSubmit={handleCustomUrlSubmit} className="space-y-3">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/model.glb"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={!customUrl.trim()}
                  className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Charger le modèle
                </button>
              </form>
            </div>

            {/* Model Info */}
            {currentModel && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Nom:</span>
                    <div className="text-gray-600">{currentModel.name}</div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Description:</span>
                    <div className="text-gray-600">{currentModel.description}</div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">URL:</span>
                    <div className="text-gray-600 break-all text-xs">
                      {selectedModel}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Format:</span>
                    <div className="text-gray-600">
                      {selectedModel.toLowerCase().includes('.usdz') ? 'USDZ (iOS AR)' : 
                       selectedModel.toLowerCase().includes('.gltf') ? 'GLTF' : 'GLB/GLTF (WebGL)'}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Model Viewer */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Visualisation 3D
                  </h3>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>🔄 Récupération automatique</span>
                    <span>•</span>
                    <span>🥽 AR disponible</span>
                  </div>
                </div>
              </div>
              
              <div className="aspect-square">
                {selectedModel ? (
                  <ModelViewer
                    ref={modelViewerRef}
                    src={selectedModel}
                    alt={currentModel?.name || 'Modèle 3D'}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p>Sélectionnez un modèle à afficher</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-gradient-to-r from-teal-50 to-orange-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Instructions de test :</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">1.</span>
                  <span>Commencez par "Astronaut" qui devrait toujours fonctionner</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">2.</span>
                  <span>Testez les URLs avec le bouton "🔍 Tester l'URL"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">3.</span>
                  <span>Observez les logs de débogage dans la colonne de droite</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">4.</span>
                  <span>Testez le "Werewolf" pour voir la récupération d'erreur</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">5.</span>
                  <span>Sur mobile Android + Chrome, testez le mode AR</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Debug Panel */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Debug Logs
                </h3>
                <button
                  onClick={clearLogs}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  🧹 Clear
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {debugLogs.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun log pour le moment...</p>
                ) : (
                  debugLogs.map((log, index) => (
                    <div
                      key={index}
                      className="text-xs font-mono bg-gray-50 p-2 rounded border-l-2 border-gray-300"
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* History */}
            {modelHistory.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Historique
                </h3>
                
                <div className="space-y-2">
                  {modelHistory.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => handleModelChange(url)}
                      className="w-full text-left p-2 rounded text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                    >
                      <div className="truncate">
                        {testModels.find(m => m.url === url)?.name || 'URL personnalisée'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions rapides
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    console.clear();
                    addDebugLog('🧹 Console cleared');
                  }}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                >
                  🧹 Clear Console
                </button>
                
                <button
                  onClick={() => {
                    if (selectedModel) {
                      navigator.clipboard.writeText(selectedModel);
                      addDebugLog('📋 URL copied to clipboard');
                    }
                  }}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                >
                  📋 Copy URL
                </button>
                
                <button
                  onClick={() => {
                    if (selectedModel) {
                      window.open(selectedModel, '_blank');
                      addDebugLog('🔗 URL opened in new tab');
                    }
                  }}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                >
                  🔗 Open URL
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
} 