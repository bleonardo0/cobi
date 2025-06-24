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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Link href="/" className="inline-flex items-center space-x-2 text-2xl font-bold text-gray-900 mb-2">
            <span className="text-3xl">🏗️</span>
            <span>COBI</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h2>
          <p className="mt-2 text-gray-600">
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
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            🎯 Comptes de démonstration
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
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
                className={`p-3 rounded-lg border-2 hover:shadow-md transition-all disabled:opacity-50 ${
                  color === 'red' ? 'border-red-200 bg-red-50 hover:bg-red-100 text-red-800' :
                  color === 'blue' ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800' :
                  color === 'green' ? 'border-green-200 bg-green-50 hover:bg-green-100 text-green-800' :
                  'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-sm font-medium">{label}</div>
              </button>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            Cliquez sur un rôle pour vous connecter instantanément
          </p>
        </motion.div>

        {/* Login/Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-colors ${
                isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-colors ${
                !isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre nom complet"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse e-mail
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  required={!isLogin}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? 'Connexion...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-800"
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