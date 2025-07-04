// Types pour l'authentification et l'autorisation
export type UserRole = 'admin' | 'restaurateur';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  restaurantId?: string; // nullable pour les admins
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Permission {
  resource: 'models' | 'users' | 'analytics' | 'settings' | 'restaurants' | 'subscriptions';
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
  color: string;
  icon: string;
}

// Définition des permissions par rôle
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    role: 'admin',
    description: 'Accès complet au système - Gestion globale',
    color: 'red',
    icon: '👑',
    permissions: [
      { resource: 'models', action: 'manage' },
      { resource: 'users', action: 'manage' },
      { resource: 'analytics', action: 'manage' },
      { resource: 'settings', action: 'manage' },
      { resource: 'restaurants', action: 'manage' },
      { resource: 'subscriptions', action: 'manage' },
    ]
  },
  restaurateur: {
    role: 'restaurateur',
    description: 'Gestion complète de son restaurant',
    color: 'blue',
    icon: '🍽️',
    permissions: [
      { resource: 'models', action: 'manage' },
      { resource: 'analytics', action: 'read' },
      { resource: 'settings', action: 'update' },
    ]
  }
};

// Helper pour vérifier les permissions
export function hasPermission(
  userRole: UserRole, 
  resource: Permission['resource'], 
  action: Permission['action']
): boolean {
  const rolePerms = ROLE_PERMISSIONS[userRole];
  
  // Vérifier si l'utilisateur a la permission 'manage' pour cette ressource
  const hasManagePermission = rolePerms.permissions.some(
    p => p.resource === resource && p.action === 'manage'
  );
  
  if (hasManagePermission) return true;
  
  // Sinon vérifier la permission spécifique
  return rolePerms.permissions.some(
    p => p.resource === resource && p.action === action
  );
} 