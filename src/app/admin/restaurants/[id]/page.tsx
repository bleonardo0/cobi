'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  rating: number;
  logoUrl?: string;
  shortDescription?: string;
  subscriptionStatus: 'active' | 'inactive' | 'pending';
  subscriptionPlan: 'basic' | 'premium';
  createdAt: string;
  modelsCount: number;
  totalViews: number;
  allergens?: string[];
}

interface Model3D {
  id: string;
  name: string;
  category?: string;
  fileSize: number;
  createdAt: string;
  publicUrl: string;
}

export default function RestaurantManagePage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [models, setModels] = useState<Model3D[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'models' | 'subscription' | 'analytics'>('info');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    address: '',
    shortDescription: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const { user } = useAuth();

  // Vérifier l'authentification admin
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/restaurant/dashboard');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchRestaurantData();
    }
  }, [user, restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les vraies données du restaurant depuis l'API
      let restaurantData = {
        name: restaurantId === 'bella-vita-uuid' ? 'Bella Vita' : 'Restaurant Exemple',
        slug: restaurantId === 'bella-vita-uuid' ? 'bella-vita' : 'restaurant-exemple',
        address: '123 Rue de la Paix, 75001 Paris',
        shortDescription: 'Restaurant italien authentique avec une cuisine traditionnelle'
      };
      
      let realTotalViews = 15420;
      
      try {
        // Récupérer les données du restaurant
        const restaurantResponse = await fetch(`/api/admin/restaurants/${restaurantId}`);
        const restaurantResult = await restaurantResponse.json();
        if (restaurantResult.success && restaurantResult.restaurant) {
          restaurantData = {
            name: restaurantResult.restaurant.name || restaurantData.name,
            slug: restaurantResult.restaurant.slug || restaurantData.slug,
            address: restaurantResult.restaurant.address || restaurantData.address,
            shortDescription: restaurantResult.restaurant.shortDescription || restaurantData.shortDescription
          };
          console.log('🔍 Vraies données restaurant récupérées:', restaurantData);
        }
        
        // Récupérer les analytics si c'est Bella Vita
        if (restaurantId === 'bella-vita-uuid') {
          const analyticsResponse = await fetch('/api/analytics/stats?restaurantId=restaurant-bella-vita-1');
          const analyticsResult = await analyticsResponse.json();
          if (analyticsResult.success) {
            realTotalViews = analyticsResult.data.general.totalViews;
            console.log('🔍 Vraies données analytics récupérées:', realTotalViews);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
      
      // Récupérer les vrais modèles depuis l'API
      let realModels: Model3D[] = [];
      try {
        const modelsResponse = await fetch('/api/models');
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json();
          if (modelsData.models && Array.isArray(modelsData.models)) {
            realModels = modelsData.models.map((model: any) => ({
              id: model.id,
              name: model.name,
              category: model.category,
              fileSize: model.fileSize || 0,
              createdAt: model.createdAt,
              publicUrl: model.publicUrl
            }));
            console.log('🔍 Vrais modèles récupérés:', realModels.length, 'modèles');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des modèles:', error);
      }

      const mockRestaurant: Restaurant = {
        id: restaurantId,
        name: restaurantData.name,
        slug: restaurantData.slug,
        address: restaurantData.address,
        rating: 4.8,
        logoUrl: '/logos/bella-vita.png',
        shortDescription: restaurantData.shortDescription,
        subscriptionStatus: 'active',
        subscriptionPlan: 'premium',
        createdAt: '2024-01-15T10:00:00Z',
        modelsCount: realModels.length, // Utiliser le nombre réel de modèles
        totalViews: realTotalViews,
        allergens: ['gluten', 'lactose']
      };

      setRestaurant(mockRestaurant);
      setModels(realModels);
      
      // Initialiser le formulaire avec les données du restaurant
      setFormData({
        name: mockRestaurant.name,
        slug: mockRestaurant.slug,
        address: mockRestaurant.address,
        shortDescription: mockRestaurant.shortDescription || ''
      });
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive' | 'pending') => {
    if (!restaurant) return;
    
    // TODO: Appel API pour changer le statut
    setRestaurant({
      ...restaurant,
      subscriptionStatus: newStatus
    });
    
    alert(`Statut changé vers: ${newStatus}`);
  };

  const handlePlanChange = async (newPlan: 'basic' | 'premium') => {
    if (!restaurant) return;
    
    // TODO: Appel API pour changer le plan
    setRestaurant({
      ...restaurant,
      subscriptionPlan: newPlan
    });
    
    alert(`Plan changé vers: ${newPlan}`);
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) return;
    
    // TODO: Appel API pour supprimer le modèle
    setModels(models.filter(m => m.id !== modelId));
    alert('Modèle supprimé');
  };

  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      // Mettre à jour l'état local avec les données de réponse
      setRestaurant({
        ...restaurant,
        name: formData.name,
        slug: formData.slug,
        address: formData.address,
        shortDescription: formData.shortDescription
      });

      // Notification de succès avec plus de détails
      alert(`✅ ${data.message || 'Modifications sauvegardées avec succès !'}\n\n` +
            `Nom: ${formData.name}\n` +
            `Slug: ${formData.slug}\n` +
            `Adresse: ${formData.address}`);
            
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`❌ Erreur lors de la sauvegarde:\n${errorMessage}\n\nVeuillez vérifier vos données et réessayer.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction pour remettre à zéro les analytics du restaurant
  const handleResetAnalytics = async () => {
    if (!restaurant) return;
    
    const confirmed = window.confirm(
      `⚠️ Êtes-vous sûr de vouloir remettre à zéro les analytics de "${restaurant.name}" ?\n\n` +
      `Cette action va :\n` +
      `• Supprimer toutes les vues existantes\n` +
      `• Supprimer toutes les sessions\n` +
      `• Remettre les compteurs à ZÉRO (0 vues)\n\n` +
      `Les nouvelles visites du menu seront comptabilisées à partir de zéro.\n\n` +
      `Cette action est IRRÉVERSIBLE !`
    );
    
    if (!confirmed) return;

    try {
      setResetLoading(true);
      
      // Mapper l'ID du restaurant vers l'ID analytics
      const restaurantIdMapping: Record<string, string> = {
        'bella-vita-uuid': 'restaurant-bella-vita-1',
        'le-gourmet-uuid': 'restaurant-test-123',
        'sushi-zen-uuid': 'restaurant-sushi-zen-1'
      };
      
      const analyticsRestaurantId = restaurantIdMapping[restaurant.id] || restaurant.id;
      
      const response = await fetch('/api/admin/analytics/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: analyticsRestaurantId,
          resetToZero: true // Vraiment remettre à zéro (0 vues)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const shouldViewAnalytics = window.confirm(
          `✅ Analytics remis à zéro pour "${restaurant.name}" !\n\n` +
          `• ${data.data.viewsRemoved} vues supprimées\n` +
          `• ${data.data.sessionsRemoved} sessions supprimées\n` +
          `• Les analytics sont maintenant à 0 vues\n` +
          `• Les nouvelles visites du menu seront comptabilisées\n\n` +
          `Voulez-vous voir la page Analytics pour vérifier ?`
        );
        
        if (shouldViewAnalytics) {
          // Utiliser le slug du restaurant
          window.open(`/insights?restaurant=${restaurant.slug}`, '_blank');
        }
      } else {
        throw new Error(data.error || 'Erreur lors du reset');
      }
    } catch (error) {
      console.error('Erreur lors du reset des analytics:', error);
      alert(
        `❌ Erreur lors du reset des analytics de "${restaurant.name}"\n\n` +
        `${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    } finally {
      setResetLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'text-purple-600 bg-purple-100';
      case 'basic': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbfaf5 0%, #f8f7f2 50%, #e9ecf1 100%)' }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg animate-pulse" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
            <span className="text-white font-bold text-2xl">👑</span>
          </div>
          <h1 className="text-2xl font-serif mb-2" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: '#1f2d3d' }}>
            Chargement...
          </h1>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbfaf5 0%, #f8f7f2 50%, #e9ecf1 100%)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Restaurant non trouvé</h1>
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
            ← Retour au dashboard admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fbfaf5 0%, #f8f7f2 50%, #e9ecf1 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-cream/90 border-b border-navy-100 shadow-sm" style={{ backgroundColor: 'rgba(251, 250, 245, 0.9)', borderColor: '#c9d0db' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour</span>
              </Link>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
                <span className="text-white font-bold text-xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: '#1f2d3d' }}>
                  {restaurant.name}
                </h1>
                <p className="text-sm" style={{ color: '#6b7280' }}>Gestion du restaurant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href={`/menu/${restaurant.slug}`}
                target="_blank"
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md"
                style={{ backgroundColor: '#1f2d3d', color: '#fbfaf5' }}
              >
                Voir Menu Client
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informations générales */}
        <div className="rounded-2xl p-6 shadow-lg border mb-8" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#1f2d3d' }}>Informations</h3>
              <p className="text-sm mb-1" style={{ color: '#6b7280' }}>Adresse: {restaurant.address}</p>
              <p className="text-sm mb-1" style={{ color: '#6b7280' }}>Note: {restaurant.rating} ⭐</p>
              <p className="text-sm" style={{ color: '#6b7280' }}>Créé le: {new Date(restaurant.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#1f2d3d' }}>Statistiques</h3>
              <p className="text-sm mb-1" style={{ color: '#6b7280' }}>Modèles: {restaurant.modelsCount}</p>
              <p className="text-sm mb-1" style={{ color: '#6b7280' }}>Vues totales: {restaurant.totalViews.toLocaleString()}</p>
              <p className="text-sm" style={{ color: '#6b7280' }}>Slug: /{restaurant.slug}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#1f2d3d' }}>Abonnement</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm mr-2" style={{ color: '#6b7280' }}>Statut:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(restaurant.subscriptionStatus)}`}>
                    {restaurant.subscriptionStatus}
                  </span>
                </div>
                <div>
                  <span className="text-sm mr-2" style={{ color: '#6b7280' }}>Plan:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPlanColor(restaurant.subscriptionPlan)}`}>
                    {restaurant.subscriptionPlan}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-8">
          <div className="flex space-x-1 rounded-xl p-1" style={{ backgroundColor: '#e9ecf1' }}>
            {[
              { id: 'info', label: 'Informations', icon: '📝' },
              { id: 'models', label: 'Modèles 3D', icon: '📦' },
              { id: 'subscription', label: 'Abonnement', icon: '💳' },
              { id: 'analytics', label: 'Analytics', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'text-white shadow-lg' 
                    : 'hover:bg-white/50'
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? '#1f2d3d' : 'transparent',
                  color: activeTab === tab.id ? '#fbfaf5' : '#1f2d3d'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
          {activeTab === 'info' && (
            <form onSubmit={handleSaveRestaurant} className="space-y-6">
              <h3 className="text-2xl font-bold" style={{ color: '#1f2d3d' }}>Modifier les informations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1f2d3d' }}>Nom du restaurant</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: '#f8f7f2', borderColor: '#c9d0db', color: '#1f2d3d' }}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1f2d3d' }}>Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: '#f8f7f2', borderColor: '#c9d0db', color: '#1f2d3d' }}
                    required
                    pattern="[a-z0-9-]+"
                    title="Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1f2d3d' }}>Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: '#f8f7f2', borderColor: '#c9d0db', color: '#1f2d3d' }}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1f2d3d' }}>Description courte</label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: '#f8f7f2', borderColor: '#c9d0db', color: '#1f2d3d' }}
                    maxLength={150}
                  />
                  <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                    {formData.shortDescription.length}/150 caractères
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2" 
                  style={{ backgroundColor: '#1f2d3d', color: '#fbfaf5' }}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Sauvegarder les modifications</span>
                    </>
                  )}
                </button>
                
                <button 
                  type="button"
                  onClick={() => {
                    if (restaurant) {
                      setFormData({
                        name: restaurant.name,
                        slug: restaurant.slug,
                        address: restaurant.address,
                        shortDescription: restaurant.shortDescription || ''
                      });
                    }
                  }}
                  className="px-4 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                  style={{ backgroundColor: '#e9ecf1', color: '#1f2d3d' }}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {activeTab === 'models' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold" style={{ color: '#1f2d3d' }}>Modèles 3D ({models.length})</h3>
                <button className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-md" style={{ backgroundColor: '#10b981', color: 'white' }}>
                  + Ajouter un modèle
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model) => (
                  <div key={model.id} className="border rounded-xl p-4" style={{ backgroundColor: '#f8f7f2', borderColor: '#c9d0db' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold" style={{ color: '#1f2d3d' }}>{model.name}</h4>
                        <p className="text-sm" style={{ color: '#6b7280' }}>Catégorie: {model.category || 'Non définie'}</p>
                      </div>
                      <span className="text-2xl">📦</span>
                    </div>
                    
                    <div className="space-y-1 mb-4">
                      <p className="text-xs" style={{ color: '#6b7280' }}>
                        Taille: {(model.fileSize / 1024 / 1024).toFixed(1)} MB
                      </p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>
                        Créé: {new Date(model.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => window.open(model.publicUrl, '_blank')}
                        className="flex-1 px-3 py-2 text-center rounded-lg text-xs font-semibold transition-all duration-200 hover:shadow-md"
                        style={{ backgroundColor: '#1f2d3d', color: '#fbfaf5' }}
                      >
                        Voir
                      </button>
                      <button 
                        onClick={() => handleDeleteModel(model.id)}
                        className="px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:shadow-md"
                        style={{ backgroundColor: '#f97316', color: 'white' }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold" style={{ color: '#1f2d3d' }}>Gestion de l'abonnement</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: '#1f2d3d' }}>Statut de l'abonnement</label>
                  <div className="space-y-2">
                    {['active', 'inactive', 'pending'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status as any)}
                        className={`w-full px-4 py-3 rounded-xl border-2 text-left font-medium transition-all ${
                          restaurant.subscriptionStatus === status
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ color: '#1f2d3d' }}
                      >
                        <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
                          status === 'active' ? 'bg-green-500' :
                          status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></span>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {restaurant.subscriptionStatus === status && (
                          <span className="float-right text-blue-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: '#1f2d3d' }}>Plan d'abonnement</label>
                  <div className="space-y-2">
                    {['basic', 'premium'].map((plan) => (
                      <button
                        key={plan}
                        onClick={() => handlePlanChange(plan as any)}
                        className={`w-full px-4 py-3 rounded-xl border-2 text-left font-medium transition-all ${
                          restaurant.subscriptionPlan === plan
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ color: '#1f2d3d' }}
                      >
                        <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
                          plan === 'premium' ? 'bg-purple-500' : 'bg-blue-500'
                        }`}></span>
                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                        {restaurant.subscriptionPlan === plan && (
                          <span className="float-right text-purple-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold" style={{ color: '#1f2d3d' }}>Analytics du restaurant</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border" style={{ backgroundColor: '#f8f7f2', borderColor: '#c9d0db' }}>
                  <div className="text-center">
                    <div className="text-2xl mb-2">📦</div>
                    <div className="text-2xl font-bold" style={{ color: '#1f2d3d' }}>{restaurant.modelsCount}</div>
                    <div className="text-sm" style={{ color: '#6b7280' }}>Modèles</div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border" style={{ backgroundColor: '#f8f7f2', borderColor: '#c9d0db' }}>
                  <div className="text-center">
                    <div className="text-2xl mb-2">👁️</div>
                    <div className="text-2xl font-bold" style={{ color: '#1f2d3d' }}>{restaurant.totalViews.toLocaleString()}</div>
                    <div className="text-sm" style={{ color: '#6b7280' }}>Vues totales</div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border" style={{ backgroundColor: '#f8f7f2', borderColor: '#c9d0db' }}>
                  <div className="text-center">
                    <div className="text-2xl mb-2">⭐</div>
                    <div className="text-2xl font-bold" style={{ color: '#1f2d3d' }}>{restaurant.rating}</div>
                    <div className="text-sm" style={{ color: '#6b7280' }}>Note moyenne</div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border" style={{ backgroundColor: '#f8f7f2', borderColor: '#c9d0db' }}>
                  <div className="text-center">
                    <div className="text-2xl mb-2">📅</div>
                    <div className="text-2xl font-bold" style={{ color: '#1f2d3d' }}>
                      {Math.floor((new Date().getTime() - new Date(restaurant.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm" style={{ color: '#6b7280' }}>Jours actifs</div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-xl border" style={{ backgroundColor: '#f8f7f2', borderColor: '#c9d0db' }}>
                <h4 className="text-lg font-semibold mb-4" style={{ color: '#1f2d3d' }}>Actions rapides</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-4 rounded-lg text-left hover:shadow-md transition-all" style={{ backgroundColor: '#10b981', color: 'white' }}>
                    <div className="text-xl mb-2">📊</div>
                    <div className="font-semibold">Export Analytics</div>
                    <div className="text-sm opacity-90">Télécharger les données</div>
                  </button>
                  
                  <button 
                    onClick={handleResetAnalytics}
                    disabled={resetLoading}
                    className="p-4 rounded-lg text-left hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                    style={{ backgroundColor: '#f97316', color: 'white' }}
                  >
                    <div className="text-xl mb-2">
                      {resetLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        '🗑️'
                      )}
                    </div>
                    <div className="font-semibold">
                      {resetLoading ? 'Reset en cours...' : 'Reset Analytics'}
                    </div>
                    <div className="text-sm opacity-90">
                      {resetLoading ? 'Patientez...' : 'Remettre à zéro'}
                    </div>
                  </button>
                  
                  <button className="p-4 rounded-lg text-left hover:shadow-md transition-all" style={{ backgroundColor: '#8b5cf6', color: 'white' }}>
                    <div className="text-xl mb-2">📧</div>
                    <div className="font-semibold">Rapport Mensuel</div>
                    <div className="text-sm opacity-90">Envoyer par email</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 