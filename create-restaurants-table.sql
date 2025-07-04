-- Création de la table restaurants
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    short_description VARCHAR(500),
    logo_url TEXT,
    primary_color VARCHAR(7), -- Couleur hexadécimale
    secondary_color VARCHAR(7), -- Couleur hexadécimale
    rating DECIMAL(3,2) DEFAULT 0,
    allergens TEXT[], -- Allergènes gérés par le restaurant
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'pending')),
    subscription_plan VARCHAR(50) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_subscription_status ON restaurants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON restaurants(name);

-- Insérer Bella Vita comme restaurant par défaut
INSERT INTO restaurants (
    id,
    name,
    slug,
    address,
    phone,
    email,
    website,
    description,
    short_description,
    logo_url,
    primary_color,
    secondary_color,
    rating,
    allergens,
    subscription_status,
    subscription_plan,
    is_active
) VALUES (
    'bella-vita-uuid',
    'Bella Vita',
    'bella-vita',
    '123 Rue de la Paix, 75001 Paris',
    '+33 1 23 45 67 89',
    'contact@bella-vita.fr',
    'https://bella-vita.fr',
    'Restaurant italien authentique proposant une cuisine traditionnelle avec des ingrédients frais et de qualité. Découvrez nos spécialités préparées avec passion dans un cadre chaleureux et convivial.',
    'Restaurant italien authentique avec une cuisine traditionnelle',
    '/logos/bella-vita.png',
    '#dc2626',
    '#991b1b',
    4.8,
    ARRAY['gluten', 'lactose'],
    'active',
    'premium',
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    logo_url = EXCLUDED.logo_url,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    rating = EXCLUDED.rating,
    allergens = EXCLUDED.allergens,
    subscription_status = EXCLUDED.subscription_status,
    subscription_plan = EXCLUDED.subscription_plan,
    is_active = EXCLUDED.is_active,
    updated_at = NOW(); 