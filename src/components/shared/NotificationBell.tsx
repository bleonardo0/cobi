"use client";

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/providers/ClerkAuthProvider';
import Link from 'next/link';

interface NotificationBellProps {
  restaurantId?: string | null;
}

export default function NotificationBell({ restaurantId }: NotificationBellProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const targetRestaurantId = restaurantId ?? (user?.restaurantId ?? null);
  const { items, unreadCount, isLoading, markAsRead } = useNotifications({
    userId: user?.role === 'admin' ? user?.id : undefined,
    restaurantId: user?.role === 'restaurateur' ? targetRestaurantId : undefined,
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 text-[10px] leading-4 bg-warning-500 text-white rounded-full text-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-lg z-40">
          <div className="p-3 border-b border-neutral-200 flex items-center justify-between">
            <span className="text-sm font-medium">Notifications</span>
            <button
              className="text-xs text-blue-600 hover:underline disabled:text-neutral-400"
              onClick={async () => {
                await Promise.all(items.filter(n => !n.read_at).map(n => markAsRead(n.id)));
              }}
              disabled={isLoading || unreadCount === 0}
            >
              Tout marquer comme lu
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <div className="p-4 text-sm text-neutral-500">Aucune notification</div>
            )}
            {items.map(n => (
              <div key={n.id} className={`p-3 border-b last:border-b-0 ${!n.read_at ? 'bg-blue-50/40' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-neutral-800 truncate">{n.title}</div>
                    {n.message && (
                      <div className="text-xs text-neutral-600 mt-0.5 line-clamp-2">{n.message}</div>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      {!n.read_at && (
                        <button className="text-xs text-neutral-600 hover:text-neutral-800" onClick={() => markAsRead(n.id)}>Marquer lu</button>
                      )}
                      {n.url && (
                        <Link href={n.url} className="text-xs text-blue-600 hover:underline">Ouvrir</Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


