import React from 'react';

const CustomerCategories = ({ isSuperAdmin }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Category Management</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Add New Category
        </button>
      </div>
      <p className="text-gray-600 mb-4">Organize your products into categories for better navigation.</p>
      <div className="text-center text-gray-500 py-8">
        Category management functionality coming soon...
      </div>
    </div>
  );
};

export default CustomerCategories;
