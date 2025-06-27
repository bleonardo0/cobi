# Système POS (Point of Sale) 

Le système POS permet aux restaurants d'accepter des commandes en ligne directement depuis leur menu 3D. Cette fonctionnalité est entièrement optionnelle et peut être activée/désactivée restaurant par restaurant.

## 🎯 Fonctionnalités principales

### Pour les clients
- **Panier interactif** : Ajout/suppression de plats avec quantités
- **Prix en temps réel** : Calcul automatique des totaux avec TVA
- **Interface intuitive** : Boutons d'ajout directement sur les cartes de plats
- **Persistence** : Le panier est sauvegardé dans le navigateur
- **Responsive** : Fonctionne sur mobile et desktop

### Pour les restaurateurs
- **Configuration flexible** : Activation/désactivation en un clic
- **Paramètres personnalisables** : TVA, frais de livraison, devise
- **Fonctionnalités modulaires** : Livraison, sur place, à emporter
- **Interface d'administration** : Gestion centralisée

## 🏗️ Architecture

### Types principaux
- `CartItem` : Article dans le panier
- `Cart` : Panier complet avec totaux
- `RestaurantPOSConfig` : Configuration POS par restaurant
- `Order` : Commande finalisée

### Hooks personnalisés
- `useCart()` : Gestion du panier côté client
- `usePOSConfig()` : Configuration POS d'un restaurant

### Composants
- `Cart` : Sidebar de panier avec animations
- `POSConfigPanel` : Interface d'administration

## 🚀 Utilisation

### 1. Activation du POS

Rendez-vous sur `/admin/pos` pour configurer un restaurant :

1. **Sélectionnez un restaurant** dans la sidebar
2. **Activez le POS** avec le toggle principal  
3. **Configurez les fonctionnalités** (commandes, livraison, etc.)
4. **Ajustez les paramètres** (TVA, frais, devise)

### 2. Test côté client

Visitez `/menu/[restaurant-slug]` pour tester :

- Si le POS est activé, vous verrez :
  - Badge "📱 Commande en ligne" dans le header
  - Bouton "Panier" en haut à droite
  - Boutons "Ajouter • XX€" sur chaque plat

### 3. Fonctionnement du panier

```typescript
// Ajout au panier
addToCart(model, quantity, options, notes);

// Mise à jour quantité
updateQuantity(itemId, newQuantity);

// Suppression
removeFromCart(itemId);
```

## 🎛️ Configuration

### Paramètres disponibles

| Paramètre | Description | Par défaut |
|-----------|-------------|------------|
| `enabled` | POS activé/désactivé | `true` |
| `ordering` | Commandes activées | `true` |
| `payment` | Paiement en ligne | `false` |
| `delivery` | Livraison disponible | `false` |
| `takeaway` | À emporter | `true` |
| `dineIn` | Sur place | `true` |
| `currency` | Devise | `EUR` |
| `taxRate` | Taux de TVA | `0.20` (20%) |
| `deliveryFee` | Frais de livraison | `0` |
| `minimumOrder` | Commande minimum | `0` |

### Configuration par défaut

```typescript
const mockConfig: RestaurantPOSConfig = {
  restaurantId: id,
  enabled: true,
  features: {
    ordering: true,
    payment: false,
    delivery: false,
    takeaway: true,
    dineIn: true,
    customization: false
  },
  settings: {
    currency: 'EUR',
    taxRate: 0.20,
    deliveryFee: 0,
    minimumOrder: 0,
    estimatedPrepTime: 20,
    acceptsReservations: false
  },
  paymentMethods: ['cash'],
  openingHours: { /* ... */ }
};
```

## 🎨 Interface utilisateur

### Boutons dynamiques sur les plats

```typescript
// Si le plat n'est pas dans le panier
<button>Ajouter • 12.50€</button>

// Si le plat est dans le panier
<div>
  <button>-</button>
  <span>2 dans le panier</span>
  <button>+</button>
</div>
```

### Panier sidebar

- **Animation** : Slide depuis la droite
- **Totaux** : Sous-total, TVA, frais, total
- **Actions** : Modifier quantités, supprimer items
- **Checkout** : Bouton "Commander • XX€"

## 🔧 Développement

### Ajout d'une nouvelle fonctionnalité

1. **Étendre les types** dans `src/types/pos.ts`
2. **Mettre à jour le hook** `usePOSConfig()`
3. **Modifier l'interface** dans `POSConfigPanel`
4. **Tester** sur la page admin et le menu

### Hooks disponibles

```typescript
// Gestion du panier
const {
  cart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getItemCount,
  isInCart,
  getItemQuantity
} = useCart({ restaurantId, config });

// Configuration POS
const {
  config,
  isLoading,
  error,
  togglePOS,
  toggleFeature,
  updateConfig
} = usePOSConfig(restaurantId);
```

## 🎭 États du système

### Statuts possibles

| État | Description | Interface |
|------|-------------|-----------|
| **Désactivé** | POS éteint | Pas de boutons panier |
| **Activé sans commandes** | POS allumé mais commandes off | Badge grisé |
| **Opérationnel** | POS + commandes activés | Interface complète |

### Gestion des erreurs

- **Plat sans prix** : Bouton grisé avec message
- **Restaurant non trouvé** : Message d'erreur
- **Panier vide** : Interface vide avec illustration
- **Erreur réseau** : Toast d'erreur + retry

## 🚨 Points d'attention

### Sécurité
- Validation côté serveur requise (TODO)
- Sanitisation des inputs utilisateur
- Gestion des sessions sécurisée

### Performance
- Panier sauvegardé en localStorage
- Debouncing sur les updates de quantité
- Lazy loading des configurations

### UX
- Feedback visuel immédiat
- Animations fluides
- Messages d'erreur clairs
- États de chargement

## 🔄 Prochaines étapes

### À implémenter
- [ ] API backend pour les configurations
- [ ] Système de commandes persisté
- [ ] Paiement en ligne (Stripe/PayPal)
- [ ] Notifications temps réel
- [ ] Interface de gestion des commandes
- [ ] Système de livraison

### Améliorations UX
- [ ] Animation du panier volant
- [ ] Toast notifications
- [ ] Sauvegarde automatique
- [ ] Offline support
- [ ] PWA pour les commandes

## 📱 URLs importantes

- **Administration** : `/admin/pos`
- **Menu avec POS** : `/menu/bella-vita`
- **Test** : Activez le POS puis visitez le menu

Le système est maintenant prêt à être testé et étendu selon vos besoins spécifiques ! 