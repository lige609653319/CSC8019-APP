import React, { useState, useEffect } from 'react';
import { NavBar, Card, Button, Tag, Space, Skeleton, Empty } from 'antd-mobile';
import { ShoppingCart } from 'lucide-react';
import { menuApi } from '../services/api';
import { useCart } from '../context/CartContext';
import '../styles/menu.css';

const CATEGORIES = ['COFFEE', 'CHOCOLATE', 'WATER'];

export const MenuPage = ({ onSelectMenu, onOpenCart }) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('COFFEE');
  const { getTotalCount } = useCart();

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const data = await menuApi.getMenusByStore(1);
      setMenus(data);
    } catch (error) {
      console.error('Failed to load menus:', error);
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
      <NavBar
        className="menu-nav-bar"
        right={
          <div className="cart-badge" onClick={onOpenCart}>
            <ShoppingCart size={24} />
            {getTotalCount() > 0 && (
              <span className="badge">{getTotalCount()}</span>
            )}
          </div>
        }
      >
        Menu
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
      </div>
    </div>
  );
};
