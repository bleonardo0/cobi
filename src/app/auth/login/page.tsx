'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import CobiLogoWithText from '@/components/shared/CobiLogoWithText';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { login, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData.email, formData.password);
      
      // Redirection basée sur le rôle
      // Cette logique sera exécutée après la mise à jour du user dans useAuth
      // On utilise un petit délai pour s'assurer que le user est mis à jour
      setTimeout(() => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (currentUser.role === 'restaurateur') {
          router.push('/restaurant/dashboard');
        } else {
          router.push('/restaurant/dashboard'); // fallback
        }
      }, 100);
    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen gradient-bg-soft flex items-center justify-center section-padding px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 sm:space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center animate-fade-in"
        >
          <CobiLogoWithText size="md" className="mb-6" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Connexion
          </h1>
          <p className="text-lg sm:text-xl" style={{ color: 'var(--color-text-secondary)' }}>
            Accédez à votre tableau de bord
          </p>
        </motion.div>



        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-modern p-6 sm:p-8 animate-scale-in"
        >
          <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
            🔐 Connexion
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Mot de passe
                </label>
                <Link 
                  href="/auth/reset"
                  className="text-sm hover:underline transition-colors"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 hover:shadow-lg"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Besoin d'un compte ? Contactez l'administrateur
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 