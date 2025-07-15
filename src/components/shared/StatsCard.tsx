'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  emoji?: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'stable';
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
  loading?: boolean;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  emoji,
  change, 
  color = 'blue', 
  loading = false 
}: StatsCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-400',
      icon: 'text-sky-600'
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-400',
      icon: 'text-emerald-600'
    },
    purple: {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      border: 'border-violet-400',
      icon: 'text-violet-600'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-400',
      icon: 'text-orange-600'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-500',
      icon: 'text-red-600'
    },
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-500',
      icon: 'text-teal-600'
    }
  };

  const colors = colorClasses[color];

  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        );
      case 'stable':
        return (
          <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 rounded w-24"></div>
              <div className="h-8 bg-neutral-200 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-neutral-200 rounded-lg"></div>
          </div>
          <div className="mt-4 h-3 bg-neutral-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-lg shadow-sm border border-neutral-200 border-l-4 ${colors.border} p-4 transition-all duration-200 hover:shadow-soft`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
            {emoji && (
              <span className="text-xl">{emoji}</span>
            )}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors.bg}`}>
          <div className={colors.icon}>
            {icon}
          </div>
        </div>
      </div>
      
      {change && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 flex items-center space-x-2"
        >
          {getTrendIcon()}
          <span className={`text-sm font-medium ${
            change.trend === 'up' ? 'text-emerald-600' : 
            change.trend === 'down' ? 'text-red-600' : 
            'text-neutral-600'
          }`}>
            {change.value}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
} 