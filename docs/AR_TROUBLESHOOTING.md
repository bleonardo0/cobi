# Guide de Dépannage AR - Android & iOS

## Problème : L'application crash quand je clique sur le bouton AR (Android)

### ✅ Solutions testées et validées :

#### 1. **Vérifications de base**
- Assurez-vous d'être sur **HTTPS** (obligatoire pour WebXR)
- Utilisez **Chrome** ou **Chrome Beta** (navigateur recommandé)
- Vérifiez que **Google Play Services pour AR** est installé et à jour

#### 2. **Redémarrage rapide**
```bash
# Étapes à suivre :
1. Fermez complètement Chrome
2. Redémarrez Chrome
3. Videz le cache (Paramètres > Confidentialité > Effacer les données)
4. Retestez l'AR
```

#### 3. **Vérification des permissions**
- Allez dans **Paramètres Android > Applications > Chrome**
- Vérifiez que la permission **Caméra** est activée
- Vérifiez que la permission **Stockage** est activée

#### 4. **Test en mode navigation privée**
- Ouvrez un onglet de navigation privée
- Testez l'AR dans cet onglet
- Si ça marche, le problème vient du cache/cookies

### 🔧 Solutions techniques avancées :

#### 1. **Forcer Scene Viewer au lieu de WebXR**
```javascript
// Dans l'URL, ajoutez le paramètre :
?ar_mode=scene-viewer
```

#### 2. **Vérifier la compatibilité de l'appareil**
Appareils testés et compatibles :
- ✅ Samsung Galaxy S8+ et plus récent
- ✅ Google Pixel (tous modèles)
- ✅ OnePlus 6 et plus récent
- ✅ Xiaomi Mi 8 et plus récent
- ❌ Appareils avec Android < 7.0

#### 3. **Diagnostic automatique**
Utilisez notre page de test : `/test-ar-android`
- Détection automatique de la compatibilité
- Logs en temps réel
- Tests avec différents modèles

### 🚨 Problèmes connus et workarounds :

#### **Crash immédiat au lancement AR**
**Cause :** Éléments CSS avec `display: none`
**Solution :** Utiliser `visibility: hidden` ou `opacity: 0`

#### **AR ne se lance pas du tout**
**Cause :** WebXR non supporté
**Solution :** Fallback automatique vers Scene Viewer

#### **Modèle n'apparaît pas en AR**
**Cause :** Modèle 3D trop volumineux ou mal formaté
**Solutions :**
- Utilisez des modèles < 10MB
- Préférez GLB à GLTF
- Vérifiez que le modèle est optimisé pour mobile

### 📱 Par type d'appareil :

#### **Samsung Galaxy**
- Désactivez temporairement Samsung Internet
- Utilisez Chrome comme navigateur par défaut
- Vérifiez les mises à jour One UI

#### **Xiaomi/MIUI**
- Désactivez les optimisations MIUI pour Chrome
- Autorisez Chrome à s'exécuter en arrière-plan
- Désactivez le mode économie d'énergie

#### **Huawei (sans Google Services)**
- AR non disponible sans Google Play Services
- Utilisez le mode 3D uniquement

### 🔍 Diagnostic étape par étape :

1. **Test de base :** Ouvrez `/test-ar-android`
2. **Vérifiez les logs :** Regardez les messages d'erreur
3. **Testez différents modèles :** Commencez par l'Astronaute Google
4. **Changez de navigateur :** Testez avec Chrome Beta
5. **Redémarrez l'appareil :** Solution de dernier recours

### 📞 Support technique :

Si le problème persiste après avoir suivi ce guide :
1. Notez le modèle exact de votre appareil
2. Notez la version d'Android
3. Notez la version de Chrome
4. Faites une capture d'écran des logs d'erreur
5. Contactez le support avec ces informations

---

## 🍎 Problème : L'AR ne propose plus d'affichage sur iPhone/iPad

### ✅ Solutions spécifiques iOS :

#### 1. **Vérifications de base iOS**
- **Utilisez Safari** (obligatoire pour Quick Look AR)
- Assurez-vous d'avoir **iOS 12+** (minimum requis)
- Vérifiez que vous êtes sur **HTTPS** (obligatoire)
- Le modèle doit être au format **USDZ** pour l'AR iOS

#### 2. **Problèmes courants et solutions**

**❌ Bouton AR n'apparaît pas du tout :**
- Vérifiez que le navigateur est **Safari** (pas Chrome iOS)
- Confirmez que le fichier est bien au format **USDZ**
- Assurez-vous que le site est servi en **HTTPS**

**❌ Bouton AR grisé ou non cliquable :**
- Redémarrez Safari complètement
- Videz le cache Safari : Réglages > Safari > Effacer historique
- Testez en navigation privée

**❌ "Impossible d'ouvrir en AR" :**
- Le fichier USDZ peut être corrompu ou mal formaté
- Testez avec un modèle USDZ d'Apple : [Toy Robot](https://developer.apple.com/augmented-reality/quick-look/models/toyrobot/robot_walk_idle.usdz)

#### 3. **Forcer le rechargement de la détection AR**
```javascript
// Ouvrez la console Safari et exécutez :
location.reload(true);
```

#### 4. **Tester la compatibilité**
Allez sur `/test-usdz` pour tester :
- Détection automatique iOS/Safari
- Test avec des modèles USDZ de référence Apple
- Diagnostic de compatibilité en temps réel

### 🔧 Solutions techniques avancées iOS :

#### **Forcer Quick Look avec lien direct**
Si model-viewer ne fonctionne pas, testez avec un lien direct :
```html
<a href="votre-modele.usdz" rel="ar">
  <img src="preview.jpg" alt="Voir en AR">
</a>
```

#### **Vérifier la compatibilité de l'appareil iOS**
Appareils testés et compatibles :
- ✅ iPhone 6s et plus récent
- ✅ iPad (5ème génération) et plus récent
- ✅ iPad Pro (tous modèles)
- ✅ iPad Air 2 et plus récent
- ✅ iPad mini 4 et plus récent
- ❌ iPhone 6 et antérieur
- ❌ iPad (4ème génération) et antérieur

#### **Optimisation des fichiers USDZ**
Pour éviter les problèmes :
- Taille recommandée : **< 25 MB** pour iOS
- Utilisez des textures compressées
- Limitez le nombre de polygones : **< 100,000 triangles**
- Testez avec Reality Composer d'Apple

### 🚨 Problèmes connus iOS et workarounds :

#### **AR ne se lance que parfois**
**Cause :** Cache Safari corrompu
**Solution :** 
1. Réglages > Safari > Avancé > Données de sites web
2. Supprimez les données pour votre site
3. Redémarrez Safari

#### **"Fichier non pris en charge" avec USDZ valide**
**Cause :** Problème de Content-Type du serveur
**Solution :** Vérifiez que le serveur renvoie :
```
Content-Type: model/vnd.usdz+zip
```

#### **AR fonctionne mais modèle invisible**
**Cause :** Échelle du modèle inadaptée
**Solutions :**
- Vérifiez l'échelle dans Reality Composer
- Ajustez la taille dans le fichier USDZ
- Utilisez l'attribut `ar-scale="auto"`

#### **Performance AR dégradée**
**Cause :** Modèle trop complexe pour l'appareil
**Solutions :**
- Réduisez la complexité géométrique
- Optimisez les textures (1024x1024 max)
- Utilisez des formats de texture compressés

### 📱 Par modèle d'iPhone :

#### **iPhone 12 et plus récent**
- Support complet Quick Look AR
- Capteur LiDAR pour placement précis
- Performances optimales

#### **iPhone X/XS/11**
- Support Quick Look AR complet
- Bonne performance avec modèles optimisés
- Placement basé sur les plans détectés

#### **iPhone 7/8/SE (2ème gen)**
- Support Quick Look AR de base
- Limitez la complexité des modèles
- Performances réduites avec gros fichiers

#### **iPhone 6s**
- Support Quick Look AR minimal
- Modèles très simples uniquement
- Performances limitées

### 🔍 Diagnostic étape par étape iOS :

1. **Test de base :** Ouvrez `/test-usdz` dans Safari iOS
2. **Vérifiez la compatibilité :** L'indicateur iOS doit être vert
3. **Testez un modèle Apple :** Utilisez le Toy Robot de référence
4. **Videz le cache :** Si problème, effacez les données Safari
5. **Redémarrez :** Fermez Safari complètement et rouvrez
6. **Testez navigation privée :** Pour isoler les problèmes de cache

### 📞 Support technique iOS :

Si le problème persiste après avoir suivi ce guide :
1. Notez le modèle exact de votre iPhone/iPad
2. Notez la version d'iOS
3. Notez la version de Safari
4. Testez avec un modèle USDZ d'Apple
5. Faites une capture d'écran du test de compatibilité
6. Contactez le support avec ces informations

---

**Dernière mise à jour :** Janvier 2025  
**Testé sur :** Android 7-14, Chrome 120-122 