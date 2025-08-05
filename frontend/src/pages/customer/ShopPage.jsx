import React from 'react';
import { useNavigate } from 'react-router-dom';

const ShopPage = () => {
  const navigate = useNavigate();
  
  const categories = [
    {
      id: 'candles',
      name: 'Candles',
      description: 'Handcrafted candles in various scents and sizes',
      image: '/placeholder-candles.jpg',
      color: 'from-pink-400 to-purple-500'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      description: 'Essential candle accessories and tools',
      image: '/placeholder-accessories.jpg',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'gift-sets',
      name: 'Gift Sets',
      description: 'Perfect gift combinations for any occasion',
      image: '/placeholder-gifts.jpg',
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 'new-arrivals',
      name: 'New Arrivals',
      description: 'Latest additions to our collection',
      image: '/placeholder-new.jpg',
      color: 'from-orange-400 to-red-500'
    }
  ];

  const handleCategoryClick = (categoryId) => {
    switch(categoryId) {
      case 'candles':
        navigate('/candles');
        break;
      case 'accessories':
        navigate('/accessories');
        break;
      case 'gift-sets':
        navigate('/gift-sets');
        break;
      case 'new-arrivals':
        navigate('/candles'); // For now, redirect to candles since we don't have a new arrivals page
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop Our Collection</h1>
          <p className="text-xl text-gray-600">Choose a category to explore our products</p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                {/* Background Image */}
                <div className="aspect-w-16 aspect-h-9 bg-gradient-to-r from-gray-200 to-gray-300 h-64">
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-80`}></div>
                  
                  {/* Placeholder for actual image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <h2 className="text-3xl font-bold mb-2 group-hover:text-yellow-300 transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-lg opacity-90 group-hover:opacity-100 transition-opacity">
                      {category.description}
                    </p>
                    <div className="mt-4">
                      <span className="inline-block bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium group-hover:bg-opacity-30 transition-all">
                        Explore {category.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopPage; 