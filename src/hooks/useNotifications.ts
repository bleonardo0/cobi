import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { NotificationItem } from '@/types/notifications';

interface UseNotificationsOptions {
  userId?: string | null;
  restaurantId?: string | null;
}

export function useNotifications({ userId, restaurantId }: UseNotificationsOptions) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasTarget = !!userId || !!restaurantId;

  const unreadCount = useMemo(() => items.filter(n => !n.read_at).length, [items]);

  const fetchNotifications = useCallback(async () => {
    if (!hasTarget) return;
    try {
      setIsLoading(true);
      setError(null);

      const qs = new URLSearchParams();
      if (userId) qs.set('userId', userId);
      if (restaurantId) qs.set('restaurantId', restaurantId);
      qs.set('limit', '30');

      const res = await fetch(`/api/notifications?${qs.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch notifications');
      setItems(json.notifications || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId, restaurantId, hasTarget]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!hasTarget) return;

    const channel = supabase
      .channel('notifications-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        const row = payload.new as NotificationItem;
        if ((userId && row.user_id === userId) || (restaurantId && row.restaurant_id === restaurantId)) {
          setItems(prev => [row, ...prev]);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications' }, payload => {
        const row = payload.new as NotificationItem;
        setItems(prev => prev.map(n => (n.id === row.id ? row : n)));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, restaurantId, hasTarget]);

  const markAsRead = useCallback(async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
  }, []);

  return { items, unreadCount, isLoading, error, refetch: fetchNotifications, markAsRead };
}


