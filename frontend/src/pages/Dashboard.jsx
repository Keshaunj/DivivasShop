import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import ProductGrid from '../components/ProductGrid';
import CartModal from '../components/CartModal';
import { productsAPI, handleAPIError } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch products from backend
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const productsData = await productsAPI.getAllProducts();
      setProducts(productsData);
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      // Fallback to mock data if API fails
      setProducts([
        {
          _id: '1',
          name: 'Lavender Candle',
          description: 'Relaxing lavender scent',
          price: 24.99,
          image: '/placeholder-product.jpg'
        },
        {
          _id: '2',
          name: 'Vanilla Candle',
          description: 'Warm vanilla aroma',
          price: 19.99,
          image: '/placeholder-product.jpg'
        },
        {
          _id: '3',
          name: 'Cinnamon Candle',
          description: 'Spicy cinnamon fragrance',
          price: 22.99,
          image: '/placeholder-product.jpg'
        },
        {
          _id: '4',
          name: 'Ocean Breeze Candle',
          description: 'Fresh ocean scent',
          price: 26.99,
          image: '/placeholder-product.jpg'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
    setIsCartOpen(true);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Divias Wicka Shop
          </h1>
          <p className="text-xl mb-8">
            Discover our handcrafted candles and accessories
          </p>
          <button 
            onClick={() => navigate('/shop')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* New User Call-to-Action */}
      <div className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              New to Divias Wicka Shop?
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Create a free account to save your favorite candles, track your orders, and get exclusive offers!
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => navigate('/shop')}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Browse Without Account
              </button>
              <button 
                onClick={() => {
                  // This would trigger the sign up modal
                  // For now, we'll navigate to a signup page or show modal
                  console.log('Open signup modal');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Create Free Account
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              ✓ No credit card required • ✓ Free shipping on orders over $50 • ✓ Easy returns
            </p>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
        {error && (
          <div className="text-center text-red-600 mb-4">
            {error}
          </div>
        )}
        <ProductGrid products={products} onAddToCart={handleAddToCart} />
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Dashboard; 