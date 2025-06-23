import { Model3D, FilterState, MenuCategory } from '@/types/model';

// Fonction pour filtrer les modèles selon les critères
export function filterModels(models: Model3D[], filters: FilterState): Model3D[] {
  return models.filter(model => {
    // Filtre par catégorie
    if (filters.category !== 'all') {
      if (model.category !== filters.category) {
        return false;
      }
    }

    // Filtre par tags
    if (filters.tags.length > 0) {
      const modelTags = model.tags || [];
      const hasMatchingTag = filters.tags.some(filterTag => 
        modelTags.includes(filterTag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Filtre par recherche (nom, tags, ingrédients)
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      const modelName = model.name.toLowerCase();
      const modelTags = (model.tags || []).join(' ').toLowerCase();
      const modelIngredients = (model.ingredients || []).join(' ').toLowerCase();
      const modelDescription = (model.description || '').toLowerCase();

      const matchesSearch = 
        modelName.includes(searchTerm) ||
        modelTags.includes(searchTerm) ||
        modelIngredients.includes(searchTerm) ||
        modelDescription.includes(searchTerm);

      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });
}

// Fonction pour obtenir les statistiques de filtrage
export function getFilterStats(models: Model3D[], filters: FilterState) {
  const filteredModels = filterModels(models, filters);
  
  // Statistiques par catégorie
  const categoryStats = models.reduce((acc, model) => {
    const category = model.category || 'autres';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Tags les plus utilisés
  const tagStats = models.reduce((acc, model) => {
    const tags = model.tags || [];
    tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return {
    total: models.length,
    filtered: filteredModels.length,
    categoryStats,
    tagStats,
    filteredModels
  };
}

// Fonction pour trier les modèles
export function sortModels(models: Model3D[], sortBy: 'name' | 'date' | 'category' = 'name'): Model3D[] {
  return [...models].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'category':
        const categoryA = a.category || 'autres';
        const categoryB = b.category || 'autres';
        if (categoryA === categoryB) {
          return a.name.localeCompare(b.name);
        }
        return categoryA.localeCompare(categoryB);
      default:
        return 0;
    }
  });
}

// Fonction pour grouper les modèles par catégorie
export function groupModelsByCategory(models: Model3D[]): Record<MenuCategory | 'autres', Model3D[]> {
  return models.reduce((acc, model) => {
    const category = (model.category as MenuCategory) || 'autres';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(model);
    return acc;
  }, {} as Record<MenuCategory | 'autres', Model3D[]>);
} 