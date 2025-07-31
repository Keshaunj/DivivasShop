import React, { useState, useEffect } from 'react';
import ProductGrid from '../components/ProductGrid';
import CartModal from '../components/CartModal';

const GiftSetsPage = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock gift sets data - replace with API call
  useEffect(() => {
    const mockGiftSets = [
      {
        _id: 'g1',
        name: 'Relaxation Gift Set',
        description: 'Lavender candle + holder + matches',
        price: 39.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'g2',
        name: 'Romance Gift Set',
        description: 'Rose candle + glass holder + lighter',
        price: 44.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'g3',
        name: 'Holiday Gift Set',
        description: 'Cinnamon candle + stand + snuffer',
        price: 49.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'g4',
        name: 'Ocean Breeze Set',
        description: 'Ocean candle + warmer + wick trimmer',
        price: 54.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'g5',
        name: 'Vanilla Comfort Set',
        description: 'Vanilla candle + storage box + accessories',
        price: 59.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'g6',
        name: 'Citrus Morning Set',
        description: 'Citrus candle + holder + matches',
        price: 42.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'g7',
        name: 'Sage Purification Set',
        description: 'Sage candle + snuffer + storage',
        price: 47.99,
        image: '/placeholder-product.jpg'
      },
      {
        _id: 'g8',
        name: 'Pine Forest Set',
        description: 'Pine candle + stand + warmer',
        price: 52.99,
        image: '/placeholder-product.jpg'
      }
    ];
    
    setProducts(mockGiftSets);
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
          <h1 className="text-3xl font-bold text-gray-900">Gift Sets</h1>
          <p className="text-gray-600 mt-2">Perfect gift combinations for any occasion</p>
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

export default GiftSetsPage; 