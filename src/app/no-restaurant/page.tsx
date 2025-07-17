'use client';

import { useAuth } from '@/providers/ClerkAuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SignOutButton } from '@clerk/nextjs';

export default function NoRestaurantPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/sign-in');
      return;
    }

    // Si l'utilisateur a maintenant un restaurant, rediriger
    if (user.restaurantId) {
      router.push('/restaurant/dashboard');
      return;
    }

    // Si c'est un admin, rediriger vers le dashboard admin
    if (user.role === 'admin') {
      router.push('/admin/dashboard');
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Compte en attente
          </h1>
          
          <p className="text-gray-600 mb-6">
            Votre compte a été créé avec succès, mais aucun restaurant ne vous a encore été assigné.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Prochaines étapes :</h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1 text-left">
              <li>Contactez l'administrateur pour qu'il vous assigne un restaurant</li>
              <li>Une fois assigné, vous pourrez accéder au dashboard de votre restaurant</li>
              <li>Vous pourrez alors gérer vos modèles 3D et votre menu</li>
            </ol>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Vos informations :</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Email :</strong> {user.email}</p>
              <p><strong>Nom :</strong> {user.name}</p>
              <p><strong>Rôle :</strong> {user.role}</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <a 
              href="mailto:admin@cobi.com"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Contacter l'administrateur
            </a>
            
            <div className="pt-2">
              <SignOutButton>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Se déconnecter
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 