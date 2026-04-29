import React, { createContext, useState, useCallback } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedTrain, setSelectedTrain] = useState(null);

    const addToCart = useCallback((menu, selectedSku, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(
                item => item.menuId === menu.id && item.skuId === selectedSku.id
            );

            if (existingItem) {
                return prevItems.map(item =>
                    item.menuId === menu.id && item.skuId === selectedSku.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [
                ...prevItems,
                {
                    menuId: menu.id,
                    menuName: menu.name,
                    imageUrl: menu.imageUrl,
                    skuId: selectedSku.id,
                    size: selectedSku.size,
                    price: selectedSku.price,
                    quantity,
                },
            ];
        });
    }, []);

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

    const removeFromCart = useCallback((menuId, skuId) => {
        setCartItems(prevItems =>
            prevItems.filter(
                item => !(item.menuId === menuId && item.skuId === skuId)
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
        setSelectedTrain(null);
    }, []);

    const getTotalPrice = useCallback(() => {
        return cartItems.reduce(
            (total, item) => total + parseFloat(item.price) * item.quantity,
            0
        );
    }, [cartItems]);

    const getTotalCount = useCallback(() => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    }, [cartItems]);

    const getOrderItems = useCallback(() => {
        return cartItems.map(item => ({
            id: item.skuId,
            quantity: item.quantity,
        }));
    }, [cartItems]);

    const setTrainForOrder = useCallback((train) => {
        setSelectedTrain(train);
    }, []);

    const getSelectedTrain = useCallback(() => {
        return selectedTrain;
    }, [selectedTrain]);

    const value = {
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalCount,
        getOrderItems,
        setTrainForOrder,
        getSelectedTrain,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = React.useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};