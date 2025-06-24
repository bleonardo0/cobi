'use client';

import { useState, useEffect, useCallback } from "react";
import { Model3D, ModelsResponse, FilterState } from "@/types/model";
import GalleryGrid from "@/components/GalleryGrid";
import FilterBar from "@/components/FilterBar";
import Link from "next/link";
import { motion } from "framer-motion";
import { filterModels, getFilterStats, sortModels } from "@/lib/filtering";
import { MENU_CATEGORIES } from "@/lib/constants";

export default function HomePage() {
  const [models, setModels] = useState<Model3D[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model3D[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'category'>('name');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/models');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des modèles');
      }
      
      const data: ModelsResponse = await response.json();
      const sortedModels = sortModels(data.models || [], sortBy);
      setModels(sortedModels);
      setFilteredModels(sortedModels);
    } catch (error) {
      console.error('Error fetching models:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = useCallback((filters: FilterState) => {
    const filtered = filterModels(models, filters);
    const sorted = sortModels(filtered, sortBy);
    setFilteredModels(sorted);
  }, [models, sortBy]);

  const handleSortChange = (newSortBy: 'name' | 'date' | 'category') => {
    setSortBy(newSortBy);
    const sorted = sortModels(filteredModels, newSortBy);
    setFilteredModels(sorted);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen gradient-bg-soft">
      {/* Header moderne inspiré du design vitrine */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="nav-modern glass-effect sticky top-0 z-50"
      >
        <div className="container-modern">
          <div className="flex justify-between items-center py-4 sm:py-6">
            {/* Logo moderne style vitrine */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">C</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Cobi</h1>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Dashboard 3D
                </p>
              </div>
            </div>

            {/* Navigation moderne */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link 
                href="/insights" 
                className="font-medium hover:underline transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                📊 Analytics
              </Link>
              <Link 
                href="/menu/test" 
                target="_blank"
                className="font-medium hover:underline transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                🍽️ Menu Client
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link href="/dashboard" className="btn-secondary hidden sm:inline-flex">
                🏗️ Dashboard
              </Link>
              <Link href="/upload" className="btn-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Ajouter</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container-modern section-padding">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="animate-fade-in"
        >
          {/* Section QR Code / Menu Client modernisée */}
          <motion.div
            variants={fadeInUp}
            className="card-modern p-8 sm:p-10 mb-12 animate-scale-in"
            style={{ 
              background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
              border: '1px solid rgba(30, 64, 175, 0.1)'
            }}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  🍽️ Menu Client 3D
                </h2>
                <p className="text-lg sm:text-xl mb-6 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Sans appli, sans surprise : vos clients scannent un QR code pour découvrir vos plats en 3D et commander en toute confiance.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <Link
                    href="/menu/test"
                    target="_blank"
                    className="btn-primary"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Voir le menu démo
                  </Link>
                  <div className="text-sm sm:text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    📱 Optimisé mobile • 🎯 Analytics intégrés
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center"
                     style={{ backgroundColor: 'rgba(30, 64, 175, 0.1)' }}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">📱</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                      QR Code
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats modernisées */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-12 animate-slide-up"
          >
            <div className="card-modern card-hover p-6 sm:p-8">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center"
                     style={{ backgroundColor: 'rgba(30, 64, 175, 0.1)' }}>
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10"
                    style={{ color: 'var(--color-primary)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold mb-2">{models.length}</p>
                  <p className="text-base sm:text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Modèles 3D
                  </p>
                </div>
              </div>
            </div>

            <div className="card-modern card-hover p-6 sm:p-8">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center"
                     style={{ backgroundColor: 'rgba(30, 64, 175, 0.1)' }}>
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10"
                    style={{ color: 'var(--color-primary)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold mb-2">{filteredModels.length}</p>
                  <p className="text-base sm:text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Affichés
                  </p>
                </div>
              </div>
            </div>

            <div className="card-modern card-hover p-6 sm:p-8">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center"
                     style={{ backgroundColor: 'rgba(30, 64, 175, 0.1)' }}>
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10"
                    style={{ color: 'var(--color-primary)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold mb-2">
                    {MENU_CATEGORIES.length}
                  </p>
                  <p className="text-base sm:text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Catégories
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filter Bar */}
          {!isLoading && models.length > 0 && (
            <motion.div variants={fadeInUp}>
              <FilterBar
                onFilterChange={handleFilterChange}
                totalItems={models.length}
                filteredItems={filteredModels.length}
              />
            </motion.div>
          )}

          {/* Sort Controls */}
          {!isLoading && models.length > 0 && (
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
            >
              <div className="text-sm sm:text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {filteredModels.length > 0 ? (
                  <>Affichage de <span className="font-bold">{filteredModels.length}</span> modèle{filteredModels.length > 1 ? 's' : ''} sur <span className="font-bold">{models.length}</span></>
                ) : (
                  <>Aucun modèle ne correspond aux critères de recherche</>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Trier par:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as 'name' | 'date' | 'category')}
                  className="input-modern"
                >
                  <option value="name">Nom</option>
                  <option value="date">Date d'ajout</option>
                  <option value="category">Catégorie</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Gallery */}
          <motion.div variants={fadeInUp}>
            <GalleryGrid
              models={filteredModels}
              isLoading={isLoading}
              error={error}
            />
          </motion.div>

          {/* Section Features */}
          {!isLoading && models.length > 0 && (
            <motion.section
              variants={fadeInUp}
              className="mt-16 card-modern p-8 sm:p-10"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
                Fonctionnalités principales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto"
                       style={{ backgroundColor: 'rgba(30, 64, 175, 0.1)' }}>
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10"
                      style={{ color: 'var(--color-primary)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Visualisation 3D</h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Explorez vos modèles avec des contrôles de caméra intuitifs et une rotation automatique
                  </p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto"
                       style={{ backgroundColor: 'rgba(30, 64, 175, 0.1)' }}>
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10"
                      style={{ color: 'var(--color-primary)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Réalité Augmentée</h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Visualisez vos modèles en AR directement sur mobile avec WebXR et Quick Look iOS
                  </p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto"
                       style={{ backgroundColor: 'rgba(30, 64, 175, 0.1)' }}>
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10"
                      style={{ color: 'var(--color-primary)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Upload Facile</h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Glissez-déposez vos fichiers USDZ, GLB ou GLTF pour les ajouter instantanément
                  </p>
                </div>
              </div>
            </motion.section>
          )}
        </motion.div>
      </main>

      {/* Footer simple */}
      <footer className="py-8 border-t" style={{ borderColor: 'var(--color-bg-tertiary)' }}>
        <div className="container-modern text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold">Cobi</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Plateforme de gestion 3D pour restaurants • © 2024 Cobi
          </p>
        </div>
      </footer>
    </div>
  );
}
