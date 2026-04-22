import React, { useState } from 'react'
import { CartProvider } from '../shared/context/CartContext'
import { MenuPage } from '../features/menu/pages/MenuPage'
import { MenuDetailPage } from '../features/menu/pages/MenuDetailPage'
import { CartPage } from '../features/menu/pages/CartPage'
import { PullToRefresh } from 'antd-mobile'
import '../App.css'

function Menu() {
  const [currentPage, setCurrentPage] = useState('menu')
  const [selectedMenu, setSelectedMenu] = useState(null)

  const handleSelectMenu = (menu) => {
    setSelectedMenu(menu)
    setCurrentPage('detail')
  }

  const handleBackFromDetail = () => {
    setCurrentPage('menu')
    setSelectedMenu(null)
  }

  const handleBackFromCart = () => {
    setCurrentPage('menu')
  }

  const handleOpenCart = () => {
    setCurrentPage('cart')
  }

  return (
    <CartProvider>
      <PullToRefresh onRefresh={async () => console.log('refresh')}>
        <div className="main-content">
          {currentPage === 'menu' && (
            <MenuPage onSelectMenu={handleSelectMenu} onOpenCart={handleOpenCart} />
          )}
          {currentPage === 'detail' && selectedMenu && (
            <MenuDetailPage menu={selectedMenu} onBack={handleBackFromDetail} />
          )}
          {currentPage === 'cart' && (
            <CartPage onBack={handleBackFromCart} />
          )}
          <div style={{ height: 100 }} />
        </div>
      </PullToRefresh>
    </CartProvider>
  )
}

export default Menu
