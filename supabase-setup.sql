-- Création de la table models_3d
CREATE TABLE IF NOT EXISTS public.models_3d (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    thumbnail_url TEXT,
    thumbnail_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_models_3d_slug ON public.models_3d(slug);
CREATE INDEX IF NOT EXISTS idx_models_3d_created_at ON public.models_3d(created_at DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_models_3d_updated_at 
    BEFORE UPDATE ON public.models_3d 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Politique RLS (Row Level Security) - optionnel selon vos besoins
-- ALTER TABLE public.models_3d ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique
-- CREATE POLICY "Allow public read access" ON public.models_3d
--     FOR SELECT USING (true);

-- Politique pour permettre l'insertion (vous pouvez ajuster selon vos besoins d'authentification)
-- CREATE POLICY "Allow authenticated insert" ON public.models_3d
--     FOR INSERT WITH CHECK (true);

-- Création du bucket de stockage (à exécuter dans l'interface Supabase Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('models-3d', 'models-3d', true);

-- Politique de stockage pour permettre l'upload public
-- CREATE POLICY "Allow public uploads" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'models-3d');

-- Politique de stockage pour permettre la lecture publique
-- CREATE POLICY "Allow public downloads" ON storage.objects
--     FOR SELECT USING (bucket_id = 'models-3d');

-- Politique de stockage pour permettre la suppression
-- CREATE POLICY "Allow public deletes" ON storage.objects
--     FOR DELETE USING (bucket_id = 'models-3d');

-- Mise à jour pour les tables existantes (ajout des colonnes thumbnail)
ALTER TABLE public.models_3d 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_path TEXT; 