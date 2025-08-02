import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { BusinessOwnerNotificationProvider } from './contexts/business-owner/BusinessOwnerNotificationContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ShopPage from './pages/ShopPage';
import CandlesPage from './pages/CandlesPage';
import AccessoriesPage from './pages/AccessoriesPage';
import GiftSetsPage from './pages/GiftSetsPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
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
                  <Route path="/admin" element={<AdminDashboard />} />
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