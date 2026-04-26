import React, { useState } from 'react';
import { NavBar, Button, Card, Space, Stepper, Toast, Dialog } from 'antd-mobile';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
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
  } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Toast.show({
        content: 'Cart is empty',
        position: 'top',
      });
      return;
    }

    Dialog.confirm({
      content: 'Confirm your order?',
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          const totalPrice = getTotalPrice();
          const orderData = {
            customerId,
            totalPrice: totalPrice.toFixed(2),
            orderType: 'DINE_IN', // Default order type, can be changed based on requirements
            items: getOrderItems(),
          };

          const result = await orderApi.createOrder(orderData);

          if (result) {
            Toast.show({
              content: 'Order placed successfully',
              position: 'top',
            });
            clearCart();
            onBack();
          }
        } catch (error) {
          console.error('Failed to place order:', error);
          Toast.show({
            content: 'Failed to place order',
            position: 'top',
          });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
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
            {/* Cart Items */}
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
