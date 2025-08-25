import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../proxyApi/api';

const SuperAdminPanel = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalBusinesses: 0,
    platformRevenue: 0
  });
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  // Check if user is super admin
  const isSuperAdmin = user?.role === 'admin' && user?.isAdmin;

  useEffect(() => {
    if (isSuperAdmin) {
      loadData();
    }
  }, [isSuperAdmin]);

  const loadData = async () => {
    try {
      console.log('Loading data...');
      
      // Try to load users first
      const usersData = await adminAPI.getAllUsers();
      setUsers(usersData || []);
      
      // Set basic stats from users data
      const basicStats = {
        totalUsers: usersData?.length || 0,
        totalAdmins: usersData?.filter(u => u.role === 'admin' || u.isAdmin)?.length || 0,
        totalProducts: 0,
        totalOrders: 0,
        totalBusinesses: usersData?.filter(u => u.role === 'admin')?.length || 0,
        platformRevenue: 0
      };
      setStats(basicStats);
      
      // Try to load dashboard stats
      try {
        const statsData = await adminAPI.getDashboardStats();
        if (statsData?.stats) {
          setStats({
            totalUsers: statsData.stats.platformUsers || statsData.stats.totalUsers || basicStats.totalUsers,
            totalAdmins: statsData.stats.totalAdmins || basicStats.totalAdmins,
            totalProducts: statsData.stats.totalProducts || 0,
            totalOrders: statsData.stats.totalOrders || 0,
            totalBusinesses: statsData.stats.totalBusinesses || basicStats.totalBusinesses,
            platformRevenue: statsData.stats.platformRevenue || statsData.stats.totalRevenue || 0
          });
        }
      } catch (statsError) {
        console.log('Stats failed, using basic stats:', statsError.message);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading data: ' + error.message);
    }
  };

  if (!isAuthenticated || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Super Admin access required.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const superAdminSections = [
    {
      id: 'overview',
      name: 'Platform Overview',
      icon: 'Chart',
      description: 'System-wide statistics and health'
    },
    {
      id: 'user-management',
      name: 'User Management',
      icon: 'Users',
      description: 'Manage all users and admins'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <PlatformOverview stats={stats} />;
      case 'user-management':
        return <UserManagement users={users} message={message} setMessage={setMessage} onRefresh={loadData} />;
      default:
        return <PlatformOverview stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">🚀 Super Admin Panel</h1>
              <span className="ml-3 px-2 py-1 bg-red-500 text-xs rounded-full">Developer Access</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                Super Admin: {user?.username || user?.email}
              </span>
              <button
                onClick={() => navigate('/admin')}
                className="px-3 py-1 bg-white text-red-600 rounded-md hover:bg-gray-100 transition-colors text-sm"
              >
                Admin Panel
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-3 py-1 text-white hover:text-gray-200 transition-colors text-sm"
              >
                ← Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {superAdminSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{section.icon}</span>
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-sm text-gray-500">{section.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Platform Overview Component
const PlatformOverview = ({ stats }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Overview</h2>
      
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="text-2xl">Users</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
              <div className="text-sm text-blue-600">Total Users</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="text-2xl">Admin</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-purple-900">{stats.totalAdmins}</div>
              <div className="text-sm text-purple-600">Total Admins</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="text-2xl">Business</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-green-900">{stats.totalBusinesses}</div>
              <div className="text-sm text-green-600">Total Businesses</div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <div className="text-2xl">💰</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-yellow-900">${stats.platformRevenue}</div>
              <div className="text-sm text-yellow-600">Platform Revenue</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = ({ users, message, setMessage, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
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
      businessAddress: '',
      phone: '',
      website: ''
    }
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'user',
      isActive: user.isActive !== false,
      businessInfo: {
        businessName: user.businessInfo?.businessName || '',
        businessType: user.businessInfo?.businessType || '',
        businessAddress: user.businessInfo?.businessAddress || '',
        phone: user.businessInfo?.phone || '',
        website: user.businessInfo?.website || ''
      }
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      // Update user role
      if (editForm.role !== selectedUser.role) {
        await adminAPI.updateUserRole(selectedUser._id, editForm.role);
      }
      
      // Update user status
      if (editForm.isActive !== selectedUser.isActive) {
        await adminAPI.updateUserStatus(selectedUser._id, editForm.isActive);
      }
      
      // Update business info
      if (JSON.stringify(editForm.businessInfo) !== JSON.stringify(selectedUser.businessInfo || {})) {
        await adminAPI.updateUserBusinessInfo(selectedUser._id, editForm.businessInfo);
      }
      
      setMessage('User updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      onRefresh(); // Refresh the user list
    } catch (error) {
      setMessage('Error updating user: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform User Management</h2>
      
      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}
      
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Roles</option>
          <option value="user">Regular Customer</option>
          <option value="admin">Business Owner Admin</option>
          <option value="manager">Business Manager</option>
          <option value="support">Customer Support</option>
          <option value="viewer">Business Viewer</option>
        </select>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Refresh Users
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.username?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.username || 'No username'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'support' ? 'bg-green-100 text-green-800' :
                    user.role === 'viewer' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {user.businessInfo?.businessName ? (
                      <div>
                        <div className="font-medium">{user.businessInfo.businessName}</div>
                        <div className="text-gray-500">{user.businessInfo.businessType}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No business info</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    ✏️ Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User Information</h3>
              <form onSubmit={handleUpdateUser}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">Regular Customer</option>
                    <option value="admin">Business Owner Admin</option>
                    <option value="manager">Business Manager</option>
                    <option value="support">Customer Support</option>
                    <option value="viewer">Business Viewer</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'active'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                  <input
                    type="text"
                    value={editForm.businessInfo.businessName}
                    onChange={(e) => setEditForm({
                      ...editForm, 
                      businessInfo: {...editForm.businessInfo, businessName: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPanel;

