'use client';

import { useState } from 'react';

const testRestaurantId = 'restaurant-bella-vita-1';

export default function TestTrackingPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const makeApiCall = async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`/api/analytics/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      addLog(`✅ ${endpoint}: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      addLog(`❌ ${endpoint}: ${error}`);
      return null;
    }
  };

  const checkStorage = async () => {
    try {
      const response = await fetch(`/api/analytics/debug?restaurantId=${testRestaurantId}`);
      const result = await response.json();
      addLog(`📊 Storage debug: ${JSON.stringify(result.debug.storage)}`);
      return result;
    } catch (error) {
      addLog(`❌ Debug check: ${error}`);
      return null;
    }
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setLogs([]);
    
    const testSessionId = `test_session_${Date.now()}`;
    
    addLog(`🧪 Starting test for restaurant: ${testRestaurantId}`);
    addLog(`📝 Session ID: ${testSessionId}`);

    // 1. Test session start
    addLog('🚀 1. Testing session start...');
    await makeApiCall('track-session', {
      restaurantId: testRestaurantId,
      sessionId: testSessionId,
      startTime: new Date().toISOString(),
      deviceType: 'desktop',
      userAgent: 'Test Agent',
    });

    // 2. Test menu view
    addLog('🍽️ 2. Testing menu view...');
    await makeApiCall('track-menu-view', {
      restaurantId: testRestaurantId,
      timestamp: new Date().toISOString(),
      sessionId: testSessionId,
      deviceType: 'desktop',
      userAgent: 'Test Agent',
      pageUrl: 'http://localhost:3000/menu/bella-vita',
      referrer: 'http://localhost:3000',
    });

    // 3. Check storage
    addLog('🔍 3. Checking storage...');
    await checkStorage();

    // 4. Test stats
    addLog('📈 4. Testing stats...');
    try {
      const response = await fetch(`/api/analytics/stats?restaurantId=${testRestaurantId}`);
      const result = await response.json();
      addLog(`📊 Stats: totalViews=${result.data.general.totalViews}, uniqueSessions=${result.data.general.uniqueSessions}`);
    } catch (error) {
      addLog(`❌ Stats check: ${error}`);
    }

    addLog('✅ Test completed!');
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Test Tracking Analytics</h1>
          
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={runFullTest}
                disabled={isRunning}
                className={`px-6 py-3 rounded-lg font-semibold ${
                  isRunning 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isRunning ? 'Test en cours...' : 'Lancer le test complet'}
              </button>
              
              <button
                onClick={() => setLogs([])}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Effacer les logs
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Restaurant ID: <code className="bg-gray-100 px-2 py-1 rounded">{testRestaurantId}</code></p>
              <p>Ce test va:</p>
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>Créer une session</li>
                <li>Tracker une vue de menu</li>
                <li>Vérifier le stockage</li>
                <li>Récupérer les statistiques</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto">
            <div className="mb-2 text-gray-400">Console:</div>
            {logs.length === 0 ? (
              <div className="text-gray-500">Aucun log pour le moment...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 break-all">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 