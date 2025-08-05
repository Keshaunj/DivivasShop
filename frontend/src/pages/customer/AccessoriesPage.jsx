import React, { useState, useEffect } from 'react';
import ProductGrid from '../../components/ProductGrid';
import CartModal from '../../components/CartModal';

const AccessoriesPage = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock accessories data - replace with API call
  useEffect(() => {
    const mockAccessories = [
      {
        _id: 'a1',
        name: 'Glass Candle Holder',
        description: 'Elegant glass holder for tea lights',
        price: 15.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'a2',
        name: 'Candle Snuffer',
        description: 'Brass candle snuffer for safe extinguishing',
        price: 12.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'a3',
        name: 'Decorative Matches',
        description: 'Long wooden matches with holder',
        price: 8.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'a4',
        name: 'Candle Wick Trimmer',
        description: 'Professional wick trimming tool',
        price: 18.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'a5',
        name: 'Candle Warmer',
        description: 'Electric candle warmer plate',
        price: 29.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'a6',
        name: 'Candle Stand',
        description: 'Metal candle stand for pillar candles',
        price: 22.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'a7',
        name: 'Candle Lighter',
        description: 'Long-reach butane lighter',
        price: 14.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'a8',
        name: 'Candle Storage Box',
        description: 'Wooden storage box for candles',
        price: 34.99,
        image: '/placeholder-product.jpg'
      }
    ];
    
    setProducts(mockAccessories);
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
          <h1 className="text-3xl font-bold text-gray-900">Accessories</h1>
          <p className="text-gray-600 mt-2">Essential accessories for your candle experience</p>
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

export default AccessoriesPage; 