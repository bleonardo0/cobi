'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'en';

interface DashboardLanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const DashboardLanguageContext = createContext<DashboardLanguageContextType | undefined>(undefined);

// Traductions pour le dashboard
const dashboardTranslations = {
  fr: {
    // Navigation & Layout
    'nav.dashboard': 'Dashboard',
    'nav.menu': 'Menu Client',
    'nav.statistics': 'Statistiques',
    'nav.settings': 'Paramètres',
    'nav.contact': 'Nous contacter',
    'nav.logout': 'Déconnexion',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Bienvenue',
    'dashboard.dishes.available': 'plats disponibles – visualisables en 3D & AR 🎉',
    'dashboard.dishes.total': 'Plats disponibles',
    'dashboard.views.total': 'Vues totales',
    'dashboard.dish.popular': 'Plat populaire',
    'dashboard.scans.weekly': 'Scans hebdomadaires',
    'dashboard.menu.active': 'Menu 3D Actif',
    'dashboard.menu.description': 'Sans appli, sans surprise : vos clients scannent un QR code pour découvrir vos plats en 3D et commander en toute confiance.',
    'dashboard.view.menu': 'Voir le menu',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Gérez les paramètres de votre restaurant',
    'settings.status': 'Statut',
    'settings.plan': 'Plan',
    'settings.rating': 'Note',
    'settings.allergens': 'Allergènes',
    'settings.general': '🏢 Général',
    'settings.design': '🎨 Design',
    'settings.hours': '🕒 Horaires',
    'settings.account': '👤 Compte',
    'settings.language': '🌐 Langue',
    'settings.restaurant.name': 'Nom du restaurant',
    'settings.restaurant.slug': 'Slug (URL)',
    'settings.restaurant.address': 'Adresse',
    'settings.restaurant.phone': 'Téléphone',
    'settings.restaurant.email': 'Email',
    'settings.restaurant.website': 'Site web',
    'settings.restaurant.description': 'Description',
    'settings.customization': 'Personnalisation',
    'settings.primary.color': 'Couleur primaire',
    'settings.secondary.color': 'Couleur secondaire',
    'settings.logo': 'Logo du restaurant',
    'settings.ambiance.image': 'Image d\'ambiance (nouveau menu)',
    'settings.choose.image': 'Choisir une image',
    'settings.choose.ambiance': 'Choisir image d\'ambiance',
    'settings.opening.hours': 'Heures d\'ouverture',
    'settings.open': 'Ouvert',
    'settings.account.current': 'Email actuel',
    'settings.account.management': 'Gestion du compte',
    'settings.account.description': 'Utilisez le menu de votre profil pour modifier votre mot de passe, email, ou autres paramètres de sécurité.',
    'settings.danger.zone': 'Zone de danger',
    'settings.delete.warning': 'La suppression de votre compte est irréversible. Toutes vos données seront perdues.',
    'settings.delete.account': 'Supprimer mon compte',
    'settings.export.stats': '📊 Exporter mes statistiques',
    'settings.export.description': 'Téléchargez vos données de performance au format CSV',
    'settings.download': 'Télécharger',
    'settings.save': 'Sauvegarder',
    'settings.saving': 'Sauvegarde...',
    'settings.language.select': 'Sélectionner la langue',
    'settings.language.french': 'Français',
    'settings.language.english': 'English',
    
    // Model Management
    'model.edit': 'Modifier',
    'model.delete': 'Supprimer',
    'model.return': 'Retour au modèle',
    'model.name': 'Nom du modèle',
    'model.category': 'Catégorie',
    'model.price': 'Prix',
    'model.description': 'Description',
    'model.ingredients': 'Ingrédients',
    'model.allergens': 'Allergènes',
    'model.preview.image': 'Image de prévisualisation',
    'model.current.image': 'Image actuelle',
    'model.replace.image': 'Remplacer l\'image',
    'model.add.image': 'Ajouter une image',
    'model.remove.image': 'Supprimer l\'image',
    'model.file.size': 'Taille du fichier',
    'model.format': 'Format',
    'model.upload.date': 'Date d\'ajout',
    
    // Common
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.add.dish': 'Ajouter un plat',
    'common.remove': 'Supprimer',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.active': 'Actif',
    'common.inactive': 'Inactif',
    'common.yes': 'Oui',
    'common.no': 'Non',
    
    // Days
    'day.monday': 'Lundi',
    'day.tuesday': 'Mardi',
    'day.wednesday': 'Mercredi',
    'day.thursday': 'Jeudi',
    'day.friday': 'Vendredi',
    'day.saturday': 'Samedi',
    'day.sunday': 'Dimanche',
  },
  en: {
    // Navigation & Layout
    'nav.dashboard': 'Dashboard',
    'nav.menu': 'Client Menu',
    'nav.statistics': 'Statistics',
    'nav.settings': 'Settings',
    'nav.contact': 'Contact Us',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.dishes.available': 'dishes available – viewable in 3D & AR 🎉',
    'dashboard.dishes.total': 'Available Dishes',
    'dashboard.views.total': 'Total Views',
    'dashboard.dish.popular': 'Popular Dish',
    'dashboard.scans.weekly': 'Weekly Scans',
    'dashboard.menu.active': '3D Menu Active',
    'dashboard.menu.description': 'No app, no surprises: your customers scan a QR code to discover your dishes in 3D and order with confidence.',
    'dashboard.view.menu': 'View Menu',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your restaurant settings',
    'settings.status': 'Status',
    'settings.plan': 'Plan',
    'settings.rating': 'Rating',
    'settings.allergens': 'Allergens',
    'settings.general': '🏢 General',
    'settings.design': '🎨 Design',
    'settings.hours': '🕒 Hours',
    'settings.account': '👤 Account',
    'settings.language': '🌐 Language',
    'settings.restaurant.name': 'Restaurant Name',
    'settings.restaurant.slug': 'Slug (URL)',
    'settings.restaurant.address': 'Address',
    'settings.restaurant.phone': 'Phone',
    'settings.restaurant.email': 'Email',
    'settings.restaurant.website': 'Website',
    'settings.restaurant.description': 'Description',
    'settings.customization': 'Customization',
    'settings.primary.color': 'Primary Color',
    'settings.secondary.color': 'Secondary Color',
    'settings.logo': 'Restaurant Logo',
    'settings.ambiance.image': 'Ambiance Image (new menu)',
    'settings.choose.image': 'Choose Image',
    'settings.choose.ambiance': 'Choose Ambiance Image',
    'settings.opening.hours': 'Opening Hours',
    'settings.open': 'Open',
    'settings.account.current': 'Current Email',
    'settings.account.management': 'Account Management',
    'settings.account.description': 'Use your profile menu to change your password, email, or other security settings.',
    'settings.danger.zone': 'Danger Zone',
    'settings.delete.warning': 'Deleting your account is irreversible. All your data will be lost.',
    'settings.delete.account': 'Delete My Account',
    'settings.export.stats': '📊 Export My Statistics',
    'settings.export.description': 'Download your performance data in CSV format',
    'settings.download': 'Download',
    'settings.save': 'Save',
    'settings.saving': 'Saving...',
    'settings.language.select': 'Select Language',
    'settings.language.french': 'Français',
    'settings.language.english': 'English',
    
    // Model Management
    'model.edit': 'Edit',
    'model.delete': 'Delete',
    'model.return': 'Back to Model',
    'model.name': 'Model Name',
    'model.category': 'Category',
    'model.price': 'Price',
    'model.description': 'Description',
    'model.ingredients': 'Ingredients',
    'model.allergens': 'Allergens',
    'model.preview.image': 'Preview Image',
    'model.current.image': 'Current Image',
    'model.replace.image': 'Replace Image',
    'model.add.image': 'Add Image',
    'model.remove.image': 'Remove Image',
    'model.file.size': 'File Size',
    'model.format': 'Format',
    'model.upload.date': 'Upload Date',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.add.dish': 'Add a dish',
    'common.remove': 'Remove',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Days
    'day.monday': 'Monday',
    'day.tuesday': 'Tuesday',
    'day.wednesday': 'Wednesday',
    'day.thursday': 'Thursday',
    'day.friday': 'Friday',
    'day.saturday': 'Saturday',
    'day.sunday': 'Sunday',
  }
};

interface DashboardLanguageProviderProps {
  children: ReactNode;
}

export function DashboardLanguageProvider({ children }: DashboardLanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('fr');

  // Charger la langue depuis localStorage au démarrage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('cobi-dashboard-language') as Language;
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Sauvegarder la langue dans localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cobi-dashboard-language', lang);
  };

  // Fonction de traduction avec support des paramètres
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = dashboardTranslations[language][key as keyof typeof dashboardTranslations[typeof language]] || key;
    
    // Remplacer les paramètres dans la traduction
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{{${paramKey}}}`, String(paramValue));
      });
    }
    
    return translation;
  };

  return (
    <DashboardLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </DashboardLanguageContext.Provider>
  );
}

export function useDashboardLanguage() {
  const context = useContext(DashboardLanguageContext);
  if (context === undefined) {
    throw new Error('useDashboardLanguage must be used within a DashboardLanguageProvider');
  }
  return context;
} 