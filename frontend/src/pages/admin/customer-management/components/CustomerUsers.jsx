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
      
      // Determine which collection the user belongs to
      let collection = 'Customer'; // Default
      if (selectedUser.role === 'admin' || selectedUser.isAdmin) {
        collection = 'Admin';
      } else if (selectedUser.role === 'business_owner') {
        collection = 'BusinessOwner';
      }
      
      // Prepare update data
      const updateData = {
        username: editForm.username,
        email: editForm.email,
        role: editForm.role,
        isActive: editForm.isActive,
        businessInfo: editForm.businessInfo
      };
      
      // Update user using the appropriate API
      await adminAPI.updateUser(selectedUser._id, updateData, collection);
      
      setMessage('User updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage('Error updating user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      setLoading(true);
      const newStatus = !user.isActive;
      
      // Determine which collection the user belongs to
      let collection = 'Customer'; // Default
      if (user.role === 'admin' || user.isAdmin) {
        collection = 'Admin';
      } else if (user.role === 'business_owner') {
        collection = 'BusinessOwner';
      }
      
      // Update user status using the appropriate API
      await adminAPI.updateUserStatus(user._id, newStatus, collection);
      
      setMessage(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      setMessage('Error updating user status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.username || user.email}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Determine which collection the user belongs to
      let collection = 'Customer'; // Default
      if (user.role === 'admin' || user.isAdmin) {
        collection = 'Admin';
      } else if (user.role === 'business_owner') {
        collection = 'BusinessOwner';
      }
      
      // Delete user using the appropriate API
      await adminAPI.deleteUser(user._id, collection);
      
      setMessage('User deleted successfully!');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage('Error deleting user: ' + error.message);
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
                        className={`mr-3 ${
                          user.isActive !== false ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
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

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="customer">Customer</option>
                    <option value="business_owner">Business Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>

                {/* Business Info Fields */}
                {(editForm.role === 'business_owner' || selectedUser.role === 'business_owner') && (
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700">Business Information</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                      <input
                        type="text"
                        value={editForm.businessInfo.businessName}
                        onChange={(e) => setEditForm(prev => ({ 
                          ...prev, 
                          businessInfo: { ...prev.businessInfo, businessName: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                      <select
                        value={editForm.businessInfo.businessType}
                        onChange={(e) => setEditForm(prev => ({ 
                          ...prev, 
                          businessInfo: { ...prev.businessInfo, businessType: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="retail">Retail</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="service">Service</option>
                        <option value="food_beverage">Food & Beverage</option>
                        <option value="health_beauty">Health & Beauty</option>
                        <option value="fashion">Fashion</option>
                        <option value="home_garden">Home & Garden</option>
                        <option value="electronics">Electronics</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={editForm.businessInfo.phone}
                        onChange={(e) => setEditForm(prev => ({ 
                          ...prev, 
                          businessInfo: { ...prev.businessInfo, phone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={editForm.businessInfo.website}
                        onChange={(e) => setEditForm(prev => ({ 
                          ...prev, 
                          businessInfo: { ...prev.businessInfo, website: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
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
