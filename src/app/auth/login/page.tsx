'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Connexion
        await login(formData.email, formData.password);
        router.push('/dashboard');
      } else {
        // Inscription
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erreur lors de l\'inscription');
        }

        // Connexion automatique après inscription
        await login(formData.email, formData.password);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'owner' | 'manager' | 'photographer' | 'viewer') => {
    setIsLoading(true);
    setError(null);

    try {
      // Comptes de démonstration
      const demoAccounts = {
        owner: { email: 'owner@demo.com', password: 'demo123' },
        manager: { email: 'manager@demo.com', password: 'demo123' },
        photographer: { email: 'photographer@demo.com', password: 'demo123' },
        viewer: { email: 'viewer@demo.com', password: 'demo123' }
      };

      const account = demoAccounts[role];
      await login(account.email, account.password);
      router.push('/dashboard');
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
          <Link href="/" className="inline-flex items-center space-x-3 text-2xl sm:text-3xl font-bold mb-6 text-gradient">
            <span className="text-4xl sm:text-5xl">🏗️</span>
            <span>COBI</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h1>
          <p className="text-lg sm:text-xl" style={{ color: 'var(--color-text-secondary)' }}>
            {isLogin 
              ? 'Accédez à votre tableau de bord' 
              : 'Créez votre compte pour commencer'
            }
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
              { role: 'owner', label: 'Owner', icon: '👑', color: 'red' },
              { role: 'manager', label: 'Manager', icon: '🎯', color: 'blue' },
              { role: 'photographer', label: 'Photographe', icon: '📸', color: 'green' },
              { role: 'viewer', label: 'Viewer', icon: '👁️', color: 'gray' }
            ].map(({ role, label, icon, color }) => (
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
              </button>
            ))}
          </div>
          
          <p className="text-xs sm:text-sm text-center mt-4" style={{ color: 'var(--color-text-secondary)' }}>
            Cliquez sur un rôle pour vous connecter instantanément
          </p>
        </motion.div>

        {/* Login/Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-modern p-6 sm:p-8 animate-scale-in"
        >
          <div className="flex mb-8">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-l-xl font-semibold transition-all text-base sm:text-lg ${
                isLogin 
                  ? 'text-white'
                  : 'hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: isLogin ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                color: isLogin ? 'white' : 'var(--color-text-secondary)'
              }}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-r-xl font-semibold transition-all text-base sm:text-lg ${
                !isLogin 
                  ? 'text-white'
                  : 'hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: !isLogin ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                color: !isLogin ? 'white' : 'var(--color-text-secondary)'
              }}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm sm:text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  Nom complet
                </label>
                <input
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-modern"
                  placeholder="Votre nom complet"
                />
              </div>
            )}

            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Adresse e-mail
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input-modern"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="input-modern"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm sm:text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  required={!isLogin}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="input-modern"
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <div className="status-error rounded-xl p-4 animate-scale-in">
                <p className="text-sm sm:text-base font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 text-base sm:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 text-center">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm sm:text-base font-medium transition-colors hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                Mot de passe oublié ?
              </Link>
            </div>
          )}
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Retour à l'accueil
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 