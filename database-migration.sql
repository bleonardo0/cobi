-- Script de migration pour ajouter les colonnes de catégorisation
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Ajouter les nouvelles colonnes
ALTER TABLE models_3d ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE models_3d ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE models_3d ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE models_3d ADD COLUMN IF NOT EXISTS ingredients TEXT[];

-- Créer les index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_models_3d_category ON models_3d(category);
CREATE INDEX IF NOT EXISTS idx_models_3d_tags ON models_3d USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_models_3d_ingredients ON models_3d USING GIN(ingredients);

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'models_3d' 
AND column_name IN ('category', 'tags', 'description', 'ingredients')
ORDER BY column_name;

-- Migration pour ajouter les nouveaux champs restaurant
-- À exécuter sur Supabase

-- Ajout des nouvelles colonnes
DO $$ 
BEGIN
    -- Vérifier et ajouter price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'price') THEN
        ALTER TABLE models_3d ADD COLUMN price DECIMAL(10,2);
        RAISE NOTICE 'Colonne price ajoutée';
    ELSE
        RAISE NOTICE 'Colonne price existe déjà';
    END IF;
    
    -- Vérifier et ajouter short_description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'short_description') THEN
        ALTER TABLE models_3d ADD COLUMN short_description VARCHAR(150);
        RAISE NOTICE 'Colonne short_description ajoutée';
    ELSE
        RAISE NOTICE 'Colonne short_description existe déjà';
    END IF;
    
    -- Vérifier et ajouter allergens
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'allergens') THEN
        ALTER TABLE models_3d ADD COLUMN allergens TEXT[];
        RAISE NOTICE 'Colonne allergens ajoutée';
    ELSE
        RAISE NOTICE 'Colonne allergens existe déjà';
    END IF;
END $$;

-- Création de l'index pour les allergènes
CREATE INDEX IF NOT EXISTS idx_models_3d_allergens ON models_3d USING GIN(allergens);

-- Mise à jour des modèles existants avec des données d'exemple
UPDATE models_3d SET 
    price = CASE 
        WHEN category = 'entrees' THEN ROUND((RANDOM() * 8 + 7)::numeric, 2)  -- 7-15€
        WHEN category = 'plats' THEN ROUND((RANDOM() * 15 + 18)::numeric, 2)   -- 18-33€
        WHEN category = 'desserts' THEN ROUND((RANDOM() * 4 + 6)::numeric, 2)  -- 6-10€
        WHEN category = 'boissons' THEN ROUND((RANDOM() * 8 + 3)::numeric, 2)  -- 3-11€
        ELSE ROUND((RANDOM() * 20 + 10)::numeric, 2)                           -- 10-30€
    END,
    short_description = CASE 
        WHEN name ILIKE '%salade%' THEN 'Salade fraîche et croquante aux légumes de saison'
        WHEN name ILIKE '%burger%' THEN 'Burger artisanal avec des ingrédients de qualité'
        WHEN name ILIKE '%pizza%' THEN 'Pizza traditionnelle avec une pâte fine et croustillante'
        WHEN name ILIKE '%tarte%' THEN 'Tarte maison préparée avec des fruits frais'
        WHEN name ILIKE '%soupe%' THEN 'Soupe onctueuse mijotée avec des légumes frais'
        ELSE 'Plat délicieux préparé avec soin par nos chefs'
    END,
    allergens = CASE 
        WHEN name ILIKE '%gluten%' OR name ILIKE '%pain%' OR name ILIKE '%pizza%' THEN ARRAY['gluten']
        WHEN name ILIKE '%fromage%' OR name ILIKE '%lait%' THEN ARRAY['lactose']
        WHEN name ILIKE '%oeuf%' THEN ARRAY['oeufs']
        WHEN name ILIKE '%poisson%' THEN ARRAY['poisson']
        WHEN name ILIKE '%crevette%' OR name ILIKE '%crabe%' THEN ARRAY['crustaces']
        ELSE ARRAY[]::TEXT[]
    END
WHERE price IS NULL OR short_description IS NULL OR allergens IS NULL;

-- Affichage du résultat
SELECT 'Migration terminée. Nouveaux champs ajoutés:' as status;
SELECT 
    COUNT(*) as total_models,
    COUNT(CASE WHEN price IS NOT NULL THEN 1 END) as models_with_price,
    COUNT(CASE WHEN short_description IS NOT NULL THEN 1 END) as models_with_description,
    COUNT(CASE WHEN allergens IS NOT NULL THEN 1 END) as models_with_allergens
FROM models_3d; 