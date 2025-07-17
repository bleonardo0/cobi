'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/ClerkAuthProvider';
import Link from 'next/link';

export default function SyncAdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    user?: any;
  } | null>(null);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setResult(null);

      const response = await fetch('/api/admin/sync-admin', {
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
          user: data.user
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Erreur lors de la synchronisation'
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setResult({
        success: false,
        message: 'Erreur de connexion'
      });
    } finally {
      setSyncing(false);
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
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Synchronisation Admin
          </h1>
          <p className="text-gray-600">
            Synchronisez votre compte admin avec la base de données
          </p>
        </div>

        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Compte Clerk connecté :</h3>
            <p className="text-sm text-blue-700">
              <strong>Email :</strong> {user.email}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Nom :</strong> {user.name}
            </p>
            <p className="text-sm text-blue-700">
              <strong>ID :</strong> {user.id}
            </p>
          </div>
        )}

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
                <p><strong>Rôle :</strong> {result.user.role}</p>
                <p><strong>Email :</strong> {result.user.email}</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {syncing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Synchronisation...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Synchroniser le compte admin
              </>
            )}
          </button>

          <div className="flex space-x-4">
            <Link href="/admin/assign-users" className="flex-1">
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                Aller à la gestion des utilisateurs
              </button>
            </Link>
            <Link href="/admin/dashboard" className="flex-1">
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                Retour au dashboard
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Cette page permet de synchroniser votre compte Clerk avec la base de données Supabase pour accéder aux fonctionnalités admin.
          </p>
        </div>
      </div>
    </div>
  );
} 