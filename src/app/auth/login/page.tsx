'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

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

  const handleDemoLogin = async (role: 'admin' | 'restaurateur') => {
    setIsLoading(true);
    setError(null);

    try {
      // Comptes de démonstration
      const demoAccounts = {
        admin: { email: 'admin@cobi.com', password: 'demo123' },
        restaurateur: { email: 'bellavita@cobi.com', password: 'demo123' }
      };

      const account = demoAccounts[role];
      await login(account.email, account.password);
      
      // Redirection basée sur le rôle
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/restaurant/dashboard');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setError('Erreur lors de la connexion de démonstration');
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
          <div className="inline-flex items-center space-x-3 text-2xl sm:text-3xl font-bold mb-6 text-gradient">
            <span className="text-4xl sm:text-5xl">🍽️</span>
            <span>COBI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Connexion
          </h1>
          <p className="text-lg sm:text-xl" style={{ color: 'var(--color-text-secondary)' }}>
            Accédez à votre tableau de bord
          </p>
        </motion.div>

        {/* Demo Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-modern card-hover p-6 sm:p-8 animate-scale-in"
        >
          <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
            🎯 Comptes de démonstration
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              { role: 'admin', label: 'Administrateur', icon: '👑', color: 'red', description: 'Gestion globale' },
              { role: 'restaurateur', label: 'Bella Vita', icon: '🍽️', color: 'blue', description: 'Dashboard restaurant' }
            ].map(({ role, label, icon, color, description }) => (
              <button
                key={role}
                onClick={() => handleDemoLogin(role as any)}
                disabled={isLoading}
                className="p-4 sm:p-5 rounded-xl border-2 border-dashed card-hover transition-all disabled:opacity-50"
                style={{ 
                  borderColor: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-bg-primary)'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.borderColor = 'var(--color-primary)';
                  (e.target as HTMLElement).style.backgroundColor = 'rgba(30, 64, 175, 0.05)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.borderColor = 'var(--color-text-secondary)';
                  (e.target as HTMLElement).style.backgroundColor = 'var(--color-bg-primary)';
                }}
              >
                <div className="text-2xl sm:text-3xl mb-2">{icon}</div>
                <div className="text-sm sm:text-base font-semibold">{label}</div>
                <div className="text-xs text-gray-500 mt-1">{description}</div>
              </button>
            ))}
          </div>
          
          <p className="text-xs sm:text-sm text-center mt-4" style={{ color: 'var(--color-text-secondary)' }}>
            Cliquez sur un rôle pour vous connecter instantanément
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
            🔐 Connexion avec vos identifiants
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
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Mot de passe
              </label>
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