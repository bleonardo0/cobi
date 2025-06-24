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
      // D'abord, essayer de récupérer depuis localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      }

      // Puis vérifier avec le serveur
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        // Token invalide ou expiré
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simuler l'appel API de login avec comptes de démonstration
      const demoUsers: Record<string, User> = {
        'owner@demo.com': {
          id: 'owner-1',
          email: 'owner@demo.com',
          name: 'Pierre Proprietaire',
          role: 'owner',
          restaurantId: 'restaurant-1',
          createdAt: new Date().toISOString(),
          isActive: true,
          avatar: undefined,
          lastLogin: new Date().toISOString()
        },
        'manager@demo.com': {
          id: 'manager-1',
          email: 'manager@demo.com',
          name: 'Marie Manager',
          role: 'manager',
          restaurantId: 'restaurant-1',
          createdAt: new Date().toISOString(),
          isActive: true,
          avatar: undefined,
          lastLogin: new Date().toISOString()
        },
        'photographer@demo.com': {
          id: 'photographer-1',
          email: 'photographer@demo.com',
          name: 'Paul Photographe',
          role: 'photographer',
          restaurantId: 'restaurant-1',
          createdAt: new Date().toISOString(),
          isActive: true,
          avatar: undefined,
          lastLogin: new Date().toISOString()
        },
        'viewer@demo.com': {
          id: 'viewer-1',
          email: 'viewer@demo.com',
          name: 'Victor Viewer',
          role: 'viewer',
          restaurantId: 'restaurant-1',
          createdAt: new Date().toISOString(),
          isActive: true,
          avatar: undefined,
          lastLogin: new Date().toISOString()
        }
      };

      // Vérifier les comptes de démonstration
      if (demoUsers[email] && password === 'demo123') {
        const userData = demoUsers[email];
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
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
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    
    // Optionnel: appel API pour invalider le token côté serveur
    fetch('/api/auth/logout', { method: 'POST' }).catch(console.error);
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