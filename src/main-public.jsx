import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { NotificationProvider } from './contexts/NotificationContext'
import PublicLayout from './components/layout/PublicLayout'
import Home from './pages/public/Home'
import Shop from './pages/public/Shop'
import ProductDetail from './pages/public/ProductDetail'
import CustomOrder from './pages/public/CustomOrder'
import Cart from './pages/public/Cart'
import Checkout from './pages/public/Checkout'
import OrderSuccess from './pages/public/OrderSuccess'
import About from './pages/public/About'
import Testimonials from './pages/public/Testimonials'
import Contact from './pages/public/Contact'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import CustomerDashboard from './pages/public/CustomerDashboard'
import FAQ from './pages/public/FAQ'
import Shipping from './pages/public/Shipping'
import Returns from './pages/public/Returns'
import Privacy from './pages/public/Privacy'
import Terms from './pages/public/Terms'
import NotFound from './pages/public/NotFound'
import { initEmailJS } from './utils/emailService.js'
import './index.css'

initEmailJS()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
                <Route path="/shop/:category" element={<PublicLayout><Shop /></PublicLayout>} />
                <Route path="/product/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
                <Route path="/custom-order" element={<PublicLayout><CustomOrder /></PublicLayout>} />
                <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
                <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
                <Route path="/order-success" element={<PublicLayout><OrderSuccess /></PublicLayout>} />
                <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                <Route path="/testimonials" element={<PublicLayout><Testimonials /></PublicLayout>} />
                <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
                <Route path="/dashboard" element={<PublicLayout><CustomerDashboard /></PublicLayout>} />
                <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
                <Route path="/shipping" element={<PublicLayout><Shipping /></PublicLayout>} />
                <Route path="/returns" element={<PublicLayout><Returns /></PublicLayout>} />
                <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
                <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
                <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </HelmetProvider>
  </React.StrictMode>
)
