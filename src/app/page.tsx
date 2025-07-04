'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Utilisateur connecté, rediriger vers le dashboard approprié
        if (user.role === 'admin') {
          router.replace('/admin/dashboard');
        } else if (user.role === 'restaurateur') {
          router.replace('/restaurant/dashboard');
        }
      } else {
        // Utilisateur non connecté, rediriger vers la page de connexion
        router.replace('/auth/login');
      }
    }
  }, [user, isLoading, router]);

  // Affichage de chargement pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbfaf5 0%, #f8f7f2 50%, #e9ecf1 100%)' }}>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #1f2d3d 0%, #22354a 100%)' }}>
          <span className="text-cream font-bold text-2xl" style={{ color: '#fbfaf5' }}>C</span>
        </div>
        <h1 className="text-2xl font-serif mb-2" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: '#1f2d3d' }}>
          Cobi
        </h1>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}
