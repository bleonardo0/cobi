'use client';

import { useState, useEffect, useCallback } from "react";
import { Model3D, ModelsResponse, FilterState } from "@/types/model";
import GalleryGrid from "@/components/GalleryGrid";
import FilterBar from "@/components/FilterBar";
import Link from "next/link";
import { motion } from "framer-motion";
import { filterModels, getFilterStats, sortModels } from "@/lib/filtering";
import { MENU_CATEGORIES } from "@/lib/constants";
import { useScrollPosition } from "@/hooks/useScrollPosition";

export default function HomePage() {
  const [models, setModels] = useState<Model3D[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model3D[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'category'>('name');
  
  // Restaurer la position de scroll si l'utilisateur revient de la page d'un modèle
  useScrollPosition('gallery', true);

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

  // Calculs des métriques restaurant
  const getRestaurantMetrics = () => {
    const totalViews = 15420;
    const totalFileSize = models.reduce((acc, model) => {
      const glbSize = model.glbFileSize || model.fileSize || 0;
      const usdzSize = model.usdzFileSize || 0;
      return acc + glbSize + usdzSize;
    }, 0);
    
    const avgLoadTime = models.length > 0 
      ? Math.round((totalFileSize / models.length / 1024 / 1024) * 150 + 200)
      : 0;
    
    return {
      totalDishes: models.length,
      totalViews,
      avgLoadTime,
      totalStorage: Math.round(totalFileSize / 1024 / 1024 * 100) / 100
    };
  };

  const metrics = getRestaurantMetrics();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fbfaf5 0%, #f8f7f2 50%, #e9ecf1 100%)' }}>
      {/* Header professionnel */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-cream/90 border-b border-navy-100 shadow-sm" style={{ backgroundColor: 'rgba(251, 250, 245, 0.9)', borderColor: '#c9d0db' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo et branding */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #1f2d3d 0%, #22354a 100%)', boxShadow: '0 10px 15px -3px rgba(31, 45, 61, 0.25)' }}>
                  <span className="text-cream font-bold text-xl lg:text-2xl" style={{ color: '#fbfaf5' }}>C</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl lg:text-3xl font-serif text-navy" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: '#1f2d3d' }}>
                  Cobi
                </h1>
                <p className="text-base font-medium" style={{ color: '#1f2d3d' }}>Dashboard 3D</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link 
                href="/insights" 
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium hover:bg-navy-50"
                style={{ color: '#1f2d3d' }}
              >
                <span>📊</span>
                <span>Analytics</span>
              </Link>
              <Link 
                href="/admin" 
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium hover:bg-navy-50"
                style={{ color: '#1f2d3d' }}
              >
                <span>⚙️</span>
                <span>Administration</span>
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Link 
                href="/auth/login" 
                className="hidden sm:flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium hover:bg-navy-50"
                style={{ color: '#1f2d3d', backgroundColor: '#e9ecf1' }}
              >
                <span>🚪</span>
                <span>Déconnexion</span>
              </Link>
              <Link 
                href="/upload" 
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #1f2d3d 0%, #22354a 100%)', 
                  color: '#fbfaf5',
                  boxShadow: '0 10px 15px -3px rgba(31, 45, 61, 0.25)'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Ajouter</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="space-y-12">
          {/* Hero Section - Menu Client */}
          <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12 shadow-2xl" style={{ 
            background: 'linear-gradient(135deg, #1f2d3d 0%, #22354a 50%, #162234 100%)',
            boxShadow: '0 25px 50px -12px rgba(31, 45, 61, 0.25)'
          }}>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbfaf5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            
            <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div style={{ color: '#fbfaf5' }}>
                <div className="inline-flex items-center space-x-2 rounded-full px-4 py-2 mb-6" style={{ backgroundColor: 'rgba(251, 250, 245, 0.15)', backdropFilter: 'blur(10px)' }}>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium">Menu 3D Actif</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6 leading-tight font-bold" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: '#fbfaf5' }}>
                  🍽️ Menu Client 3D
                </h2>
                
                <p className="text-xl lg:text-2xl mb-8 leading-relaxed font-medium" style={{ color: '#fbfaf5' }}>
                  Sans appli, sans surprise : vos clients scannent un QR code pour découvrir vos plats en 3D et commander en toute confiance.
                </p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <Link
                    href="/menu/test"
                    target="_blank"
                    className="inline-flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl group"
                    style={{ backgroundColor: '#fbfaf5', color: '#1f2d3d' }}
                  >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Voir le menu démo</span>
                  </Link>
                  
                  <div className="flex items-center space-x-4" style={{ color: '#fbfaf5' }}>
                    <div className="flex items-center space-x-2">
                      <span>📱</span>
                      <span className="text-base font-semibold">Mobile</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>🎯</span>
                      <span className="text-base font-semibold">Analytics</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl" style={{ backgroundColor: 'rgba(251, 250, 245, 0.15)', backdropFilter: 'blur(10px)' }}>
                    <div className="text-center">
                      <div className="text-5xl mb-3">📱</div>
                      <div className="font-semibold" style={{ color: '#fbfaf5' }}>QR Code</div>
                      <div className="text-sm" style={{ color: '#c9d0db' }}>Scan & View</div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Métriques - Design moderne avec alignement parfait */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Plats à la carte */}
            <div className="rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #1f2d3d 0%, #22354a 100%)',
                  boxShadow: '0 10px 15px -3px rgba(31, 45, 61, 0.25)'
                }}>
                  <svg className="w-8 h-8 lg:w-10 lg:h-10" style={{ color: '#fbfaf5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold mb-1" style={{ color: '#1f2d3d' }}>{metrics.totalDishes}</p>
                  <p className="text-base lg:text-lg font-semibold" style={{ color: '#1f2d3d' }}>Plats à la carte</p>
                </div>
              </div>
            </div>

            {/* Vues menu 3D */}
            <div className="rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.25)'
                }}>
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold mb-1" style={{ color: '#1f2d3d' }}>
                    {metrics.totalViews.toLocaleString()}
                  </p>
                  <p className="text-base lg:text-lg font-semibold" style={{ color: '#1f2d3d' }}>Vues menu 3D</p>
                </div>
              </div>
            </div>

            {/* Temps de chargement */}
            <div className="rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`} style={{
                  background: metrics.avgLoadTime > 1000 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : metrics.avgLoadTime > 500 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: metrics.avgLoadTime > 1000 
                    ? '0 10px 15px -3px rgba(239, 68, 68, 0.25)'
                    : metrics.avgLoadTime > 500 
                    ? '0 10px 15px -3px rgba(245, 158, 11, 0.25)'
                    : '0 10px 15px -3px rgba(16, 185, 129, 0.25)'
                }}>
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-3xl lg:text-4xl font-bold mb-1`} style={{
                    color: metrics.avgLoadTime > 1000 ? '#dc2626' : metrics.avgLoadTime > 500 ? '#d97706' : '#059669'
                  }}>
                    {metrics.avgLoadTime}ms
                  </p>
                  <p className="text-base lg:text-lg font-semibold" style={{ color: '#1f2d3d' }}>Temps chargement</p>
                </div>
              </div>
            </div>

            {/* Données stockées */}
            <div className="rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.25)'
                }}>
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold mb-1" style={{ color: '#1f2d3d' }}>
                    {metrics.totalStorage}
                  </p>
                  <p className="text-base lg:text-lg font-semibold" style={{ color: '#1f2d3d' }}>Mo stockées</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Galerie */}
          <div className="space-y-8">
            {/* Filter Bar */}
            {!isLoading && models.length > 0 && (
              <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
                <FilterBar
                  onFilterChange={handleFilterChange}
                  totalItems={models.length}
                  filteredItems={filteredModels.length}
                />
              </div>
            )}

            {/* Sort Controls */}
            {!isLoading && models.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
                <div className="text-lg font-semibold" style={{ color: '#1f2d3d' }}>
                  {filteredModels.length > 0 ? (
                    <>Affichage de <span className="font-bold" style={{ color: '#1f2d3d' }}>{filteredModels.length}</span> modèle{filteredModels.length > 1 ? 's' : ''} sur <span className="font-bold">{models.length}</span></>
                  ) : (
                    <>Aucun modèle ne correspond aux critères de recherche</>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold" style={{ color: '#1f2d3d' }}>Trier par:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as 'name' | 'date' | 'category')}
                    className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 font-semibold text-base"
                    style={{ 
                      backgroundColor: '#f8f7f2', 
                      borderColor: '#c9d0db',
                      color: '#1f2d3d'
                    }}
                  >
                    <option value="name">Nom</option>
                    <option value="date">Date d'ajout</option>
                    <option value="category">Catégorie</option>
                  </select>
                </div>
              </div>
            )}

            {/* Gallery Grid */}
            <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <GalleryGrid
                models={filteredModels}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>

          {/* Section Features */}
          {!isLoading && models.length > 0 && (
            <section className="rounded-3xl p-8 lg:p-12 border" style={{ 
              background: 'linear-gradient(135deg, #fbfaf5 0%, #f8f7f2 50%, #e9ecf1 100%)',
              borderColor: '#c9d0db'
            }}>
                              <div className="text-center mb-12">
                  <h2 className="text-3xl lg:text-4xl font-serif mb-4" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: '#1f2d3d' }}>
                    Fonctionnalités principales
                  </h2>
                  <p className="text-xl lg:text-2xl max-w-2xl mx-auto font-medium" style={{ color: '#1f2d3d' }}>
                    Découvrez tous les outils pour gérer et présenter vos modèles 3D
                  </p>
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                <div className="text-center group">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-105 transition-transform" style={{ 
                    background: 'linear-gradient(135deg, #1f2d3d 0%, #22354a 100%)',
                    boxShadow: '0 10px 15px -3px rgba(31, 45, 61, 0.25)'
                  }}>
                    <svg className="w-10 h-10 lg:w-12 lg:h-12" style={{ color: '#fbfaf5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#1f2d3d' }}>Visualisation 3D</h3>
                  <p className="text-lg leading-relaxed font-medium" style={{ color: '#1f2d3d' }}>
                    Explorez vos modèles avec des contrôles de caméra intuitifs et une rotation automatique
                  </p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-105 transition-transform" style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.25)'
                  }}>
                    <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#1f2d3d' }}>Réalité Augmentée</h3>
                  <p className="text-lg leading-relaxed font-medium" style={{ color: '#1f2d3d' }}>
                    Visualisez vos modèles en AR directement sur mobile avec WebXR et Quick Look iOS
                  </p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-105 transition-transform" style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.25)'
                  }}>
                    <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#1f2d3d' }}>Upload Facile</h3>
                  <p className="text-lg leading-relaxed font-medium" style={{ color: '#1f2d3d' }}>
                    Glissez-déposez vos fichiers USDZ, GLB ou GLTF pour les ajouter instantanément
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer moderne */}
      <footer className="border-t" style={{ borderColor: '#c9d0db', backgroundColor: 'rgba(251, 250, 245, 0.8)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ 
                background: 'linear-gradient(135deg, #1f2d3d 0%, #22354a 100%)',
                boxShadow: '0 10px 15px -3px rgba(31, 45, 61, 0.25)'
              }}>
                <span className="font-bold text-lg" style={{ color: '#fbfaf5' }}>C</span>
              </div>
              <span className="text-2xl font-serif font-bold" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: '#1f2d3d' }}>Cobi</span>
            </div>
            <p className="text-base font-medium" style={{ color: '#1f2d3d' }}>
              Plateforme de gestion 3D pour restaurants • © 2024 Cobi
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
