import React, { useState } from 'react';
import { NavBar, Button, Card, Stepper, Toast, Dialog } from 'antd-mobile';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useCart } from './CartContext';
import { createOrder } from '../utils/ordersApi';
import '../styles/menu.css';

const CartItemImage = ({ imageUrl, menuName }) => {
    const [imageError, setImageError] = useState(false);

    return imageUrl && !imageError ? (
        <img
            src={imageUrl}
            alt={menuName}
            className="item-image"
            onError={() => setImageError(true)}
        />
    ) : (
        <div className="item-image-placeholder">
            <div className="placeholder-icon">☕</div>
        </div>
    );
};

export const CartPage = ({ onBack, customerId = 1 }) => {
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        getTotalPrice,
        clearCart,
        getOrderItems,
        getSelectedTrain,
    } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const selectedTrain = getSelectedTrain();

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        try {
            setIsSubmitting(true);
            const totalPrice = getTotalPrice();
            const orderData = {
                storeId: 1,
                totalPrice: totalPrice.toFixed(2),
                orderType: 'DINE_IN',
                items: getOrderItems(),
            };

            const response = await createOrder(orderData);

            // createOrder returns the created order data on success
            if (response) {
                Toast.show({
                    icon: 'success',
                    content: 'Order created successfully!',
                    position: 'top',
                });

                clearCart();
                onBack();
            } else {
                throw new Error('Failed to create order');
            }
        } catch (error) {
            Toast.show({
                icon: 'fail',
                content: error.message || 'Failed to create order. Please try again.',
                position: 'top',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveItem = (menuId, skuId) => {
        removeFromCart(menuId, skuId);
        Toast.show({
            content: 'Item removed',
            position: 'top',
        });
    };

    const totalPrice = getTotalPrice();

    return (
        <div className="cart-page">
            <NavBar
                onBack={onBack}
            >
                Cart
            </NavBar>

            <div className="cart-container">
                {cartItems.length === 0 ? (
                    <Card className="empty-cart">
                        <div className="empty-cart-content">
                            <div className="empty-icon">🛒</div>
                            <div>Your cart is empty</div>
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="cart-items">
                            {cartItems.map(item => (
                                <Card key={`${item.menuId}-${item.skuId}`} className="cart-item-card">
                                    <div className="cart-item-content">
                                        <CartItemImage imageUrl={item.imageUrl} menuName={item.menuName} />

                                        <div className="item-details">
                                            <div className="item-name">{item.menuName}</div>
                                            <div className="item-size">{item.size}</div>
                                            <div className="item-price">£{item.price}</div>
                                        </div>

                                        <div className="item-actions">
                                            <Stepper
                                                value={item.quantity}
                                                onChange={(value) =>
                                                    updateQuantity(item.menuId, item.skuId, value)
                                                }
                                                min={1}
                                                max={99}
                                                size="small"
                                            />
                                            <Button
                                                color="danger"
                                                fill="text"
                                                size="small"
                                                onClick={() =>
                                                    handleRemoveItem(item.menuId, item.skuId)
                                                }
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="item-total">
                                        Total: £{(parseFloat(item.price) * item.quantity).toFixed(2)}
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Price Summary */}
                        <Card className="cart-summary">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>£{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery</span>
                                <span>£0.00</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>£{totalPrice.toFixed(2)}</span>
                            </div>
                        </Card>

                        {/* Train Information Card - between Total Price and Checkout */}
                        {selectedTrain && (
                            <Card className="train-info-summary" style={{ textAlign: 'center', padding: '16px' }}>
                                <div className="train-info-header" style={{ marginBottom: '12px' }}>
                                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#6F4E37' }}>🚂 Train Order</span>
                                </div>
                                <div className="train-info-details">
                                    <div className="train-info-row" style={{ marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', color: '#666' }}>Train ID: </span>
                                        <span style={{ fontSize: '14px' }}>{selectedTrain.trainId}</span>
                                    </div>
                                    <div className="train-info-row" style={{ marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', color: '#666' }}>Station: </span>
                                        <span style={{ fontSize: '14px' }}>{selectedTrain.currentStation}</span>
                                    </div>
                                    <div className="train-info-row" style={{ marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', color: '#666' }}>Arrival Time: </span>
                                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                                            {selectedTrain.arrivalTime
                                                ? new Date(selectedTrain.arrivalTime).toLocaleTimeString('en-GB', { hour12: false })
                                                : '--'}
                                        </span>
                                    </div>
                                    <div className="train-info-row" style={{ marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', color: '#666' }}>Platform: </span>
                                        <span style={{ fontSize: '14px' }}>{selectedTrain.platform || 'TBC'}</span>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Checkout Button */}
                        <div className="cart-button-group">
                            <Button
                                block
                                color="primary"
                                size="large"
                                onClick={handleCheckout}
                                loading={isSubmitting}
                            >
                                Checkout
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};