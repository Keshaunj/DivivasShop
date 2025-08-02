import React from 'react';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product, onAddToCart }) => {
  const { addToCart, loading } = useCart();

  const handleAddToCart = async () => {
    await addToCart(product, 1);
    // Call the original onAddToCart if provided (for backward compatibility)
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-w-1 aspect-h-1 w-full">
        <img
          src={product.image || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">${product.price}</span>
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 