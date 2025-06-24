// Types pour l'historique et les logs d'audit
import { User } from './auth';
import { Model3D } from './model';

export interface ModelRevision {
  id: string;
  modelId: string;
  versionNumber: number;
  versionName?: string; // ex: "v1.2 - Correction texture"
  createdBy: string; // User ID
  createdAt: string;
  changeNote?: string;
  isActive: boolean; // La version actuellement active
  
  // Snapshot des données du modèle à cette révision
  snapshot: {
    name: string;
    glbUrl?: string;
    usdzUrl?: string;
    thumbnailUrl?: string;
    fileSize: number;
    glbFileSize?: number;
    usdzFileSize?: number;
    category?: string;
    tags?: string[];
    description?: string;
    price?: number;
  };
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  resourceName: string;
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: string;
  details?: Record<string, any>; // Données spécifiques à l'action
  ipAddress?: string;
  userAgent?: string;
}

export type AuditAction = 
  | 'create' | 'update' | 'delete' | 'restore'
  | 'upload' | 'download' | 'view'
  | 'login' | 'logout'
  | 'invite_user' | 'remove_user' | 'change_role';

export type AuditResource =
  | 'model' | 'user' | 'revision' | 'session' | 'settings';

// Helper pour créer des logs d'audit
export interface CreateAuditLogParams {
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  resourceName: string;
  user: User;
  details?: Record<string, any>;
}

// Types pour les filtres de logs
export interface LogFilters {
  userId?: string;
  action?: AuditAction;
  resource?: AuditResource;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Types pour les statistiques d'historique
export interface HistoryStats {
  totalRevisions: number;
  activeModels: number;
  deletedModels: number;
  totalUsers: number;
  actionsLast30Days: number;
  topUsers: Array<{
    userId: string;
    userName: string;
    actionCount: number;
  }>;
}

// Helpers pour formater les messages de logs
export function formatAuditMessage(log: AuditLog): string {
  const userName = log.userName || log.userEmail;
  const date = new Date(log.timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  switch (log.action) {
    case 'create':
      return `${userName} a créé ${log.resource} "${log.resourceName}" le ${date}`;
    case 'update':
      return `${userName} a modifié ${log.resource} "${log.resourceName}" le ${date}`;
    case 'delete':
      return `${userName} a supprimé ${log.resource} "${log.resourceName}" le ${date}`;
    case 'restore':
      return `${userName} a restauré ${log.resource} "${log.resourceName}" le ${date}`;
    case 'upload':
      return `${userName} a uploadé "${log.resourceName}" le ${date}`;
    case 'view':
      return `${userName} a consulté "${log.resourceName}" le ${date}`;
    case 'login':
      return `${userName} s'est connecté le ${date}`;
    case 'invite_user':
      return `${userName} a invité un utilisateur le ${date}`;
    case 'remove_user':
      return `${userName} a supprimé l'utilisateur "${log.resourceName}" le ${date}`;
    case 'change_role':
      return `${userName} a modifié le rôle de "${log.resourceName}" le ${date}`;
    default:
      return `${userName} a effectué l'action "${log.action}" sur "${log.resourceName}" le ${date}`;
  }
}

export function getActionIcon(action: AuditAction): string {
  switch (action) {
    case 'create': return '➕';
    case 'update': return '✏️';
    case 'delete': return '🗑️';
    case 'restore': return '🔄';
    case 'upload': return '📤';
    case 'download': return '📥';
    case 'view': return '👁️';
    case 'login': return '🔐';
    case 'logout': return '🚪';
    case 'invite_user': return '📧';
    case 'remove_user': return '👤❌';
    case 'change_role': return '🎭';
    default: return '📝';
  }
}

export function getActionColor(action: AuditAction): string {
  switch (action) {
    case 'create': case 'upload': case 'login': case 'invite_user':
      return 'text-green-600';
    case 'update': case 'restore': case 'change_role':
      return 'text-blue-600';
    case 'delete': case 'remove_user': case 'logout':
      return 'text-red-600';
    case 'view': case 'download':
      return 'text-gray-600';
    default:
      return 'text-gray-800';
  }
} 