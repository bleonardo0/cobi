import { useState, useEffect } from 'react';
import { ModelRevision, AuditLog, CreateAuditLogParams } from '@/types/history';
import { Model3D } from '@/types/model';
import { useAuth } from './useAuth';

export function useModelHistory(modelId: string) {
  const [revisions, setRevisions] = useState<ModelRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (modelId) {
      fetchRevisions();
    }
  }, [modelId]);

  const fetchRevisions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/models/${modelId}/revisions`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'historique');
      }
      
      const data = await response.json();
      setRevisions(data.revisions || []);
    } catch (error) {
      console.error('Error fetching revisions:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const createRevision = async (
    model: Model3D, 
    changeNote?: string, 
    versionName?: string
  ): Promise<ModelRevision | null> => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      const newRevision: Omit<ModelRevision, 'id'> = {
        modelId: model.id,
        versionNumber: revisions.length + 1,
        versionName,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        changeNote,
        isActive: true, // La nouvelle révision devient active
        snapshot: {
          name: model.name,
          glbUrl: model.glbUrl,
          usdzUrl: model.usdzUrl,
          thumbnailUrl: model.thumbnailUrl,
          fileSize: model.fileSize,
          glbFileSize: model.glbFileSize,
          usdzFileSize: model.usdzFileSize,
          category: model.category,
          tags: model.tags,
          description: model.description,
          price: model.price,
        }
      };

      const response = await fetch(`/api/models/${modelId}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRevision)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la révision');
      }

      const data = await response.json();
      await fetchRevisions(); // Recharger la liste
      return data.revision;
    } catch (error) {
      console.error('Error creating revision:', error);
      throw error;
    }
  };

  const restoreRevision = async (revisionId: string): Promise<Model3D | null> => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      const response = await fetch(`/api/models/${modelId}/revisions/${revisionId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la restauration');
      }

      const data = await response.json();
      await fetchRevisions(); // Recharger la liste
      return data.model;
    } catch (error) {
      console.error('Error restoring revision:', error);
      throw error;
    }
  };

  const deleteRevision = async (revisionId: string): Promise<void> => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      const response = await fetch(`/api/models/${modelId}/revisions/${revisionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await fetchRevisions(); // Recharger la liste
    } catch (error) {
      console.error('Error deleting revision:', error);
      throw error;
    }
  };

  return {
    revisions,
    isLoading,
    error,
    createRevision,
    restoreRevision,
    deleteRevision,
    refresh: fetchRevisions,
  };
}

// Hook pour les logs d'audit
export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (filters?: {
    limit?: number;
    offset?: number;
    userId?: string;
    resourceId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.resourceId) params.append('resourceId', filters.resourceId);
      if (filters?.action) params.append('action', filters.action);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/audit/logs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des logs');
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const createAuditLog = async (params: CreateAuditLogParams): Promise<void> => {
    try {
      const logData = {
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        resourceName: params.resourceName,
        userId: params.user.id,
        userEmail: params.user.email,
        userName: params.user.name,
        timestamp: new Date().toISOString(),
        details: params.details,
        ipAddress: window.location.hostname, // Simplification
        userAgent: navigator.userAgent,
      };

      await fetch('/api/audit/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Ne pas throw - les logs d'audit ne doivent pas faire échouer les actions principales
    }
  };

  useEffect(() => {
    fetchLogs({ limit: 50 }); // Charger les 50 derniers logs par défaut
  }, []);

  return {
    logs,
    isLoading,
    error,
    fetchLogs,
    createAuditLog,
    refresh: () => fetchLogs({ limit: 50 }),
  };
} 