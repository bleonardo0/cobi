# 🍽️ Nouveau Menu Restaurant - Design Moderne

## 🎨 Vue d'ensemble

Le nouveau menu restaurant a été entièrement refait avec un design moderne style **Uber Eats / Notion Food**, optimisé pour mobile et desktop avec une interface épurée et élégante.

## ✨ Caractéristiques principales

### 📱 Design & UX
- **Interface moderne et épurée** avec Tailwind CSS uniquement
- **Responsive design** : 1 colonne sur mobile, 2 colonnes sur desktop
- **Image d'ambiance** configurable en haut du menu
- **Animations fluides** avec `hover:scale-105` et transitions
- **Layout centré** avec `max-w-4xl mx-auto`

### 🎯 Composants clés
- **Image d'ambiance** : `w-full h-48 object-cover rounded-b-xl`
- **Filtres sticky** : boutons ronds avec `rounded-full` et `sticky top-4`
- **Cartes de plats** : design moderne avec `rounded-xl shadow-md`
- **Boutons d'action** : style Uber Eats avec `bg-emerald-500`

### 📂 Structure des cartes de plats
```typescript
// Carte de plat moderne
<div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:scale-105">
  {/* Image du plat - h-48 object-cover */}
  <img src={model.thumbnailUrl} alt={model.name} className="w-full h-48 object-cover" />
  
  {/* Contenu */}
  <div className="p-4">
    <h3 className="text-md font-semibold text-gray-900 mb-2">{model.name}</h3>
    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{model.shortDescription}</p>
    <p className="text-base font-bold text-emerald-600 mb-3">{model.price}€</p>
    <button className="w-full bg-emerald-500 text-white text-sm py-2 rounded-full hover:bg-emerald-600">
      Voir en 3D
    </button>
  </div>
</div>
```

## ⚙️ Configuration

### Image d'ambiance
1. Aller dans **Dashboard > Paramètres > Design**
2. Section "Image d'ambiance (nouveau menu)"
3. Upload d'une image (max 10MB)
4. Format recommandé : 1200x400px (ratio 3:1)

### Données requises
Les plats doivent avoir :
- `thumbnailUrl` : image du plat
- `name` : nom du plat
- `shortDescription` : description courte (limitée à 2 lignes avec `line-clamp-2`)
- `price` : prix en euros
- `category` : catégorie pour les filtres

## 📱 Responsive Design

### Mobile (< 768px)
- Layout vertical en 1 colonne
- Image d'ambiance pleine largeur
- Filtres centrés avec scroll horizontal
- Cartes empilées verticalement

### Desktop (≥ 768px)
- Layout en grille 2 colonnes (`md:grid-cols-2`)
- Container centré avec `max-w-4xl`
- Filtres sticky en haut
- Espacement optimisé avec `gap-6`

## 🎨 Couleurs & Thème

### Palette principale
- **Fond** : `bg-gray-50` (gris très clair)
- **Cartes** : `bg-white` avec `shadow-md`
- **Filtres actifs** : `bg-orange-500 text-white`
- **Boutons** : `bg-emerald-500` pour les actions principales
- **Texte** : `text-gray-900` / `text-gray-600`

### Classes utilitaires ajoutées
```css
.line-clamp-1, .line-clamp-2, .line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: X;
}
```

## 🚀 Utilisation

Le nouveau menu est automatiquement appliqué sur la route :
```
/menu/[restaurant-slug]
```

### API utilisées
- `GET /api/restaurants/${slug}` - Données du restaurant
- `GET /api/restaurants/by-slug/${slug}/models` - Plats du menu

### Props du composant ModernDishCard
```typescript
interface ModernDishCardProps {
  model: Model3D;
  restaurant: Restaurant;
  onViewIn3D: (model: Model3D) => void;
}
```

## 🔄 Migration depuis l'ancien menu

L'ancien menu a été remplacé mais garde la même structure de données. Seule l'interface utilisateur a changé pour un design plus moderne et épuré.

### Fonctionnalités conservées
- ✅ Visualisation 3D des plats
- ✅ Filtres par catégorie
- ✅ Hotspots sur les modèles 3D
- ✅ Analytics et tracking
- ✅ Responsive design

### Nouvelles fonctionnalités
- ✅ Image d'ambiance configurable
- ✅ Design moderne style apps mobile
- ✅ Animations et transitions fluides
- ✅ Layout optimisé mobile-first
- ✅ Configuration depuis le dashboard

---

*Le nouveau menu offre une expérience utilisateur moderne et professionnelle, alignée sur les standards actuels des applications de commande en ligne.* 