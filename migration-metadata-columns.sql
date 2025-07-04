-- Migration pour ajouter toutes les colonnes de métadonnées manquantes
-- Exécuter ce script dans Supabase Dashboard > SQL Editor

-- Ajouter les colonnes de métadonnées si elles n'existent pas
DO $$ 
BEGIN
    -- Thumbnail URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE models_3d ADD COLUMN thumbnail_url TEXT;
        RAISE NOTICE 'Colonne thumbnail_url ajoutée';
    END IF;
    
    -- Thumbnail path
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'thumbnail_path') THEN
        ALTER TABLE models_3d ADD COLUMN thumbnail_path TEXT;
        RAISE NOTICE 'Colonne thumbnail_path ajoutée';
    END IF;
    
    -- Category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'category') THEN
        ALTER TABLE models_3d ADD COLUMN category VARCHAR(50);
        RAISE NOTICE 'Colonne category ajoutée';
    END IF;
    
    -- Tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'tags') THEN
        ALTER TABLE models_3d ADD COLUMN tags TEXT[];
        RAISE NOTICE 'Colonne tags ajoutée';
    END IF;
    
    -- Description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'description') THEN
        ALTER TABLE models_3d ADD COLUMN description TEXT;
        RAISE NOTICE 'Colonne description ajoutée';
    END IF;
    
    -- Ingredients
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'ingredients') THEN
        ALTER TABLE models_3d ADD COLUMN ingredients TEXT[];
        RAISE NOTICE 'Colonne ingredients ajoutée';
    END IF;
    
    -- Price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'price') THEN
        ALTER TABLE models_3d ADD COLUMN price DECIMAL(10,2);
        RAISE NOTICE 'Colonne price ajoutée';
    END IF;
    
    -- Short description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'short_description') THEN
        ALTER TABLE models_3d ADD COLUMN short_description VARCHAR(150);
        RAISE NOTICE 'Colonne short_description ajoutée';
    END IF;
    
    -- Allergens
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'allergens') THEN
        ALTER TABLE models_3d ADD COLUMN allergens TEXT[];
        RAISE NOTICE 'Colonne allergens ajoutée';
    END IF;
END $$;

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_models_3d_category ON models_3d(category);
CREATE INDEX IF NOT EXISTS idx_models_3d_tags ON models_3d USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_models_3d_allergens ON models_3d USING GIN(allergens);
CREATE INDEX IF NOT EXISTS idx_models_3d_ingredients ON models_3d USING GIN(ingredients);
CREATE INDEX IF NOT EXISTS idx_models_3d_price ON models_3d(price);

-- Vérifier les colonnes ajoutées
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'models_3d' 
AND column_name IN ('thumbnail_url', 'thumbnail_path', 'category', 'tags', 'description', 'ingredients', 'price', 'short_description', 'allergens')
ORDER BY column_name;

-- Afficher un résumé de la table
SELECT 
    COUNT(*) as total_records,
    COUNT(category) as records_with_category,
    COUNT(tags) as records_with_tags,
    COUNT(price) as records_with_price,
    COUNT(short_description) as records_with_description,
    COUNT(allergens) as records_with_allergens
FROM models_3d;

COMMIT; 