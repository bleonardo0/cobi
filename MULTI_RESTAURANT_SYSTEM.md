# 🏪 Système Multi-Restaurant - Analytics Extensibles

## 🎯 **Objectif**
Le système analytics est maintenant **100% extensible** et fonctionne automatiquement pour **chaque restaurant** ajouté à la plateforme.

## ✅ **Fonctionnalités**

### **🔄 Détection automatique du restaurant**
- **Pages menu** (`/menu/[restaurant]`) : Détection via l'URL
- **Dashboard restaurant** : Détection via l'utilisateur connecté + fallback bella-vita
- **Pages insights** : Détection contextuelle intelligente

### **📊 Analytics individualisés**
- Chaque restaurant a ses **propres statistics**
- **Isolation complète** des données entre restaurants
- **Métriques en temps réel** par restaurant

### **🚀 Zéro configuration**
- **Aucun code à modifier** pour ajouter un nouveau restaurant
- **ID récupérés automatiquement** depuis la base `restaurants`
- **Fallbacks intelligents** pour la compatibilité

## 🏗️ **Architecture**

### **Hook `useRestaurantId`**
```typescript
const { restaurantId, restaurantSlug, isLoading } = useRestaurantId(fallbackSlug?);
```

**Logique de détection :**
1. **URL slug** (`/menu/restaurant-name`) 
2. **Fallback fourni** (dashboard utilisateur)
3. **Défaut** : `bella-vita`

**Récupération ID :**
1. Appel `GET /api/restaurants/[slug]`
2. Extraction de `restaurant.id` depuis la DB
3. Fallback vers ancien UUID pour `bella-vita`

### **Composants modernisés**

#### **📈 Insights (`/insights`)**
```typescript
const { restaurantId } = useRestaurantId();
// → Analytics spécifiques au restaurant détecté
```

#### **🏠 Dashboard (`/restaurant/dashboard`)**
```typescript
const { restaurantId } = useRestaurantId('bella-vita');
// → Métriques du restaurant de l'utilisateur connecté
```

#### **🛍️ ModelCard (tracking)**
```typescript
const { restaurantId } = useRestaurantId();
// → Vues trackées pour le bon restaurant automatiquement
```

## 🧪 **Test Multi-Restaurant**

### **Étape 1 : Ajouter un restaurant**
```sql
INSERT INTO restaurants (id, name, slug, address) 
VALUES (gen_random_uuid(), 'Le Gourmet', 'le-gourmet', '123 Rue de la Gastronomie');
```

### **Étape 2 : Tester les analytics**
1. **Aller sur** `/menu/le-gourmet` 
2. **Cliquer sur des plats** → Vues trackées pour le-gourmet
3. **Aller sur** `/insights` → Analytics spécifiques à le-gourmet
4. **Vérifier isolation** : Aucune vue de bella-vita visible

### **Étape 3 : Dashboard restaurant**
1. **Créer utilisateur** avec `restaurant_slug = 'le-gourmet'`
2. **Se connecter** → Dashboard montre métriques de le-gourmet uniquement

## 📊 **Isolation des données**

### **Tracking par restaurant**
```sql
-- Chaque vue est liée à son restaurant
INSERT INTO model_views (model_id, restaurant_id, ...)
VALUES ('model-123', 'restaurant-uuid-le-gourmet', ...);
```

### **Requêtes filtrées**
```sql
-- Analytics récupérées uniquement pour le restaurant actuel
SELECT * FROM model_views 
WHERE restaurant_id = 'current-restaurant-uuid';
```

### **Métriques séparées**
- ✅ **Vues totales** par restaurant
- ✅ **Plats populaires** par restaurant  
- ✅ **Durées moyennes** par restaurant
- ✅ **Répartition devices** par restaurant

## 🔧 **Configuration zéro**

### **Pour ajouter un restaurant :**
1. **Ajouter l'entrée** dans la table `restaurants`
2. **Créer les modèles 3D** avec `restaurant_id` correct
3. **C'est tout !** Les analytics fonctionnent automatiquement

### **Aucun code à modifier :**
- ❌ Pas de mapping hardcodé à mettre à jour
- ❌ Pas de configuration manuelle
- ❌ Pas de redéploiement nécessaire

## 🎉 **Avantages**

### **🏪 Scalabilité**
- **Support illimité** de restaurants
- **Performance optimale** avec requêtes filtrées
- **Isolation totale** des données

### **👨‍💻 Maintenabilité**
- **Code DRY** : Un seul système pour tous
- **Hook réutilisable** partout  
- **Logique centralisée** de détection

### **🚀 Expérience utilisateur**
- **Détection transparente** du restaurant
- **Analytics contextuels** automatiques
- **Performance en temps réel**

## 📋 **Checklist nouveau restaurant**

- [ ] Ajouter entrée dans `restaurants` table
- [ ] Uploader modèles 3D avec bon `restaurant_id` 
- [ ] Tester menu `/menu/[slug]`
- [ ] Vérifier tracking des vues
- [ ] Contrôler insights `/insights` 
- [ ] Valider isolation des données

---

**🎯 Le système est maintenant 100% extensible !**

Chaque nouveau restaurant bénéficie automatiquement du système analytics complet sans aucune modification de code. 🚀 