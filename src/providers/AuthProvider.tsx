'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole, hasPermission, Permission } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  canPerform: (resource: Permission['resource'], action: Permission['action']) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Vérifier si nous sommes côté client (pas SSR)
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      // Récupérer depuis localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        
        // Vérifier que les données sont valides
        if (userData && userData.id && userData.email && userData.role) {
          setUser(userData);
          console.log('✅ Utilisateur récupéré depuis localStorage:', userData.email);
                 } else {
           // Données corrompues
           localStorage.removeItem('user');
           setUser(null);
           console.log('❌ Données utilisateur corrompues, suppression');
         }
       } else {
         setUser(null);
         console.log('ℹ️ Aucun utilisateur sauvegardé');
       }
     } catch (error) {
       console.error('Erreur lors de la récupération de l\'utilisateur:', error);
       if (typeof window !== 'undefined') {
         localStorage.removeItem('user');
       }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Comptes de démonstration pour les tests
      const demoUsers: Record<string, User> = {
        'admin@cobi.com': {
          id: 'admin-uuid',
          email: 'admin@cobi.com',
          name: 'Administrateur Cobi',
          role: 'admin',
          restaurantId: undefined,
          createdAt: new Date().toISOString(),
          isActive: true,
          avatar: undefined,
          lastLogin: new Date().toISOString()
        }
      };

      // Vérifier les comptes de démonstration (mot de passe simple pour les tests)
      if (demoUsers[email] && password === 'demo123') {
        const userData = demoUsers[email];
        setUser(userData);
        
        // Sauvegarder en localStorage si côté client
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        console.log('✅ Connexion réussie:', userData.email);
        return;
      }

      // Sinon, appel API normal
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid credentials');
      }

      const data = await response.json();
      setUser(data.user);
      
      // Sauvegarder en localStorage si côté client
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    
    // Vérifier si nous sommes côté client avant d'accéder à localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    
    console.log('🚪 Utilisateur déconnecté');
  };

  const canPerform = (resource: Permission['resource'], action: Permission['action']): boolean => {
    if (!user) return false;
    return hasPermission(user.role, resource, action);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    canPerform,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 