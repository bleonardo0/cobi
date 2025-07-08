# Migration Hotspots - Guide d'installation

Ce guide vous aide à ajouter les colonnes nécessaires pour le système de hotspots interactifs.

## 🎯 Colonnes qui seront ajoutées

La migration ajoute les colonnes suivantes à la table `models_3d` :

| Colonne | Type | Description |
|---------|------|-------------|
| `hotspots_enabled` | BOOLEAN | Active/désactive les hotspots pour le modèle |
| `hotspots_config` | JSONB | Configuration JSON des positions des hotspots |
| `nutri_score` | TEXT | Score nutritionnel (A, B, C, D, E) |
| `security_risk` | BOOLEAN | Indique un risque de sécurité alimentaire |
| `origin_country` | TEXT | Pays d'origine du produit |
| `transport_distance` | NUMERIC | Distance de transport en km |
| `carbon_footprint` | NUMERIC | Empreinte carbone en kg CO2 |

## 🚀 Options d'installation

### Option 1: Interface Supabase (Recommandé)

1. Allez dans votre dashboard Supabase
2. Naviguez vers **SQL Editor**
3. Copiez le contenu du fichier `migration-add-hotspots-columns.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** pour exécuter la migration

### Option 2: Script automatisé

```bash
# Assurez-vous que vos variables d'environnement sont configurées
node scripts/run-hotspots-migration.js --auto
```

### Option 3: Ligne par ligne (pour dépannage)

Si vous rencontrez des problèmes, vous pouvez exécuter chaque commande SQL individuellement :

```sql
-- 1. Activer les hotspots
ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS hotspots_enabled BOOLEAN DEFAULT FALSE;

-- 2. Configuration des hotspots
ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS hotspots_config JSONB DEFAULT '{}';

-- 3. Score nutritionnel
ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS nutri_score TEXT CHECK (nutri_score IN ('A', 'B', 'C', 'D', 'E'));

-- 4. Risque sécurité
ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS security_risk BOOLEAN DEFAULT FALSE;

-- 5. Pays d'origine
ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS origin_country TEXT;

-- 6. Distance transport
ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS transport_distance NUMERIC;

-- 7. Empreinte carbone
ALTER TABLE models_3d 
ADD COLUMN IF NOT EXISTS carbon_footprint NUMERIC;
```

## ✅ Vérification de l'installation

Après la migration, vérifiez que les colonnes ont été ajoutées :

```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'models_3d' 
AND (column_name LIKE '%hotspot%' 
     OR column_name IN ('nutri_score', 'security_risk', 'origin_country', 'transport_distance', 'carbon_footprint'))
ORDER BY column_name;
```

## 🔧 Dépannage

### Erreur "column already exists"
Si vous voyez cette erreur, c'est normal ! Les commandes utilisent `IF NOT EXISTS` pour éviter les conflits.

### Erreur de permissions
Assurez-vous d'utiliser une clé de service role avec les permissions de modification de schéma.

### Variables d'environnement manquantes
Vérifiez que ces variables sont définies dans votre `.env.local` :
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🎉 Après la migration

Une fois la migration terminée :

1. ✅ Les hotspots peuvent être activés/désactivés
2. ✅ Les configurations de hotspots sont sauvegardées
3. ✅ Les données nutritionnelles et de traçabilité sont persistées
4. ✅ L'éditeur interactif fonctionne correctement

## 📋 Prochaines étapes

Après la migration, vous pouvez :
- Tester l'éditeur de hotspots dans l'interface
- Configurer les hotspots sur vos modèles existants
- Utiliser les nouvelles données pour l'affichage et les filtres

## 🆘 Support

Si vous rencontrez des problèmes, vérifiez :
1. La connexion à Supabase
2. Les permissions de votre clé API
3. La structure de votre table `models_3d`

---

**Migration créée le :** 2024-12-19  
**Version :** 1.0  
**Compatibilité :** Supabase PostgreSQL 