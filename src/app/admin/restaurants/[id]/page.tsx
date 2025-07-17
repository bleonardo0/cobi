'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/providers/ClerkAuthProvider";
import DashboardLayout from "@/components/shared/DashboardLayout";

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
  ownerName?: string;
  ownerContact?: string;
  ownerContactMethod?: 'email' | 'phone' | 'both';
}

interface Model3D {
  id: string;
  name: string;
  slug: string;
  publicUrl: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
  tags?: string[];
  description?: string;
  ingredients?: string[];
  price?: number;
  shortDescription?: string;
  allergens?: string[];
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
    shortDescription: '',
    ownerName: '',
    ownerContact: '',
    ownerContactMethod: 'email' as 'email' | 'phone' | 'both'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { user } = useAuth();

  // Vérifier l'authentification admin
  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
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
      
      // Récupérer les données du restaurant
      const restaurantResponse = await fetch(`/api/admin/restaurants/${restaurantId}`);
      const restaurantResult = await restaurantResponse.json();
      
      if (!restaurantResult.success) {
        throw new Error(restaurantResult.error || 'Erreur lors de la récupération du restaurant');
      }

      const restaurantData = restaurantResult.restaurant;
      
      // Récupérer les modèles du restaurant
      const modelsResponse = await fetch(`/api/models?restaurantId=${restaurantId}`);
      const modelsResult = await modelsResponse.json();
      const realModels = modelsResult.success ? modelsResult.models : [];

      // Récupérer les analytics
      let realTotalViews = 0;
      try {
        const analyticsResponse = await fetch(`/api/analytics/stats?restaurantId=${restaurantId}`);
        const analyticsResult = await analyticsResponse.json();
        if (analyticsResult.success) {
          realTotalViews = analyticsResult.data.general.totalViews || 0;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des analytics:', error);
      }

      const mockRestaurant: Restaurant = {
        id: restaurantData.id,
        name: restaurantData.name,
        slug: restaurantData.slug,
        address: restaurantData.address,
        rating: restaurantData.rating || 4.8,
        logoUrl: restaurantData.logoUrl,
        shortDescription: restaurantData.shortDescription,
        subscriptionStatus: restaurantData.subscriptionStatus || 'active',
        subscriptionPlan: restaurantData.subscriptionPlan || 'premium',
        createdAt: restaurantData.createdAt,
        modelsCount: realModels.length,
        totalViews: realTotalViews,
        allergens: restaurantData.allergens || [],
        ownerName: restaurantData.ownerName,
        ownerContact: restaurantData.ownerContact,
        ownerContactMethod: restaurantData.ownerContactMethod
      };

      setRestaurant(mockRestaurant);
      setModels(realModels);
      
      // Initialiser le formulaire avec les données du restaurant
      setFormData({
        name: mockRestaurant.name,
        slug: mockRestaurant.slug,
        address: mockRestaurant.address,
        shortDescription: mockRestaurant.shortDescription || '',
        ownerName: mockRestaurant.ownerName || '',
        ownerContact: mockRestaurant.ownerContact || '',
        ownerContactMethod: mockRestaurant.ownerContactMethod || 'email'
      });
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    } finally {
      setIsLoading(false);
    }
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

      // Mettre à jour l'état local
      setRestaurant({
        ...restaurant,
        name: formData.name,
        slug: formData.slug,
        address: formData.address,
        shortDescription: formData.shortDescription,
        ownerName: formData.ownerName,
        ownerContact: formData.ownerContact,
        ownerContactMethod: formData.ownerContactMethod
      });

      alert('✅ Modifications sauvegardées avec succès !');
            
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`❌ Erreur lors de la sauvegarde: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!restaurant) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      alert('✅ Restaurant supprimé avec succès !');
      router.push('/admin/restaurants');
            
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`❌ Erreur lors de la suppression: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!restaurant) {
    return (
      <DashboardLayout userRole="admin">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Restaurant non trouvé</h1>
          <button
            onClick={() => router.push('/admin/restaurants')}
            className="text-blue-600 hover:underline"
          >
            ← Retour à la liste des restaurants
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {restaurant.name}
            </h1>
            <p className="text-gray-600">Gestion du restaurant</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/restaurants')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Retour
            </button>
            <a
              href={`/menu/${restaurant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Voir Menu Client
            </a>
          </div>
        </div>

        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Adresse:</strong> {restaurant.address}</p>
                <p><strong>Note:</strong> {restaurant.rating} ⭐</p>
                <p><strong>Créé le:</strong> {new Date(restaurant.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistiques</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Modèles:</strong> {restaurant.modelsCount}</p>
                <p><strong>Vues totales:</strong> {restaurant.totalViews.toLocaleString()}</p>
                <p><strong>Slug:</strong> /{restaurant.slug}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Abonnement</h3>
              <div className="space-y-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(restaurant.subscriptionStatus)}`}>
                  {restaurant.subscriptionStatus}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(restaurant.subscriptionPlan)}`}>
                  {restaurant.subscriptionPlan}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'info', label: '📝 Informations', icon: '📝' },
                { key: 'models', label: '🎨 Modèles 3D', icon: '🎨' },
                { key: 'subscription', label: '💳 Abonnement', icon: '💳' },
                { key: 'analytics', label: '📊 Analytics', icon: '📊' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Modifier les informations
                  </h3>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    🗑️ Supprimer le restaurant
                  </button>
                </div>
                
                <form onSubmit={handleSaveRestaurant} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du restaurant
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        pattern="[a-z0-9-]+"
                        title="Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description courte
                    </label>
                    <textarea
                      value={formData.shortDescription}
                      onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Description du restaurant..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du propriétaire/contact
                      </label>
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) => handleInputChange('ownerName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Jean Dupont"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact du propriétaire
                      </label>
                      <input
                        type="text"
                        value={formData.ownerContact}
                        onChange={(e) => handleInputChange('ownerContact', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="jean.dupont@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Méthode de contact préférée
                    </label>
                    <select
                      value={formData.ownerContactMethod}
                      onChange={(e) => handleInputChange('ownerContactMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Téléphone</option>
                      <option value="both">Email et téléphone</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        if (restaurant) {
                          setFormData({
                            name: restaurant.name,
                            slug: restaurant.slug,
                            address: restaurant.address,
                            shortDescription: restaurant.shortDescription || '',
                            ownerName: restaurant.ownerName || '',
                            ownerContact: restaurant.ownerContact || '',
                            ownerContactMethod: restaurant.ownerContactMethod || 'email'
                          });
                        }
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'models' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Modèles 3D ({models.length})
                </h3>
                {models.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Aucun modèle 3D trouvé pour ce restaurant
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {models.map((model) => (
                      <div key={model.id} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{model.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {model.filename} • {(model.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(model.publicUrl, '_blank')}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Voir
                          </button>
                          <button
                            onClick={() => router.push(`/models/${model.slug}/edit`)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Modifier
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subscription' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Gestion de l'abonnement
                </h3>
                <p className="text-gray-500">
                  Fonctionnalité à venir...
                </p>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Analytics
                </h3>
                <p className="text-gray-500">
                  Fonctionnalité à venir...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le restaurant <strong>{restaurant.name}</strong> ?
              <br/><br/>
              <span className="text-red-600 font-medium">
                Cette action supprimera définitivement :
              </span>
              <br/>
              • Le restaurant et ses informations<br/>
              • Tous les utilisateurs associés<br/>
              • Tous les modèles 3D et fichiers<br/>
              • Toutes les données d'analytics<br/>
              <br/>
              <span className="text-red-600 font-medium">
                Cette action est irréversible !
              </span>
            </p>
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteRestaurant}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 