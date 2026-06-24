import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'cake-paradise-cart';

const loadCart = () => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback((product, options = {}) => {
    setItems((prev) => {
      const itemKey = `${product.id}-${options.weight || ''}-${options.flavor || ''}`;
      const existingIndex = prev.findIndex((item) => item.itemKey === itemKey);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (options.quantity || 1),
          customText: options.customText || updated[existingIndex].customText,
        };
        return updated;
      }

      const price = product.priceMatrix?.[options.weight] || product.basePrice;
      return [
        ...prev,
        {
          itemKey,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images?.[0] || '',
          weight: options.weight || product.weights?.[0]?.value || '',
          weightLabel: options.weightLabel || product.weights?.[0]?.label || '',
          flavor: options.flavor || product.flavors?.[0] || '',
          customText: options.customText || '',
          quantity: options.quantity || 1,
          unitPrice: price,
          lineTotal: price * (options.quantity || 1),
          leadTimeDays: product.leadTimeDays || 1,
        },
      ];
    });
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((itemKey, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.itemKey === itemKey
          ? { ...item, quantity, lineTotal: item.unitPrice * quantity }
          : item
      )
    );
  }, []);

  const updateCustomText = useCallback((itemKey, customText) => {
    setItems((prev) =>
      prev.map((item) =>
        item.itemKey === itemKey ? { ...item, customText } : item
      )
    );
  }, []);

  const removeItem = useCallback((itemKey) => {
    setItems((prev) => prev.filter((item) => item.itemKey !== itemKey));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getMaxLeadTime = useCallback(() => {
    if (items.length === 0) return 1;
    return Math.max(...items.map((item) => item.leadTimeDays || 1));
  }, [items]);

  const value = {
    items,
    isCartOpen,
    setIsCartOpen,
    addItem,
    updateQuantity,
    updateCustomText,
    removeItem,
    clearCart,
    getSubtotal,
    getItemCount,
    getMaxLeadTime,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
