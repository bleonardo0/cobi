# Galerie 3D - Next.js

Une galerie moderne de modèles 3D avec support de la réalité augmentée, construite avec Next.js 15, React 18+ et Tailwind CSS.

## ✨ Fonctionnalités

- 🎯 **Visualisation 3D interactive** avec model-viewer de Google
- 📱 **Réalité augmentée** pour les modèles USDZ sur iOS
- 🎨 **Interface moderne** avec Tailwind CSS et animations Framer Motion
- 📤 **Upload drag & drop** avec validation des fichiers
- 🔍 **Pages de détail** pour chaque modèle
- 📊 **Statistiques** de la collection
- 🚀 **Performance optimisée** avec Next.js SSR
- ✅ **Tests unitaires** avec Jest et React Testing Library

## 🛠️ Stack Technique

- **Framework** : Next.js 15 (App Router)
- **UI** : React 18+, Tailwind CSS
- **3D/AR** : @google/model-viewer
- **Animations** : Framer Motion
- **Types** : TypeScript
- **Tests** : Jest, React Testing Library
- **Linting** : ESLint, Prettier

## 📁 Structure du Projet

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── api/               # API Routes
│   │   ├── models/        # GET /api/models
│   │   └── upload/        # POST /api/upload
│   ├── models/[slug]/     # Pages de détail des modèles
│   ├── upload/            # Page d'upload
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   ├── GalleryGrid.tsx    # Grille de modèles
│   ├── ModelCard.tsx      # Carte de modèle 3D
│   └── UploadForm.tsx     # Formulaire d'upload
├── lib/                   # Utilitaires et logique métier
│   ├── models.ts          # Gestion des données
│   └── utils.ts           # Fonctions utilitaires
├── types/                 # Définitions TypeScript
│   ├── model.ts           # Types des modèles 3D
│   └── model-viewer.d.ts  # Types pour model-viewer
└── __tests__/             # Tests unitaires
```

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd galerie-3d

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le projet sera accessible sur [http://localhost:3000](http://localhost:3000).

### Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linting ESLint
npm run test         # Tests Jest
npm run test:watch   # Tests en mode watch
```

## 📋 Formats Supportés

- **USDZ** : Format Apple pour la réalité augmentée (iOS)
- **GLB** : Format binaire glTF (recommandé pour le web)
- **GLTF** : Format JSON glTF avec assets séparés

### Limites

- Taille maximale : 50MB par fichier
- Types MIME supportés : `model/vnd.usdz+zip`, `model/gltf-binary`, `model/gltf+json`

## 🎯 Utilisation

### 1. Télécharger un Modèle

1. Cliquez sur "Ajouter un modèle" ou allez sur `/upload`
2. Glissez-déposez vos fichiers 3D ou cliquez pour sélectionner
3. Les fichiers sont validés automatiquement
4. Cliquez sur "Télécharger" pour ajouter à la galerie

### 2. Visualiser en 3D

- **Rotation** : Clic gauche + glisser
- **Zoom** : Molette de la souris
- **Pan** : Clic droit + glisser
- **Réinitialiser** : Bouton "Réinitialiser"

### 3. Réalité Augmentée (iOS)

Pour les modèles USDZ sur iOS :
1. Cliquez sur le bouton "AR"
2. Autorisez l'accès à la caméra
3. Pointez vers une surface plane
4. Placez et manipulez le modèle

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env.local` :

```env
# Optionnel : Configuration personnalisée
NEXT_PUBLIC_MAX_FILE_SIZE=52428800  # 50MB en bytes
```

### Personnalisation

#### Modifier les Formats Supportés

Éditez `src/lib/utils.ts` :

```typescript
const supportedTypes: SupportedMimeTypes[] = [
  'model/vnd.usdz+zip',
  'model/gltf-binary',
  'model/gltf+json'
  // Ajoutez d'autres formats si nécessaire
];
```

#### Changer la Taille Maximale

Éditez `src/app/api/upload/route.ts` :

```typescript
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test -- --coverage
```

### Structure des Tests

- Tests unitaires pour les composants React
- Mocks pour les dépendances externes (model-viewer, framer-motion)
- Configuration Jest avec support TypeScript et Next.js

## 📱 Responsive Design

L'interface s'adapte automatiquement :

- **Mobile** : 1 colonne
- **Tablette** : 2 colonnes  
- **Desktop** : 3 colonnes

## 🔒 Sécurité

- Validation des types de fichiers côté client et serveur
- Limitation de la taille des fichiers
- Noms de fichiers sécurisés (caractères spéciaux supprimés)
- Validation des extensions et types MIME

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Build Manuel

```bash
# Build de production
npm run build

# Démarrer le serveur
npm start
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

1. Consultez la documentation
2. Vérifiez les [issues existantes](../../issues)
3. Créez une nouvelle issue si nécessaire

## 🔮 Roadmap

- [ ] Support des textures PBR
- [ ] Éditeur de métadonnées
- [ ] Système de tags et catégories
- [ ] API REST complète
- [ ] Mode sombre
- [ ] Partage social
- [ ] Compression automatique des modèles
