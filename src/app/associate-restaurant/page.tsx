'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/ClerkAuthProvider';
import { motion } from 'framer-motion';

export default function AssociateRestaurantPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const handleAssociate = async (restaurantSlug: string) => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/associate-restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ restaurantSlug }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        // Rafraîchir les données utilisateur
        await refreshUser();
        // Rediriger vers le dashboard après 2 secondes
        setTimeout(() => {
          router.push('/restaurant/dashboard');
        }, 2000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Erreur lors de l\'association');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbfaf5 0%, #f8f7f2 50%, #e9ecf1 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Associer votre compte à un restaurant
        </h1>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Bonjour <strong>{user?.name}</strong> ! Pour accéder à votre dashboard, 
            vous devez vous associer à un restaurant.
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-gray-50 border">
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleAssociate('bella-vita')}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Association en cours...' : 'S\'associer à Bella Vita'}
          </button>

          <button
            onClick={() => router.push('/sign-in')}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Retour à la connexion
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Si vous n'avez pas de restaurant assigné, contactez l'administrateur.
          </p>
        </div>
      </motion.div>
    </div>
  );
} 