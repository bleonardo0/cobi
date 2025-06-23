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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajout des nouvelles colonnes si elles n'existent pas (pour mise à jour)
DO $$ 
BEGIN
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
END $$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_models_3d_slug ON models_3d(slug);
CREATE INDEX IF NOT EXISTS idx_models_3d_created_at ON models_3d(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_models_3d_category ON models_3d(category);
CREATE INDEX IF NOT EXISTS idx_models_3d_tags ON models_3d USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_models_3d_name ON models_3d(name);
CREATE INDEX IF NOT EXISTS idx_models_3d_ingredients ON models_3d USING GIN(ingredients);
CREATE INDEX IF NOT EXISTS idx_models_3d_allergens ON models_3d USING GIN(allergens);

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

-- Configuration de la sécurité RLS (Row Level Security)
ALTER TABLE models_3d ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique
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

-- Mise à jour pour les tables existantes (ajout des colonnes thumbnail)
ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_path TEXT; 