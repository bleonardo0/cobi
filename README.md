# Galerie 3D - Next.js avec Supabase

Une galerie moderne de modèles 3D avec support de la réalité augmentée, construite avec Next.js 15, React 18+, Tailwind CSS et Supabase.

## ✨ Fonctionnalités

- 🎯 **Visualisation 3D interactive** avec model-viewer de Google
- 📱 **Réalité augmentée** pour les modèles USDZ sur iOS
- 🎨 **Interface moderne** avec Tailwind CSS et animations Framer Motion
- 📤 **Upload drag & drop** avec validation des fichiers
- 🔍 **Pages de détail** pour chaque modèle
- 📊 **Statistiques** de la collection
- 🚀 **Performance optimisée** avec Next.js SSR
- ☁️ **Stockage cloud** avec Supabase Storage
- 🗄️ **Base de données** PostgreSQL via Supabase
- ✅ **Tests unitaires** avec Jest et React Testing Library

## 🛠️ Stack Technique

- **Framework** : Next.js 15 (App Router)
- **UI** : React 18+, Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Storage)
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
│   ├── ModelViewer.tsx    # Wrapper pour model-viewer
│   └── UploadForm.tsx     # Formulaire d'upload
├── lib/                   # Utilitaires et logique métier
│   ├── models.ts          # Gestion des données avec Supabase
│   ├── supabase.ts        # Configuration Supabase
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
- Compte Supabase

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd galerie-3d

# Installer les dépendances
npm install
```

### Configuration Supabase

1. **Créer un projet Supabase** sur [supabase.com](https://supabase.com)

2. **Configurer les variables d'environnement**
   
   Créez un fichier `.env.local` :
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Storage Configuration
   NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=models-3d
   ```

3. **Configurer la base de données**
   
   Exécutez le script SQL dans l'éditeur Supabase :
   ```bash
   # Le contenu du fichier supabase-setup.sql
   ```

4. **Créer le bucket de stockage**
   
   Dans Supabase Storage, créez un bucket public nommé `models-3d`

📖 **Guide détaillé** : Consultez [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) pour les instructions complètes.

### Démarrage

```bash
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
- Stockage : Supabase Storage (1GB gratuit, puis payant)

## 🎯 Utilisation

### 1. Télécharger un Modèle

1. Cliquez sur "Ajouter un modèle" ou allez sur `/upload`
2. Glissez-déposez vos fichiers 3D ou cliquez pour sélectionner
3. Les fichiers sont validés automatiquement
4. Cliquez sur "Télécharger" pour ajouter à la galerie
5. Le fichier est stocké dans Supabase Storage et les métadonnées en base

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

```env
# Supabase (Obligatoire)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage (Optionnel)
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=models-3d
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
- Politiques de sécurité Supabase (RLS)
- Stockage sécurisé avec Supabase Storage

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Configurer les variables d'environnement dans Vercel
# Puis déployer
vercel
```

**Important** : Configurez les variables d'environnement Supabase dans les paramètres de votre projet Vercel.

### Build Manuel

```bash
npm run build
npm run start
```

## 📊 Base de Données

### Structure de la table `models_3d`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| name | TEXT | Nom du modèle |
| filename | TEXT | Nom du fichier |
| original_name | TEXT | Nom original du fichier |
| file_size | BIGINT | Taille en bytes |
| mime_type | TEXT | Type MIME |
| storage_path | TEXT | Chemin dans Supabase Storage |
| public_url | TEXT | URL publique du fichier |
| slug | TEXT | Slug unique pour l'URL |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de modification |

## 🔧 Dépannage

### Erreurs courantes

1. **"bucket not found"**
   - Vérifiez que le bucket `models-3d` existe dans Supabase Storage
   - Vérifiez la variable `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`

2. **Erreur de permissions**
   - Vérifiez les politiques de storage dans Supabase
   - Assurez-vous que le bucket est public
   - Vérifiez les clés API dans `.env.local`

3. **Erreur de base de données**
   - Vérifiez que la table `models_3d` existe
   - Vérifiez les politiques RLS si activées
   - Vérifiez la clé service role

## 📈 Monitoring

- Surveillez l'utilisation du storage dans le dashboard Supabase
- Configurez des alertes pour les quotas
- Surveillez les logs d'erreur dans l'onglet **Logs** de Supabase

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Google Model Viewer](https://modelviewer.dev/) pour le rendu 3D
- [Supabase](https://supabase.com/) pour le backend
- [Next.js](https://nextjs.org/) pour le framework
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [Framer Motion](https://www.framer.com/motion/) pour les animations
