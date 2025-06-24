// Types pour l'authentification et l'autorisation
export type UserRole = 'owner' | 'manager' | 'photographer' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  restaurantId: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Permission {
  resource: 'models' | 'users' | 'analytics' | 'settings';
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
  owner: {
    role: 'owner',
    description: 'Accès complet au système',
    color: 'red',
    icon: '👑',
    permissions: [
      { resource: 'models', action: 'manage' },
      { resource: 'users', action: 'manage' },
      { resource: 'analytics', action: 'manage' },
      { resource: 'settings', action: 'manage' },
    ]
  },
  manager: {
    role: 'manager',
    description: 'Gestion des modèles et utilisateurs',
    color: 'blue',
    icon: '🎯',
    permissions: [
      { resource: 'models', action: 'manage' },
      { resource: 'users', action: 'read' },
      { resource: 'analytics', action: 'read' },
      { resource: 'settings', action: 'read' },
    ]
  },
  photographer: {
    role: 'photographer',
    description: 'Upload et édition des modèles 3D',
    color: 'green',
    icon: '📸',
    permissions: [
      { resource: 'models', action: 'create' },
      { resource: 'models', action: 'read' },
      { resource: 'models', action: 'update' },
      { resource: 'analytics', action: 'read' },
    ]
  },
  viewer: {
    role: 'viewer',
    description: 'Consultation uniquement',
    color: 'gray',
    icon: '👁️',
    permissions: [
      { resource: 'models', action: 'read' },
      { resource: 'analytics', action: 'read' },
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