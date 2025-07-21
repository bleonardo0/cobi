'use client';

import { useAuth } from '@/providers/ClerkAuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculer la destination avant le rendu
  const destination = useMemo(() => {
    if (isLoading || !user) return null;
    
    if (user.role === 'admin') {
      return '/admin/dashboard';
    }
    
    if (user.role === 'restaurateur') {
      return user.restaurantId ? '/restaurant/dashboard' : '/no-restaurant';
    }
    
    return '/sign-in';
  }, [user, isLoading]);

  useEffect(() => {
    // Ne rediriger que si on est vraiment sur la page d'accueil ET que le composant est monté
    if (!mounted || pathname !== '/') return;

    if (!isLoading && !user) {
      router.replace('/sign-in');
      return;
    }

    if (destination) {
      router.replace(destination);
    }
  }, [destination, isLoading, user, router, mounted, pathname]);

  // Pendant le chargement ou si pas encore monté
  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si pas d'utilisateur, ne rien afficher (redirection en cours)
  if (!user) {
    return null;
  }

  // Afficher un message de redirection
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Redirection...</p>
      </div>
    </div>
  );
}
