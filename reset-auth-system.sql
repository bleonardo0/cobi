-- Script de remise à zéro complète du système d'authentification
-- Exécuter dans Supabase Dashboard > SQL Editor

-- 1. Supprimer tous les utilisateurs existants
DELETE FROM users;

-- 2. Remettre la table users à sa structure de base
DROP TABLE IF EXISTS users CASCADE;

-- 3. Recréer la table users avec une structure simple et compatible Clerk
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'restaurateur')),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- 4. Créer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_restaurant_id ON users(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- 5. Activer la sécurité RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. Créer une politique simple pour permettre toutes les opérations (à ajuster plus tard)
CREATE POLICY "Allow all operations for users" ON users FOR ALL USING (true);

-- 7. Créer un compte admin temporaire (remplacer CLERK_ADMIN_ID par votre ID Clerk)
-- Vous devrez remplacer 'your_clerk_admin_id' par votre vrai ID Clerk
INSERT INTO users (clerk_id, email, name, role, restaurant_id, is_active)
VALUES (
    'your_clerk_admin_id', -- À remplacer par votre ID Clerk
    'admin@cobi.com',
    'Administrateur Principal',
    'admin',
    NULL,
    true
);

-- 8. Vérifier la structure finale
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 9. Afficher les utilisateurs créés
SELECT * FROM users; 