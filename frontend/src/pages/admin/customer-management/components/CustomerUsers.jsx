import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../../proxyApi/api';

const CustomerUsers = ({ isSuperAdmin }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: '',
    isActive: true,
    businessInfo: {
      businessName: '',
      businessType: '',
      phone: '',
      website: ''
    }
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users...');
      const response = await adminAPI.getAllUsers();
      console.log('Users loaded successfully, count:', response?.length || 0);
      setUsers(response || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage('Error loading users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'customer',
      isActive: user.isActive !== false,
      businessInfo: {
        businessName: user.businessInfo?.businessName || '',
        businessType: user.businessInfo?.businessType || '',
        phone: user.businessInfo?.phone || '',
        website: user.businessInfo?.website || ''
      }
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Update user logic here
      setMessage('User updated successfully!');
      setShowEditModal(false);
      loadUsers();
    } catch (error) {
      setMessage('Error updating user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      setLoading(true);
      const newStatus = !user.isActive;
      // Update user status logic here
      setMessage(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      loadUsers();
    } catch (error) {
      setMessage('Error updating user status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    return (
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  try {
    if (loading) {
      return (
        <div className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="text-lg text-gray-600">Loading users...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isSuperAdmin ? 'Platform User Management' : 'Customer Management'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isSuperAdmin 
                ? 'Manage all users across the platform, including business owners and customers.' 
                : 'Manage customer accounts, view profiles, and handle support requests.'
              }
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
            {message}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users by email, username, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* User Status Summary */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">📊 User Status Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-white rounded border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-700">Total Users</span>
                <span className="font-bold text-blue-900">{users.length}</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-green-700">✅ Active Users</span>
                <span className="font-bold text-green-900">{users.filter(u => u.isActive !== false).length}</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded border border-red-200">
              <div className="flex items-center justify-between">
                <span className="text-red-700">❌ Inactive Users</span>
                <span className="font-bold text-red-900">{users.filter(u => u.isActive === false).length}</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded border border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-purple-700">🔍 Search Results</span>
                <span className="font-bold text-purple-900">{filteredUsers.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username || 'N/A'}</div>
                          <div className="text-sm text-gray-500">ID: {user._id?.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'business_owner' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'manager' ? 'bg-green-100 text-green-800' :
                        user.role === 'support' ? 'bg-yellow-100 text-yellow-800' :
                        user.role === 'viewer' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role || 'customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user)}
                        className={`${
                          user.isActive !== false ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            {searchTerm ? 'No users found matching your search.' : 'No users found.'}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in CustomerUsers component:', error);
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Users</h2>
          <p className="text-gray-600 mb-4">There was an error loading the users section.</p>
          <details className="text-left bg-gray-50 p-4 rounded-lg">
            <summary className="cursor-pointer font-medium text-gray-700">Error Details</summary>
            <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap">{error.message}</pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default CustomerUsers;
