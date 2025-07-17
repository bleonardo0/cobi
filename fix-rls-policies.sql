-- Script pour corriger les politiques RLS (Row Level Security) qui empêchent l'upload
-- Exécuter ce script dans Supabase Dashboard > SQL Editor

-- 1. Supprimer toutes les politiques existantes pour repartir à zéro
DROP POLICY IF EXISTS "Allow public read access" ON models_3d;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON models_3d;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON models_3d;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON models_3d;
DROP POLICY IF EXISTS "Allow public insert" ON models_3d;
DROP POLICY IF EXISTS "Allow public delete" ON models_3d;
DROP POLICY IF EXISTS "Allow public update" ON models_3d;

-- 2. Créer des politiques plus permissives pour l'upload
-- Politique pour permettre la lecture publique (pour afficher les modèles)
CREATE POLICY "Enable read access for all users" ON models_3d
    FOR SELECT USING (true);

-- Politique pour permettre l'insertion (pour l'API d'upload)
CREATE POLICY "Enable insert for all users" ON models_3d
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour (pour l'édition des modèles)
CREATE POLICY "Enable update for all users" ON models_3d
    FOR UPDATE USING (true);

-- Politique pour permettre la suppression (pour la suppression des modèles)
CREATE POLICY "Enable delete for all users" ON models_3d
    FOR DELETE USING (true);

-- 3. Corriger également les politiques pour la table users
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Enable read access for users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for users" ON users
    FOR UPDATE USING (true);

-- 4. Corriger les politiques pour la table restaurants
DROP POLICY IF EXISTS "Allow public read access to restaurants" ON restaurants;

CREATE POLICY "Enable read access for restaurants" ON restaurants
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for restaurants" ON restaurants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for restaurants" ON restaurants
    FOR UPDATE USING (true);

-- 5. Corriger les politiques de storage
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;

-- Nouvelle politique pour permettre tous les accès au bucket models-3d
CREATE POLICY "Enable all operations on models-3d bucket" ON storage.objects
    FOR ALL USING (bucket_id = 'models-3d');

-- 6. Vérifier que le bucket existe et est public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('models-3d', 'models-3d', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 7. Afficher un résumé des politiques créées
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
WHERE tablename IN ('models_3d', 'users', 'restaurants')
ORDER BY tablename, policyname;

-- 8. Tester l'insertion pour vérifier que ça fonctionne
-- (Ce test sera automatiquement annulé à la fin)
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
    allergens
) VALUES (
    'Test Upload Policy',
    'test-upload-policy.glb',
    'test-upload-policy.glb',
    1024,
    'model/gltf-binary',
    'test/test-upload-policy.glb',
    'https://test.com/test-upload-policy.glb',
    'test-upload-policy-' || extract(epoch from now())::text,
    'autres',
    ARRAY['test'],
    10.50,
    'Test pour vérifier les politiques RLS',
    ARRAY['test']
);
ROLLBACK;

-- Message de confirmation
SELECT 'Politiques RLS corrigées ! Vous pouvez maintenant tester l''upload de modèles.' as message; 