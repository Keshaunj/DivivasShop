import React, { useState, useEffect } from 'react';
import ProductGrid from '../../components/ProductGrid';
import CartModal from '../../components/CartModal';

const CandlesPage = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock candle data - replace with API call
  useEffect(() => {
    const mockCandles = [
      {
        _id: 'c1',
        name: 'Lavender Dream Candle',
        description: 'Soothing lavender for relaxation',
        price: 24.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'c2',
        name: 'Vanilla Comfort Candle',
        description: 'Warm vanilla for cozy evenings',
        price: 19.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'c3',
        name: 'Cinnamon Spice Candle',
        description: 'Spicy cinnamon for energy',
        price: 22.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'c4',
        name: 'Ocean Breeze Candle',
        description: 'Fresh ocean for clarity',
        price: 26.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'c5',
        name: 'Rose Romance Candle',
        description: 'Romantic rose for love',
        price: 28.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'c6',
        name: 'Pine Forest Candle',
        description: 'Natural pine for grounding',
        price: 21.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'c7',
        name: 'Citrus Sunrise Candle',
        description: 'Refreshing citrus for mornings',
        price: 23.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'c8',
        name: 'Sage Purification Candle',
        description: 'Purifying sage for cleansing',
        price: 25.99,
        image: '/placeholder-product.jpg'
      }
    ];
    
    setProducts(mockCandles);
    setLoading(false);
  }, []);

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item._id === product._id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item._id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item._id !== productId));
    } else {
      setCartItems(cartItems.map(item => 
        item._id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const handleRemoveItem = (productId) => {
    setCartItems(cartItems.filter(item => item._id !== productId));
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout...');
    setIsCartOpen(false);
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
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Candles</h1>
          <p className="text-gray-600 mt-2">Discover our collection of handcrafted candles</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProductGrid products={products} onAddToCart={handleAddToCart} />
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default CandlesPage; 