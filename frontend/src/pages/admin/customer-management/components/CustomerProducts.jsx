import React from 'react';

const CustomerProducts = ({ isSuperAdmin }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Product Management</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Add New Product
        </button>
      </div>
      <p className="text-gray-600 mb-4">Manage your products, add images, and update descriptions.</p>
      <div className="text-center text-gray-500 py-8">
        Product management functionality coming soon...
      </div>
    </div>
  );
};

export default CustomerProducts;
