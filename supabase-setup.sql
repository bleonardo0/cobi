-- Création de la table models_3d avec support pour GLB et USDZ
CREATE TABLE IF NOT EXISTS models_3d (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL UNIQUE,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    thumbnail_url TEXT,
    thumbnail_path TEXT,
    -- Nouveaux champs pour supporter GLB et USDZ
    glb_url TEXT,
    glb_path TEXT,
    glb_file_size BIGINT,
    usdz_url TEXT,
    usdz_path TEXT,
    usdz_file_size BIGINT,
    format VARCHAR(50),
    -- Liaison avec restaurant
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création de la table users pour l'authentification
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'restaurateur')),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Ajout des nouvelles colonnes si elles n'existent pas (pour mise à jour)
DO $$ 
BEGIN
    -- Vérifier et ajouter restaurant_id à models_3d
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'restaurant_id') THEN
        ALTER TABLE models_3d ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    END IF;

    -- Vérifier et ajouter glb_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'glb_url') THEN
        ALTER TABLE models_3d ADD COLUMN glb_url TEXT;
    END IF;
    
    -- Vérifier et ajouter glb_path
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'glb_path') THEN
        ALTER TABLE models_3d ADD COLUMN glb_path TEXT;
    END IF;
    
    -- Vérifier et ajouter glb_file_size
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'glb_file_size') THEN
        ALTER TABLE models_3d ADD COLUMN glb_file_size BIGINT;
    END IF;
    
    -- Vérifier et ajouter usdz_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'usdz_url') THEN
        ALTER TABLE models_3d ADD COLUMN usdz_url TEXT;
    END IF;
    
    -- Vérifier et ajouter usdz_path
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'usdz_path') THEN
        ALTER TABLE models_3d ADD COLUMN usdz_path TEXT;
    END IF;
    
    -- Vérifier et ajouter usdz_file_size
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'usdz_file_size') THEN
        ALTER TABLE models_3d ADD COLUMN usdz_file_size BIGINT;
    END IF;
    
    -- Vérifier et ajouter format
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'format') THEN
        ALTER TABLE models_3d ADD COLUMN format VARCHAR(50);
    END IF;
    
    -- Vérifier et ajouter category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'category') THEN
        ALTER TABLE models_3d ADD COLUMN category VARCHAR(50);
    END IF;
    
    -- Vérifier et ajouter tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'tags') THEN
        ALTER TABLE models_3d ADD COLUMN tags TEXT[];
    END IF;
    
    -- Vérifier et ajouter description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'description') THEN
        ALTER TABLE models_3d ADD COLUMN description TEXT;
    END IF;
    
    -- Vérifier et ajouter ingredients
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'ingredients') THEN
        ALTER TABLE models_3d ADD COLUMN ingredients TEXT[];
    END IF;
    
    -- Vérifier et ajouter price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'price') THEN
        ALTER TABLE models_3d ADD COLUMN price DECIMAL(10,2);
    END IF;
    
    -- Vérifier et ajouter short_description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'short_description') THEN
        ALTER TABLE models_3d ADD COLUMN short_description VARCHAR(150);
    END IF;
    
    -- Vérifier et ajouter allergens
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'models_3d' AND column_name = 'allergens') THEN
        ALTER TABLE models_3d ADD COLUMN allergens TEXT[];
    END IF;

    -- Ajouter slug à restaurants si pas présent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'slug') THEN
        ALTER TABLE restaurants ADD COLUMN slug VARCHAR(255) UNIQUE;
    END IF;

    -- Ajouter subscription_status à restaurants si pas présent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'subscription_status') THEN
        ALTER TABLE restaurants ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'active';
    END IF;

    -- Ajouter subscription_plan à restaurants si pas présent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'subscription_plan') THEN
        ALTER TABLE restaurants ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'basic';
    END IF;

    -- Ajouter created_at à restaurants si pas présent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'created_at') THEN
        ALTER TABLE restaurants ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Ajouter updated_at à restaurants si pas présent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'updated_at') THEN
        ALTER TABLE restaurants ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_models_3d_slug ON models_3d(slug);
CREATE INDEX IF NOT EXISTS idx_models_3d_created_at ON models_3d(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_models_3d_category ON models_3d(category);
CREATE INDEX IF NOT EXISTS idx_models_3d_tags ON models_3d USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_models_3d_name ON models_3d(name);
CREATE INDEX IF NOT EXISTS idx_models_3d_ingredients ON models_3d USING GIN(ingredients);
CREATE INDEX IF NOT EXISTS idx_models_3d_allergens ON models_3d USING GIN(allergens);
CREATE INDEX IF NOT EXISTS idx_models_3d_restaurant_id ON models_3d(restaurant_id);

-- Index pour users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_restaurant_id ON users(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Index pour restaurants
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_subscription_status ON restaurants(subscription_status);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS update_models_3d_updated_at ON models_3d;
CREATE TRIGGER update_models_3d_updated_at
    BEFORE UPDATE ON models_3d
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Configuration de la sécurité RLS (Row Level Security)
ALTER TABLE models_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique des modèles
DROP POLICY IF EXISTS "Allow public read access" ON models_3d;
CREATE POLICY "Allow public read access" ON models_3d
    FOR SELECT USING (true);

-- Politique pour permettre l'insertion (pour l'API d'upload)
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON models_3d;
CREATE POLICY "Allow insert for authenticated users" ON models_3d
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la suppression (pour l'API de suppression)
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON models_3d;
CREATE POLICY "Allow delete for authenticated users" ON models_3d
    FOR DELETE USING (true);

-- Politique pour permettre la mise à jour
DROP POLICY IF EXISTS "Allow update for authenticated users" ON models_3d;
CREATE POLICY "Allow update for authenticated users" ON models_3d
    FOR UPDATE USING (true);

-- Politiques pour users
DROP POLICY IF EXISTS "Users can read their own data" ON users;
CREATE POLICY "Users can read their own data" ON users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (true);

-- Politiques pour restaurants
DROP POLICY IF EXISTS "Allow public read access to restaurants" ON restaurants;
CREATE POLICY "Allow public read access to restaurants" ON restaurants
    FOR SELECT USING (true);

-- Configuration du bucket de stockage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('models-3d', 'models-3d', true)
ON CONFLICT (id) DO NOTHING;

-- Politique de stockage pour permettre l'upload public
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'models-3d');

-- Politique de stockage pour permettre la lecture publique
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
CREATE POLICY "Allow public downloads" ON storage.objects
    FOR SELECT USING (bucket_id = 'models-3d');

-- Politique de stockage pour permettre la suppression
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
CREATE POLICY "Allow public deletes" ON storage.objects
    FOR DELETE USING (bucket_id = 'models-3d');

-- Insertion des données de base

-- Créer le restaurant Bella Vita s'il n'existe pas
INSERT INTO restaurants (id, name, slug, adress, rating, logo_url, short_description, allergens, subscription_status, subscription_plan)
VALUES (
    'bella-vita-uuid',
    'Bella Vita',
    'bella-vita',
    '123 Rue de la Paix, 75001 Paris',
    4.8,
    '/logos/bella-vita.png',
    'Restaurant italien authentique avec une cuisine traditionnelle',
    ARRAY['gluten', 'lactose'],
    'active',
    'premium'
) ON CONFLICT (id) DO NOTHING;

-- Créer les comptes utilisateurs
INSERT INTO users (id, email, name, password_hash, role, restaurant_id, is_active)
VALUES 
    (
        'admin-uuid',
        'admin@cobi.com',
        'Administrateur Cobi',
        '$2b$10$dummy.hash.for.admin.password', -- Remplacer par un vrai hash
        'admin',
        NULL,
        true
    ),
    (
        'bellavita-uuid',
        'bellavita@cobi.com',
        'Manager Bella Vita',
        '$2b$10$dummy.hash.for.bellavita.password', -- Remplacer par un vrai hash
        'restaurateur',
        'bella-vita-uuid',
        true
    )
ON CONFLICT (email) DO NOTHING; 