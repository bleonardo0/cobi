-- Migration pour ajouter la colonne ingredients à la table models_3d
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne ingredients si elle n'existe pas déjà
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'models_3d' 
    AND column_name = 'ingredients'
  ) THEN
    ALTER TABLE models_3d ADD COLUMN ingredients jsonb DEFAULT '[]'::jsonb;
    
    -- Ajouter un commentaire explicatif
    COMMENT ON COLUMN models_3d.ingredients IS 'Liste des ingrédients du plat sous forme de tableau JSON';
    
    RAISE NOTICE 'Colonne ingredients ajoutée avec succès à la table models_3d';
  ELSE
    RAISE NOTICE 'La colonne ingredients existe déjà dans la table models_3d';
  END IF;
END $$;

-- 2. Vérifier que la colonne a bien été créée
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'models_3d' 
  AND column_name = 'ingredients';

-- 3. Optionnel : Ajouter des ingrédients exemples aux modèles existants (pour test)
-- Décommentez les lignes suivantes pour ajouter des données de test

/*
UPDATE models_3d 
SET ingredients = '[
  "Mozzarella", 
  "Sauce tomate", 
  "Basilic frais", 
  "Huile d\'olive"
]'::jsonb
WHERE name ILIKE '%pizza%'
  AND (ingredients IS NULL OR ingredients = '[]'::jsonb);

UPDATE models_3d 
SET ingredients = '[
  "Pâtes fraîches", 
  "Crème fraîche", 
  "Lardons", 
  "Parmesan", 
  "Œuf"
]'::jsonb
WHERE name ILIKE '%carbonara%'
  AND (ingredients IS NULL OR ingredients = '[]'::jsonb);

UPDATE models_3d 
SET ingredients = '[
  "Salade verte", 
  "Tomates cerises", 
  "Concombre", 
  "Olives", 
  "Vinaigrette"
]'::jsonb
WHERE name ILIKE '%salade%'
  AND (ingredients IS NULL OR ingredients = '[]'::jsonb);
*/

-- 4. Vérifier les données après insertion (si activé)
-- SELECT name, ingredients FROM models_3d WHERE ingredients != '[]'::jsonb LIMIT 5; 