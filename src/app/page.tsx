'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import CobiLogoWithText from '@/components/shared/CobiLogoWithText';

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
        <CobiLogoWithText size="lg" className="mb-4" />
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}
