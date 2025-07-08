'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface GlobalSettings {
  siteName: string;
  siteDescription: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  maxFileSize: number; // en MB
  allowedFormats: string[];
  maintenanceMode: boolean;
  analyticsEnabled: boolean;
  debugMode: boolean;
  autoThumbnails: boolean;
  emailNotifications: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings>({
    siteName: 'COBI',
    siteDescription: 'Plateforme de gestion et visualisation de modèles 3D pour restaurants',
    defaultCurrency: 'EUR',
    defaultTaxRate: 20,
    maxFileSize: 50,
    allowedFormats: ['glb', 'usdz', 'gltf'],
    maintenanceMode: false,
    analyticsEnabled: true,
    debugMode: false,
    autoThumbnails: true,
    emailNotifications: true,
    backupFrequency: 'daily'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Appel API pour sauvegarder les paramètres
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      setSaveMessage('Paramètres sauvegardés avec succès !');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Erreur lors de la sauvegarde');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              href="/admin/dashboard" 
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres globaux</h1>
              <p className="text-gray-600 mt-1">Configuration générale de l'application</p>
            </div>
          </div>

          {/* Message de sauvegarde */}
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                saveMessage.includes('succès') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {saveMessage}
            </motion.div>
          )}
        </div>

        <div className="space-y-8">
          {/* Informations générales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations générales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du site
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise par défaut
                </label>
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => updateSetting('defaultCurrency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du site
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => updateSetting('siteDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux de TVA par défaut (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.defaultTaxRate}
                  onChange={(e) => updateSetting('defaultTaxRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Paramètres de fichiers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestion des fichiers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille maximale des fichiers (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={settings.maxFileSize}
                  onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value) || 50)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence de sauvegarde
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => updateSetting('backupFrequency', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuelle</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formats autorisés
                </label>
                <div className="flex flex-wrap gap-3">
                  {['glb', 'usdz', 'gltf', 'obj', 'fbx'].map((format) => (
                    <label key={format} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.allowedFormats.includes(format)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateSetting('allowedFormats', [...settings.allowedFormats, format]);
                          } else {
                            updateSetting('allowedFormats', settings.allowedFormats.filter(f => f !== format));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">.{format}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fonctionnalités */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Fonctionnalités</h2>
            
            <div className="space-y-4">
              {[
                { key: 'analyticsEnabled', label: 'Analytics activés', description: 'Collecte des données d\'utilisation' },
                { key: 'autoThumbnails', label: 'Miniatures automatiques', description: 'Génération automatique des thumbnails' },
                { key: 'emailNotifications', label: 'Notifications email', description: 'Envoi d\'emails pour les événements importants' },
                { key: 'debugMode', label: 'Mode debug', description: 'Affichage des logs détaillés (développement uniquement)' }
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{feature.label}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                  <button
                    onClick={() => updateSetting(feature.key as keyof GlobalSettings, !settings[feature.key as keyof GlobalSettings] as any)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings[feature.key as keyof GlobalSettings] ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings[feature.key as keyof GlobalSettings] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mode maintenance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Mode maintenance</h2>
            
            <div className="flex items-center justify-between p-4 border-2 border-dashed border-red-200 rounded-lg bg-red-50">
              <div>
                <h3 className="font-medium text-red-900">Mode maintenance</h3>
                <p className="text-sm text-red-700">
                  Active le mode maintenance pour tous les utilisateurs
                </p>
              </div>
              <button
                onClick={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-between pt-6">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Retour à l'administration
            </Link>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setSettings({
                  siteName: 'COBI',
                  siteDescription: 'Plateforme de gestion et visualisation de modèles 3D pour restaurants',
                  defaultCurrency: 'EUR',
                  defaultTaxRate: 20,
                  maxFileSize: 50,
                  allowedFormats: ['glb', 'usdz', 'gltf'],
                  maintenanceMode: false,
                  analyticsEnabled: true,
                  debugMode: false,
                  autoThumbnails: true,
                  emailNotifications: true,
                  backupFrequency: 'daily'
                })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg font-medium"
              >
                Réinitialiser
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSaving && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 