import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';

/* Inner layout that has access to useLocation */
function AppLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/' && !location.search;
  const isCheckoutPage = location.pathname === '/checkout';

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      {/* Global Dark Toaster Notification */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#14172a',
            color: '#fff',
            border: '1px solid #232845',
            borderRadius: '16px',
            fontSize: '13px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#c9a84c',
              secondary: '#0b0c16',
            },
          },
          error: {
            iconTheme: {
              primary: '#e94560',
              secondary: '#0b0c16',
            },
          },
        }}
      />

      {/* Navigation Header — hidden on dedicated checkout page */}
      {!isCheckoutPage && <Navbar />}

      {/* Main Content Viewport
          On homepage the hero goes behind the navbar (no top padding).
          On all other pages we add padding-top so content isn't hidden. */}
      <main className={`flex-1 ${isCheckoutPage ? '' : isHomePage ? '' : 'pt-20'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/category/:slug" element={<ShopPage />} />
          <Route path="/men" element={<ShopPage initialCategory="Men" />} />
          <Route path="/women" element={<ShopPage initialCategory="Women" />} />
          <Route path="/unisex" element={<ShopPage initialCategory="Unisex" />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="py-24 text-center space-y-4">
                <h2 className="text-4xl font-black text-[#e94560]">404</h2>
                <p className="text-sm text-gray-400">Page not found on the island.</p>
                <a
                  href="/"
                  className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white text-xs font-semibold"
                >
                  Return Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Footer — hidden on dedicated checkout page */}
      {!isCheckoutPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppLayout />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
