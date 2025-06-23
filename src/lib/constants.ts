import { CategoryInfo, TagInfo, MenuCategory } from '@/types/model';

// Catégories prédéfinies pour le restaurant
export const MENU_CATEGORIES: CategoryInfo[] = [
  {
    id: 'entrees',
    name: 'Entrées',
    icon: '🥗',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'plats',
    name: 'Plats',
    icon: '🍽️',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'desserts',
    name: 'Desserts',
    icon: '🍰',
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  },
  {
    id: 'boissons',
    name: 'Boissons',
    icon: '🥤',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'menus-speciaux',
    name: 'Menus Spéciaux',
    icon: '⭐',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  {
    id: 'autres',
    name: 'Autres',
    icon: '📦',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  }
];

// Tags prédéfinis pour les filtres rapides
export const PREDEFINED_TAGS: TagInfo[] = [
  {
    id: 'vegan',
    name: 'Vegan',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'vegetarien',
    name: 'Végétarien',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'sans-gluten',
    name: 'Sans Gluten',
    color: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'epice',
    name: 'Épicé',
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'bio',
    name: 'Bio',
    color: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'fait-maison',
    name: 'Fait Maison',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'sans-lactose',
    name: 'Sans Lactose',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'leger',
    name: 'Léger',
    color: 'bg-cyan-100 text-cyan-800'
  },
  {
    id: 'signature',
    name: 'Signature',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'nouveau',
    name: 'Nouveau',
    color: 'bg-pink-100 text-pink-800'
  }
];

// Fonction utilitaire pour obtenir les infos d'une catégorie
export function getCategoryInfo(categoryId: MenuCategory): CategoryInfo | undefined {
  return MENU_CATEGORIES.find(cat => cat.id === categoryId);
}

// Fonction utilitaire pour obtenir les infos d'un tag
export function getTagInfo(tagId: string): TagInfo | undefined {
  return PREDEFINED_TAGS.find(tag => tag.id === tagId);
}

// Allergènes prédéfinis
export interface AllergenInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const PREDEFINED_ALLERGENS: AllergenInfo[] = [
  { id: 'gluten', name: 'Gluten', icon: '🌾', color: 'bg-amber-100 text-amber-800' },
  { id: 'lactose', name: 'Lactose', icon: '🥛', color: 'bg-blue-100 text-blue-800' },
  { id: 'oeufs', name: 'Œufs', icon: '🥚', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'arachides', name: 'Arachides', icon: '🥜', color: 'bg-orange-100 text-orange-800' },
  { id: 'fruits-a-coque', name: 'Fruits à coque', icon: '🌰', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'soja', name: 'Soja', icon: '🫘', color: 'bg-green-100 text-green-800' },
  { id: 'poisson', name: 'Poisson', icon: '🐟', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'crustaces', name: 'Crustacés', icon: '🦐', color: 'bg-red-100 text-red-800' },
  { id: 'mollusques', name: 'Mollusques', icon: '🦪', color: 'bg-gray-100 text-gray-800' },
  { id: 'celeri', name: 'Céleri', icon: '🥬', color: 'bg-green-100 text-green-800' },
  { id: 'moutarde', name: 'Moutarde', icon: '🌱', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'sesame', name: 'Sésame', icon: '🌰', color: 'bg-orange-100 text-orange-800' },
  { id: 'sulfites', name: 'Sulfites', icon: '🧪', color: 'bg-purple-100 text-purple-800' },
  { id: 'lupin', name: 'Lupin', icon: '🌸', color: 'bg-pink-100 text-pink-800' },
];

// Fonction utilitaire pour obtenir les infos d'un allergène
export function getAllergenInfo(allergenId: string): AllergenInfo | undefined {
  return PREDEFINED_ALLERGENS.find(allergen => allergen.id === allergenId);
} 