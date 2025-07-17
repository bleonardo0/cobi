-- Script de diagnostic pour identifier le problème d'upload RLS
-- Exécuter ce script dans Supabase Dashboard > SQL Editor

-- 1. Vérifier la structure de la table models_3d
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'models_3d' 
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes sur la table models_3d
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'models_3d';

-- 3. Vérifier les restaurants existants
SELECT 
    id,
    name,
    slug,
    created_at
FROM restaurants
ORDER BY created_at DESC;

-- 4. Vérifier les politiques RLS actuelles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'models_3d';

-- 5. Désactiver temporairement RLS sur models_3d pour tester
ALTER TABLE models_3d DISABLE ROW LEVEL SECURITY;

-- 6. Créer un restaurant par défaut si nécessaire
INSERT INTO restaurants (id, name, slug, address, rating, short_description, subscription_status, subscription_plan)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Restaurant Test',
    'restaurant-test',
    'Adresse test',
    4.5,
    'Restaurant de test pour les uploads',
    'active',
    'premium'
) ON CONFLICT (id) DO NOTHING;

-- 7. Test d'insertion simple
BEGIN;
INSERT INTO models_3d (
    name, 
    filename, 
    original_name, 
    file_size, 
    mime_type, 
    storage_path, 
    public_url, 
    slug,
    category,
    tags,
    price,
    short_description,
    allergens,
    restaurant_id
) VALUES (
    'Test Model RLS',
    'test-model-rls.glb',
    'test-model-rls.glb',
    1024,
    'model/gltf-binary',
    'test/test-model-rls.glb',
    'https://test.com/test-model-rls.glb',
    'test-model-rls-' || extract(epoch from now())::text,
    'autres',
    ARRAY['test'],
    10.50,
    'Test pour diagnostiquer RLS',
    ARRAY['test'],
    '00000000-0000-0000-0000-000000000001'
);
ROLLBACK;

-- 8. Test d'insertion avec restaurant_id NULL
BEGIN;
INSERT INTO models_3d (
    name, 
    filename, 
    original_name, 
    file_size, 
    mime_type, 
    storage_path, 
    public_url, 
    slug,
    category,
    tags,
    price,
    short_description,
    allergens,
    restaurant_id
) VALUES (
    'Test Model NULL Restaurant',
    'test-model-null.glb',
    'test-model-null.glb',
    1024,
    'model/gltf-binary',
    'test/test-model-null.glb',
    'https://test.com/test-model-null.glb',
    'test-model-null-' || extract(epoch from now())::text,
    'autres',
    ARRAY['test'],
    10.50,
    'Test avec restaurant_id NULL',
    ARRAY['test'],
    NULL
);
ROLLBACK;

-- 9. Modifier la contrainte pour permettre NULL
ALTER TABLE models_3d ALTER COLUMN restaurant_id DROP NOT NULL;

-- 10. Réactiver RLS avec des politiques plus permissives
ALTER TABLE models_3d ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Allow public read access" ON models_3d;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON models_3d;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON models_3d;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON models_3d;
DROP POLICY IF EXISTS "Enable read access for all users" ON models_3d;
DROP POLICY IF EXISTS "Enable insert for all users" ON models_3d;
DROP POLICY IF EXISTS "Enable update for all users" ON models_3d;
DROP POLICY IF EXISTS "Enable delete for all users" ON models_3d;

-- Créer une seule politique très permissive
CREATE POLICY "Allow all operations on models_3d" ON models_3d
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 11. Test final avec RLS activé
BEGIN;
INSERT INTO models_3d (
    name, 
    filename, 
    original_name, 
    file_size, 
    mime_type, 
    storage_path, 
    public_url, 
    slug,
    category,
    tags,
    price,
    short_description,
    allergens,
    restaurant_id
) VALUES (
    'Test Model Final',
    'test-model-final.glb',
    'test-model-final.glb',
    1024,
    'model/gltf-binary',
    'test/test-model-final.glb',
    'https://test.com/test-model-final.glb',
    'test-model-final-' || extract(epoch from now())::text,
    'autres',
    ARRAY['test'],
    10.50,
    'Test final avec RLS',
    ARRAY['test'],
    NULL
);
ROLLBACK;

-- 12. Afficher le résumé
SELECT 
    'Diagnostic terminé ! Testez maintenant l''upload depuis l''interface.' as message,
    COUNT(*) as restaurants_count
FROM restaurants; 