import React, { useState, useEffect } from 'react';
import { NavBar, Card, Button, Tag, Skeleton, Empty, Toast, Input } from 'antd-mobile';
import { ShoppingCart, Train, Search, X } from 'lucide-react';
import { menuApi, storeApi } from '../utils/menuApi';
import { useCart } from './CartContext';
import TrainInfo from '../components/TrainInfo';
import '../styles/menu.css';

const CATEGORIES = ['COFFEE', 'CHOCOLATE', 'WATER'];
const STORE_ID = 1;

export const MenuPage = ({ onSelectMenu, onOpenCart }) => {
    const [menus, setMenus] = useState([]);
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('COFFEE');
    const [error, setError] = useState(null);
    const [trainModalVisible, setTrainModalVisible] = useState(false);
    const [selectedStation, setSelectedStation] = useState('');
    const [imageErrors, setImageErrors] = useState({});
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const { getTotalCount, getTotalPrice } = useCart();
    
    const handleImageError = (menuId) => {
        setImageErrors(prev => ({ ...prev, [menuId]: true }));
    };

    const handleSearch = async (value) => {
        setSearchInput(value);
        
        if (!value.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        try {
            setSearchLoading(true);
            const results = await menuApi.searchMenus(STORE_ID, value.trim());
            setSearchResults(results || []);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Search error:', error);
            Toast.show({
                content: 'Search failed',
                position: 'top',
            });
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectSearchResult = (menu) => {
        setSearchInput('');
        setShowSearchResults(false);
        setSearchResults([]);
        onSelectMenu(menu);
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

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

    const handleStationSelect = (station) => {
        setSelectedStation(station);
        Toast.show({
            content: `Selected station: ${station}`,
            position: 'top',
            duration: 1500,
        });
    };

    const storeName = store?.name || 'Whistlestop Coffee Hut';
    const displayStation = selectedStation || 'Choose your station';

    return (
        <div className="menu-page">
            <NavBar
                className="menu-nav-bar"
                right={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            onClick={() => setTrainModalVisible(true)}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <Train size={22} color="#6F4E37" />
                        </div>
                    </div>
                }
                back={null}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#6F4E37', fontSize: '18px' }}>
                        Whistlestop Coffee Hut
                    </span>
                    <div
                        onClick={() => setTrainModalVisible(true)}
                        style={{
                            fontSize: '14px',
                            color: '#1890ff',
                            cursor: 'pointer',
                            marginTop: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        📍 {displayStation}
                    </div>
                </div>
            </NavBar>

            {/* Search Bar */}
            <div className="menu-search-bar">
                <div className="search-input-wrapper">
                    <Search size={18} color="#999" />
                    <Input
                        placeholder="Search for menu..."
                        value={searchInput}
                        onChange={(val) => handleSearch(val)}
                        clearable
                        style={{ flex: 1, marginLeft: '8px' }}
                    />
                    {searchInput && (
                        <X size={18} color="#999" onClick={clearSearch} style={{ cursor: 'pointer' }} />
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && (
                    <div className="search-results-dropdown">
                        {searchLoading ? (
                            <div className="search-result-item">
                                <Skeleton animated paragraph={{ rows: 1 }} />
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="search-result-item">
                                <span style={{ color: '#999' }}>No results found</span>
                            </div>
                        ) : (
                            searchResults.map(item => (
                                <div 
                                    key={item.id} 
                                    className="search-result-item"
                                    onClick={() => handleSelectSearchResult(item)}
                                >
                                    <div className="search-result-image">
                                        {item.imageUrl && !imageErrors[`search-${item.id}`] ? (
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.name}
                                                onError={() => setImageErrors(prev => ({ ...prev, [`search-${item.id}`]: true }))}
                                            />
                                        ) : (
                                            <div style={{ fontSize: '20px' }}>☕</div>
                                        )}
                                    </div>
                                    <div className="search-result-info">
                                        <div className="search-result-name">{item.name}</div>
                                        <div className="search-result-category">
                                            {item.category} · £{item.skus?.[0]?.price || '0.00'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div className="menu-container">
                <div className="category-sidebar">
                    {CATEGORIES.map(category => (
                        <div
                            key={category}
                            className={`category-item ${selectedCategory === category ? 'active' : ''
                                }`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {getCategoryLabel(category)}
                        </div>
                    ))}
                </div>

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
                                    {menu.imageUrl && !imageErrors[menu.id] ? (
                                        <img 
                                            src={menu.imageUrl} 
                                            alt={menu.name} 
                                            className="menu-image"
                                            onError={() => handleImageError(menu.id)}
                                        />
                                    ) : (
                                        <div className="placeholder-icon">☕</div>
                                    )}
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

            <TrainInfo
                visible={trainModalVisible}
                onClose={() => setTrainModalVisible(false)}
                externalStation={selectedStation}
                onSelectStation={handleStationSelect}
            />
        </div>
    );
};
