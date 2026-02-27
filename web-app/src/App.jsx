import React, { useState } from 'react'
import { 
  NavBar, 
  SearchBar, 
  Card, 
  Button, 
  Badge, 
  Space, 
  Image, 
  TabBar, 
  Tag,
  List,
  PullToRefresh
} from 'antd-mobile'
import { 
  ShoppingCart, 
  LayoutGrid, 
  List as ListIcon, 
  User 
} from 'lucide-react'
import './App.css'

const COFFEE_DATA = [
  { id: 1, name: 'Americano', price: 4.00, image: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&w=200&q=80', description: 'Freshly brewed espresso with hot water.' },
  { id: 2, name: 'Latte', price: 5.50, image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=200&q=80', description: 'Espresso with steamed milk and a light layer of foam.' },
  { id: 3, name: 'Cappuccino', price: 5.25, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=200&q=80', description: 'Equal parts of espresso, steamed milk, and milk foam.' },
  { id: 4, name: 'Mocha', price: 6.00, image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&w=200&q=80', description: 'Espresso mixed with chocolate and steamed milk.' },
  { id: 5, name: 'Flat White', price: 5.75, image: 'https://images.unsplash.com/photo-1512568433530-5531d9577af5?auto=format&fit=crop&w=200&q=80', description: 'Espresso with micro-foamed milk.' },
]

function App() {
  const [cartCount, setCartCount] = useState(0)
  const [activeKey, setActiveKey] = useState('home')

  const addToCart = (e) => {
    e.stopPropagation()
    setCartCount(prev => prev + 1)
  }

  const tabs = [
    { key: 'home', title: 'Home', icon: <LayoutGrid size={22} /> },
    { key: 'menu', title: 'Menu', icon: <ListIcon size={22} /> },
    { key: 'me', title: 'Me', icon: <User size={22} /> },
  ]

  return (
    <div className="app-container">
      <NavBar
        className="nav-bar"
        right={
          <div onClick={() => console.log('Cart clicked')}>
            <Badge content={cartCount > 0 ? cartCount : null}>
              <ShoppingCart size={24} color="#6F4E37" />
            </Badge>
          </div>
        }
        back={null}
      >
        <span style={{ fontWeight: 'bold', color: '#6F4E37' }}>Coffee Client</span>
      </NavBar>

      <div className="search-wrapper">
        <SearchBar placeholder='Search for coffee...' showCancelButton />
      </div>

      <div className="content-scroll">
        <PullToRefresh onRefresh={async () => console.log('refresh')}>
          <div className="main-content">
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
                <Button color="primary" size="small" shape="rounded">Order Now</Button>
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
                        size='mini' 
                        color='primary' 
                        fill='solid' 
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
            <div style={{ height: 100 }} />
          </div>
        </PullToRefresh>
      </div>

      <div className="tab-bar-wrapper">
        <TabBar activeKey={activeKey} onChange={setActiveKey}>
          {tabs.map(item => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </div>
  )
}

export default App
