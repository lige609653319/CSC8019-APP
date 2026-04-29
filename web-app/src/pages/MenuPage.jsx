import React, { useState, useEffect } from 'react';
import {
    NavBar,
    Card,
    Button,
    Tag,
    Skeleton,
    Empty,
    Toast,
    Input,
    Popup,
    List,
    Dialog,
} from 'antd-mobile';
import { ShoppingCart, Train, Search, X, MapPin, ChevronDown } from 'lucide-react';
import { menuApi, storeApi } from '../utils/menuApi';
import { useCart } from './CartContext';
import TrainInfo from '../components/TrainInfo';
import '../styles/menu.css';

const CATEGORIES = ['COFFEE', 'CHOCOLATE', 'WATER'];
const DEFAULT_STORE_ID = 1;

export const MenuPage = ({ onSelectMenu, onOpenCart }) => {
    const savedStoreId = Number(localStorage.getItem('selectedStoreId')) || DEFAULT_STORE_ID;

    const [menus, setMenus] = useState([]);
    const [stores, setStores] = useState([]);
    const [store, setStore] = useState(null);
    const [selectedStoreId, setSelectedStoreId] = useState(savedStoreId);
    const [storePopupVisible, setStorePopupVisible] = useState(false);

    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('COFFEE');
    const [error, setError] = useState(null);
    const [trainModalVisible, setTrainModalVisible] = useState(false);
    const [selectedStation, setSelectedStation] = useState('');
    const [imageErrors, setImageErrors] = useState({});
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const {
        cartItems,
        clearCart,
        getTotalCount,
    } = useCart();

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

        const results = menus.filter(item =>
            item.name.toLowerCase().includes(value.trim().toLowerCase())
        );

        setSearchResults(results);
        setShowSearchResults(true);
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
        loadStores();
    }, []);

    useEffect(() => {
        if (selectedStoreId) {
            loadData(selectedStoreId);
        }
    }, [selectedStoreId]);

    const loadStores = async () => {
        try {
            const storeList = await storeApi.getStores();

            const activeStores = storeList.filter(item =>
                !item.status || item.status === 'ACTIVE'
            );

            setStores(activeStores);

            if (activeStores.length > 0) {
                const currentStoreExists = activeStores.some(
                    item => Number(item.id) === Number(selectedStoreId)
                );

                if (!currentStoreExists) {
                    const firstStoreId = activeStores[0].id;
                    setSelectedStoreId(firstStoreId);
                    localStorage.setItem('selectedStoreId', String(firstStoreId));
                }
            }
        } catch (error) {
            console.error('Failed to load stores:', error);
            Toast.show({
                content: 'Failed to load stores.',
                position: 'top',
            });
        }
    };

    const loadData = async (storeId) => {
        try {
            setLoading(true);
            setError(null);

            clearSearch();

            const [storeData, menuData] = await Promise.all([
                storeApi.getStoreById(storeId),
                menuApi.getMenusByStore(storeId),
            ]);

            setStore(storeData);
            setMenus(menuData);
            setImageErrors({});
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

    const switchStore = (newStoreId) => {
        setSelectedStoreId(newStoreId);
        localStorage.setItem('selectedStoreId', String(newStoreId));
        setStorePopupVisible(false);
        setSelectedCategory('COFFEE');
    };

    const getStoreDisplayName = (storeItem) => {
        if (!storeItem) {
            return 'Choose store';
        }

        if (storeItem.locationName) {
            return `${storeItem.name} - ${storeItem.locationName}`;
        }

        return storeItem.name || 'Whistlestop Coffee Hut';
    };

    const switchStoreByStation = (stationName) => {
        if (!stationName) {
            return;
        }

        const matchedStore = stores.find(item =>
            item.locationName?.toLowerCase().trim() === stationName.toLowerCase().trim()
        );

        if (!matchedStore) {
            Toast.show({
                content: `No store found for ${stationName}. Please choose a store manually.`,
                position: 'top',
            });
            return;
        }

        if (Number(matchedStore.id) === Number(selectedStoreId)) {
            return;
        }

        if (cartItems.length > 0) {
            Dialog.confirm({
                title: 'Switch store?',
                content: `The selected station matches ${getStoreDisplayName(matchedStore)}. Switching store will clear your current cart.`,
                confirmText: 'Switch',
                cancelText: 'Cancel',
                onConfirm: () => {
                    clearCart();
                    switchStore(matchedStore.id);
                },
            });
            return;
        }

        switchStore(matchedStore.id);

        Toast.show({
            content: `Store switched to ${getStoreDisplayName(matchedStore)}`,
            position: 'top',
            duration: 1500,
        });
    };

    const handleStoreSelect = (newStore) => {
        const newStoreId = newStore.id;

        if (Number(newStoreId) === Number(selectedStoreId)) {
            setStorePopupVisible(false);
            return;
        }

        if (cartItems.length > 0) {
            Dialog.confirm({
                title: 'Switch store?',
                content: 'Changing store will clear your current cart. Do you want to continue?',
                confirmText: 'Switch',
                cancelText: 'Cancel',
                onConfirm: () => {
                    clearCart();
                    switchStore(newStoreId);
                },
            });
            return;
        }

        switchStore(newStoreId);
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

        switchStoreByStation(station);
    };

    const storeName = getStoreDisplayName(store);
    const displayStation = selectedStation || 'Choose your station';

    return (
        <div className="menu-page">
            <NavBar
                className="menu-nav-bar"
                right={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            onClick={() => setTrainModalVisible(true)}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Train size={22} color="#6F4E37" />
                        </div>

                        <div
                            onClick={onOpenCart}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative',
                            }}
                        >
                            <ShoppingCart size={22} color="#6F4E37" />

                            {getTotalCount() > 0 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-8px',
                                        backgroundColor: '#ff4d4f',
                                        color: 'white',
                                        borderRadius: '50%',
                                        minWidth: '16px',
                                        height: '16px',
                                        fontSize: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 4px',
                                    }}
                                >
                                    {getTotalCount()}
                                </div>
                            )}
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
                        onClick={() => setStorePopupVisible(true)}
                        style={{
                            fontSize: '13px',
                            color: '#6F4E37',
                            cursor: 'pointer',
                            marginTop: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            maxWidth: '260px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <MapPin size={14} />
                        <span>{storeName}</span>
                        <ChevronDown size={14} />
                    </div>

                    <div
                        onClick={() => setTrainModalVisible(true)}
                        style={{
                            fontSize: '13px',
                            color: '#1890ff',
                            cursor: 'pointer',
                            marginTop: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        🚆 {displayStation}
                    </div>
                </div>
            </NavBar>

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
                        <X
                            size={18}
                            color="#999"
                            onClick={clearSearch}
                            style={{ cursor: 'pointer' }}
                        />
                    )}
                </div>

                {showSearchResults && (
                    <div className="search-results-dropdown">
                        {searchResults.length === 0 ? (
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
                                                onError={() =>
                                                    setImageErrors(prev => ({
                                                        ...prev,
                                                        [`search-${item.id}`]: true,
                                                    }))
                                                }
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
                            className={`category-item ${selectedCategory === category ? 'active' : ''}`}
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
                                <Button
                                    color="primary"
                                    size="small"
                                    onClick={() => loadData(selectedStoreId)}
                                >
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
                                            <Tag color="default">
                                                {getCategoryLabel(menu.category)}
                                            </Tag>
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

            <Popup
                visible={storePopupVisible}
                onMaskClick={() => setStorePopupVisible(false)}
                bodyStyle={{
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    minHeight: '260px',
                }}
            >
                <div style={{ padding: '16px' }}>
                    <div
                        style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginBottom: '12px',
                            color: '#6F4E37',
                        }}
                    >
                        Choose store
                    </div>

                    {stores.length === 0 ? (
                        <Empty description="No stores available" />
                    ) : (
                        <List>
                            {stores.map(item => (
                                <List.Item
                                    key={item.id}
                                    onClick={() => handleStoreSelect(item)}
                                    extra={
                                        Number(item.id) === Number(selectedStoreId)
                                            ? 'Selected'
                                            : ''
                                    }
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>
                                            {getStoreDisplayName(item)}
                                        </div>
                                        {item.code && (
                                            <div
                                                style={{
                                                    fontSize: '12px',
                                                    color: '#999',
                                                    marginTop: '3px',
                                                }}
                                            >
                                                Store code: {item.code}
                                            </div>
                                        )}
                                    </div>
                                </List.Item>
                            ))}
                        </List>
                    )}
                </div>
            </Popup>

            <TrainInfo
                visible={trainModalVisible}
                onClose={() => setTrainModalVisible(false)}
                externalStation={selectedStation}
                onSelectStation={handleStationSelect}
            />
        </div>
    );
};