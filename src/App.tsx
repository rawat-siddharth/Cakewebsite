import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { StoreProvider } from './context/StoreContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ScrollToTop } from './components/ScrollToTop';
import { StorefrontLayout } from './components/StorefrontLayout';

// Customer Storefront Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Contact } from './pages/Contact';

// Admin Pages & Protected Shell
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminDelivery } from './pages/admin/AdminDelivery';
import { AdminSettings } from './pages/admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <StoreProvider>
          <CartProvider>
            <ScrollToTop />
            <Routes>
              {/* PUBLIC STOREFRONT ROUTES (with Boutique Header/Footer) */}
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/contact" element={<Contact />} />
              </Route>

              {/* ADMIN AUTHENTICATION */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* ADMIN DASHBOARD (Protected by Supabase Auth & Role) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminProducts />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminCategories />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminOrders />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/delivery"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminDelivery />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminSettings />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </StoreProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
