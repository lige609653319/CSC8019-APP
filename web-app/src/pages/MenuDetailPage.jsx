import React, { useState } from 'react';
import { NavBar, Button, Card, Space, Radio, Stepper, Toast } from 'antd-mobile';
import { ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import '../styles/menu.css';

export const MenuDetailPage = ({ menu, onBack }) => {
  const [selectedSku, setSelectedSku] = useState(menu.skus?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!selectedSku) {
      Toast.show({
        content: 'Please select a size',
        position: 'top',
      });
      return;
    }

    addToCart(menu, selectedSku, quantity);
    Toast.show({
      content: 'Added to cart',
      position: 'top',
    });
    
    // Reset and close after a short delay
    setTimeout(() => {
      setQuantity(1);
      onBack();
    }, 500);
  };

  const getSizeLabel = (size) => {
    const labels = {
      REGULAR: 'Regular',
      LARGE: 'Large',
    };
    return labels[size] || size;
  };

  return (
    <div className="menu-detail-page">
      <NavBar
        onBack={onBack}
        left={<ChevronLeft size={24} />}
      >
        Details
      </NavBar>

      <div className="detail-container">
        {/* Product Image Placeholder */}
        <div className="detail-image-placeholder">
          <div className="placeholder-icon-large">☕</div>
        </div>

        {/* Product Info */}
        <Card className="detail-info-card">
          <div className="detail-name">{menu.name}</div>
          <div className="detail-category">{menu.category}</div>
        </Card>

        {/* Size Selection */}
        <Card className="detail-sku-card">
          <div className="sku-title">Select Size</div>
          <Space direction="vertical" block>
            {menu.skus && menu.skus.length > 0 ? (
              menu.skus.map(sku => (
                <div
                  key={sku.id}
                  className="sku-option"
                  onClick={() => setSelectedSku(sku)}
                >
                  <Radio
                    checked={selectedSku?.id === sku.id}
                    onChange={() => setSelectedSku(sku)}
                  />
                  <div className="sku-option-content">
                    <div className="sku-size">{getSizeLabel(sku.size)}</div>
                    <div className="sku-availability">
                      {sku.isAvailable ? (
                        <span className="available">In Stock</span>
                      ) : (
                        <span className="unavailable">Out of Stock</span>
                      )}
                    </div>
                  </div>
                  <div className="sku-price">£{sku.price}</div>
                </div>
              ))
            ) : (
              <div>No sizes available</div>
            )}
          </Space>
        </Card>

        {/* Quantity Selection */}
        <Card className="detail-quantity-card">
          <div className="quantity-title">Quantity</div>
          <Stepper
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={99}
          />
        </Card>

        {/* Price Summary */}
        <Card className="detail-price-card">
          <div className="price-row">
            <span>Price</span>
            <span>£{selectedSku?.price || '0.00'}</span>
          </div>
          <div className="price-row">
            <span>Quantity</span>
            <span>{quantity}</span>
          </div>
          <div className="price-row total">
            <span>Total</span>
            <span>
              £{(parseFloat(selectedSku?.price || 0) * quantity).toFixed(2)}
            </span>
          </div>
        </Card>

        {/* Add to Cart Button */}
        <div className="detail-button-group">
          <Button
            block
            color="primary"
            size="large"
            onClick={handleAddToCart}
            disabled={!selectedSku?.isAvailable}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};
