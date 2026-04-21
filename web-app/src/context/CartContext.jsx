import React, { createContext, useState, useCallback } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Add item to cart
  const addToCart = useCallback((menu, selectedSku, quantity = 1) => {
    setCartItems(prevItems => {
      // Check if item already exists
      const existingItem = prevItems.find(
        item => item.menuId === menu.id && item.skuId === selectedSku.id
      );

      if (existingItem) {
        // Update quantity if item exists
        return prevItems.map(item =>
          item.menuId === menu.id && item.skuId === selectedSku.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // Add new item
      return [
        ...prevItems,
        {
          menuId: menu.id,
          menuName: menu.name,
          skuId: selectedSku.id,
          size: selectedSku.size,
          price: selectedSku.price,
          quantity,
        },
      ];
    });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((menuId, skuId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menuId, skuId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.menuId === menuId && item.skuId === skuId
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((menuId, skuId) => {
    setCartItems(prevItems =>
      prevItems.filter(
        item => !(item.menuId === menuId && item.skuId === skuId)
      )
    );
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Calculate total price
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + parseFloat(item.price) * item.quantity,
      0
    );
  }, [cartItems]);

  // Get total items count
  const getTotalCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Convert cart to order format
  const getOrderItems = useCallback(() => {
    return cartItems.map(item => ({
      id: item.skuId,
      quantity: item.quantity,
    }));
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalCount,
    getOrderItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook to use cart context
export const useCart = () => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
