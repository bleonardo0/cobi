'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'en';

interface MenuLanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const MenuLanguageContext = createContext<MenuLanguageContextType | undefined>(undefined);

// Traductions pour le menu client
const menuTranslations = {
  fr: {
    // Menu Client
    'menu.title': 'Menu',
    'menu.all': 'Toutes',
    'menu.search': 'Rechercher...',
    'menu.no.results': 'Aucun résultat trouvé',
    'menu.loading': 'Chargement du menu...',
    'menu.language.select': 'Langue',
    'menu.language.french': 'Français',
    'menu.language.english': 'English',
    
    // Categories
    'category.entrees': 'Entrées',
    'category.plats': 'Plats',
    'category.desserts': 'Desserts',
    'category.boissons': 'Boissons',
    'category.autres': 'Autres',
    
    // Model/Dish details
    'model.ingredients': 'Ingrédients',
    'model.allergens': 'Allergènes',
    'model.price.on.request': 'Prix sur demande',
    'model.view.3d': 'Voir en 3D',
    'model.hotspots.hide': 'Masquer les hotspots',
    'model.hotspots.show': 'Afficher les hotspots',
    
    // Restaurant info
    'restaurant.not.found': 'Restaurant non trouvé',
    'restaurant.menu.description': 'Découvrez notre délicieux menu',
    'restaurant.menu.3d.available': 'Menu disponible en 3D • Livraison disponible',
    'restaurant.error.loading': 'Erreur lors du chargement du menu',
    'restaurant.error.unknown': 'Erreur inconnue',
    'restaurant.no.dishes.category': 'Aucun plat ne correspond à cette catégorie.',
    'restaurant.dish.description.default': 'Délicieux plat préparé avec soin par nos chefs',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.close': 'Fermer',
  },
  en: {
    // Menu Client
    'menu.title': 'Menu',
    'menu.all': 'All',
    'menu.search': 'Search...',
    'menu.no.results': 'No results found',
    'menu.loading': 'Loading menu...',
    'menu.language.select': 'Language',
    'menu.language.french': 'Français',
    'menu.language.english': 'English',
    
    // Categories
    'category.entrees': 'Starters',
    'category.plats': 'Main Courses',
    'category.desserts': 'Desserts',
    'category.boissons': 'Beverages',
    'category.autres': 'Others',
    
    // Model/Dish details
    'model.ingredients': 'Ingredients',
    'model.allergens': 'Allergens',
    'model.price.on.request': 'Price on request',
    'model.view.3d': 'View in 3D',
    'model.hotspots.hide': 'Hide hotspots',
    'model.hotspots.show': 'Show hotspots',
    
    // Restaurant info
    'restaurant.not.found': 'Restaurant not found',
    'restaurant.menu.description': 'Discover our delicious menu',
    'restaurant.menu.3d.available': '3D Menu available • Delivery available',
    'restaurant.error.loading': 'Error loading menu',
    'restaurant.error.unknown': 'Unknown error',
    'restaurant.no.dishes.category': 'No dishes match this category.',
    'restaurant.dish.description.default': 'Delicious dish prepared with care by our chefs',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.close': 'Close',
  }
};

interface MenuLanguageProviderProps {
  children: ReactNode;
}

export function MenuLanguageProvider({ children }: MenuLanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('fr');

  // Charger la langue depuis localStorage au démarrage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('cobi-menu-language') as Language;
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Sauvegarder la langue dans localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cobi-menu-language', lang);
  };

  // Fonction de traduction avec support des paramètres
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = menuTranslations[language][key as keyof typeof menuTranslations[typeof language]] || key;
    
    // Remplacer les paramètres dans la traduction
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{{${paramKey}}}`, String(paramValue));
      });
    }
    
    return translation;
  };

  return (
    <MenuLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </MenuLanguageContext.Provider>
  );
}

export function useMenuLanguage() {
  const context = useContext(MenuLanguageContext);
  if (context === undefined) {
    throw new Error('useMenuLanguage must be used within a MenuLanguageProvider');
  }
  return context;
} 