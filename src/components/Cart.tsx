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
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 bg-teal-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold">Votre panier</h2>
                  <p className="text-teal-100 text-sm">
                    {cart.items.length} article{cart.items.length > 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-teal-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6 0H9.5" />
                  </svg>
                  <p className="text-lg font-medium">Panier vide</p>
                  <p className="text-sm text-center mt-2">
                    Ajoutez des plats depuis le menu pour commencer votre commande
                  </p>
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
              <div className="border-t border-gray-200 bg-gray-50">
                {/* Totals */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                  
                  {(cart.deliveryFee || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Frais de livraison</span>
                      <span>{formatPrice(cart.deliveryFee || 0)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 sm:p-4 space-y-3">
                  <button
                    onClick={onCheckout}
                    className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors min-h-[48px]"
                  >
                    Commander • {formatPrice(cart.total)}
                  </button>
                  
                  <button
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="w-full bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 min-h-[44px]"
                  >
                    {isClearing ? 'Suppression...' : 'Vider le panier'}
                  </button>
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
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                disabled={item.quantity <= 1}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <span className="font-medium min-w-[24px] text-center">{item.quantity}</span>
              
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
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
            className="p-2 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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