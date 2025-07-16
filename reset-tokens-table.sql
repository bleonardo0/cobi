-- Table pour stocker les tokens de réinitialisation de mot de passe
CREATE TABLE IF NOT EXISTS reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_email ON reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires_at ON reset_tokens(expires_at);

-- Politique RLS (Row Level Security)
ALTER TABLE reset_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for reset_tokens" ON reset_tokens FOR ALL USING (true);

-- Fonction pour nettoyer les tokens expirés
CREATE OR REPLACE FUNCTION cleanup_expired_reset_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM reset_tokens 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Commentaire pour documenter la table
COMMENT ON TABLE reset_tokens IS 'Tokens de réinitialisation de mot de passe avec expiration';
COMMENT ON COLUMN reset_tokens.token IS 'Token unique généré pour la réinitialisation';
COMMENT ON COLUMN reset_tokens.expires_at IS 'Date et heure d''expiration du token (24h par défaut)';
COMMENT ON COLUMN reset_tokens.used_at IS 'Date et heure d''utilisation du token (null si non utilisé)';

-- Insertion d'un token de test pour le développement (optionnel)
-- INSERT INTO reset_tokens (user_id, email, token, expires_at) 
-- VALUES (
--     (SELECT id FROM users WHERE email = 'admin@cobi.com' LIMIT 1),
--     'admin@cobi.com',
--     'test-token-123',
--     NOW() + INTERVAL '24 hours'
-- );

-- Rappel : Exécutez cette commande dans Supabase Dashboard → SQL Editor
-- Pour vérifier : SELECT * FROM reset_tokens; 