import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../../proxyApi/api';

const CustomerAdminManagement = ({ isSuperAdmin }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [businessOwners, setBusinessOwners] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'business_owner',
    adminLevel: 'admin',
    permissions: [],
    businessInfo: {
      businessName: '',
      businessType: 'retail',
      businessDescription: ''
    }
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    role: '',
    adminLevel: '',
    permissions: [],
    isActive: true,
    businessInfo: {
      businessName: '',
      businessType: 'retail',
      businessDescription: ''
    }
  });

  // Promote form state
  const [promoteForm, setPromoteForm] = useState({
    role: 'business_owner',
    adminLevel: 'admin',
    businessInfo: {
      businessName: '',
      businessType: 'retail',
      businessDescription: ''
    }
  });

  // Permission templates
  const permissionTemplates = {
    super_admin: [
      { resource: 'platform', actions: ['read', 'create', 'update', 'delete', 'manage'] },
      { resource: 'business_owners', actions: ['read', 'create', 'update', 'delete', 'manage'] },
      { resource: 'admins', actions: ['read', 'create', 'update', 'delete', 'manage'] },
      { resource: 'customers', actions: ['read', 'create', 'update', 'delete', 'manage'] },
      { resource: 'analytics', actions: ['read', 'manage'] },
      { resource: 'settings', actions: ['read', 'create', 'update', 'delete', 'manage'] }
    ],
    business_owner: [
      { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
      { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
      { resource: 'orders', actions: ['read', 'update'] },
      { resource: 'customers', actions: ['read', 'update'] },
      { resource: 'analytics', actions: ['read'] },
      { resource: 'settings', actions: ['read', 'update'] },
      { resource: 'team_management', actions: ['read', 'create', 'update'] }
    ],
    manager: [
      { resource: 'products', actions: ['read', 'create', 'update'] },
      { resource: 'categories', actions: ['read', 'create'] },
      { resource: 'orders', actions: ['read', 'update'] },
      { resource: 'analytics', actions: ['read'] },
      { resource: 'inventory', actions: ['read', 'update'] }
    ],
    support: [
      { resource: 'orders', actions: ['read', 'update'] },
      { resource: 'customers', actions: ['read'] },
      { resource: 'analytics', actions: ['read'] }
    ],
    viewer: [
      { resource: 'products', actions: ['read'] },
      { resource: 'categories', actions: ['read'] },
      { resource: 'orders', actions: ['read'] },
      { resource: 'analytics', actions: ['read'] }
    ]
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadAllUsers();
    }
  }, [isSuperAdmin]);

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      
      // Load all user types
      const [customersRes, businessOwnersRes, adminsRes] = await Promise.all([
        adminAPI.getAllCustomers(),
        adminAPI.getAllBusinessOwners(),
        adminAPI.getAllAdmins()
      ]);

      setCustomers(customersRes || []);
      setBusinessOwners(businessOwnersRes || []);
      setAdmins(adminsRes || []);

      // Combine all users for unified view
      const allUsersCombined = [
        ...customers.map(user => ({ ...user, userType: 'customer', collection: 'Customer' })),
        ...businessOwners.map(user => ({ ...user, userType: 'business_owner', collection: 'BusinessOwner' })),
        ...admins.map(user => ({ ...user, userType: 'admin', collection: 'Admin' }))
      ];

      setAllUsers(allUsersCombined);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage('Error loading users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Set permissions based on role
      const permissions = permissionTemplates[inviteForm.role] || [];
      
      const inviteData = {
        ...inviteForm,
        permissions
      };

      await adminAPI.inviteAdmin(inviteData);
      setMessage('User invitation sent successfully!');
      setShowInviteModal(false);
      setInviteForm({
        email: '',
        firstName: '',
        lastName: '',
        role: 'business_owner',
        adminLevel: 'admin',
        permissions: [],
        businessInfo: {
          businessName: '',
          businessType: 'retail',
          businessDescription: ''
        }
      });
      loadAllUsers();
    } catch (error) {
      setMessage('Error sending invitation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Set permissions based on role
      const permissions = permissionTemplates[editForm.role] || [];
      
      const updateData = {
        ...editForm,
        permissions
      };

      await adminAPI.updateUser(selectedUser._id, updateData, selectedUser.collection);
      setMessage('User updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      loadAllUsers();
    } catch (error) {
      setMessage('Error updating user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Set permissions based on role
      const permissions = permissionTemplates[promoteForm.role] || [];
      
      const promoteData = {
        ...promoteForm,
        permissions
      };

      await adminAPI.promoteUser(selectedUser._id, promoteData, selectedUser.collection);
      setMessage(`User promoted to ${promoteForm.role} successfully!`);
      setShowPromoteModal(false);
      setSelectedUser(null);
      loadAllUsers();
    } catch (error) {
      setMessage('Error promoting user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, collection) => {
    if (window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      try {
        setLoading(true);
        await adminAPI.deleteUser(userId, collection);
        setMessage('User removed successfully!');
        loadAllUsers();
      } catch (error) {
        setMessage('Error removing user: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      setLoading(true);
      const newStatus = !user.isActive;
      await adminAPI.updateUserStatus(user._id, newStatus, user.collection);
      setMessage(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      loadAllUsers();
    } catch (error) {
      setMessage('Error updating user status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setInviteForm(prev => ({ ...prev, role }));
    setEditForm(prev => ({ ...prev, role }));
    setPromoteForm(prev => ({ ...prev, role }));
  };

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.businessInfo?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole || user.userType === filterRole;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? user.isActive !== false : user.isActive === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only Super Admins can access admin management.</p>
        </div>
      </div>
    );
  }

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
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage all users, promote customers to business owners, and manage admin roles.</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Invite New User
        </button>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          {message}
        </div>
      )}

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-blue-600 text-lg mb-1">👥</div>
          <div className="text-2xl font-bold text-blue-900">{allUsers.length}</div>
          <div className="text-sm text-blue-700">Total Users</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-green-600 text-lg mb-1">✅</div>
          <div className="text-2xl font-bold text-green-900">
            {allUsers.filter(u => u.isActive !== false).length}
          </div>
          <div className="text-sm text-green-700">Active Users</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-purple-600 text-lg mb-1">🏢</div>
          <div className="text-2xl font-bold text-purple-900">
            {businessOwners.length}
          </div>
          <div className="text-sm text-purple-700">Business Owners</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-orange-600 text-lg mb-1">👑</div>
          <div className="text-2xl font-bold text-orange-900">
            {admins.length}
          </div>
          <div className="text-sm text-orange-700">Admins</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-gray-600 text-lg mb-1">🛒</div>
          <div className="text-2xl font-bold text-gray-900">
            {customers.length}
          </div>
          <div className="text-sm text-gray-700">Customers</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name, email, role, or business name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="business_owner">Business Owners</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
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
                            {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.email
                          }
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.userType === 'customer' ? 'bg-gray-100 text-gray-800' :
                      user.userType === 'business_owner' ? 'bg-blue-100 text-blue-800' :
                      user.userType === 'admin' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.userType?.replace('_', ' ').toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'business_owner' ? 'bg-green-100 text-green-800' :
                      user.role === 'customer' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role || 'customer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.businessInfo?.businessName || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.businessInfo?.businessType || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Promote Button (for customers) */}
                    {user.userType === 'customer' && (
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setPromoteForm({
                            role: 'business_owner',
                            adminLevel: 'admin',
                            businessInfo: {
                              businessName: '',
                              businessType: 'retail',
                              businessDescription: ''
                            }
                          });
                          setShowPromoteModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Promote
                      </button>
                    )}
                    
                    {/* Edit Button */}
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setEditForm({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          role: user.role || user.userType || 'customer',
                          adminLevel: user.adminLevel || 'user',
                          permissions: user.permissions || [],
                          isActive: user.isActive !== false,
                          businessInfo: user.businessInfo || {
                            businessName: '',
                            businessType: 'retail',
                            businessDescription: ''
                          }
                        });
                        setShowEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    
                    {/* Status Toggle */}
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={`${
                        user.isActive !== false ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      } mr-3`}
                    >
                      {user.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    {/* Delete Button (except super admins) */}
                    {user.role !== 'super_admin' && (
                      <button 
                        onClick={() => handleDeleteUser(user._id, user.collection)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          {searchTerm || filterRole !== 'all' || filterStatus !== 'all' ? 'No users found matching your criteria.' : 'No users found.'}
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite New User</h3>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="business_owner">Business Owner</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Level</label>
                <select
                  value={inviteForm.adminLevel}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, adminLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {/* Business Info for Business Owners */}
              {inviteForm.role === 'business_owner' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={inviteForm.businessInfo.businessName}
                      onChange={(e) => setInviteForm(prev => ({ 
                        ...prev, 
                        businessInfo: { ...prev.businessInfo, businessName: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                    <select
                      value={inviteForm.businessInfo.businessType}
                      onChange={(e) => setInviteForm(prev => ({ 
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
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promote User Modal */}
      {showPromoteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Promote User</h3>
            <p className="text-gray-600 mb-4">
              Promoting <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ({selectedUser.email})
            </p>
            <form onSubmit={handlePromoteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Role</label>
                <select
                  value={promoteForm.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="business_owner">Business Owner</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Level</label>
                <select
                  value={promoteForm.adminLevel}
                  onChange={(e) => setPromoteForm(prev => ({ ...prev, adminLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {/* Business Info for Business Owners */}
              {promoteForm.role === 'business_owner' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={promoteForm.businessInfo.businessName}
                      onChange={(e) => setPromoteForm(prev => ({ 
                        ...prev, 
                        businessInfo: { ...prev.businessInfo, businessName: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                    <select
                      value={promoteForm.businessInfo.businessType}
                      onChange={(e) => setPromoteForm(prev => ({ 
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
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPromoteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Promoting...' : 'Promote User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="business_owner">Business Owner</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Level</label>
                <select
                  value={editForm.adminLevel}
                  onChange={(e) => setEditForm(prev => ({ ...prev, adminLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
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

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
};

export default CustomerAdminManagement;
