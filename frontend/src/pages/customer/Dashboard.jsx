import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import ProductGrid from '../../components/ProductGrid';
import CartModal from '../../components/CartModal';
import { productsAPI, handleAPIError } from '../../proxyApi/api';

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
            Welcome to Divias Candle Shop
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

      {/* Placeholder Products Section */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Quick Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder Product 1 */}
            <div className="bg-black rounded-lg p-6 text-white text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold mb-2">Lavender Dreams</h3>
              <p className="text-gray-300 text-sm mb-3">Relaxing evening scent</p>
              <p className="text-xl font-bold">$24.99</p>
            </div>

            {/* Placeholder Product 2 */}
            <div className="bg-black rounded-lg p-6 text-white text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold mb-2">Vanilla Sunset</h3>
              <p className="text-gray-300 text-sm mb-3">Warm comfort aroma</p>
              <p className="text-xl font-bold">$19.99</p>
            </div>

            {/* Placeholder Product 3 */}
            <div className="bg-black rounded-lg p-6 text-white text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold mb-2">Ocean Breeze</h3>
              <p className="text-gray-300 text-sm mb-3">Fresh coastal vibes</p>
              <p className="text-xl font-bold">$26.99</p>
            </div>

            {/* Placeholder Product 4 */}
            <div className="bg-black rounded-lg p-6 text-white text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold mb-2">Cinnamon Spice</h3>
              <p className="text-gray-300 text-sm mb-3">Holiday warmth</p>
              <p className="text-xl font-bold">$22.99</p>
            </div>
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