'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirection automatique vers /admin/dashboard
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-4">🔄</div>
        <p className="text-gray-600">Redirection vers le tableau de bord admin...</p>
      </div>
    </div>
  );
} 