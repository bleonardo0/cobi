// Types pour le système POS (Point of Sale)

export interface CartItem {
  id: string;
  modelId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category?: string;
  shortDescription?: string;
  allergens?: string[];
  ingredients?: string[];
  // Options pour personnalisation future
  options?: CartItemOption[];
  notes?: string;
}

export interface CartItemOption {
  id: string;
  name: string;
  value: string;
  price: number; // prix additionnel
}

export interface Cart {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax?: number;
  deliveryFee?: number;
  restaurantId: string;
  sessionId: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  customerId?: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax?: number;
  deliveryFee?: number;
  status: OrderStatus;
  orderType: OrderType;
  paymentMethod?: PaymentMethod;
  customerInfo: CustomerInfo;
  specialInstructions?: string;
  estimatedTime?: number; // en minutes
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'pending'           // En attente
  | 'confirmed'         // Confirmée
  | 'preparing'         // En préparation
  | 'ready'            // Prête
  | 'delivered'        // Livrée
  | 'cancelled';       // Annulée

export type OrderType = 
  | 'dine-in'          // Sur place
  | 'takeaway'         // À emporter
  | 'delivery';        // Livraison

export type PaymentMethod = 
  | 'cash'             // Espèces
  | 'card'             // Carte
  | 'online';          // Paiement en ligne

export interface CustomerInfo {
  name: string;
  email?: string;
  phone?: string;
  // Pour livraison
  address?: {
    street: string;
    city: string;
    postalCode: string;
    instructions?: string;
  };
  // Pour table
  tableNumber?: string | number;
}

// Configuration POS par restaurant
export interface RestaurantPOSConfig {
  restaurantId: string;
  enabled: boolean;
  features: {
    ordering: boolean;           // Commande activée
    payment: boolean;           // Paiement en ligne activé
    delivery: boolean;          // Livraison activée
    takeaway: boolean;          // À emporter activé
    dineIn: boolean;           // Sur place activé
    customization: boolean;     // Personnalisation des plats
  };
  settings: {
    currency: string;           // EUR, USD, etc.
    taxRate: number;           // Taux de TVA (ex: 0.20 pour 20%)
    deliveryFee: number;       // Frais de livraison
    minimumOrder: number;      // Commande minimum
    estimatedPrepTime: number; // Temps de préparation estimé (minutes)
    acceptsReservations: boolean;
  };
  paymentMethods: PaymentMethod[];
  openingHours: {
    [key: string]: {          // lundi, mardi, etc.
      open: string;           // "09:00"
      close: string;          // "22:00"
      closed: boolean;
    };
  };
}

// Réponses API
export interface AddToCartResponse {
  success: boolean;
  cart?: Cart;
  error?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order?: Order;
  error?: string;
}

export interface POSConfigResponse {
  success: boolean;
  config?: RestaurantPOSConfig;
  error?: string;
} 