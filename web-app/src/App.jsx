import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './pages/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        } 
      />
      {/* Redirect all other paths to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App

