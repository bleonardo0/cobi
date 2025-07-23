'use client';

import { useState, useEffect } from 'react';
import { FilterState, MenuCategory } from '@/types/model';
import { MENU_CATEGORIES, PREDEFINED_TAGS, getCategoryInfo, getTagInfo } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { useRestaurantTheme, useApplyTheme } from '@/hooks/useRestaurantTheme';

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  totalItems: number;
  filteredItems: number;
}

export default function FilterBar({ onFilterChange, totalItems, filteredItems }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    tags: [],
    search: ''
  });

  const [searchInput, setSearchInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Système de thème restaurant
  const theme = useRestaurantTheme();
  useApplyTheme(theme);

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Notifier les changements de filtres
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleCategoryChange = (category: MenuCategory | 'all') => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handleTagToggle = (tagId: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) 
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const clearFilters = () => {
    setFilters({ category: 'all', tags: [], search: '' });
    setSearchInput('');
  };

  const hasActiveFilters = filters.category !== 'all' || filters.tags.length > 0 || filters.search.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6"
    >
      {/* Header avec recherche */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Filtrer les modèles</h2>
            <p className="text-sm text-neutral-500 mt-1">
              {filteredItems} sur {totalItems} modèles
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 ring-1 ring-primary-200">
                  Filtres actifs
                </span>
              )}
            </p>
          </div>
          
          {/* Toggle expand button on mobile */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* Barre de recherche */}
        <div className="relative w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher par nom, tag ou ingrédient..."
            className="w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-neutral-900 placeholder-neutral-500 bg-white"
          />
          <AnimatePresence>
            {searchInput && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchInput('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filtres - Masqués/Affichés selon l'état */}
      <AnimatePresence>
        {(isExpanded || (typeof window !== 'undefined' && !window.matchMedia('(max-width: 1024px)').matches)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Filtres par catégorie - Fixed isolated icons */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Catégories
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* Bouton Toutes catégories */}
                <motion.button
                  key="all-categories-v4"
                  onClick={() => handleCategoryChange('all')}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                    filters.category === 'all'
                      ? 'bg-blue-600 text-white ring-2 ring-blue-500/20 shadow-lg'
                      : 'bg-gray-100 text-gray-800 hover:bg-blue-50 hover:text-blue-700 hover:ring-1 hover:ring-blue-200'
                  }`}
                  style={{
                    backgroundColor: filters.category === 'all' ? theme.primaryColor : '#f3f4f6',
                    color: filters.category === 'all' ? '#ffffff' : '#1f2937'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🍽️ Toutes
                </motion.button>
                {MENU_CATEGORIES.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                      filters.category === category.id
                        ? 'bg-blue-600 text-white ring-2 ring-blue-500/20 shadow-lg'
                        : 'bg-gray-100 text-gray-800 hover:bg-blue-50 hover:text-blue-700 hover:ring-1 hover:ring-blue-200'
                    }`}
                    style={{
                      backgroundColor: filters.category === category.id ? theme.primaryColor : '#f3f4f6',
                      color: filters.category === category.id ? '#ffffff' : '#1f2937'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category.icon} {category.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Filtres par tags */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map((tag) => (
                  <motion.button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 relative ${
                      filters.tags.includes(tag.id)
                        ? 'ring-2 shadow-soft'
                        : 'bg-neutral-100 text-neutral-700 hover:ring-1'
                    }`}
                    style={{
                      backgroundColor: filters.tags.includes(tag.id) ? theme.secondaryColor + '20' : '#f3f4f6',
                      color: filters.tags.includes(tag.id) ? theme.secondaryColor : '#1f2937',
                      '--tw-ring-color': theme.secondaryColor + '33'
                    } as React.CSSProperties}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tag.name}
                    {filters.tags.includes(tag.id) && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-1 inline-block text-accent-600"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <div className="text-sm text-neutral-600">
                {hasActiveFilters && (
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-1 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filtrage actif
                  </span>
                )}
              </div>
              
              {hasActiveFilters && (
                <motion.button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Effacer les filtres
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicateur de résultats */}
      {totalItems > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 pt-4 border-t border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {filteredItems === totalItems ? 'Tous les modèles affichés' : `${filteredItems} modèles trouvés`}
              </span>
            </div>
            {filteredItems === 0 && hasActiveFilters && (
              <span className="text-sm text-orange-600 font-medium">
                Aucun résultat - Essayez d'ajuster vos filtres
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 