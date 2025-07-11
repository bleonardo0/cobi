-- Script simplifié pour créer une table analytics dans Supabase
-- À exécuter dans le SQL Editor de Supabase

-- Table pour les vues de modèles 3D (simplifié)
CREATE TABLE IF NOT EXISTS model_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id VARCHAR(255) NOT NULL,
    restaurant_id VARCHAR(255) NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_type VARCHAR(50) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_model_views_model_id ON model_views(model_id);
CREATE INDEX IF NOT EXISTS idx_model_views_restaurant_id ON model_views(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_model_views_viewed_at ON model_views(viewed_at DESC);

-- Politique RLS (Row Level Security)
ALTER TABLE model_views ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (à modifier en production)
CREATE POLICY "Enable all operations for model_views" ON model_views FOR ALL USING (true);

-- Vérification que la table a été créée
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'model_views'; 