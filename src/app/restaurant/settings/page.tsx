'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/ClerkAuthProvider';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/shared/DashboardLayout';
import StatsCard from '@/components/shared/StatsCard';
import { UserButton } from '@clerk/nextjs';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  short_description: string;
  logo_url: string;
  ambiance_image_url?: string;
  primary_color: string;
  secondary_color: string;
  rating: number;
  allergens: string[];
  subscription_status: string;
  subscription_plan: string;
  is_active: boolean;
  owner_contact: string;
  owner_contact_method: string;
  owner_name: string;
  created_at: string;
  updated_at: string;
}

interface OpeningHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const defaultOpeningHours: OpeningHours[] = [
  { day: 'Lundi', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Mardi', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Mercredi', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Jeudi', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Vendredi', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Samedi', isOpen: true, openTime: '10:00', closeTime: '17:00' },
  { day: 'Dimanche', isOpen: false, openTime: '10:00', closeTime: '17:00' },
];

export default function RestaurantSettingsPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>(defaultOpeningHours);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/sign-in');
      return;
    }
    loadRestaurantData();
  }, [user, router, authLoading]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const loadRestaurantData = async () => {
    try {
      setIsLoading(true);
      
      const { data: restaurantData, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', user?.restaurantId)
        .single();

      if (error) throw error;
      setRestaurant(restaurantData);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!restaurant) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: restaurant.name,
          slug: restaurant.slug,
          address: restaurant.address,
          phone: restaurant.phone,
          email: restaurant.email,
          website: restaurant.website,
          description: restaurant.description,
          short_description: restaurant.short_description,
          primary_color: restaurant.primary_color,
          secondary_color: restaurant.secondary_color,
          logo_url: restaurant.logo_url,
          ambiance_image_url: restaurant.ambiance_image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurant.id);

      if (error) throw error;
      
      showToast('Modifications enregistrées', 'success');
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !restaurant) return;

    if (!file.type.startsWith('image/')) {
      showToast('Veuillez sélectionner une image', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('L\'image ne doit pas dépasser 5MB', 'error');
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('restaurantId', restaurant.id);

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      await loadRestaurantData();
      showToast('Logo uploadé avec succès', 'success');
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showToast(`Erreur lors de l'upload du logo: ${errorMessage}`, 'error');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleAmbianceImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !restaurant) return;

    if (!file.type.startsWith('image/')) {
      showToast('Veuillez sélectionner une image', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('L\'image ne doit pas dépasser 10MB', 'error');
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('restaurantId', restaurant.id);
      formData.append('type', 'ambiance');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      if (data.url) {
        setRestaurant(prev => prev ? { ...prev, ambiance_image_url: data.url } : null);
        showToast('Image d\'ambiance uploadée avec succès', 'success');
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showToast(`Erreur lors de l'upload de l'image: ${errorMessage}`, 'error');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const exportStatistics = async () => {
    if (!restaurant) return;

    try {
      setIsExporting(true);
      
      const response = await fetch(`/api/analytics/stats?restaurantId=${restaurant.id}&format=csv`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `statistiques-${restaurant.slug}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast('Statistiques exportées avec succès', 'success');
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showToast('Erreur lors de l\'export des statistiques', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showToast('Erreur lors de la suppression du compte', 'error');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="restaurateur">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <DashboardLayout userRole="restaurateur">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-2 text-red-600">
            <span className="text-xl">⚠️</span>
            <span>Impossible de charger les données du restaurant</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      userRole="restaurateur"
      restaurantName={restaurant.name}
      restaurantSlug={restaurant.slug}
      showFloatingButton={false}
    >
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-lg shadow-lg border animate-in slide-in-from-right ${
              toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
              toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Paramètres</h1>
            <p className="text-neutral-600">Gérez les paramètres de votre restaurant</p>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Statut"
            value={restaurant.is_active ? 'Actif' : 'Inactif'}
            icon={<span>{restaurant.is_active ? '✅' : '❌'}</span>}
          />
          <StatsCard
            title="Plan"
            value={restaurant.subscription_plan || 'Gratuit'}
            icon={<span>💳</span>}
          />
          <StatsCard
            title="Note"
            value={restaurant.rating ? `${restaurant.rating}/5` : 'N/A'}
            icon={<span>⭐</span>}
          />
          <StatsCard
            title="Allergènes"
            value={restaurant.allergens?.length || 0}
            icon={<span>🚫</span>}
          />
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="border-b border-neutral-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                  activeTab === 'general'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                🏢 Général
              </button>
              <button
                onClick={() => setActiveTab('customization')}
                className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                  activeTab === 'customization'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                🎨 Design
              </button>
              <button
                onClick={() => setActiveTab('hours')}
                className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                  activeTab === 'hours'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                🕒 Horaires
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                  activeTab === 'account'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                👤 Compte
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Informations générales</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Nom du restaurant
                        </label>
                        <input
                          type="text"
                          value={restaurant.name || ''}
                          onChange={(e) => setRestaurant({...restaurant, name: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Slug (URL)
                        </label>
                        <input
                          type="text"
                          value={restaurant.slug || ''}
                          onChange={(e) => setRestaurant({...restaurant, slug: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                          pattern="[a-z0-9-]+"
                          title="Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Adresse
                      </label>
                      <textarea
                        value={restaurant.address || ''}
                        onChange={(e) => setRestaurant({...restaurant, address: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="text"
                          value={restaurant.phone || ''}
                          onChange={(e) => setRestaurant({...restaurant, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={restaurant.email || ''}
                          onChange={(e) => setRestaurant({...restaurant, email: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Site web
                        </label>
                        <input
                          type="url"
                          value={restaurant.website || ''}
                          onChange={(e) => setRestaurant({...restaurant, website: e.target.value})}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={restaurant.description || ''}
                        onChange={(e) => setRestaurant({...restaurant, description: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'customization' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Personnalisation</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Couleur primaire
                        </label>
                        <input
                          type="color"
                          value={restaurant.primary_color || '#0ea5e9'}
                          onChange={(e) => setRestaurant({...restaurant, primary_color: e.target.value})}
                          className="w-full h-10 rounded-lg border border-neutral-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Couleur secondaire
                        </label>
                        <input
                          type="color"
                          value={restaurant.secondary_color || '#10b981'}
                          onChange={(e) => setRestaurant({...restaurant, secondary_color: e.target.value})}
                          className="w-full h-10 rounded-lg border border-neutral-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Logo du restaurant
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={isUploading}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className={`px-4 py-2 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 flex items-center gap-2 ${
                              isUploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <span>📁</span>
                            {isUploading ? 'Upload en cours...' : 'Choisir une image'}
                          </label>
                        </div>
                        {restaurant.logo_url && (
                          <div className="mt-2">
                            <img 
                              src={restaurant.logo_url} 
                              alt="Logo du restaurant" 
                              className="w-24 h-24 object-contain border rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Image d'ambiance (nouveau menu)
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAmbianceImageUpload}
                            disabled={isUploading}
                            className="hidden"
                            id="ambiance-upload"
                          />
                          <label
                            htmlFor="ambiance-upload"
                            className={`px-4 py-2 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 flex items-center gap-2 ${
                              isUploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <span>🖼️</span>
                            {isUploading ? 'Upload en cours...' : 'Choisir image d\'ambiance'}
                          </label>
                        </div>
                        {restaurant.ambiance_image_url && (
                          <div className="mt-2">
                            <img 
                              src={restaurant.ambiance_image_url} 
                              alt="Image d'ambiance du restaurant" 
                              className="w-full max-w-md h-32 object-cover border rounded-lg"
                            />
                          </div>
                        )}
                        <p className="text-xs text-neutral-500">
                          Cette image sera affichée en haut de votre nouveau menu moderne. Format recommandé : 1200x400px (ratio 3:1)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hours' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Heures d'ouverture</h3>
                  <div className="space-y-3">
                    {openingHours.map((day, index) => (
                      <div key={day.day} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-20 font-medium text-neutral-700">
                            {day.day}
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={day.isOpen}
                              onChange={(e) => {
                                const newHours = [...openingHours];
                                newHours[index].isOpen = e.target.checked;
                                setOpeningHours(newHours);
                              }}
                              className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                            />
                            <span className="text-sm">Ouvert</span>
                          </label>
                        </div>
                        {day.isOpen && (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={day.openTime}
                              onChange={(e) => {
                                const newHours = [...openingHours];
                                newHours[index].openTime = e.target.value;
                                setOpeningHours(newHours);
                              }}
                              className="px-2 py-1 border border-neutral-300 rounded text-sm"
                            />
                            <span className="text-neutral-500">-</span>
                            <input
                              type="time"
                              value={day.closeTime}
                              onChange={(e) => {
                                const newHours = [...openingHours];
                                newHours[index].closeTime = e.target.value;
                                setOpeningHours(newHours);
                              }}
                              className="px-2 py-1 border border-neutral-300 rounded text-sm"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Compte utilisateur</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Email actuel
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500"
                      />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Gestion du compte
                          </label>
                          <p className="text-sm text-neutral-600 mb-3">
                            Utilisez le menu de votre profil pour modifier votre mot de passe, email, ou autres paramètres de sécurité.
                          </p>
                        </div>
                        <div className="transform scale-125">
                          <UserButton 
                            appearance={{
                              elements: {
                                avatarBox: "w-10 h-10",
                                userButtonPopoverCard: "shadow-lg border border-gray-200",
                                userButtonPopoverActionButton: "hover:bg-gray-50"
                              }
                            }}
                            showName={false}
                            afterSignOutUrl="/sign-in"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-red-600 mb-2">Zone de danger</h4>
                      <p className="text-sm text-neutral-600 mb-4">
                        La suppression de votre compte est irréversible. Toutes vos données seront perdues.
                      </p>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <span>🗑️</span>
                        Supprimer mon compte
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export des statistiques */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">📊 Exporter mes statistiques</h3>
              <p className="text-sm text-neutral-600">
                Téléchargez vos données de performance au format CSV
              </p>
            </div>
            <button
              onClick={exportStatistics}
              disabled={isExporting}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
            >
              <span>📥</span>
              {isExporting ? 'Export en cours...' : 'Télécharger'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera toutes vos données.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouton de sauvegarde flottant */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="group relative inline-flex items-center justify-center gap-3 px-6 py-4 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden min-w-[200px] border-2 border-white/20 hover:border-white/40"
          style={{ 
            background: restaurant ? `linear-gradient(135deg, ${restaurant.primary_color}, ${restaurant.secondary_color})` : 'linear-gradient(135deg, #3b82f6, #10b981)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
          }}
        >
          <svg
            className="w-5 h-5 relative z-10 flex-shrink-0 text-white drop-shadow-sm"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          
          <span className="font-bold text-sm relative z-10 whitespace-nowrap text-white drop-shadow-sm">
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </span>
          
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
        </button>
      </div>
    </DashboardLayout>
  );
} 