-- Migration hotspots pour COBI (GLB uniquement)
-- Exécuter dans Supabase Dashboard > SQL Editor

-- Nouvelles colonnes pour les hotspots et métadonnées étendues
DO $$ 
BEGIN
    -- Nutri-Score et sécurité alimentaire
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'nutri_score') THEN
        ALTER TABLE models_3d ADD COLUMN nutri_score CHAR(1) CHECK (nutri_score IN ('A', 'B', 'C', 'D', 'E'));
        RAISE NOTICE 'Colonne nutri_score ajoutée';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'security_risk') THEN
        ALTER TABLE models_3d ADD COLUMN security_risk BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Colonne security_risk ajoutée';
    END IF;
    
    -- Traçabilité
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'origin_country') THEN
        ALTER TABLE models_3d ADD COLUMN origin_country TEXT;
        RAISE NOTICE 'Colonne origin_country ajoutée';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'transport_distance') THEN
        ALTER TABLE models_3d ADD COLUMN transport_distance INTEGER; -- en km
        RAISE NOTICE 'Colonne transport_distance ajoutée';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'carbon_footprint') THEN
        ALTER TABLE models_3d ADD COLUMN carbon_footprint DECIMAL(8,2); -- en kg CO2
        RAISE NOTICE 'Colonne carbon_footprint ajoutée';
    END IF;
    
    -- Accords boisson (JSON pour flexibilité)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'drink_pairings') THEN
        ALTER TABLE models_3d ADD COLUMN drink_pairings JSONB;
        RAISE NOTICE 'Colonne drink_pairings ajoutée';
    END IF;
    
    -- Hotspots configuration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'hotspots_enabled') THEN
        ALTER TABLE models_3d ADD COLUMN hotspots_enabled BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Colonne hotspots_enabled ajoutée';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'hotspots_config') THEN
        ALTER TABLE models_3d ADD COLUMN hotspots_config JSONB;
        RAISE NOTICE 'Colonne hotspots_config ajoutée';
    END IF;
    
    -- Note moyenne (calculée)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'average_rating') THEN
        ALTER TABLE models_3d ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
        RAISE NOTICE 'Colonne average_rating ajoutée';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'rating_count') THEN
        ALTER TABLE models_3d ADD COLUMN rating_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Colonne rating_count ajoutée';
    END IF;
END $$;

-- Table pour les ratings individuels
CREATE TABLE IF NOT EXISTS model_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id UUID NOT NULL REFERENCES models_3d(id) ON DELETE CASCADE,
    user_session TEXT NOT NULL, -- Session ou user ID
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    is_positive BOOLEAN, -- pour le système thumbs up/down
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(model_id, user_session)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_model_ratings_model_id ON model_ratings(model_id);
CREATE INDEX IF NOT EXISTS idx_model_ratings_created_at ON model_ratings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_models_3d_nutri_score ON models_3d(nutri_score);
CREATE INDEX IF NOT EXISTS idx_models_3d_origin_country ON models_3d(origin_country);
CREATE INDEX IF NOT EXISTS idx_models_3d_drink_pairings ON models_3d USING GIN(drink_pairings);
CREATE INDEX IF NOT EXISTS idx_models_3d_hotspots_config ON models_3d USING GIN(hotspots_config);
CREATE INDEX IF NOT EXISTS idx_models_3d_average_rating ON models_3d(average_rating DESC);

-- Configuration hotspots par défaut pour les modèles existants
UPDATE models_3d 
SET hotspots_config = '{
    "allergens": {"x": 0.2, "y": 0.8, "z": 0.1},
    "traceability": {"x": 0.8, "y": 0.6, "z": 0.2},
    "pairings": {"x": 0.5, "y": 0.3, "z": 0.8},
    "rating": {"x": 0.7, "y": 0.9, "z": 0.1},
    "share": {"x": 0.9, "y": 0.1, "z": 0.1}
}'::jsonb
WHERE hotspots_config IS NULL;

-- Activation par défaut des hotspots pour les modèles existants
UPDATE models_3d 
SET hotspots_enabled = TRUE
WHERE hotspots_enabled IS NULL;

COMMIT; 