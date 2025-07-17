-- Migration pour ajouter le champ clerk_id à la table users
-- Exécuter dans Supabase Dashboard > SQL Editor

-- 1. Ajouter la colonne clerk_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255) UNIQUE;

-- 2. Créer un index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- 3. Vérifier la structure mise à jour
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 