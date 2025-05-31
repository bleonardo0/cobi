'use client';

import { useSearchParams } from 'next/navigation';
import ModelViewer from '@/components/ModelViewer';

export default function TestModelPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url') || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Test du Model Viewer</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">URL testée :</h2>
          <code className="bg-gray-100 p-2 rounded text-sm block break-all">{url}</code>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-96 lg:h-[600px]">
            <ModelViewer
              src={url}
              alt="Test Model"
              className="w-full h-full"
            />
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Si ce modèle de test se charge, le problème vient des fichiers sur votre Supabase.
              Si ce modèle ne se charge pas, le problème vient de model-viewer lui-même.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 