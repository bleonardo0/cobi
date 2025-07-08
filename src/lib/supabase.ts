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
      restaurants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          address: string;
          phone: string | null;
          email: string | null;
          website: string | null;
          description: string | null;
          short_description: string | null;
          logo_url: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          rating: number | null;
          allergens: string[] | null;
          owner_name: string | null;
          owner_contact: string | null;
          owner_contact_method: 'email' | 'phone' | 'both' | null;
          subscription_status: 'active' | 'inactive' | 'pending';
          subscription_plan: 'basic' | 'premium';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          address: string;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          description?: string | null;
          short_description?: string | null;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          rating?: number | null;
          allergens?: string[] | null;
          owner_name?: string | null;
          owner_contact?: string | null;
          owner_contact_method?: 'email' | 'phone' | 'both' | null;
          subscription_status?: 'active' | 'inactive' | 'pending';
          subscription_plan?: 'basic' | 'premium';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          address?: string;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          description?: string | null;
          short_description?: string | null;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          rating?: number | null;
          allergens?: string[] | null;
          owner_name?: string | null;
          owner_contact?: string | null;
          owner_contact_method?: 'email' | 'phone' | 'both' | null;
          subscription_status?: 'active' | 'inactive' | 'pending';
          subscription_plan?: 'basic' | 'premium';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
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
          thumbnail_url: string | null;
          thumbnail_path: string | null;
          category: string | null;
          tags: string[] | null;
          description: string | null;
          ingredients: string[] | null;
          price: number | null;
          short_description: string | null;
          allergens: string[] | null;
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
          thumbnail_url?: string | null;
          thumbnail_path?: string | null;
          category?: string | null;
          tags?: string[] | null;
          description?: string | null;
          ingredients?: string[] | null;
          price?: number | null;
          short_description?: string | null;
          allergens?: string[] | null;
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
          thumbnail_url?: string | null;
          thumbnail_path?: string | null;
          category?: string | null;
          tags?: string[] | null;
          description?: string | null;
          ingredients?: string[] | null;
          price?: number | null;
          short_description?: string | null;
          allergens?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 