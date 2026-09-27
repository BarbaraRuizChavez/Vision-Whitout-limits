import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LiveAnnouncer from './components/LiveAnnouncer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TermsPage from './pages/TermsPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProfilePage from './pages/ProfilePage';

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timeoutId = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.focus?.({ preventScroll: true });
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

export default function App() {
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // Mensaje de bienvenida para lectores de pantalla al entrar al sitio.
  // La región aria-live debe existir vacía primero: si el texto ya viene
  // en el primer render, el lector de pantalla no lo detecta como "cambio"
  // y no lo anuncia. Por eso se llena en un useEffect, con un pequeño
  // retraso para no chocar con el anuncio inicial de la página del navegador.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setWelcomeMessage(
        'Bienvenido a Vision Without Limits. Bastón y lentes inteligentes para movilidad accesible.'
      );
    }, 600);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="app-container">
      <ScrollToHash />
      <div aria-live="polite" role="status" className="sr-only">
        {welcomeMessage}
      </div>
      <LiveAnnouncer />
      <Header />

      <main id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route
            path="/mis-pedidos"
            element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pedidos"
            element={
              <ProtectedRoute role="administrador">
                <AdminOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/productos"
            element={
              <ProtectedRoute role="administrador">
                <AdminProductsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}