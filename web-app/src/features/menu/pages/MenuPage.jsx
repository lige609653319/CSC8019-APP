import React, { useState, useEffect } from 'react';
import { NavBar, Card, Button, Tag, Skeleton, Empty, Toast } from 'antd-mobile';
import { ShoppingCart } from 'lucide-react';
import { menuApi, storeApi } from '../services/api';
import { useCart } from '../../../shared/context/CartContext';
import '../styles/menu.css';

const CATEGORIES = ['COFFEE', 'CHOCOLATE', 'WATER'];
const STORE_ID = 1;

export const MenuPage = ({ onSelectMenu, onOpenCart }) => {
  const [menus, setMenus] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('COFFEE');
  const [error, setError] = useState(null);
  const { getTotalCount, getTotalPrice } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [storeData, menuData] = await Promise.all([
        storeApi.getStoreById(STORE_ID),
        menuApi.getMenusByStore(STORE_ID),
      ]);
      setStore(storeData);
      setMenus(menuData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError(error.message);
      Toast.show({
        content: 'Failed to load menu. Please check if backend is running.',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMenus = menus.filter(menu => menu.category === selectedCategory);

  const getCategoryLabel = (category) => {
    const labels = {
      COFFEE: 'Coffee',
      CHOCOLATE: 'Chocolate',
      WATER: 'Water',
    };
    return labels[category] || category;
  };

  return (
    <div className="menu-page">
      <NavBar className="menu-nav-bar">
        {store?.name || 'Menu'}
      </NavBar>

      <div className="menu-container">
        {/* Category Sidebar */}
        <div className="category-sidebar">
          {CATEGORIES.map(category => (
            <div
              key={category}
              className={`category-item ${
                selectedCategory === category ? 'active' : ''
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {getCategoryLabel(category)}
            </div>
          ))}
        </div>

        {/* Menu List */}
        <div className="menu-list">
          {error && (
            <Card className="error-card">
              <div className="error-content">
                <div className="error-icon">⚠️</div>
                <div>{error}</div>
                <Button color="primary" size="small" onClick={loadData}>
                  Retry
                </Button>
              </div>
            </Card>
          )}
          {loading ? (
            <Skeleton animated paragraph={{ rows: 3 }} />
          ) : filteredMenus.length === 0 ? (
            <Empty description="No items available" />
          ) : (
            filteredMenus.map(menu => (
              <Card
                key={menu.id}
                className="menu-card"
                onClick={() => onSelectMenu(menu)}
              >
                <div className="menu-card-content">
                  <div className="menu-image-placeholder">
                    <div className="placeholder-icon">☕</div>
                  </div>
                  <div className="menu-info">
                    <div className="menu-name">{menu.name}</div>
                    <div className="menu-category">
                      <Tag color="default">{getCategoryLabel(menu.category)}</Tag>
                    </div>
                    <div className="menu-bottom">
                      <div className="menu-price">
                        £{menu.skus?.[0]?.price || '0.00'}
                      </div>
                      <Button
                        color="primary"
                        fill="solid"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMenu(menu);
                        }}
                      >
                        Select Size
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Cart Button at Bottom */}
        {getTotalCount() > 0 && (
          <div className="cart-button-bottom">
            <Button
              block
              color="primary"
              size="large"
              onClick={onOpenCart}
            >
              <ShoppingCart size={20} style={{ marginRight: '8px' }} />
              Cart ({getTotalCount()}) · £{getTotalPrice().toFixed(2)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
