-- ============================================================================
-- MIGRATION : Ajouter les colonnes manquantes à la table restaurants
-- ============================================================================
-- Exécutez ce script dans votre dashboard Supabase (SQL Editor)

-- D'abord, vérifions la structure actuelle de la table restaurants
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
ORDER BY ordinal_position;

-- Ajouter les colonnes manquantes une par une
DO $$ 
BEGIN
    -- Ajouter slug
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'slug') THEN
        ALTER TABLE restaurants ADD COLUMN slug VARCHAR(255);
        RAISE NOTICE 'Colonne slug ajoutée';
    ELSE
        RAISE NOTICE 'Colonne slug existe déjà';
    END IF;

    -- Ajouter phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'phone') THEN
        ALTER TABLE restaurants ADD COLUMN phone VARCHAR(50);
        RAISE NOTICE 'Colonne phone ajoutée';
    ELSE
        RAISE NOTICE 'Colonne phone existe déjà';
    END IF;

    -- Ajouter website
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'website') THEN
        ALTER TABLE restaurants ADD COLUMN website TEXT;
        RAISE NOTICE 'Colonne website ajoutée';
    ELSE
        RAISE NOTICE 'Colonne website existe déjà';
    END IF;

    -- Ajouter email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'email') THEN
        ALTER TABLE restaurants ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Colonne email ajoutée';
    ELSE
        RAISE NOTICE 'Colonne email existe déjà';
    END IF;

    -- Ajouter description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'description') THEN
        ALTER TABLE restaurants ADD COLUMN description TEXT;
        RAISE NOTICE 'Colonne description ajoutée';
    ELSE
        RAISE NOTICE 'Colonne description existe déjà';
    END IF;

    -- Ajouter short_description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'short_description') THEN
        ALTER TABLE restaurants ADD COLUMN short_description TEXT;
        RAISE NOTICE 'Colonne short_description ajoutée';
    ELSE
        RAISE NOTICE 'Colonne short_description existe déjà';
    END IF;

    -- Ajouter logo_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'logo_url') THEN
        ALTER TABLE restaurants ADD COLUMN logo_url TEXT;
        RAISE NOTICE 'Colonne logo_url ajoutée';
    ELSE
        RAISE NOTICE 'Colonne logo_url existe déjà';
    END IF;

    -- Ajouter cover_image_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'cover_image_url') THEN
        ALTER TABLE restaurants ADD COLUMN cover_image_url TEXT;
        RAISE NOTICE 'Colonne cover_image_url ajoutée';
    ELSE
        RAISE NOTICE 'Colonne cover_image_url existe déjà';
    END IF;

    -- Ajouter primary_color
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'primary_color') THEN
        ALTER TABLE restaurants ADD COLUMN primary_color VARCHAR(7) DEFAULT '#0a5b48';
        RAISE NOTICE 'Colonne primary_color ajoutée';
    ELSE
        RAISE NOTICE 'Colonne primary_color existe déjà';
    END IF;

    -- Ajouter secondary_color
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'secondary_color') THEN
        ALTER TABLE restaurants ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#d97706';
        RAISE NOTICE 'Colonne secondary_color ajoutée';
    ELSE
        RAISE NOTICE 'Colonne secondary_color existe déjà';
    END IF;

    -- Ajouter subscription_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'subscription_status') THEN
        ALTER TABLE restaurants ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'active';
        RAISE NOTICE 'Colonne subscription_status ajoutée';
    ELSE
        RAISE NOTICE 'Colonne subscription_status existe déjà';
    END IF;

    -- Ajouter subscription_plan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'subscription_plan') THEN
        ALTER TABLE restaurants ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'basic';
        RAISE NOTICE 'Colonne subscription_plan ajoutée';
    ELSE
        RAISE NOTICE 'Colonne subscription_plan existe déjà';
    END IF;

    -- Ajouter is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'is_active') THEN
        ALTER TABLE restaurants ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Colonne is_active ajoutée';
    ELSE
        RAISE NOTICE 'Colonne is_active existe déjà';
    END IF;

    -- Ajouter settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'settings') THEN
        ALTER TABLE restaurants ADD COLUMN settings JSONB DEFAULT '{}';
        RAISE NOTICE 'Colonne settings ajoutée';
    ELSE
        RAISE NOTICE 'Colonne settings existe déjà';
    END IF;

    -- Ajouter created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'created_at') THEN
        ALTER TABLE restaurants ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne created_at ajoutée';
    ELSE
        RAISE NOTICE 'Colonne created_at existe déjà';
    END IF;

    -- Ajouter updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'updated_at') THEN
        ALTER TABLE restaurants ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne updated_at ajoutée';
    ELSE
        RAISE NOTICE 'Colonne updated_at existe déjà';
    END IF;

END $$;

-- Créer la fonction pour updated_at si elle n'existe pas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ajouter le trigger pour updated_at
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Créer les index manquants
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_subscription_status ON restaurants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON restaurants(name);

-- Ajouter une contrainte unique sur slug si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'restaurants' AND constraint_name = 'restaurants_slug_key') THEN
        ALTER TABLE restaurants ADD CONSTRAINT restaurants_slug_key UNIQUE (slug);
        RAISE NOTICE 'Contrainte unique sur slug ajoutée';
    ELSE
        RAISE NOTICE 'Contrainte unique sur slug existe déjà';
    END IF;
END $$;

-- Mettre à jour les données existantes avec des valeurs par défaut
UPDATE restaurants 
SET 
    slug = COALESCE(slug, LOWER(REPLACE(name, ' ', '-'))),
    phone = COALESCE(phone, '+33 1 42 86 87 88'),
    website = COALESCE(website, 'https://example.com'),
    description = COALESCE(description, short_description, 'Restaurant de qualité'),
    short_description = COALESCE(short_description, 'Restaurant de qualité'),
    logo_url = COALESCE(logo_url, '/logos/default.png'),
    primary_color = COALESCE(primary_color, '#0a5b48'),
    secondary_color = COALESCE(secondary_color, '#d97706'),
    subscription_status = COALESCE(subscription_status, 'active'),
    subscription_plan = COALESCE(subscription_plan, 'basic'),
    is_active = COALESCE(is_active, true),
    settings = COALESCE(settings, '{}'),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE 
    slug IS NULL OR 
    phone IS NULL OR 
    website IS NULL OR 
    description IS NULL OR 
    short_description IS NULL OR 
    logo_url IS NULL OR 
    primary_color IS NULL OR 
    secondary_color IS NULL OR 
    subscription_status IS NULL OR 
    subscription_plan IS NULL OR 
    is_active IS NULL OR 
    settings IS NULL OR 
    created_at IS NULL OR 
    updated_at IS NULL;

-- Créer ou mettre à jour le restaurant Bella Vita
INSERT INTO restaurants (id, name, slug, adress, phone, website, description, short_description, logo_url, rating, allergens, primary_color, secondary_color, subscription_status, subscription_plan, is_active)
VALUES (
    'bella-vita-uuid',
    'Bella Vita',
    'bella-vita',
    '123 Rue de la Paix, 75001 Paris',
    '+33 1 42 86 87 88',
    'https://bellavita.fr',
    'Découvrez notre menu italien en 3D - Une expérience culinaire immersive',
    'Restaurant italien authentique avec une cuisine traditionnelle',
    '/logos/bella-vita.png',
    4.8,
    ARRAY['gluten', 'lactose'],
    '#0a5b48',
    '#d97706',
    'active',
    'premium',
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    adress = EXCLUDED.adress,
    phone = EXCLUDED.phone,
    website = EXCLUDED.website,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    logo_url = EXCLUDED.logo_url,
    rating = EXCLUDED.rating,
    allergens = EXCLUDED.allergens,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    subscription_status = EXCLUDED.subscription_status,
    subscription_plan = EXCLUDED.subscription_plan,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Vérifier que tout a été ajouté correctement
SELECT 'Migration terminée avec succès!' as status;

-- Afficher la nouvelle structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
ORDER BY ordinal_position;

-- Afficher les données du restaurant de test
SELECT * FROM restaurants WHERE slug = 'bella-vita' OR id = 'bella-vita-uuid'; 