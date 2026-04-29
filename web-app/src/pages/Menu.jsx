import React, { useState, useEffect } from 'react'
import { MenuPage } from './MenuPage'
import { MenuDetailPage } from './MenuDetailPage'
import { CartPage } from './CartPage'
import { PullToRefresh } from 'antd-mobile'
import '../App.css'

function Menu({ initialPage = 'menu', onCartOpen, cartClickTrigger }) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [selectedMenu, setSelectedMenu] = useState(null)

  useEffect(() => {
    // Update currentPage when initialPage changes
    setCurrentPage(initialPage)
    if (initialPage === 'cart') {
      setSelectedMenu(null)  // Clear selected menu when opening cart
    }
  }, [initialPage, cartClickTrigger])  // Add cartClickTrigger to dependency array

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
  )
}

export default Menu
