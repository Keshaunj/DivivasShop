import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../../proxyApi/api';

const CustomerOverview = ({ isSuperAdmin, onSectionChange }) => {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await adminAPI.getDashboardStats();
      
      if (data && data.stats) {
        setStats(data.stats);
      } else {
        // Fallback data structure based on your actual API response
        setStats({
          totalProducts: data?.totalProducts || 0,
          totalOrders: data?.totalOrders || 0,
          totalUsers: data?.platformUsers || 0, // Use platformUsers for total users
          totalRevenue: data?.totalRevenue || 0,
          platformUsers: data?.platformUsers || 0,
          platformRevenue: data?.platformRevenue || 0,
          totalBusinesses: data?.totalBusinesses || 0,
          totalAdmins: data?.totalAdmins || 0
        });
      }
      
      if (data && data.recentOrders) {
        setRecentOrders(data.recentOrders);
      } else {
        setRecentOrders([]);
      }
      
      if (data && data.lowStockProducts) {
        setLowStockProducts(data.lowStockProducts);
      } else {
        setLowStockProducts([]);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message);
      
      // Set fallback data on error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        platformUsers: 0,
        platformRevenue: 0,
        totalBusinesses: 0,
        totalAdmins: 0
      });
      setRecentOrders([]);
      setLowStockProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">There was an error loading the dashboard data.</p>
          <details className="text-left bg-gray-50 p-4 rounded-lg">
            <summary className="cursor-pointer font-medium text-gray-700">Error Details</summary>
            <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap">{error}</pre>
          </details>
          <button
            onClick={fetchDashboardStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry Loading Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {isSuperAdmin ? 'Platform Overview' : 'Business Overview'}
      </h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Products */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="text-2xl">🕯️</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-blue-900">
                {stats.totalProducts || 0}
              </div>
              <div className="text-sm text-blue-700">Total Products</div>
            </div>
          </div>
        </div>
        
        {/* Orders */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="text-2xl">📦</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-green-900">
                {stats.totalOrders || 0}
              </div>
              <div className="text-sm text-green-700">Total Orders</div>
            </div>
          </div>
        </div>
        
        {/* Users - Show platformUsers for total count */}
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="text-2xl">👥</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-purple-900">
                {stats.platformUsers || stats.totalUsers || 0}
              </div>
              <div className="text-sm text-purple-700">Total Users</div>
              <div className="text-xs text-purple-600">
                {isSuperAdmin ? 'All platform users' : 'Business users'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Revenue */}
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <div className="text-2xl">💰</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-orange-900">
                ${stats.platformRevenue || stats.totalRevenue || '0.00'}
              </div>
              <div className="text-sm text-orange-700">
                {isSuperAdmin ? 'Platform Revenue' : 'Total Revenue'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats for Super Admin */}
      {isSuperAdmin && (stats.totalBusinesses || stats.totalAdmins) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Businesses */}
          {stats.totalBusinesses > 0 && (
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
              <div className="flex items-center">
                <div className="text-2xl">🏢</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-indigo-900">
                    {stats.totalBusinesses}
                  </div>
                  <div className="text-sm text-indigo-700">Active Businesses</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Admins */}
          {stats.totalAdmins > 0 && (
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <div className="flex items-center">
                <div className="text-2xl">👑</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-red-900">
                    {stats.totalAdmins}
                  </div>
                  <div className="text-sm text-red-700">Total Admins</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions - Clickable Buttons */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Users Management Button */}
          <button 
            onClick={() => onSectionChange('users')}
            className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left group"
          >
            <div className="text-purple-600 text-lg mb-2 group-hover:scale-110 transition-transform">👥</div>
            <div className="font-medium text-gray-900">
              {isSuperAdmin ? 'Platform Users' : 'Customer Users'}
            </div>
            <div className="text-sm text-gray-500">
              {isSuperAdmin 
                ? 'View all customers across all businesses' 
                : 'Manage customer accounts and profiles'
              }
            </div>
            <div className="text-xs text-purple-500 mt-2 group-hover:text-purple-600">
              👆 Click to manage users
            </div>
          </button>
          
          {/* Orders Management Button */}
          <button 
            onClick={() => onSectionChange('orders')}
            className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left group"
          >
            <div className="text-green-600 text-lg mb-2 group-hover:scale-110 transition-transform">📦</div>
            <div className="font-medium text-gray-900">View Orders</div>
            <div className="text-sm text-gray-500">Track customer orders and status</div>
            <div className="text-xs text-green-500 mt-2 group-hover:text-green-600">
              👆 Click to view orders
            </div>
          </button>
          
          {/* Products Management Button */}
          <button 
            onClick={() => onSectionChange('products')}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left group"
          >
            <div className="text-blue-600 text-lg mb-2 group-hover:scale-110 transition-transform">🕯️</div>
            <div className="font-medium text-gray-900">Manage Products</div>
            <div className="text-sm text-gray-500">Add, edit, and organize products</div>
            <div className="text-xs text-blue-500 mt-2 group-hover:text-blue-600">
              👆 Click to manage products
            </div>
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      {recentOrders && recentOrders.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isSuperAdmin ? 'Recent Platform Orders' : 'Recent Business Orders'}
          </h3>
          {isSuperAdmin && (
            <p className="text-sm text-gray-600 mb-4">
              💡 Showing recent orders from all businesses across the platform
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{order._id?.slice(-8) || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt || order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.customerEmail || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">${(order.total || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-600 text-center">No recent orders to display.</p>
        </div>
      )}

      {/* Low Stock Products */}
      {lowStockProducts && lowStockProducts.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">🕯️</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category || 'Uncategorized'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        (product.stock || 0) <= 5 ? 'bg-red-100 text-red-800' :
                        (product.stock || 0) <= 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(product.price || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-600 text-center">No low stock products to display.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerOverview;
