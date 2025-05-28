import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Client pour le côté client (avec clé anonyme)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client pour le côté serveur (avec clé service pour les opérations admin)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Types pour la base de données
export interface Database {
  public: {
    Tables: {
      models_3d: {
        Row: {
          id: string;
          name: string;
          filename: string;
          original_name: string;
          file_size: number;
          mime_type: string;
          storage_path: string;
          public_url: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          filename: string;
          original_name: string;
          file_size: number;
          mime_type: string;
          storage_path: string;
          public_url: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          filename?: string;
          original_name?: string;
          file_size?: number;
          mime_type?: string;
          storage_path?: string;
          public_url?: string;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 