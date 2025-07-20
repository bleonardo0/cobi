-- Migration pour ajouter la colonne ambiance_image_url à la table restaurants
-- À exécuter dans l'éditeur SQL de Supabase

ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS ambiance_image_url TEXT;

-- Commentaire pour la colonne
COMMENT ON COLUMN restaurants.ambiance_image_url IS 'URL de l''image d''ambiance affichée en haut du menu moderne';

-- Optionnel : Index si nécessaire pour les requêtes
-- CREATE INDEX IF NOT EXISTS idx_restaurants_ambiance_image ON restaurants(ambiance_image_url) WHERE ambiance_image_url IS NOT NULL; 