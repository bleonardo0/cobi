-- Migration complète pour corriger la table users
-- Exécuter dans Supabase Dashboard > SQL Editor

-- 1. Vérifier la structure actuelle
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Ajouter les colonnes manquantes une par une
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Modifier la colonne password_hash pour qu'elle soit nullable (pas nécessaire avec Clerk)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 4. Créer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- 5. Vérifier la structure finale
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 