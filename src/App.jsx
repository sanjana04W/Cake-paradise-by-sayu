import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';

// Public Pages
import Home from './pages/public/Home';
import Shop from './pages/public/Shop';
import ProductDetail from './pages/public/ProductDetail';
import CustomOrder from './pages/public/CustomOrder';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import OrderSuccess from './pages/public/OrderSuccess';
import About from './pages/public/About';
import Testimonials from './pages/public/Testimonials';
import Contact from './pages/public/Contact';
import NotFound from './pages/public/NotFound';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import CustomerDashboard from './pages/public/CustomerDashboard';
import FAQ from './pages/public/FAQ';
import Shipping from './pages/public/Shipping';
import Returns from './pages/public/Returns';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';

import AdminLayout from './components/admin/AdminLayout';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Inventory from './pages/admin/Inventory';
import Customers from './pages/admin/Customers';
import Media from './pages/admin/Media';
import Promotions from './pages/admin/Promotions';
import Settings from './pages/admin/Settings';
import Messages from './pages/admin/Messages';

function App() {
  return (
    <HelmetProvider>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
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
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="inquiries" element={<Customers />} />
                  <Route path="media" element={<Media />} />
                  <Route path="promotions" element={<Promotions />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="messages" element={<Messages />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </HelmetProvider>
  );
}

export default App;
