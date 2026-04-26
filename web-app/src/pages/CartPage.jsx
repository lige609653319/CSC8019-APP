import React, { useState } from 'react';
import { NavBar, Button, Card, Stepper, Toast } from 'antd-mobile';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useCart } from '../../../shared/context/CartContext';
import { orderApi } from '../services/api';
import '../styles/menu.css';

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

            const response = await orderApi.createOrder(orderData);

            if (response && response.code === 200) {
                Toast.show({
                    icon: 'success',
                    content: 'Order created successfully!',
                    position: 'top',
                });

                clearCart();
                onBack();
            } else {
                throw new Error(response?.message || 'Failed to create order');
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
                left={<ChevronLeft size={24} />}
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
                        <div className="cart-items">
                            {cartItems.map(item => (
                                <Card key={`${item.menuId}-${item.skuId}`} className="cart-item-card">
                                    <div className="cart-item-content">
                                        <div className="item-image-placeholder">
                                            <div className="placeholder-icon">☕</div>
                                        </div>

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

                        {selectedTrain && (
                            <Card className="train-info-summary">
                                <div className="train-info-header">
                                    <span>🚂 Train Order</span>
                                </div>
                                <div className="train-info-details">
                                    <div className="train-info-row">
                                        <span>Train ID:</span>
                                        <span><strong>{selectedTrain.trainId}</strong></span>
                                    </div>
                                    <div className="train-info-row">
                                        <span>Station:</span>
                                        <span>{selectedTrain.currentStation}</span>
                                    </div>
                                    <div className="train-info-row">
                                        <span>Arrival Time:</span>
                                        <span>
                      {selectedTrain.arrivalTime
                          ? new Date(selectedTrain.arrivalTime).toLocaleTimeString('en-GB', { hour12: false })
                          : '--'}
                    </span>
                                    </div>
                                    <div className="train-info-row">
                                        <span>Platform:</span>
                                        <span>{selectedTrain.platform || 'TBC'}</span>
                                    </div>
                                </div>
                            </Card>
                        )}

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