import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // unique composite key
  productId: string;
  productName: string;
  slug: string;
  image: string;
  selectedSize?: string;
  selectedFlavour?: string;
  selectedFlavours?: string[];
  flavourDistribution?: string;
  selectedAddOns?: Array<{ id: string; name: string; price: number }>;
  customMessage?: string;
  quantity: number;
  unitPrice: number;
  deliveryDate?: string;
  specialInstructions?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setExactQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cake_n_crave_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // LocalStorage unavailable or corrupt
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items]);

  const generateItemId = (item: Omit<CartItem, 'id'>): string => {
    const size = (item.selectedSize || 'nosize').toLowerCase().replace(/\s+/g, '');
    const flavoursKey = (item.selectedFlavours && item.selectedFlavours.length > 0)
      ? [...item.selectedFlavours].map(f => f.trim()).sort().join('+')
      : (item.selectedFlavour || 'noflavour').trim().toLowerCase();
    const distKey = (item.flavourDistribution || 'nodist').toLowerCase().replace(/\s+/g, '');
    const addOnsKey = (item.selectedAddOns || []).map((a) => a.id).sort().join('+') || 'noaddons';
    const msg = (item.customMessage || '').trim().toLowerCase();
    return `${item.productId}_${size}_${flavoursKey}_${distKey}_${addOnsKey}_${msg}`;
  };

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    const compositeId = generateItemId(newItem);
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === compositeId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + newItem.quantity,
          deliveryDate: newItem.deliveryDate || updated[existingIndex].deliveryDate,
          specialInstructions: newItem.specialInstructions || updated[existingIndex].specialInstructions,
        };
        return updated;
      } else {
        return [...prev, { ...newItem, id: compositeId }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const setExactQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        setExactQuantity,
        clearCart,
        totalCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
