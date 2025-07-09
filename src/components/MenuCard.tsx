'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Model3D } from '@/types/model';
import { getCategoryInfo, getAllergenInfo } from '@/lib/constants';
import LazyImage from './LazyImage';

interface MenuCardProps {
  model: Model3D;
  index: number;
  isSelected: boolean;
  onSelect: (model: Model3D) => void;
  posEnabled: boolean;
  canOrder: boolean;
  isInCart: boolean;
  cartQuantity: number;
  onAddToCart: (model: Model3D) => void;
  onRemoveFromCart: (modelId: string) => void;
}

const MenuCard = memo(function MenuCard({
  model,
  index,
  isSelected,
  onSelect,
  posEnabled,
  canOrder,
  isInCart,
  cartQuantity,
  onAddToCart,
  onRemoveFromCart
}: MenuCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-soft-lg flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        isSelected 
          ? 'border-primary-300 shadow-glow bg-primary-50/50' 
          : 'border-neutral-200 hover:border-primary-200'
      }`}
      onClick={() => onSelect(model)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(model);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Voir le plat ${model.name} en 3D${model.price ? ` - ${model.price.toFixed(2)}€` : ''}${isSelected ? ' (actuellement sélectionné)' : ''}`}
      aria-pressed={isSelected}
    >
      {/* Image/Thumbnail */}
      <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-t-2xl overflow-hidden relative">
        {model.thumbnailUrl ? (
          <LazyImage 
            src={model.thumbnailUrl} 
            alt={model.name}
            className="w-full h-full group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-gradient-to-br from-neutral-100 to-neutral-200">
            <motion.svg 
              className="w-16 h-16" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </motion.svg>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badge 3D */}
        <div className="absolute top-3 right-3">
          <motion.span 
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-soft backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✨ 3D
          </motion.span>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-soft"
          >
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Informations du plat */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg font-display text-neutral-800 line-clamp-2 group-hover:text-primary-700 transition-colors">
            {model.name}
          </h3>
          {model.price && (
            <div className="flex flex-col items-end">
              <span className="font-bold text-xl font-display text-primary-600">
                {model.price.toFixed(2)}€
              </span>
              <span className="text-xs text-neutral-500 font-medium">TTC</span>
            </div>
          )}
        </div>

        {model.shortDescription && (
          <p className="text-sm mb-4 line-clamp-2 font-body text-neutral-600 leading-relaxed">
            {model.shortDescription}
          </p>
        )}

        {/* Tags et allergènes */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Tags */}
          {model.tags && model.tags.length > 0 && (
            <>
              {model.tags.slice(0, 2).map((tagId) => {
                const tagInfo = getCategoryInfo(tagId as any);
                return tagInfo ? (
                  <motion.span
                    key={tagId}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 border border-primary-200"
                  >
                    {tagInfo.name}
                  </motion.span>
                ) : null;
              })}
            </>
          )}

          {/* Allergènes */}
          {model.allergens && model.allergens.length > 0 && (
            <>
              {model.allergens.slice(0, 3).map((allergenId) => {
                const allergenInfo = getAllergenInfo(allergenId);
                return allergenInfo ? (
                  <motion.span
                    key={allergenId}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center w-8 h-8 rounded-full text-sm bg-gradient-to-r from-accent-100 to-accent-200 text-accent-700 border border-accent-200 justify-center"
                    title={allergenInfo.name}
                  >
                    {allergenInfo.icon}
                  </motion.span>
                ) : null;
              })}
            </>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="space-y-3 mt-auto">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 rounded-xl font-semibold font-display text-sm transition-all duration-200 shadow-soft hover:shadow-glow flex items-center justify-center space-x-2"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(model);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Voir en 3D</span>
          </motion.button>

          {/* Bouton panier si POS activé */}
          {posEnabled && canOrder && (
            <div className="flex items-center space-x-2">
              {isInCart ? (
                <div className="flex items-center space-x-2 w-full">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromCart(model.id);
                    }}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    -
                  </motion.button>
                  <span className="font-medium text-sm">{cartQuantity}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(model);
                    }}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    +
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(model);
                  }}
                  className="w-full bg-white hover:bg-green-50 text-green-700 py-2 rounded-xl font-semibold font-display text-sm transition-all duration-200 shadow-soft border border-green-200 hover:border-green-300 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6 0H9.5" />
                  </svg>
                  <span>Ajouter au panier</span>
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default MenuCard; 