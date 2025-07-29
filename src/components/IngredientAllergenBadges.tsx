'use client';

import React, { useState } from 'react';

interface Badge {
  id: string;
  text: string;
}

interface IngredientAllergenBadgesProps {
  items: string[];
  type: 'ingredients' | 'allergens';
  className?: string;
}

const IngredientAllergenBadges: React.FC<IngredientAllergenBadgesProps> = ({
  items,
  type,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!items || items.length === 0) return null;

  const maxDisplayed = 3;
  const displayedItems = items.slice(0, maxDisplayed);
  const remainingItems = items.slice(maxDisplayed);
  const hasMoreItems = remainingItems.length > 0;

  const getConfig = () => {
    if (type === 'ingredients') {
      return {
        title: '🥦 Ingrédients',
        badgeClasses: 'bg-green-100 text-green-800',
        moreButtonClasses: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      };
    } else {
      return {
        title: '⚠️ Allergènes',
        badgeClasses: 'bg-red-100 text-red-800',
        moreButtonClasses: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      };
    }
  };

  const config = getConfig();

  return (
    <div className={`mt-2 text-sm ${className}`}>
      <div className="font-semibold text-gray-600 mb-1">
        {config.title} :
      </div>
      <div className="flex flex-wrap gap-2">
        {displayedItems.map((item, index) => (
          <span
            key={index}
            className={`${config.badgeClasses} px-2 py-1 rounded-full text-xs font-medium`}
          >
            {item}
          </span>
        ))}
        
        {hasMoreItems && (
          <div className="relative">
            <span
              className={`${config.moreButtonClasses} px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors`}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              +{remainingItems.length}
            </span>
            
            {showTooltip && (
              <div className="absolute left-0 top-full mt-1 bg-white text-gray-900 text-xs p-2 shadow-lg rounded border z-10 min-w-max max-w-xs">
                <div className="space-y-1">
                  {remainingItems.map((item, index) => (
                    <div key={index} className="whitespace-nowrap">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientAllergenBadges; 