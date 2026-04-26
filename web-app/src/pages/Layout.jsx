import React, { useState, useEffect } from 'react'
import { 
  NavBar, 
  SearchBar, 
  TabBar, 
  PullToRefresh
} from 'antd-mobile'
import { 
  ShoppingCart, 
  LayoutGrid, 
  List as ListIcon, 
  User
} from 'lucide-react'
import { fetchLoyaltyBalance, fetchLoyaltyTransactions } from '../utils/loyaltyApi'
import LoyaltyClubSection from '../components/LoyaltyClubSection'
import Menu from './Menu'
import '../App.css'

function Layout() {
  const [activeKey, setActiveKey] = useState('home')
  const [loyaltyBalance, setLoyaltyBalance] = useState(null)
  const [loyaltyTransactions, setLoyaltyTransactions] = useState([])
  const [loyaltyLoading, setLoyaltyLoading] = useState(false)
  const [loyaltyError, setLoyaltyError] = useState('')
  const username = localStorage.getItem('username')

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

  useEffect(() => {
    if (activeKey === 'profile') loadLoyaltyData()
  }, [activeKey])

  const tabs = [
    { key: 'home', title: 'Home', icon: <LayoutGrid size={22} /> },
    { key: 'menu', title: 'Menu', icon: <ListIcon size={22} /> },
    { key: 'profile', title: 'Profile', icon: <User size={22} /> },
  ]

  return (
    <div className="app-container">
      <NavBar
        className="nav-bar"
        right={
          <div onClick={() => console.log('Cart clicked')}>
            <ShoppingCart size={24} color="#6F4E37" />
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
        {activeKey === 'menu' && (
          <Menu />
        )}

        {activeKey === 'profile' ? (
          <PullToRefresh onRefresh={loadLoyaltyData}>
            <div className="main-content">
              <LoyaltyClubSection
                balance={loyaltyBalance}
                transactions={loyaltyTransactions}
                loading={loyaltyLoading}
                error={loyaltyError || undefined}
                onRefresh={loadLoyaltyData}
                username={username}
              />
              <div style={{ height: 100 }} />
            </div>
          </PullToRefresh>
        ) : (
          <PullToRefresh onRefresh={async () => console.log('refresh')}>
            <div style={{ height: 100 }} />
          </PullToRefresh>
        )}
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

export default Layout
