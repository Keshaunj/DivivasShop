import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <img 
        src={product.image || '/placeholder-product.jpg'} 
        alt={product.name} 
        className="w-full h-48 object-cover rounded mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-2">{product.description}</p>
      <p className="text-xl font-bold text-gray-900 mb-4">${product.price}</p>
      <button 
        onClick={() => onAddToCart(product)}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard; 