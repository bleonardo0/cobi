'use client';

import { useState, useEffect } from 'react';

interface Model {
  id: string;
  name: string;
  filename: string;
  file_size: number;
  public_url: string;
  created_at: string;
}

export default function AdminCleanupPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      const data = await response.json();
      setModels(data.models || []);
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteModel = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/models/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchModels(); // Recharger la liste
        alert('Modèle supprimé avec succès !');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des modèles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧹 Admin - Nettoyage des Modèles
          </h1>
          <p className="text-xl text-gray-600">
            Gérez et supprimez les modèles défaillants
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              📋 Modèles existants ({models.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {models.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">Aucun modèle trouvé</p>
              </div>
            ) : (
              models.map((model) => (
                <div key={model.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{model.name}</h3>
                          <p className="text-sm text-gray-500">{model.filename}</p>
                          <p className="text-xs text-gray-400">
                            Taille: {(model.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={model.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        📥 Télécharger
                      </a>
                      
                      <button
                        onClick={() => deleteModel(model.id, model.name)}
                        disabled={deleting === model.id}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === model.id ? '⏳' : '🗑️'} Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>💡 Conseil :</strong> Supprimez le modèle Werewolf défaillant, puis re-uploadez-le 
              via la page d'upload normale.
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <a
              href="/upload"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📤 Aller à l'Upload
            </a>
            <a
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              🏠 Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 