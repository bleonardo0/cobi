// Re-export du hook principal d'authentification
export { useAuth } from '@/providers/ClerkAuthProvider';

// Hook pour vérifier les permissions spécifiques
import { useAuth } from '@/providers/ClerkAuthProvider';

export function usePermissions() {
  const { user, canPerform, hasRole } = useAuth();

  return {
    // Permissions sur les modèles
    canCreateModel: canPerform('models', 'create'),
    canEditModel: canPerform('models', 'update'),
    canDeleteModel: canPerform('models', 'delete'),
    canManageModels: canPerform('models', 'manage'),

    // Permissions sur les utilisateurs
    canInviteUsers: canPerform('users', 'create'),
    canEditUsers: canPerform('users', 'update'),
    canDeleteUsers: canPerform('users', 'delete'),
    canManageUsers: canPerform('users', 'manage'),

    // Permissions sur les analytics
    canViewAnalytics: canPerform('analytics', 'read'),
    canManageAnalytics: canPerform('analytics', 'manage'),

    // Permissions sur les settings
    canViewSettings: canPerform('settings', 'read'),
    canManageSettings: canPerform('settings', 'manage'),

    // Rôles spécifiques
    isAdmin: hasRole('admin'),
    isRestaurateur: hasRole('restaurateur'),
    
    // User info
    currentUser: user,
  };
} 