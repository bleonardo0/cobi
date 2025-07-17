-- Script pour corriger le problème RLS du DirectUploadForm
-- Le problème vient du fait que DirectUploadForm utilise le client Supabase côté client
-- qui utilise la clé 'anon' soumise aux politiques RLS

-- 1. Désactiver RLS sur models_3d
ALTER TABLE models_3d DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier que RLS est désactivé
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'models_3d';

-- 3. Nettoyer toutes les politiques existantes
DROP POLICY IF EXISTS "Allow public read access" ON models_3d;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON models_3d;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON models_3d;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON models_3d;
DROP POLICY IF EXISTS "Enable read access for all users" ON models_3d;
DROP POLICY IF EXISTS "Enable insert for all users" ON models_3d;
DROP POLICY IF EXISTS "Enable update for all users" ON models_3d;
DROP POLICY IF EXISTS "Enable delete for all users" ON models_3d;
DROP POLICY IF EXISTS "Allow all operations on models_3d" ON models_3d;

-- 4. Vérifier qu'aucune politique n'existe
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'models_3d';

-- 5. Test d'insertion directe (simule ce que fait DirectUploadForm)
BEGIN;
INSERT INTO models_3d (
    name, 
    filename, 
    original_name, 
    slug, 
    file_size, 
    mime_type, 
    storage_path, 
    public_url, 
    category, 
    tags, 
    price, 
    short_description, 
    allergens, 
    restaurant_id, 
    created_at, 
    updated_at
) VALUES (
    'Test Direct Upload',
    'test-direct-upload.glb',
    'test-direct-upload.glb',
    'test-direct-upload-' || extract(epoch from now())::text,
    1024,
    'model/gltf-binary',
    'test/test-direct-upload.glb',
    'https://test.com/test-direct-upload.glb',
    'autres',
    ARRAY[]::text[],
    10.50,
    'Test direct upload',
    ARRAY[]::text[],
    null,
    NOW(),
    NOW()
);
ROLLBACK;

-- 6. Message de confirmation
SELECT 
    'RLS désactivé sur models_3d - Test maintenant le DirectUploadForm' as message,
    'Si ça ne marche toujours pas, le problème vient d''ailleurs' as note; 