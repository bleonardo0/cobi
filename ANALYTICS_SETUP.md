# Système Analytics Simplifié

## 🎯 Objectif
Tracker simplement les vues de modèles quand les utilisateurs cliquent sur un plat dans le menu.

## ✅ Ce qui a été fait

### 🧹 Nettoyage complet
- ✅ Suppression de tous les anciens fichiers complexes
- ✅ Suppression des endpoints inutiles  
- ✅ Remise à zéro des données existantes
- ✅ Système simplifié à l'extrême

### 📊 Nouveau système
- ✅ **Une seule table** : `model_views` dans Supabase
- ✅ **Tracking automatique** : Quand on clique sur un modèle dans le menu
- ✅ **API simplifiée** : 2 endpoints seulement
- ✅ **Page insights** : Affiche les stats correctement

## 🚀 Installation

### 1. Créer la table dans Supabase

**Se connecter à Supabase Dashboard → SQL Editor → Exécuter :**

```sql
-- Table pour les vues de modèles 3D (simplifié)
CREATE TABLE IF NOT EXISTS model_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id VARCHAR(255) NOT NULL,
    restaurant_id VARCHAR(255) NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_type VARCHAR(50) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_model_views_model_id ON model_views(model_id);
CREATE INDEX IF NOT EXISTS idx_model_views_restaurant_id ON model_views(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_model_views_viewed_at ON model_views(viewed_at DESC);

-- Politique RLS (Row Level Security)
ALTER TABLE model_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for model_views" ON model_views FOR ALL USING (true);
```

### 2. Vérifier les variables d'environnement

Dans `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📋 Fonctionnement

### ✨ Tracking automatique
- L'utilisateur visite le menu
- Il clique sur un plat pour voir les détails
- **Automatically tracked** dans Supabase !

### 📊 Endpoints API

1. **`POST /api/analytics/track-model-view`**
   - Track une vue de modèle
   - Appelé automatiquement lors du clic

2. **`GET /api/analytics/stats`**
   - Récupère les statistiques
   - Utilisé par la page insights

3. **`POST /api/analytics/reset`** (optionnel)
   - Remet à zéro toutes les données

## 🎉 Test

1. **Aller sur le menu** : `/menu/bella-vita`
2. **Cliquer sur un plat** → Vue trackée automatiquement
3. **Aller sur insights** : `/insights` → Voir les stats
4. **Répéter** → Les compteurs augmentent !

## 📈 Page Insights

La page insights affiche maintenant :
- **Vues totales** : Nombre de clics sur les modèles
- **Modèles populaires** : Classement par nombre de vues
- **Répartition devices** : Mobile/Tablet/Desktop
- **Graphique par jour** : Évolution des vues

## 🔧 Maintenance

### Remettre à zéro les données
```bash
curl -X POST http://localhost:3000/api/analytics/reset
```

### Vérifier les données en direct
- Supabase Dashboard → Table Editor → `model_views`

---

**🎯 Système maintenant ultra-simple :**
1. **1 table** dans Supabase
2. **Tracking automatique** des clics
3. **Stats en temps réel** sur la page insights

**Prêt pour la production !** ✨ 