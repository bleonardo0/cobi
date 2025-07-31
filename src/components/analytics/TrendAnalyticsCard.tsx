'use client';

import { ModelTrendAnalytics } from '@/types/analytics';

interface TrendAnalyticsCardProps {
  trends: ModelTrendAnalytics[];
  period: 'daily' | 'weekly' | 'monthly';
  timeRange: '7d' | '30d' | '90d';
}

export default function TrendAnalyticsCard({ trends, period, timeRange }: TrendAnalyticsCardProps) {
  const topTrends = trends.slice(0, 5);

  const getTrendIcon = (trend: 'ascending' | 'descending' | 'stable') => {
    switch (trend) {
      case 'ascending':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7m0 0H7" />
          </svg>
        );
      case 'descending':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10m0 0h10" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
          </svg>
        );
    }
  };

  const getTrendColor = (trend: 'ascending' | 'descending' | 'stable') => {
    switch (trend) {
      case 'ascending': return 'text-green-600';
      case 'descending': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily': return 'Tendances quotidiennes';
      case 'weekly': return 'Tendances hebdomadaires';
      case 'monthly': return 'Tendances mensuelles';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{getPeriodLabel()}</h3>
        <span className="text-sm text-slate-500">
          {timeRange === '7d' ? '7 derniers jours' : 
           timeRange === '30d' ? '30 derniers jours' : 
           '90 derniers jours'}
        </span>
      </div>

      {topTrends.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Aucune tendance disponible</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topTrends.map((trend, index) => {
            const totalViews = period === 'daily' 
              ? trend.dailyViews.reduce((sum, d) => sum + d.views, 0)
              : period === 'weekly'
              ? trend.weeklyViews.reduce((sum, w) => sum + w.views, 0)
              : trend.monthlyViews.reduce((sum, m) => sum + m.views, 0);

            return (
              <div key={trend.modelId} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-medium text-indigo-600">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{trend.name}</h4>
                    <p className="text-sm text-slate-500">{totalViews} vues</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-1 ${getTrendColor(trend.trend)}`}>
                    {getTrendIcon(trend.trend)}
                    <span className="text-sm font-medium">
                      {trend.growthRate > 0 ? '+' : ''}{trend.growthRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}