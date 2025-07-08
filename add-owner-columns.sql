-- Migration pour ajouter les colonnes propriétaire/contact principal
-- Script à exécuter dans Supabase SQL Editor ou via CLI

-- Ajouter les colonnes pour le propriétaire/contact principal
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS owner_contact VARCHAR(255),
ADD COLUMN IF NOT EXISTS owner_contact_method VARCHAR(20) DEFAULT 'email';

-- Ajouter une contrainte pour owner_contact_method
ALTER TABLE restaurants 
ADD CONSTRAINT check_owner_contact_method 
CHECK (owner_contact_method IN ('email', 'phone', 'both'));

-- Mettre à jour les restaurants existants avec des valeurs par défaut (optionnel)
UPDATE restaurants 
SET owner_contact_method = 'email' 
WHERE owner_contact_method IS NULL;

-- Commentaires pour la documentation
COMMENT ON COLUMN restaurants.owner_name IS 'Nom du propriétaire ou contact principal du restaurant';
COMMENT ON COLUMN restaurants.owner_contact IS 'Email ou téléphone du propriétaire/contact principal';
COMMENT ON COLUMN restaurants.owner_contact_method IS 'Méthode de contact préférée: email, phone ou both'; 