"use client";

import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/providers/ClerkAuthProvider';
import Link from 'next/link';

interface NotificationBellProps {
  restaurantId?: string | null;
}

export default function NotificationBell({ restaurantId }: NotificationBellProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetRestaurantId = restaurantId ?? (user?.restaurantId ?? null);
  const { items, unreadCount, isLoading, markAsRead, deleteNotification, deleteAll } = useNotifications({
    userId: user?.role === 'admin' ? user?.id : undefined,
    restaurantId: user?.role === 'restaurateur' ? targetRestaurantId : undefined,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(null), 2200);
  };

  // Fermer si clic en dehors ou touche Échap
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <>
            {/* Dot + ping (rouge) */}
            <span className="absolute top-0.5 right-0.5 inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 ring-2 ring-white"></span>
            </span>
            {/* Compteur (rouge) */}
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 text-[10px] leading-4 bg-red-600 text-white rounded-full text-center shadow-sm ring-2 ring-white">
              {unreadCount}
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-lg z-40">
          <div className="p-3 border-b border-neutral-200 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-neutral-800">Notifications</span>
            <div className="flex items-center gap-3 text-[11px] whitespace-nowrap">
              <button
                className="text-blue-600 hover:underline disabled:text-neutral-300 disabled:hover:no-underline"
                onClick={async () => {
                  await Promise.all(items.filter(n => !n.read_at).map(n => markAsRead(n.id)));
                  setOpen(false);
                  showToast('Toutes les notifications sont marquées comme lues', 'success');
                }}
                disabled={isLoading || unreadCount === 0}
              >
                Marquer tout lu
              </button>
              <button
                className="text-red-600 hover:underline disabled:text-neutral-300 disabled:hover:no-underline"
                onClick={async () => {
                  const ok = window.confirm('Supprimer toutes les notifications ?');
                  if (!ok) return;
                  await deleteAll();
                  setOpen(false);
                  showToast('Toutes les notifications ont été supprimées', 'success');
                }}
                disabled={isLoading || items.length === 0}
              >
                Supprimer tout
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <div className="p-4 text-sm text-neutral-500">Aucune notification</div>
            )}
            {items.map(n => (
              <div key={n.id} className={`p-3 border-b last:border-b-0 ${!n.read_at ? 'bg-blue-50/40' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${!n.read_at ? 'bg-blue-500' : 'bg-neutral-300'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-neutral-800 truncate">{n.title}</div>
                    {n.message && (
                      <div className="text-xs text-neutral-600 mt-0.5 line-clamp-2">{n.message}</div>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-[11px]">
                      {!n.read_at && (
                        <button
                          className="text-xs text-neutral-600 hover:text-neutral-800"
                          onClick={async () => {
                            await markAsRead(n.id);
                            setOpen(false);
                            showToast('Notification marquée comme lue', 'success');
                          }}
                        >
                          Marquer lu
                        </button>
                      )}
                      {n.url && (
                        <Link
                          href={n.url}
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          Ouvrir
                        </Link>
                      )}
                    </div>
                  </div>
                  <button
                    className="ml-2 text-neutral-400 hover:text-neutral-600"
                    aria-label="Supprimer"
                    title="Supprimer"
                    onClick={async () => {
                      await deleteNotification(n.id);
                      showToast('Notification supprimée', 'success');
                    }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg border text-sm ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}


