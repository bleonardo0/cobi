'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/ClerkAuthProvider';
import Link from 'next/link';

export default function ForceAdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    user?: any;
    action?: string;
  } | null>(null);

  const handleForceAdmin = async () => {
    try {
      setProcessing(true);
      setResult(null);

      const response = await fetch('/api/admin/force-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          user: data.user,
          action: data.action
        });
        
        // Forcer le rafraîchissement de la page après 2 secondes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setResult({
          success: false,
          message: data.error || 'Erreur lors du forçage du rôle admin'
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setResult({
        success: false,
        message: 'Erreur de connexion'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Forcer le rôle Admin
          </h1>
          <p className="text-gray-600">
            Transformez votre compte actuel en compte administrateur
          </p>
        </div>

        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Compte actuel :</h3>
            <p className="text-sm text-blue-700">
              <strong>Email :</strong> {user.email}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Nom :</strong> {user.name}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Rôle actuel :</strong> {user.role}
            </p>
            {user.restaurantId && (
              <p className="text-sm text-blue-700">
                <strong>Restaurant :</strong> {user.restaurantId}
              </p>
            )}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="font-medium text-yellow-900 mb-1">⚠️ Attention</h3>
              <p className="text-sm text-yellow-800">
                Cette action va :
              </p>
              <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                <li>• Changer votre rôle vers "admin"</li>
                <li>• Supprimer l'association avec un restaurant</li>
                <li>• Vous donner accès à toutes les fonctionnalités admin</li>
              </ul>
            </div>
          </div>
        </div>

        {result && (
          <div className={`border rounded-lg p-4 mb-6 ${
            result.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {result.success ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              <span className="font-medium">{result.message}</span>
            </div>
            {result.success && result.user && (
              <div className="mt-2 text-sm">
                <p><strong>Nouveau rôle :</strong> {result.user.role}</p>
                <p><strong>Action :</strong> {result.action === 'updated' ? 'Compte mis à jour' : 'Compte créé'}</p>
                {result.success && (
                  <p className="mt-2 text-green-600">
                    🔄 La page va se rafraîchir automatiquement...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleForceAdmin}
            disabled={processing}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Traitement en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Forcer le rôle Admin
              </>
            )}
          </button>

          <div className="flex space-x-4">
            <Link href="/admin/assign-users" className="flex-1">
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                Gestion des utilisateurs
              </button>
            </Link>
            <Link href="/admin/dashboard" className="flex-1">
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                Dashboard admin
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Cette page permet de résoudre les problèmes d'autorisation en forçant le rôle admin sur votre compte actuel.
          </p>
        </div>
      </div>
    </div>
  );
} 