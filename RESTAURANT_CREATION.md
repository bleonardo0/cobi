# 🏪 Création de Restaurants - Guide Complet

## Vue d'ensemble

Le système permet de créer facilement de nouveaux restaurants depuis l'interface admin. Chaque restaurant créé génère automatiquement :
- ✅ Une page menu publique (`/menu/{slug}`)
- ✅ Un dashboard de gestion (`/restaurant/dashboard`)
- ✅ Une page d'administration (`/admin/restaurants/{id}`)

## 📋 Fonctionnalités

### 1. **Création de Restaurant**
- **URL**: `/admin/restaurants/add`
- **Accès**: Interface admin
- **Fonctionnalités**:
  - Génération automatique du slug basé sur le nom
  - Validation des données en temps réel
  - Vérification d'unicité du slug
  - Personnalisation des couleurs (primaire/secondaire)
  - Gestion des allergènes
  - Plans d'abonnement (basic/premium)

### 2. **Gestion des Restaurants**
- **URL**: `/admin/restaurants`
- **Accès**: Interface admin
- **Fonctionnalités**:
  - Liste de tous les restaurants configurés
  - Statuts et plans d'abonnement
  - Liens rapides vers menu et dashboard
  - Accès aux paramètres individuels

### 3. **Pages Générées Automatiquement**

#### Page Menu (`/menu/{slug}`)
- Menu 3D interactif
- Visualisation des modèles
- Hotspots informatifs
- Système de panier (si POS activé)
- Personnalisation avec couleurs du restaurant

#### Dashboard Restaurant (`/restaurant/dashboard`)
- Statistiques de vues
- Gestion des modèles
- Analytics en temps réel
- Outils d'administration

#### Page Admin (`/admin/restaurants/{id}`)
- Modification des informations
- Gestion des modèles
- Configuration des hotspots
- Paramètres POS

## 🔧 Utilisation

### Étape 1 : Accéder à l'Interface Admin
```
http://localhost:3001/admin
```

### Étape 2 : Créer un Restaurant
1. Cliquer sur "Gestion des restaurants" ou "Nouveau restaurant"
2. Remplir le formulaire :
   - **Nom** : Nom du restaurant (obligatoire)
   - **Slug** : URL générée automatiquement (modifiable)
   - **Adresse** : Adresse complète (obligatoire)
   - **Contact** : Téléphone et email
   - **Descriptions** : Courte et complète
   - **Couleurs** : Personnalisation de l'interface
   - **Allergènes** : Sélection des allergènes gérés

### Étape 3 : Validation et Création
- Validation automatique des données
- Vérification d'unicité du slug
- Création en base de données
- Génération des URLs automatiques

## 🎯 Exemple Concret

```javascript
// Données d'exemple
{
  "name": "Le Bistro Moderne",
  "slug": "le-bistro-moderne",
  "address": "45 Avenue des Champs-Élysées, 75008 Paris",
  "phone": "+33 1 42 25 76 89",
  "email": "contact@bistromoderne.fr",
  "website": "https://bistromoderne.fr",
  "shortDescription": "Cuisine française moderne avec vue sur les Champs-Élysées",
  "primaryColor": "#2563eb",
  "secondaryColor": "#1e40af",
  "subscriptionPlan": "premium",
  "allergens": ["gluten", "lactose", "fruits_a_coque"]
}
```

### URLs Générées
- **Menu** : `http://localhost:3001/menu/le-bistro-moderne`
- **Dashboard** : `http://localhost:3001/restaurant/dashboard`
- **Admin** : `http://localhost:3001/admin/restaurants/{uuid}`

## 🗄️ Structure Base de Données

### Table `restaurants`
```sql
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    description TEXT,
    short_description VARCHAR(500),
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    rating DECIMAL(3,2) DEFAULT 0,
    allergens TEXT[],
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔗 APIs Disponibles

### Création de Restaurant
```http
POST /api/admin/restaurants
Content-Type: application/json

{
  "name": "Restaurant Name",
  "slug": "restaurant-slug",
  "address": "Full Address",
  "email": "contact@restaurant.com",
  "shortDescription": "Short description",
  "primaryColor": "#dc2626",
  "secondaryColor": "#991b1b",
  "subscriptionPlan": "premium",
  "allergens": ["gluten", "lactose"]
}
```

### Liste des Restaurants
```http
GET /api/admin/restaurants
```

### Informations d'un Restaurant
```http
GET /api/restaurants/{slug}
```

### Modèles d'un Restaurant
```http
GET /api/restaurants/{slug}/models
```

## 🎨 Personnalisation

### Couleurs
- **Primaire** : Couleur principale du restaurant
- **Secondaire** : Couleur d'accent
- Format : Hexadécimal (#RRGGBB)

### Allergènes Supportés
- `gluten`, `lactose`, `arachides`, `oeufs`, `poisson`, `soja`
- `fruits_a_coque`, `celeri`, `moutarde`, `sesame`, `sulfites`
- `lupin`, `mollusques`, `crustaces`

### Plans d'Abonnement
- **Basic** : Fonctionnalités de base
- **Premium** : Fonctionnalités avancées + POS

## 🚀 Fonctionnalités Futures

### En Développement
- [ ] Association modèles → restaurants spécifiques
- [ ] Upload de logo personnalisé
- [ ] Gestion des horaires d'ouverture
- [ ] Système de réservations
- [ ] Multi-langues

### Prochaines Versions
- [ ] Templates de menu personnalisés
- [ ] Intégration système de paiement
- [ ] Analytics avancées par restaurant
- [ ] Gestion des équipes/utilisateurs

## 🔧 Configuration Requise

### Variables d'Environnement
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Permissions Supabase
- Table `restaurants` : SELECT, INSERT, UPDATE
- Row Level Security activée
- Politiques d'accès configurées

## 📞 Support

Pour toute question ou problème :
1. Vérifier la documentation API
2. Consulter les logs de l'application
3. Tester les endpoints individuellement
4. Vérifier la configuration Supabase

## 🎉 Exemple d'Utilisation Complète

```bash
# 1. Accéder à l'admin
http://localhost:3001/admin

# 2. Créer un restaurant
# Remplir le formulaire sur /admin/restaurants/add

# 3. Accéder au menu généré
http://localhost:3001/menu/votre-restaurant-slug

# 4. Gérer depuis le dashboard
http://localhost:3001/restaurant/dashboard

# 5. Administrer
http://localhost:3001/admin/restaurants/{id}
```

---

**🏪 Système de Création de Restaurants COBI** - Version 1.0
*Génération automatique des pages menu et dashboard* 