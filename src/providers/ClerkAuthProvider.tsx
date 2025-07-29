'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { User, UserRole, hasPermission, Permission } from '@/types/auth';
import { supabaseAdmin } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  canPerform: (resource: Permission['resource'], action: Permission['action']) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Cache pour les données utilisateur
const userCache = new Map<string, { user: User; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function ClerkAuthProvider({ children }: AuthProviderProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchingRef = useRef<Promise<User | null> | null>(null);

  // Fonction pour récupérer les données utilisateur depuis Supabase avec cache
  const fetchUserData = useCallback(async (clerkId: string): Promise<User | null> => {
    // Vérifier le cache
    const cached = userCache.get(clerkId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🚀 Cache hit for user:', clerkId);
      return cached.user;
    }

    try {
      const { data, error } = await fetch(`/api/users/${clerkId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => res.json());
      
      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      // Mettre en cache
      if (data) {
        userCache.set(clerkId, {
          user: data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }, []);

  // Synchroniser avec Supabase quand l'utilisateur Clerk change
  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded) return;

      // Si on a déjà une requête en cours, l'attendre
      if (fetchingRef.current) {
        await fetchingRef.current;
        return;
      }

      if (clerkUser) {


        // Utilisateur connecté, récupérer les données Supabase
        const fetchPromise = fetchUserData(clerkUser.id);
        fetchingRef.current = fetchPromise;
        
        const userData = await fetchPromise;
        fetchingRef.current = null;
        
        if (userData) {
          setUser(userData);
        } else {
          // Créer les données utilisateur si elles n'existent pas
          const newUser: User = {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Utilisateur',
            avatar: clerkUser.imageUrl,
            role: 'restaurateur', // Par défaut
            restaurantId: undefined,
            createdAt: new Date().toISOString(),
            isActive: true,
            lastLogin: new Date().toISOString()
          };
          
          // Mettre en cache le nouvel utilisateur
          userCache.set(clerkUser.id, {
            user: newUser,
            timestamp: Date.now()
          });
          
          setUser(newUser);
        }
      } else {
        // Utilisateur déconnecté
        setUser(null);
      }
      
      setIsLoading(false);
    };

    syncUser();
  }, [clerkUser, isLoaded, fetchUserData]);

  const refreshUser = useCallback(async () => {
    if (clerkUser) {
      // Invalider le cache
      userCache.delete(clerkUser.id);
      
      const userData = await fetchUserData(clerkUser.id);
      if (userData) {
        setUser(userData);
      }
    }
  }, [clerkUser, fetchUserData]);

  const logout = useCallback(() => {
    // Nettoyer le cache
    if (user) {
      userCache.delete(user.id);
    }
    setUser(null);
  }, [user]);

  const canPerform = useCallback((resource: Permission['resource'], action: Permission['action']): boolean => {
    if (!user) return false;
    return hasPermission(user.role, resource, action);
  }, [user]);

  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    logout,
    canPerform,
    hasRole,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 