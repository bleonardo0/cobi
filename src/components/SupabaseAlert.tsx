'use client';

import { isSupabaseConfigured } from '@/lib/supabase';

export default function SupabaseAlert() {
  if (isSupabaseConfigured) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <svg
          className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0"
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
        <div>
          <h3 className="text-sm font-medium text-yellow-800 mb-1">
            Configuration Supabase requise
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            Pour utiliser l&apos;upload et le stockage des modèles 3D, vous devez configurer Supabase.
          </p>
          <div className="text-sm text-yellow-700">
            <p className="mb-2">Étapes à suivre :</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Créez un projet sur <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-800">supabase.com</a></li>
              <li>Configurez les variables d&apos;environnement dans <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
              <li>Exécutez le script SQL pour créer la table</li>
              <li>Créez le bucket de stockage <code className="bg-yellow-100 px-1 rounded">models-3d</code></li>
            </ol>
            <p className="mt-3">
              📖 Consultez le guide détaillé : <code className="bg-yellow-100 px-1 rounded">SUPABASE_SETUP.md</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 