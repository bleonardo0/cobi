-- Script pour supprimer les colonnes USDZ de la table models_3d
-- Exécuter ce script dans votre console Supabase

-- Supprimer les colonnes liées à USDZ
ALTER TABLE models_3d 
DROP COLUMN IF EXISTS usdz_url,
DROP COLUMN IF EXISTS usdz_path,
DROP COLUMN IF EXISTS usdz_file_size,
DROP COLUMN IF EXISTS glb_url,
DROP COLUMN IF EXISTS glb_path,
DROP COLUMN IF EXISTS glb_file_size,
DROP COLUMN IF EXISTS format;

-- Ajouter des commentaires pour clarifier le schéma
COMMENT ON COLUMN models_3d.public_url IS 'URL publique du modèle 3D (GLB/GLTF)';
COMMENT ON COLUMN models_3d.storage_path IS 'Chemin de stockage du modèle 3D (GLB/GLTF)';
COMMENT ON COLUMN models_3d.mime_type IS 'Type MIME du modèle (model/gltf-binary ou model/gltf+json)';
COMMENT ON COLUMN models_3d.filename IS 'Nom de fichier du modèle 3D (GLB/GLTF)';

-- Mettre à jour les contraintes si nécessaire
ALTER TABLE models_3d 
ADD CONSTRAINT check_mime_type 
CHECK (mime_type IN ('model/gltf-binary', 'model/gltf+json'));

-- Ajouter un index sur le mime_type pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_models_3d_mime_type ON models_3d(mime_type);

-- Nettoyer les données existantes qui n'ont pas de fichier principal
-- (au cas où il y aurait des modèles USDZ-only)
DELETE FROM models_3d 
WHERE (public_url IS NULL OR storage_path IS NULL OR filename IS NULL);

-- Mettre à jour les modèles existants pour s'assurer que les formats sont corrects
UPDATE models_3d 
SET mime_type = 'model/gltf-binary' 
WHERE mime_type IS NULL OR mime_type = 'model/vnd.usdz+zip';

-- Afficher un résumé des modèles restants
SELECT 
    COUNT(*) as total_models,
    mime_type,
    COUNT(*) as count_by_type
FROM models_3d 
GROUP BY mime_type;

-- Afficher les modèles pour vérification
SELECT 
    id,
    name,
    filename,
    mime_type,
    file_size,
    created_at
FROM models_3d 
ORDER BY created_at DESC;

COMMIT; 