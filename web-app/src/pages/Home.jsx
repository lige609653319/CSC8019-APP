import React, { useState, useEffect } from 'react'
import {
    NavBar,
    Card,
    Button,
    Badge,
    Image,
    TabBar,
    List,
    PullToRefresh,
    Popup,
    Dialog,
    Toast,
    Empty
} from 'antd-mobile'
import {
    ShoppingCart,
    LayoutGrid,
    List as ListIcon,
    User,
    ClipboardList,
    MapPin,
    ChevronRight,
    Clock
} from 'lucide-react'
import { fetchLoyaltyBalance, fetchLoyaltyTransactions } from '../utils/loyaltyApi'
import { storeApi } from '../utils/menuApi'
import LoyaltyClubSection from '../components/LoyaltyClubSection'
import TrainInfo from '../components/TrainInfo'
import Orders from './Orders'
import Menu from './Menu'
import { useCart } from './CartContext'
import '../App.css'

const COFFEE_DATA = [
    {
        id: 1,
        name: 'Americano',
        price: 4.00,
        image: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&w=200&q=80',
        description: 'Freshly brewed espresso with hot water.'
    },
    {
        id: 2,
        name: 'Latte',
        price: 5.50,
        image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=200&q=80',
        description: 'Espresso with steamed milk and a light layer of foam.'
    },
    {
        id: 3,
        name: 'Cappuccino',
        price: 5.25,
        image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=200&q=80',
        description: 'Equal parts of espresso, steamed milk, and milk foam.'
    },
    {
        id: 4,
        name: 'Mocha',
        price: 6.00,
        image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&w=200&q=80',
        description: 'Espresso mixed with chocolate and steamed milk.'
    },
    {
        id: 5,
        name: 'Flat White',
        price: 5.75,
        image: 'https://images.unsplash.com/photo-1512568433530-5531d9577af5?auto=format&fit=crop&w=200&q=80',
        description: 'Espresso with micro-foamed milk.'
    },
]

const DEFAULT_STORE_ID = 1

function Home() {
    const savedStoreId = Number(localStorage.getItem('selectedStoreId')) || DEFAULT_STORE_ID

    const [activeKey, setActiveKey] = useState('home')
    const [menuCurrentPage, setMenuCurrentPage] = useState('menu')
    const [cartClickCount, setCartClickCount] = useState(0)
    const [loyaltyBalance, setLoyaltyBalance] = useState(null)
    const [loyaltyTransactions, setLoyaltyTransactions] = useState([])
    const [loyaltyLoading, setLoyaltyLoading] = useState(false)
    const [loyaltyError, setLoyaltyError] = useState('')
    const [trainModalVisible, setTrainModalVisible] = useState(false)

    const [selectedStoreId, setSelectedStoreId] = useState(savedStoreId)
    const [currentStore, setCurrentStore] = useState(null)
    const [stores, setStores] = useState([])
    const [storePopupVisible, setStorePopupVisible] = useState(false)

    const {
        getTotalCount,
        addToCart,
        cartItems,
        clearCart
    } = useCart()

    const loadStores = async () => {
        try {
            const storeList = await storeApi.getStores()

            const activeStores = storeList.filter(item =>
                !item.status || item.status === 'ACTIVE'
            )

            setStores(activeStores)

            if (activeStores.length > 0) {
                const currentStoreExists = activeStores.some(
                    item => Number(item.id) === Number(selectedStoreId)
                )

                if (!currentStoreExists) {
                    const firstStore = activeStores[0]
                    setSelectedStoreId(firstStore.id)
                    setCurrentStore(firstStore)
                    localStorage.setItem('selectedStoreId', String(firstStore.id))
                }
            }
        } catch (error) {
            console.error('Failed to load stores:', error)
            Toast.show({
                content: 'Failed to load stores.',
                position: 'top',
            })
        }
    }

    const loadCurrentStore = async (storeId = selectedStoreId) => {
        try {
            const storeData = await storeApi.getStoreById(storeId)
            console.log('Current store data:', storeData)
            setCurrentStore(storeData)
        } catch (error) {
            console.error('Failed to load current store:', error)
        }
    }

    const loadLoyaltyData = async () => {
        setLoyaltyLoading(true)
        setLoyaltyError('')

        try {
            const [balance, transactions] = await Promise.all([
                fetchLoyaltyBalance(),
                fetchLoyaltyTransactions(5)
            ])

            setLoyaltyBalance(balance)
            setLoyaltyTransactions(Array.isArray(transactions) ? transactions : [])
        } catch (err) {
            setLoyaltyError(err.response?.data?.message || err.message || 'Failed to load loyalty data')
            setLoyaltyBalance(null)
            setLoyaltyTransactions([])
        } finally {
            setLoyaltyLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('userid')
        localStorage.removeItem('role')
        window.location.href = '/login'
    }

    useEffect(() => {
        loadStores()
        loadCurrentStore(savedStoreId)
    }, [])

    useEffect(() => {
        if (activeKey === 'home') {
            const latestStoreId = Number(localStorage.getItem('selectedStoreId')) || DEFAULT_STORE_ID
            setSelectedStoreId(latestStoreId)
            loadCurrentStore(latestStoreId)
            loadStores()
        }

        if (activeKey === 'profile') {
            loadLoyaltyData()
        }
    }, [activeKey])

    const handleCartClick = () => {
        setActiveKey('menu')
        setMenuCurrentPage('cart')
        setCartClickCount(prev => prev + 1)
    }

    const switchStore = (newStore) => {
        setSelectedStoreId(newStore.id)
        setCurrentStore(newStore)
        localStorage.setItem('selectedStoreId', String(newStore.id))
        setStorePopupVisible(false)

        Toast.show({
            content: `Store switched to ${getStoreLocation(newStore)}`,
            position: 'top',
            duration: 1500,
        })
    }

    const handleStoreSelect = (newStore) => {
        if (!newStore) {
            return
        }

        if (Number(newStore.id) === Number(selectedStoreId)) {
            setStorePopupVisible(false)
            return
        }

        if (cartItems && cartItems.length > 0) {
            Dialog.confirm({
                title: 'Switch store?',
                content: 'Changing store will clear your current cart. Do you want to continue?',
                confirmText: 'Switch',
                cancelText: 'Cancel',
                onConfirm: () => {
                    clearCart()
                    switchStore(newStore)
                },
            })
            return
        }

        switchStore(newStore)
    }

    const getStoreLocation = (storeItem = currentStore) => {
        return storeItem?.locationName || storeItem?.location_name || 'Choose store'
    }

    const getStoreName = (storeItem = currentStore) => {
        return storeItem?.name || 'Whistlestop Coffee Hut'
    }

    const getStoreHours = (storeItem = currentStore) => {
        if (!storeItem) {
            return 'Opening hours not set'
        }

        const openingTime = storeItem.openingTime || storeItem.opening_time
        const closingTime = storeItem.closingTime || storeItem.closing_time

        if (openingTime && closingTime) {
            return `${openingTime} - ${closingTime}`
        }

        return 'Closed'
    }

    const tabs = [
        { key: 'home', title: 'Home', icon: <LayoutGrid size={22} /> },
        { key: 'menu', title: 'Menu', icon: <ListIcon size={22} /> },
        { key: 'orders', title: 'Orders', icon: <ClipboardList size={22} /> },
        { key: 'profile', title: 'Profile', icon: <User size={22} /> },
    ]

    return (
        <div className="app-container">

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {activeKey === 'profile' ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <LoyaltyClubSection
                            balance={loyaltyBalance}
                            transactions={loyaltyTransactions}
                            loading={loyaltyLoading}
                            error={loyaltyError || undefined}
                            onRefresh={loadLoyaltyData}
                            onLogout={handleLogout}
                        />
                    </div>
                ) : activeKey === 'orders' ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Orders />
                    </div>
                ) : activeKey === 'menu' ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Menu initialPage={menuCurrentPage} cartClickTrigger={cartClickCount} />
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <NavBar
                            className="nav-bar"
                            right={
                                <div onClick={handleCartClick} style={{ cursor: 'pointer', position: 'relative' }}>
                                    <Badge content={getTotalCount() > 0 ? getTotalCount() : null}>
                                        <ShoppingCart size={24} color="#6F4E37" />
                                    </Badge>
                                </div>
                            }
                            back={null}
                        >
                            <span style={{ fontWeight: 'bold', color: '#6F4E37', fontSize: '18px' }}>Coffee Client</span>
                        </NavBar>
                        <div className="content-scroll">
                            <PullToRefresh onRefresh={async () => {
                                await loadStores()
                                await loadCurrentStore()
                            }}>
                                <div className="main-content">
                                    <div
                                        onClick={() => setStorePopupVisible(true)}
                                        style={{
                                            backgroundColor: '#fff',
                                            borderRadius: '14px',
                                            padding: '14px 16px',
                                            marginBottom: '16px',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '12px',
                                            }}
                                        >
                                            <div style={{ minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        fontSize: '18px',
                                                        fontWeight: 700,
                                                        color: '#6F4E37',
                                                        lineHeight: '24px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {getStoreName()}
                                                </div>

                                                <div
                                                    style={{
                                                        marginTop: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '14px',
                                                        color: '#666',
                                                    }}
                                                >
                                                    <MapPin size={16} color="#999" style={{ flexShrink: 0 }} />

                                                    <span
                                                        style={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {getStoreLocation()}
                                                    </span>
                                                </div>

                                                <div
                                                    style={{
                                                        marginTop: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '14px',
                                                        color: '#666',
                                                    }}
                                                >
                                                    <Clock size={16} color="#999" style={{ flexShrink: 0 }} />

                                                    <span
                                                        style={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {getStoreHours()}
                                                    </span>
                                                </div>
                                            </div>

                                            <ChevronRight size={22} color="#6F4E37" style={{ flexShrink: 0 }} />
                                        </div>
                                    </div>

                                    <h2 className="section-title">Exclusive Offers</h2>
                                    <Card className="promo-card">
                                <div className="promo-image-container">
                                    <Image
                                        src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
                                        lazy
                                        style={{ borderRadius: 8, height: 160 }}
                                    />
                                    <div className="promo-tag">New</div>
                                </div>
                                <div className="promo-info">
                                    <h3>Spring Collection</h3>
                                    <p>Taste the freshness of our new seasonal blends.</p>
                                    <Button color="primary" size="small" shape="rounded">
                                        Order Now
                                    </Button>
                                </div>
                            </Card>

                            <h2 className="section-title">Menu</h2>
                            <List className="coffee-list">
                                {COFFEE_DATA.map(coffee => (
                                    <List.Item
                                        key={coffee.id}
                                        prefix={
                                            <Image
                                                src={coffee.image}
                                                style={{ borderRadius: 8 }}
                                                fit="cover"
                                                width={80}
                                                height={80}
                                            />
                                        }
                                        description={coffee.description}
                                        extra={
                                            <div className="item-extra">
                                                <span className="price">${coffee.price.toFixed(2)}</span>
                                                <Button
                                                    size="mini"
                                                    color="primary"
                                                    fill="solid"
                                                    className="add-btn"
                                                    onClick={addToCart}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        }
                                    >
                                        <span className="coffee-name">{coffee.name}</span>
                                    </List.Item>
                                ))}
                            </List>
                                </div>
                            </PullToRefresh>
                        </div>
                    </div>
                )}
            </div>

            <Popup
                visible={storePopupVisible}
                onMaskClick={() => setStorePopupVisible(false)}
                bodyStyle={{
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    minHeight: '280px',
                    maxHeight: '70vh',
                    overflowY: 'auto',
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
                                            {getStoreLocation(item)}
                                        </div>

                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#999',
                                                marginTop: '3px',
                                            }}
                                        >
                                            {getStoreName(item)}
                                        </div>

                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#999',
                                                marginTop: '3px',
                                            }}
                                        >
                                            Opening hours: {getStoreHours(item)}
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

            <div className="tab-bar-wrapper">
                <TabBar activeKey={activeKey} onChange={setActiveKey}>
                    {tabs.map(item => (
                        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
                    ))}
                </TabBar>
            </div>

            <TrainInfo
                visible={trainModalVisible}
                onClose={() => setTrainModalVisible(false)}
            />
        </div>
    )
}

export default Home