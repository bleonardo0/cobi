-- Script corrigé pour supprimer les colonnes USDZ de la table models_3d
-- Exécuter ce script dans votre console Supabase

-- Étape 1: Afficher les données existantes pour diagnostic
SELECT 
    id,
    name,
    mime_type,
    public_url,
    storage_path,
    filename
FROM models_3d 
ORDER BY created_at DESC;

-- Étape 2: Mettre à jour les données existantes AVANT d'ajouter les contraintes
-- Corriger les mime_types non conformes
UPDATE models_3d 
SET mime_type = 'model/gltf-binary' 
WHERE mime_type = 'model/vnd.usdz+zip' OR mime_type IS NULL OR mime_type NOT IN ('model/gltf-binary', 'model/gltf+json');

-- Étape 3: Nettoyer les données corrompues ou incomplètes
-- Supprimer les modèles qui n'ont pas les champs essentiels
DELETE FROM models_3d 
WHERE (public_url IS NULL OR public_url = '') 
   OR (storage_path IS NULL OR storage_path = '') 
   OR (filename IS NULL OR filename = '');

-- Étape 4: Supprimer les colonnes USDZ si elles existent
ALTER TABLE models_3d 
DROP COLUMN IF EXISTS usdz_url,
DROP COLUMN IF EXISTS usdz_path,
DROP COLUMN IF EXISTS usdz_file_size,
DROP COLUMN IF EXISTS glb_url,
DROP COLUMN IF EXISTS glb_path,
DROP COLUMN IF EXISTS glb_file_size,
DROP COLUMN IF EXISTS format;

-- Étape 5: Maintenant ajouter les contraintes sur les données propres
ALTER TABLE models_3d 
ADD CONSTRAINT check_mime_type 
CHECK (mime_type IN ('model/gltf-binary', 'model/gltf+json'));

-- Étape 6: Ajouter les contraintes NOT NULL pour les champs essentiels
ALTER TABLE models_3d 
ALTER COLUMN public_url SET NOT NULL,
ALTER COLUMN storage_path SET NOT NULL,
ALTER COLUMN filename SET NOT NULL,
ALTER COLUMN mime_type SET NOT NULL;

-- Étape 7: Ajouter des commentaires pour clarifier le schéma
COMMENT ON COLUMN models_3d.public_url IS 'URL publique du modèle 3D (GLB/GLTF)';
COMMENT ON COLUMN models_3d.storage_path IS 'Chemin de stockage du modèle 3D (GLB/GLTF)';
COMMENT ON COLUMN models_3d.mime_type IS 'Type MIME du modèle (model/gltf-binary ou model/gltf+json)';
COMMENT ON COLUMN models_3d.filename IS 'Nom de fichier du modèle 3D (GLB/GLTF)';

-- Étape 8: Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_models_3d_mime_type ON models_3d(mime_type);
CREATE INDEX IF NOT EXISTS idx_models_3d_filename ON models_3d(filename);
CREATE INDEX IF NOT EXISTS idx_models_3d_slug ON models_3d(slug);

-- Étape 9: Afficher un résumé des modèles après nettoyage
SELECT 
    COUNT(*) as total_models,
    mime_type,
    COUNT(*) as count_by_type
FROM models_3d 
GROUP BY mime_type;

-- Étape 10: Afficher les modèles finaux pour vérification
SELECT 
    id,
    name,
    filename,
    mime_type,
    file_size,
    created_at,
    CASE 
        WHEN LENGTH(public_url) > 50 THEN LEFT(public_url, 50) || '...'
        ELSE public_url
    END as public_url_preview
FROM models_3d 
ORDER BY created_at DESC;

COMMIT; 