-- Migration: Ajouter les colonnes pour les hotspots
-- Date: 2024-12-19
-- Description: Ajoute toutes les colonnes nécessaires pour le système de hotspots interactifs

-- Ajouter les colonnes hotspots à la table models_3d
ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS hotspots_enabled BOOLEAN DEFAULT FALSE;

ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS hotspots_config JSONB DEFAULT '{}';

ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS nutri_score TEXT CHECK (nutri_score IN ('A', 'B', 'C', 'D', 'E'));

ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS security_risk BOOLEAN DEFAULT FALSE;

ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS origin_country TEXT;

ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS transport_distance NUMERIC;

ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS carbon_footprint NUMERIC;

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN models_3d.hotspots_enabled IS 'Indique si les hotspots sont activés pour ce modèle';
COMMENT ON COLUMN models_3d.hotspots_config IS 'Configuration JSON des positions et données des hotspots';
COMMENT ON COLUMN models_3d.nutri_score IS 'Score nutritionnel du produit (A, B, C, D, E)';
COMMENT ON COLUMN models_3d.security_risk IS 'Indique si le produit présente un risque de sécurité alimentaire';
COMMENT ON COLUMN models_3d.origin_country IS 'Pays d''origine du produit';
COMMENT ON COLUMN models_3d.transport_distance IS 'Distance de transport en kilomètres';
COMMENT ON COLUMN models_3d.carbon_footprint IS 'Empreinte carbone en kg de CO2';

-- Créer des index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_models_3d_hotspots_enabled ON models_3d(hotspots_enabled);
CREATE INDEX IF NOT EXISTS idx_models_3d_nutri_score ON models_3d(nutri_score);
CREATE INDEX IF NOT EXISTS idx_models_3d_origin_country ON models_3d(origin_country);

-- Vérification: Afficher la structure de la table après migration
-- (Décommentez cette ligne pour vérifier la structure)
-- SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'models_3d' AND column_name LIKE '%hotspot%' OR column_name IN ('nutri_score', 'security_risk', 'origin_country', 'transport_distance', 'carbon_footprint');

-- Message de succès
SELECT 'Migration hotspots terminée avec succès! 🎯' AS message; 