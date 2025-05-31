'use client';

import { useEffect } from 'react';

export default function TestSimplePage() {
  useEffect(() => {
    // Import model-viewer dynamically
    import('@google/model-viewer').then(() => {
      console.log('Model viewer loaded in simple test');
    }).catch((error) => {
      console.error('Failed to load model-viewer:', error);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Simple Model Viewer</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Test avec l'astronaute Google (fichier GLB de référence) :
          </p>
          
          <div 
            style={{ width: '100%', height: '400px' }}
            dangerouslySetInnerHTML={{
              __html: `
                <model-viewer
                  src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
                  alt="Test Astronaut"
                  auto-rotate
                  camera-controls
                  style="width: 100%; height: 100%; background: #f0f0f0;"
                ></model-viewer>
              `
            }}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Test avec votre fichier GLB Werewolf (via proxy Next.js) :
          </p>
          
          <div 
            style={{ width: '100%', height: '400px' }}
            dangerouslySetInnerHTML={{
              __html: `
                <model-viewer
                  src="/api/proxy/models/Werewolf_Warrior-1748705750086-r7afwr-1748708260428-gfsxd2.glb"
                  alt="Test Werewolf Proxy"
                  auto-rotate
                  camera-controls
                  style="width: 100%; height: 100%; background: #f0f0f0;"
                ></model-viewer>
              `
            }}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-4">
            Test avec votre fichier GLB Werewolf (URL Supabase directe) :
          </p>
          
          <div 
            style={{ width: '100%', height: '400px' }}
            dangerouslySetInnerHTML={{
              __html: `
                <model-viewer
                  src="https://cwrivrxejzesoyszhggz.supabase.co/storage/v1/object/public/models-3d/models/Werewolf_Warrior-1748705750086-r7afwr-1748708260428-gfsxd2.glb"
                  alt="Test Werewolf Direct"
                  auto-rotate
                  camera-controls
                  style="width: 100%; height: 100%; background: #f0f0f0;"
                ></model-viewer>
              `
            }}
          />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            🔬 Test comparatif : astronaute (référence), proxy Next.js vs URL Supabase directe.
            Ouvrez la console pour voir les logs de chargement.
          </p>
        </div>
      </div>
    </div>
  );
} 