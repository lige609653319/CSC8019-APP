import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Orders from './pages/Orders'
import './App.css'

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const isAuthenticated = token && token.trim() !== '' && token !== 'null' && token !== 'undefined';
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const isAuthenticated = token && token.trim() !== '' && token !== 'null' && token !== 'undefined';
    return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            <Route
                path="/orders"
                element={
                    <PrivateRoute>
                        <Orders />
                    </PrivateRoute>
                }
            />

            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Home />
                    </PrivateRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

export default App
