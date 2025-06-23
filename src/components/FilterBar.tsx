'use client';

import { useState, useEffect } from 'react';
import { FilterState, MenuCategory } from '@/types/model';
import { MENU_CATEGORIES, PREDEFINED_TAGS, getCategoryInfo, getTagInfo } from '@/lib/constants';

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      {/* Header avec recherche */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h2 className="text-lg font-semibold text-gray-900">Filtrer les modèles</h2>
          <p className="text-sm text-gray-600">
            {filteredItems} sur {totalItems} modèles affichés
          </p>
        </div>
        
        {/* Barre de recherche */}
        <div className="relative w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher par nom, tag ou ingrédient..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Catégories</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              filters.category === 'all'
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Toutes
          </button>
          {MENU_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border flex items-center gap-2 ${
                filters.category === category.id
                  ? category.color
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres par tags */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_TAGS.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagToggle(tag.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filters.tags.includes(tag.id)
                  ? tag.color + ' ring-2 ring-offset-1 ring-blue-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag.name}
              {filters.tags.includes(tag.id) && (
                <span className="ml-1">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {filters.tags.length > 0 && (
              <span>
                Tags actifs: {filters.tags.map(tagId => getTagInfo(tagId)?.name).join(', ')}
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Effacer tous les filtres
          </button>
        </div>
      )}
    </div>
  );
} 