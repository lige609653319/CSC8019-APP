import React, { useState } from 'react'
import { CartProvider } from './shared/context/CartContext'
import { MenuPage } from './features/menu/pages/MenuPage'
import { MenuDetailPage } from './features/menu/pages/MenuDetailPage'
import { CartPage } from './features/menu/pages/CartPage'
import './App.css'

function App() {
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
      <div className="app-container">
        {currentPage === 'menu' && (
          <MenuPage onSelectMenu={handleSelectMenu} onOpenCart={handleOpenCart} />
        )}
        {currentPage === 'detail' && selectedMenu && (
          <MenuDetailPage menu={selectedMenu} onBack={handleBackFromDetail} />
        )}
        {currentPage === 'cart' && (
          <CartPage onBack={handleBackFromCart} />
        )}
      </div>
    </CartProvider>
  )
}

export default App
