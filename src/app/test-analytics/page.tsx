'use client';

import { useState } from 'react';
import { getAllModels } from '@/lib/models';

export default function TestAnalyticsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReinitializing, setIsReinitializing] = useState(false);
  const [message, setMessage] = useState('');

  const generateTestData = async () => {
    setIsGenerating(true);
    setMessage('Génération de données de test...');

    try {
      // Récupérer tous les modèles
      const models = await getAllModels();
      
      if (models.length === 0) {
        setMessage('❌ Aucun modèle trouvé. Ajoutez d\'abord des modèles 3D.');
        return;
      }

      // Générer plusieurs sessions de test
      for (let session = 0; session < 5; session++) {
        const sessionId = `test_session_${Date.now()}_${session}`;
        const deviceType = ['mobile', 'tablet', 'desktop'][Math.floor(Math.random() * 3)];

        // Démarrer une session
        await fetch('/api/analytics/track-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId: 'restaurant-test-123',
            sessionId,
            startTime: new Date().toISOString(),
            deviceType,
          }),
        });

        // Générer des vues pour 2-4 modèles aléatoirement
        const numModelsToView = Math.floor(Math.random() * 3) + 2;
        const shuffledModels = [...models].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < numModelsToView && i < shuffledModels.length; i++) {
          const model = shuffledModels[i];
          
          // Tracker une vue
          await fetch('/api/analytics/track-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              modelId: model.id,
              restaurantId: 'restaurant-test-123',
              timestamp: new Date().toISOString(),
              sessionId,
              interactionType: 'view',
              deviceType,
            }),
          });

          // Attendre un peu puis terminer la vue avec une durée
          const viewDuration = Math.floor(Math.random() * 180) + 30; // 30-210 secondes
          
          await fetch('/api/analytics/track-view-end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              modelId: model.id,
              restaurantId: 'restaurant-test-123',
              sessionId,
              viewDuration,
            }),
          });
        }

        // Terminer la session
        await fetch('/api/analytics/track-session-end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId: 'restaurant-test-123',
            sessionId,
            endTime: new Date().toISOString(),
          }),
        });

        setMessage(`Session ${session + 1}/5 générée...`);
        
        // Petite pause entre les sessions
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setMessage('✅ Données de test générées avec succès ! Allez voir les insights.');
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('❌ Erreur lors de la génération des données de test.');
    } finally {
      setIsGenerating(false);
    }
  };

  const reinitializeData = async () => {
    setIsReinitializing(true);
    setMessage('Réinitialisation avec les vrais noms de modèles...');

    try {
      const response = await fetch('/api/analytics/reinitialize', {
        method: 'POST',
      });

      if (response.ok) {
        setMessage('✅ Données réinitialisées avec les vrais noms de modèles !');
      } else {
        setMessage('❌ Erreur lors de la réinitialisation.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('❌ Erreur lors de la réinitialisation.');
    } finally {
      setIsReinitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🧪 Test Analytics</h1>
          <p className="text-gray-600 mb-6">
            Générez rapidement des données d'analytics pour tester le système en temps réel.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={reinitializeData}
              disabled={isReinitializing}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isReinitializing
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isReinitializing ? 'Réinitialisation...' : '🔄 Réinitialiser avec vrais noms'}
            </button>
            
            <button
              onClick={generateTestData}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isGenerating
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isGenerating ? 'Génération en cours...' : 'Générer des données de test'}
            </button>
          </div>

          {message && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{message}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3">Liens utiles :</p>
            <div className="space-y-2">
              <a
                href="/insights"
                className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                📊 Voir les Insights
              </a>
              <a
                href="/menu/test"
                target="_blank"
                className="block text-green-600 hover:text-green-700 text-sm font-medium"
              >
                🍽️ Menu Client (génère des vraies données)
              </a>
              <a
                href="/"
                className="block text-gray-600 hover:text-gray-700 text-sm font-medium"
              >
                🏠 Dashboard Principal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 