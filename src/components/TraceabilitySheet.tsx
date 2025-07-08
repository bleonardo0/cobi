'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Model3D } from '@/types/model';

interface TraceabilitySheetProps {
  model: Model3D;
  isOpen: boolean;
  onClose: () => void;
}

export default function TraceabilitySheet({ model, isOpen, onClose }: TraceabilitySheetProps) {
  const [activeTab, setActiveTab] = useState<'origin' | 'transport' | 'carbon'>('origin');

  const getOriginFlag = (country?: string) => {
    const flags: Record<string, string> = {
      'france': '🇫🇷',
      'italie': '🇮🇹',
      'espagne': '🇪🇸',
      'portugal': '🇵🇹',
      'allemagne': '🇩🇪',
      'belgique': '🇧🇪',
      'pays-bas': '🇳🇱',
      'royaume-uni': '🇬🇧',
      'irlande': '🇮🇪',
      'norvege': '🇳🇴',
      'danemark': '🇩🇰',
      'suede': '🇸🇪',
      'finlande': '🇫🇮',
      'islande': '🇮🇸',
      'grece': '🇬🇷',
      'turquie': '🇹🇷',
      'maroc': '🇲🇦',
      'tunisie': '🇹🇳',
      'algerie': '🇩🇿',
      'senegal': '🇸🇳',
      'cote-ivoire': '🇨🇮',
      'madagascar': '🇲🇬',
      'maurice': '🇲🇺',
      'reunion': '🇷🇪',
      'nouvelle-caledonie': '🇳🇨',
      'polynesie': '🇵🇫',
      'bresil': '🇧🇷',
      'argentine': '🇦🇷',
      'chili': '🇨🇱',
      'perou': '🇵🇪',
      'equateur': '🇪🇨',
      'mexique': '🇲🇽',
      'canada': '🇨🇦',
      'etats-unis': '🇺🇸',
      'japon': '🇯🇵',
      'coree': '🇰🇷',
      'chine': '🇨🇳',
      'vietnam': '🇻🇳',
      'thailande': '🇹🇭',
      'inde': '🇮🇳',
      'australie': '🇦🇺',
      'nouvelle-zelande': '🇳🇿'
    };
    return flags[country?.toLowerCase() || ''] || '🌍';
  };

  const getCarbonLevel = (footprint?: number) => {
    if (!footprint) return { level: 'unknown', color: 'gray', label: 'Non renseigné' };
    
    if (footprint < 0.5) return { level: 'excellent', color: 'green', label: 'Excellent' };
    if (footprint < 1.0) return { level: 'good', color: 'lime', label: 'Bon' };
    if (footprint < 2.0) return { level: 'medium', color: 'yellow', label: 'Modéré' };
    if (footprint < 4.0) return { level: 'high', color: 'orange', label: 'Élevé' };
    return { level: 'very-high', color: 'red', label: 'Très élevé' };
  };

  const carbonInfo = getCarbonLevel(model.carbonFootprint);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={onClose}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Traçabilité - {model.name}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('origin')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'origin'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📍 Origine
              </button>
              <button
                onClick={() => setActiveTab('transport')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'transport'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🚛 Transport
              </button>
              <button
                onClick={() => setActiveTab('carbon')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'carbon'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🌱 Impact CO₂
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <AnimatePresence mode="wait">
                {activeTab === 'origin' && (
                  <motion.div
                    key="origin"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-3">
                        {getOriginFlag(model.originCountry)}
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {model.originCountry || 'Origine non renseignée'}
                      </h4>
                      <p className="text-gray-600">
                        Pays d'origine des ingrédients principaux
                      </p>
                    </div>
                    
                    {model.originCountry && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-2">Traçabilité garantie</h5>
                        <p className="text-sm text-green-700">
                          Nos fournisseurs sont sélectionnés pour leur qualité et leur transparence. 
                          Tous les ingrédients sont tracés depuis leur origine.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 'transport' && (
                  <motion.div
                    key="transport"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">🚛</div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {model.transportDistance ? `${model.transportDistance} km` : 'Distance non renseignée'}
                      </h4>
                      <p className="text-gray-600">
                        Distance moyenne de transport des ingrédients
                      </p>
                    </div>
                    
                    {model.transportDistance && (
                      <div className={`p-4 rounded-lg ${
                        model.transportDistance < 100 ? 'bg-green-50' :
                        model.transportDistance < 500 ? 'bg-yellow-50' :
                        'bg-orange-50'
                      }`}>
                        <h5 className={`font-medium mb-2 ${
                          model.transportDistance < 100 ? 'text-green-800' :
                          model.transportDistance < 500 ? 'text-yellow-800' :
                          'text-orange-800'
                        }`}>
                          {model.transportDistance < 100 ? 'Circuit court' :
                           model.transportDistance < 500 ? 'Circuit moyen' :
                           'Circuit long'}
                        </h5>
                        <p className={`text-sm ${
                          model.transportDistance < 100 ? 'text-green-700' :
                          model.transportDistance < 500 ? 'text-yellow-700' :
                          'text-orange-700'
                        }`}>
                          {model.transportDistance < 100 
                            ? 'Ingrédients principalement locaux, impact transport minimal.'
                            : model.transportDistance < 500
                            ? 'Ingrédients régionaux, impact transport modéré.'
                            : 'Ingrédients importés, impact transport plus important.'}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 'carbon' && (
                  <motion.div
                    key="carbon"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">🌱</div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {model.carbonFootprint ? `${model.carbonFootprint} kg CO₂` : 'Impact non calculé'}
                      </h4>
                      <p className="text-gray-600">
                        Empreinte carbone estimée par portion
                      </p>
                    </div>
                    
                    {model.carbonFootprint && (
                      <div className={`p-4 rounded-lg bg-${carbonInfo.color}-50`}>
                        <h5 className={`font-medium mb-2 text-${carbonInfo.color}-800`}>
                          Impact {carbonInfo.label}
                        </h5>
                        <p className={`text-sm text-${carbonInfo.color}-700`}>
                          {carbonInfo.level === 'excellent' && 'Excellent choix ! Très faible impact environnemental.'}
                          {carbonInfo.level === 'good' && 'Bon choix pour l\'environnement.'}
                          {carbonInfo.level === 'medium' && 'Impact modéré, dans la moyenne.'}
                          {carbonInfo.level === 'high' && 'Impact plus élevé, principalement dû aux ingrédients.'}
                          {carbonInfo.level === 'very-high' && 'Impact élevé, consommation occasionnelle recommandée.'}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-center text-xs text-gray-500">
                      <p>Calcul basé sur les méthodes ACV (Analyse du Cycle de Vie)</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 