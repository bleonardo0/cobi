'use client';

import { ConversionMetrics } from '@/types/analytics';

interface ConversionMetricsCardProps {
  metrics: ConversionMetrics[];
}

export default function ConversionMetricsCard({ metrics }: ConversionMetricsCardProps) {
  const topConverting = metrics.slice(0, 8);
  
  const getConversionColor = (rate: number) => {
    if (rate >= 15) return 'text-green-600 bg-green-50';
    if (rate >= 8) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConversionIcon = (rate: number) => {
    if (rate >= 15) {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (rate >= 8) {
      return (
        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Taux de Conversion</h3>
          <p className="text-sm text-slate-500 mt-1">Vue 3D → Commande POS</p>
        </div>
        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
          Données simulées
        </div>
      </div>

      {topConverting.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <p>Aucune donnée de conversion disponible</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topConverting.map((metric, index) => (
            <div key={metric.modelId} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-medium text-indigo-600">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">{metric.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                    <span>{metric.totalViews} vues</span>
                    <span>•</span>
                    <span>{metric.ordersCount} commandes</span>
                    {metric.revenueGenerated > 0 && (
                      <>
                        <span>•</span>
                        <span>{metric.revenueGenerated.toFixed(2)}€</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getConversionColor(metric.conversionRate)}`}>
                  {getConversionIcon(metric.conversionRate)}
                  <span className="text-sm font-medium">
                    {metric.conversionRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {metrics.reduce((sum, m) => sum + m.totalViews, 0)}
            </div>
            <div className="text-sm text-slate-500">Total des vues</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {metrics.reduce((sum, m) => sum + m.ordersCount, 0)}
            </div>
            <div className="text-sm text-slate-500">Total commandes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {metrics.length > 0 
                ? ((metrics.reduce((sum, m) => sum + m.ordersCount, 0) / 
                    metrics.reduce((sum, m) => sum + m.totalViews, 0)) * 100).toFixed(1)
                : '0.0'
              }%
            </div>
            <div className="text-sm text-slate-500">Conversion globale</div>
          </div>
        </div>
      </div>
    </div>
  );
}