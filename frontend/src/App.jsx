import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { BusinessOwnerNotificationProvider } from './contexts/business-owner/BusinessOwnerNotificationContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/customer/Dashboard';
import ShopPage from './pages/customer/ShopPage';
import CandlesPage from './pages/customer/CandlesPage';
import AccessoriesPage from './pages/customer/AccessoriesPage';
import GiftSetsPage from './pages/customer/GiftSetsPage';
import CartPage from './pages/customer/CartPage';
import ProfilePage from './pages/customer/ProfilePage';
import CorporatePortal from './pages/admin/corporate-portal';
import AdminDashboard from './pages/admin/AdminDashboard';
import SuperAdminPanel from './pages/admin/SuperAdminPanel';
import Footer from './components/Footer';
import BusinessOwnerNotificationModal from './components/business-owner/BusinessOwnerNotificationModal';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BusinessOwnerNotificationProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/candles" element={<CandlesPage />} />
                  <Route path="/accessories" element={<AccessoriesPage />} />
                  <Route path="/gift-sets" element={<GiftSetsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/corporate" element={<CorporatePortal />} />
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/super-admin" element={
                    <ProtectedRoute requireSuperAdmin={true}>
                      <SuperAdminPanel />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
              <BusinessOwnerNotificationModal />
            </div>
          </Router>
        </BusinessOwnerNotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}
