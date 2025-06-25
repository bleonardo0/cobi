# Préservation de la Position de Scroll

Cette fonctionnalité permet de maintenir la position de scroll de l'utilisateur lors de la navigation entre les pages, notamment entre la liste des modèles et la page de détail d'un modèle.

## Problème résolu

Auparavant, quand un utilisateur consultait un modèle et revenait à la liste, il se retrouvait en haut de la page et devait faire défiler à nouveau pour retrouver sa position. Cette fonctionnalité corrige ce comportement en restaurant automatiquement la position de scroll.

## Composants impliqués

### 1. Hook `useScrollPosition`
- **Fichier** : `src/hooks/useScrollPosition.ts`
- **Fonction** : Gère la sauvegarde et la restauration des positions de scroll
- **Stockage** : Utilise `sessionStorage` pour persister les positions entre les navigations

### 2. Composant `BackButton`
- **Fichier** : `src/components/BackButton.tsx`
- **Fonction** : Bouton de retour intelligent qui utilise l'historique du navigateur
- **Avantage** : Préserve automatiquement la position de scroll lors du retour

### 3. Modifications dans `ModelCard`
- **Fichier** : `src/components/ModelCard.tsx`
- **Fonction** : Sauvegarde la position avant de naviguer vers un modèle

### 4. Modifications dans `HomePage`
- **Fichier** : `src/app/page.tsx`
- **Fonction** : Restaure la position de scroll au retour sur la page d'accueil

## Comment ça fonctionne

1. **Navigation vers un modèle** :
   - L'utilisateur clique sur une carte de modèle
   - `ModelCard` sauvegarde la position de scroll actuelle
   - Navigation vers la page du modèle

2. **Retour à la liste** :
   - L'utilisateur clique sur le bouton retour ou utilise le bouton retour du navigateur
   - `BackButton` utilise `window.history.back()` pour préserver l'état de scroll
   - `HomePage` restaure automatiquement la position sauvegardée

## Utilisation

### Bouton de retour intelligent
```tsx
import BackButton from '@/components/BackButton';

// Usage basique
<BackButton />

// Avec URL de fallback personnalisée
<BackButton fallbackHref="/custom-fallback" />

// Avec styles personnalisés
<BackButton 
  className="custom-button-class"
  title="Titre personnalisé"
>
  Contenu personnalisé
</BackButton>
```

### Hook de position de scroll
```tsx
import { useScrollPosition } from '@/hooks/useScrollPosition';

function MyComponent() {
  const { saveScrollPosition, restoreScrollPosition } = useScrollPosition('unique-key');
  
  // Sauvegarder manuellement
  const handleSave = () => {
    saveScrollPosition();
  };
  
  // Restaurer manuellement
  const handleRestore = () => {
    restoreScrollPosition();
  };
}
```

## Configuration

### Clé de stockage
Chaque page utilise une clé unique pour éviter les conflits :
- `'gallery'` : Pour la page d'accueil avec la liste des modèles

### Durée de stockage
- Les positions sont stockées dans `sessionStorage`
- Elles sont automatiquement nettoyées après 30 secondes d'inactivité
- Elles sont perdues à la fermeture de l'onglet

## Avantages

1. **Expérience utilisateur améliorée** : Plus besoin de faire défiler à nouveau
2. **Navigation intuitive** : Le retour fonctionne comme attendu
3. **Performance** : Stockage léger en mémoire de session
4. **Compatibilité** : Fonctionne avec tous les navigateurs modernes

## Limitations

- Fonctionne uniquement dans la même session de navigateur
- Ne fonctionne pas avec les liens directs (URL tapée manuellement)
- Nécessite JavaScript activé

## Tests

Pour tester la fonctionnalité :

1. Aller sur la page d'accueil
2. Faire défiler vers le bas
3. Cliquer sur un modèle
4. Utiliser le bouton retour
5. Vérifier que la position de scroll est restaurée

## Maintenance

- Surveiller l'utilisation de `sessionStorage` si beaucoup de pages utilisent cette fonctionnalité
- Considérer l'ajout d'un nettoyage automatique plus fréquent si nécessaire
- Tester régulièrement sur différents navigateurs et appareils 