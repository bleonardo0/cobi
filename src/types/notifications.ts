export type NotificationType =
  | 'model_ready'
  | 'model_failed'
  | 'low_stock'
  | 'price_inconsistency'
  | 'feedback_new'
  | 'analytics_alert'
  | 'task'
  | 'system';

export interface NotificationItem {
  id: string;
  user_id?: string | null;
  restaurant_id?: string | null;
  type: NotificationType;
  title: string;
  message?: string | null;
  url?: string | null;
  read_at?: string | null;
  created_at: string;
}



