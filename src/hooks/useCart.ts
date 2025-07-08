'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cart, CartItem, RestaurantPOSConfig } from '@/types/pos';
import { Model3D } from '@/types/model';

interface UseCartProps {
  restaurantId: string;
  config?: RestaurantPOSConfig;
}

export function useCart({ restaurantId, config }: UseCartProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Générer un ID de session pour le panier
  const sessionId = typeof window !== 'undefined' 
    ? localStorage.getItem('cart_session_id') || generateSessionId()
    : generateSessionId();

  function generateSessionId(): string {
    const id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart_session_id', id);
    }
    return id;
  }

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    loadCartFromStorage();
  }, [restaurantId]);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    if (cart) {
      saveCartToStorage(cart);
    }
  }, [cart]);

  const loadCartFromStorage = () => {
    try {
      const stored = localStorage.getItem(`cart_${restaurantId}`);
      if (stored) {
        const parsedCart = JSON.parse(stored);
        // Vérifier que c'est bien pour le bon restaurant
        if (parsedCart.restaurantId === restaurantId) {
          setCart(parsedCart);
        } else {
          // Différent restaurant, créer un nouveau panier
          initializeCart();
        }
      } else {
        initializeCart();
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      initializeCart();
    }
  };

  const saveCartToStorage = (cartToSave: Cart) => {
    try {
      localStorage.setItem(`cart_${restaurantId}`, JSON.stringify(cartToSave));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error);
    }
  };

  const initializeCart = () => {
    const newCart: Cart = {
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      deliveryFee: 0,
      restaurantId,
      sessionId
    };
    setCart(newCart);
  };

  const calculateTotals = (items: CartItem[]): Pick<Cart, 'subtotal' | 'total' | 'tax' | 'deliveryFee'> => {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const optionsTotal = item.options?.reduce((optSum, opt) => optSum + opt.price, 0) || 0;
      return sum + itemTotal + (optionsTotal * item.quantity);
    }, 0);

    // Les prix incluent déjà la TVA (prix TTC)
    const deliveryFee = config?.settings.deliveryFee || 0;
    const total = subtotal + deliveryFee;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: 0, // TVA incluse dans les prix
      deliveryFee,
      total: Math.round(total * 100) / 100
    };
  };

  const addToCart = useCallback((model: Model3D, quantity: number = 1, options?: any[], notes?: string) => {
    if (!config?.enabled || !config?.features.ordering) {
      setError('Les commandes ne sont pas activées pour ce restaurant');
      return;
    }

    if (!model.price || model.price <= 0) {
      setError('Ce plat n\'a pas de prix défini');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setCart(prevCart => {
        if (!prevCart) return null;

        const existingItemIndex = prevCart.items.findIndex(
          item => item.modelId === model.id && 
                 JSON.stringify(item.options) === JSON.stringify(options)
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Article existant, augmenter la quantité
          newItems = [...prevCart.items];
          newItems[existingItemIndex].quantity += quantity;
          if (notes) {
            newItems[existingItemIndex].notes = notes;
          }
        } else {
          // Nouvel article
                     const newItem: CartItem = {
             id: `${model.id}_${Date.now()}`,
             modelId: model.id,
             name: model.name,
             price: model.price || 0,
             quantity,
             imageUrl: model.thumbnailUrl,
             category: model.category,
             shortDescription: model.shortDescription,
             allergens: model.allergens,
             ingredients: model.ingredients,
             options,
             notes
           };
          newItems = [...prevCart.items, newItem];
        }

        const totals = calculateTotals(newItems);

        return {
          ...prevCart,
          items: newItems,
          ...totals
        };
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setError('Erreur lors de l\'ajout au panier');
    } finally {
      setIsLoading(false);
    }
  }, [config, restaurantId]);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prevCart => {
      if (!prevCart) return null;

      const newItems = prevCart.items.filter(item => item.id !== itemId);
      const totals = calculateTotals(newItems);

      return {
        ...prevCart,
        items: newItems,
        ...totals
      };
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => {
      if (!prevCart) return null;

      const newItems = prevCart.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      const totals = calculateTotals(newItems);

      return {
        ...prevCart,
        items: newItems,
        ...totals
      };
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    const emptyCart: Cart = {
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      deliveryFee: 0,
      restaurantId,
      sessionId
    };
    setCart(emptyCart);
    localStorage.removeItem(`cart_${restaurantId}`);
  }, [restaurantId, sessionId]);

  const getItemCount = useCallback(() => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }, [cart]);

  const isInCart = useCallback((modelId: string) => {
    return cart?.items.some(item => item.modelId === modelId) || false;
  }, [cart]);

  const getItemQuantity = useCallback((modelId: string) => {
    return cart?.items.find(item => item.modelId === modelId)?.quantity || 0;
  }, [cart]);

  return {
    cart,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    isInCart,
    getItemQuantity,
    // Helpers
    isEmpty: !cart || cart.items.length === 0,
    isEnabled: config?.enabled && config?.features.ordering
  };
} 