# Documentation API - Galerie 3D

## Endpoints Disponibles

### GET /api/models

Récupère la liste de tous les modèles 3D.

**Réponse :**
```json
{
  "models": [
    {
      "id": "1234567890",
      "name": "Mon Modèle",
      "filename": "mon-modele-1234567890-abc123.usdz",
      "url": "/models/mon-modele-1234567890-abc123.usdz",
      "thumbnailUrl": null,
      "description": null,
      "fileSize": 1024000,
      "uploadDate": "2024-01-01T00:00:00.000Z",
      "mimeType": "model/vnd.usdz+zip",
      "slug": "mon-modele"
    }
  ],
  "total": 1
}
```

**Codes de statut :**
- `200` : Succès
- `500` : Erreur serveur

---

### POST /api/upload

Upload un nouveau modèle 3D.

**Paramètres :**
- `file` (FormData) : Le fichier 3D à uploader

**Formats supportés :**
- USDZ (model/vnd.usdz+zip)
- GLB (model/gltf-binary)
- GLTF (model/gltf+json)

**Limites :**
- Taille maximale : 50MB
- Extensions autorisées : .usdz, .glb, .gltf

**Réponse succès :**
```json
{
  "success": true,
  "model": {
    "id": "1234567890",
    "name": "Mon Modèle",
    "filename": "mon-modele-1234567890-abc123.usdz",
    "url": "/models/mon-modele-1234567890-abc123.usdz",
    "fileSize": 1024000,
    "uploadDate": "2024-01-01T00:00:00.000Z",
    "mimeType": "model/vnd.usdz+zip",
    "slug": "mon-modele"
  }
}
```

**Réponse erreur :**
```json
{
  "success": false,
  "error": "Le fichier est trop volumineux (max 50MB)"
}
```

**Codes de statut :**
- `200` : Upload réussi
- `400` : Erreur de validation (fichier invalide, trop volumineux, etc.)
- `500` : Erreur serveur

---

## Types TypeScript

### Model3D
```typescript
interface Model3D {
  id: string;
  name: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  fileSize: number;
  uploadDate: string;
  mimeType: string;
  slug: string;
}
```

### UploadResponse
```typescript
interface UploadResponse {
  success: boolean;
  model?: Model3D;
  error?: string;
}
```

### ModelsResponse
```typescript
interface ModelsResponse {
  models: Model3D[];
  total: number;
}
```

### SupportedMimeTypes
```typescript
type SupportedMimeTypes = 
  | 'model/vnd.usdz+zip' 
  | 'model/gltf-binary' 
  | 'model/gltf+json';
```

---

## Exemples d'utilisation

### Récupérer tous les modèles
```javascript
const response = await fetch('/api/models');
const data = await response.json();
console.log(`${data.total} modèles trouvés`);
```

### Uploader un modèle
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
if (result.success) {
  console.log('Modèle uploadé:', result.model);
} else {
  console.error('Erreur:', result.error);
}
```

---

## Gestion des erreurs

### Erreurs communes

**400 - Bad Request :**
- Aucun fichier fourni
- Type de fichier non supporté
- Fichier trop volumineux
- Extension de fichier invalide

**500 - Internal Server Error :**
- Erreur d'écriture sur le disque
- Erreur de base de données
- Erreur de traitement du fichier

### Format des erreurs
Toutes les erreurs suivent le même format :
```json
{
  "success": false,
  "error": "Message d'erreur descriptif"
}
```

---

## Sécurité

### Validation des fichiers
- Vérification du type MIME
- Vérification de l'extension
- Limitation de la taille
- Nettoyage du nom de fichier

### Noms de fichiers sécurisés
Les noms de fichiers sont automatiquement nettoyés :
- Caractères spéciaux supprimés
- Timestamp ajouté pour l'unicité
- Chaîne aléatoire pour éviter les collisions

Exemple : `mon modèle (1).usdz` → `mon-modele-1234567890-abc123.usdz` 