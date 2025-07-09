'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cart as CartType, CartItem, RestaurantPOSConfig } from '@/types/pos';

interface CartProps {
  cart: CartType | null;
  config?: RestaurantPOSConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  onClearCart: () => void;
}

export default function Cart({
  cart,
  config,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onClearCart
}: CartProps) {
  const [isClearing, setIsClearing] = useState(false);

  if (!cart) return null;

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      onClearCart();
    } finally {
      setIsClearing(false);
    }
  };

  const formatPrice = (price: number) => {
    const currency = config?.settings.currency || 'EUR';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const sidebarVariants = {
    closed: { x: '100%' },
    open: { x: 0 }
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white/95 backdrop-blur-lg shadow-soft-lg z-50 flex flex-col border-l border-neutral-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-display">Votre panier</h2>
                  <p className="text-blue-100 text-sm font-medium">
                    {cart.items.length} article{cart.items.length > 1 ? 's' : ''}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6 0H9.5" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-800 mb-3 font-display">Panier vide</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed max-w-sm">
                      Ajoutez des plats depuis le menu pour commencer votre commande
                    </p>
                  </motion.div>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {cart.items.map((item) => (
                    <CartItemComponent
                      key={item.id}
                      item={item}
                      onUpdateQuantity={onUpdateQuantity}
                      onRemove={onRemoveItem}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <div className="border-t border-neutral-200 bg-neutral-50/50 backdrop-blur-sm">
                {/* Totals */}
                <div className="p-6 space-y-3">
                  <div className="flex justify-between text-sm font-medium text-neutral-600">
                    <span>Sous-total</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                  
                  {(cart.deliveryFee || 0) > 0 && (
                    <div className="flex justify-between text-sm font-medium text-neutral-600">
                      <span>Frais de livraison</span>
                      <span>{formatPrice(cart.deliveryFee || 0)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xl font-bold text-neutral-800 pt-3 border-t border-neutral-200">
                    <span>Total</span>
                    <span className="text-blue-600">{formatPrice(cart.total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCheckout}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-2xl font-bold font-display text-lg transition-all duration-200 shadow-soft hover:shadow-lg flex items-center justify-center space-x-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6 0H9.5" />
                    </svg>
                    <span>Commander • {formatPrice(cart.total)}</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="w-full bg-white hover:bg-neutral-50 text-neutral-700 py-3 px-6 rounded-2xl font-semibold font-display text-sm transition-all duration-200 shadow-soft border border-neutral-200 hover:border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isClearing ? (
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Suppression...</span>
                      </span>
                    ) : (
                      'Vider le panier'
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Composant pour un item du panier
interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  formatPrice: (price: number) => string;
}

function CartItemComponent({ item, onUpdateQuantity, onRemove, formatPrice }: CartItemProps) {
  const itemTotal = item.price * item.quantity;
  const optionsTotal = item.options?.reduce((sum, opt) => sum + opt.price, 0) || 0;
  const totalWithOptions = itemTotal + (optionsTotal * item.quantity);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex space-x-3">
        {/* Image */}
        {item.imageUrl && (
          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
          {item.shortDescription && (
            <p className="text-sm text-gray-500 mt-1">{item.shortDescription}</p>
          )}
          
          {/* Options */}
          {item.options && item.options.length > 0 && (
            <div className="mt-2 space-y-1">
              {item.options.map((option) => (
                <div key={option.id} className="text-xs text-gray-600">
                  + {option.name}: {option.value} {option.price > 0 && `(+${formatPrice(option.price)})`}
                </div>
              ))}
            </div>
          )}
          
          {/* Notes */}
          {item.notes && (
            <div className="mt-2 text-xs text-gray-600 italic">
              Note: {item.notes}
            </div>
          )}
          
          {/* Price and quantity */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                disabled={item.quantity <= 1}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <span className="font-medium">{item.quantity}</span>
              
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            <div className="text-right">
              <div className="font-medium">{formatPrice(totalWithOptions)}</div>
              {optionsTotal > 0 && (
                <div className="text-xs text-gray-500">
                  Base: {formatPrice(itemTotal)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Remove button */}
        <div className="flex-shrink-0">
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 