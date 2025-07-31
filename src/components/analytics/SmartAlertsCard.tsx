'use client';

import { SmartAlert } from '@/types/analytics';

interface SmartAlertsCardProps {
  alerts: SmartAlert[];
}

export default function SmartAlertsCard({ alerts }: SmartAlertsCardProps) {
  const getSeverityIcon = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getSeverityColor = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getTypeLabel = (type: SmartAlert['type']) => {
    switch (type) {
      case 'high_views_no_orders': return 'Conversion faible';
      case 'declining_popularity': return 'Popularité en baisse';
      case 'trending_up': return 'Tendance positive';
      case 'low_conversion': return 'Taux de conversion bas';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Alertes Intelligentes</h3>
          <p className="text-sm text-slate-500 mt-1">Insights automatiques sur vos plats</p>
        </div>
        {alerts.length > 0 && (
          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p>Aucune alerte pour le moment</p>
          <p className="text-xs mt-1">C'est bon signe ! 👍</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start space-x-3">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-900">{alert.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 px-2 py-1 bg-white rounded-full">
                        {getTypeLabel(alert.type)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatTimeAgo(alert.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-3">{alert.message}</p>
                  
                  {alert.metrics && (
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      {alert.metrics.views && (
                        <span className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{alert.metrics.views} vues</span>
                        </span>
                      )}
                      {alert.metrics.orders !== undefined && (
                        <span className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span>{alert.metrics.orders} commandes</span>
                        </span>
                      )}
                      {alert.metrics.conversionRate !== undefined && (
                        <span className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <span>{alert.metrics.conversionRate.toFixed(1)}% conversion</span>
                        </span>
                      )}
                      {alert.metrics.trend !== undefined && (
                        <span className={`flex items-center space-x-1 ${alert.metrics.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={alert.metrics.trend >= 0 ? "M7 17l9.2-9.2M17 17V7m0 0H7" : "M17 7l-9.2 9.2M7 7v10m0 0h10"} />
                          </svg>
                          <span>{alert.metrics.trend >= 0 ? '+' : ''}{alert.metrics.trend.toFixed(1)}% tendance</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}