-- Script pour ajouter les colonnes manquantes à la table model_views
-- À exécuter dans le SQL Editor de Supabase

-- Ajouter les colonnes manquantes à model_views
DO $$ 
BEGIN
    -- Ajouter view_duration si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'model_views' AND column_name = 'view_duration') THEN
        ALTER TABLE model_views ADD COLUMN view_duration INTEGER;
        RAISE NOTICE 'Colonne view_duration ajoutée à model_views';
    ELSE
        RAISE NOTICE 'Colonne view_duration existe déjà dans model_views';
    END IF;

    -- Ajouter ended_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'model_views' AND column_name = 'ended_at') THEN
        ALTER TABLE model_views ADD COLUMN ended_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne ended_at ajoutée à model_views';
    ELSE
        RAISE NOTICE 'Colonne ended_at existe déjà dans model_views';
    END IF;

    -- Ajouter interaction_type si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'model_views' AND column_name = 'interaction_type') THEN
        ALTER TABLE model_views ADD COLUMN interaction_type VARCHAR(50);
        RAISE NOTICE 'Colonne interaction_type ajoutée à model_views';
    ELSE
        RAISE NOTICE 'Colonne interaction_type existe déjà dans model_views';
    END IF;
END $$;

-- Créer des index pour optimiser les performances sur les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_model_views_ended_at ON model_views(ended_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_views_interaction_type ON model_views(interaction_type);
CREATE INDEX IF NOT EXISTS idx_model_views_duration ON model_views(view_duration DESC);

-- Vérifier que les colonnes ont été ajoutées
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'model_views' 
ORDER BY ordinal_position;

-- Statistiques sur la table
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'model_views'; 