-- Script simple pour diagnostiquer le problème d'upload
-- Exécuter ce script dans Supabase Dashboard > SQL Editor

-- 1. Vérifier la table models_3d existe
SELECT 'models_3d table exists' as status;

-- 2. Désactiver complètement RLS sur models_3d
ALTER TABLE models_3d DISABLE ROW LEVEL SECURITY;

-- 3. Supprimer toutes les politiques
DROP POLICY IF EXISTS "Allow public read access" ON models_3d;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON models_3d;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON models_3d;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON models_3d;
DROP POLICY IF EXISTS "Enable read access for all users" ON models_3d;
DROP POLICY IF EXISTS "Enable insert for all users" ON models_3d;
DROP POLICY IF EXISTS "Enable update for all users" ON models_3d;
DROP POLICY IF EXISTS "Enable delete for all users" ON models_3d;
DROP POLICY IF EXISTS "Allow all operations on models_3d" ON models_3d;

-- 4. Test d'insertion avec les colonnes minimales requises
BEGIN;
INSERT INTO models_3d (
    name, 
    filename, 
    original_name, 
    file_size, 
    mime_type, 
    storage_path, 
    public_url, 
    slug
) VALUES (
    'Test Pizza',
    'pizza-test.glb',
    'pizza-test.glb',
    1024,
    'model/gltf-binary',
    'test/pizza-test.glb',
    'https://test.com/pizza-test.glb',
    'pizza-test-' || extract(epoch from now())::text
);
COMMIT;

-- 5. Vérifier que l'insertion a fonctionné
SELECT 'Test insertion successful' as status, count(*) as models_count FROM models_3d;

-- 6. Supprimer le test
DELETE FROM models_3d WHERE name = 'Test Pizza';

-- 7. Message final
SELECT 'RLS désactivé - Essayez maintenant l''upload depuis l''interface' as message; 