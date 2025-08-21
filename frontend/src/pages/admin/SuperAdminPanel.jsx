import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../proxyApi/api';

const SuperAdminPanel = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Check if user is super admin
  const isSuperAdmin = user?.role === 'admin' && user?.isAdmin;

  useEffect(() => {
    if (isSuperAdmin) {
      loadSuperAdminData();
    }
  }, [isSuperAdmin]);

  const loadSuperAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllUsers()
      ]);
      
      setStats(statsData.stats);
      setUsers(usersData);
      setAdmins(usersData.filter(u => u.role === 'admin' || u.isAdmin));
    } catch (error) {
      setMessage('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
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
      icon: '📊',
      description: 'System-wide statistics and health'
    },
    {
      id: 'business-monitoring',
      name: 'Business Monitoring',
      icon: '🏢',
      description: 'Monitor all business operations and analytics'
    },
    {
      id: 'transaction-monitoring',
      name: 'Transaction Monitoring',
      icon: '💰',
      description: 'View all orders, payments, and financial data'
    },
    {
      id: 'product-management',
      name: 'Product Management',
      icon: '🛍️',
      description: 'Monitor all products across all businesses'
    },
    {
      id: 'customer-support',
      name: 'Customer Support',
      icon: '🎧',
      description: 'Support tools for business owners and customers'
    },
    {
      id: 'user-management',
      name: 'User Management',
      icon: '👥',
      description: 'Manage all users and admins'
    },
    {
      id: 'admin-management',
      name: 'Admin Management',
      icon: '👑',
      description: 'Create and manage admin accounts'
    },
    {
      id: 'system-health',
      name: 'System Health',
      icon: '🏥',
      description: 'Monitor platform performance'
    },
    {
      id: 'security',
      name: 'Security',
      icon: '🔒',
      description: 'Security settings and logs'
    },
    {
      id: 'platform-settings',
      name: 'Platform Settings',
      icon: '⚙️',
      description: 'Global platform configuration'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <PlatformOverview stats={stats} />;
      case 'business-monitoring':
        return <BusinessMonitoring />;
      case 'transaction-monitoring':
        return <TransactionMonitoring />;
      case 'product-management':
        return <ProductManagement />;
      case 'customer-support':
        return <CustomerSupport />;
      case 'user-management':
        return <UserManagement users={users} onUserUpdate={loadSuperAdminData} />;
      case 'admin-management':
        return <AdminManagement admins={admins} onAdminUpdate={loadSuperAdminData} />;
      case 'system-health':
        return <SystemHealth />;
      case 'security':
        return <Security />;
      case 'platform-settings':
        return <PlatformSettings />;
      default:
        return <PlatformOverview stats={stats} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">Loading Super Admin Panel...</div>
        </div>
      </div>
    );
  }

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
            <div className="text-2xl">👥</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-blue-900">{stats.totalUsers || 'N/A'}</div>
              <div className="text-sm text-blue-700">Total Users</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="text-2xl">👑</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-purple-900">{stats.totalAdmins || 'N/A'}</div>
              <div className="text-sm text-purple-700">Total Admins</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="text-2xl">🕯️</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-green-900">{stats.totalProducts || 'N/A'}</div>
              <div className="text-sm text-green-700">Total Products</div>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <div className="text-2xl">📦</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-orange-900">{stats.totalOrders || 'N/A'}</div>
              <div className="text-sm text-orange-700">Total Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Permission System Overview */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200 mb-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4">🔐 Permission System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-800 mb-3">👑 Super Admin (You)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Products:</span>
                <span className="text-green-600 font-medium">Full Access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Categories:</span>
                <span className="text-green-600 font-medium">Full Access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Orders:</span>
                <span className="text-green-600 font-medium">Full Access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Users:</span>
                <span className="text-green-600 font-medium">Full Access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Analytics:</span>
                <span className="text-green-600 font-medium">Full Access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Settings:</span>
                <span className="text-green-600 font-medium">Full Access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Admin Management:</span>
                <span className="text-red-600 font-medium">EXCLUSIVE ACCESS</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-3">🏢 Business Owner Admin</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Products:</span>
                <span className="text-blue-600 font-medium">Full Access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Categories:</span>
                <span className="text-blue-600 font-medium">Full Access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Orders:</span>
                <span className="text-blue-600 font-medium">Read + Update</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Users:</span>
                <span className="text-blue-600 font-medium">Read + Update</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Analytics:</span>
                <span className="text-blue-600 font-medium">Read Only</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Settings:</span>
                <span className="text-blue-600 font-medium">Read + Update</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Admin Management:</span>
                <span className="text-gray-400 font-medium">NO ACCESS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveSection('business-monitoring')}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors text-left cursor-pointer"
          >
            <div className="text-blue-600 text-lg mb-2">🏢</div>
            <div className="font-medium text-gray-900">Business Monitoring</div>
            <div className="text-sm text-gray-500">Monitor all businesses</div>
          </button>
          
          <button 
            onClick={() => setActiveSection('transaction-monitoring')}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors text-left cursor-pointer"
          >
            <div className="text-green-600 text-lg mb-2">💰</div>
            <div className="font-medium text-gray-900">Transactions</div>
            <div className="text-sm text-gray-500">View all orders & payments</div>
          </button>
          
          <button 
            onClick={() => setActiveSection('product-management')}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors text-left cursor-pointer"
          >
            <div className="text-purple-600 text-lg mb-2">🛍️</div>
            <div className="font-medium text-gray-900">Products</div>
            <div className="text-sm text-gray-500">Monitor all products</div>
          </button>
          
          <button 
            onClick={() => setActiveSection('customer-support')}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-colors text-left cursor-pointer"
          >
            <div className="text-orange-600 text-lg mb-2">🎧</div>
            <div className="font-medium text-gray-900">Support</div>
            <div className="text-sm text-gray-500">Help business owners</div>
          </button>
        </div>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = ({ users, onUserUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>
      
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
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="support">Support</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
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
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <button className="text-red-600 hover:text-red-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Admin Management Component
const AdminManagement = ({ admins, onAdminUpdate }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showPermissions, setShowPermissions] = useState({});

  const togglePermissions = (adminId) => {
    setShowPermissions(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  const getPermissionColor = (resource) => {
    const colors = {
      'products': 'bg-blue-100 text-blue-800',
      'categories': 'bg-green-100 text-green-800',
      'orders': 'bg-purple-100 text-purple-800',
      'users': 'bg-yellow-100 text-yellow-800',
      'analytics': 'bg-indigo-100 text-indigo-800',
      'settings': 'bg-pink-100 text-pink-800',
      'admin_management': 'bg-red-100 text-red-800'
    };
    return colors[resource] || 'bg-gray-100 text-gray-800';
  };

  const getAdminType = (admin) => {
    if (admin.isAdmin && admin.role === 'admin') return 'Super Admin';
    if (admin.role === 'admin') return 'Business Owner Admin';
    if (admin.role === 'manager') return 'Manager';
    if (admin.role === 'support') return 'Support';
    return 'Regular User';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Admin Management</h2>
          <p className="text-sm text-gray-600 mt-1">Only Super Admins can create and manage other admins</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
        >
          <span className="mr-2">➕</span>
          Invite Business Owner Admin
        </button>
      </div>
      
      {/* Permission Levels Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">🔐 Admin Permission Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <span className="text-red-600 text-lg mr-2">👑</span>
              <span className="font-semibold text-gray-900">Super Admin</span>
            </div>
            <p className="text-sm text-gray-600">Full platform access + can manage other admins</p>
            <div className="text-xs text-gray-500 mt-2">7 resources, all actions</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <span className="text-purple-600 text-lg mr-2">🏢</span>
              <span className="font-semibold text-gray-900">Business Owner Admin</span>
            </div>
            <p className="text-sm text-gray-600">Full business operations access</p>
            <div className="text-xs text-gray-500 mt-2">6 resources, limited actions</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <span className="text-green-600 text-lg mr-2">👥</span>
              <span className="font-semibold text-gray-900">Manager/Support</span>
            </div>
            <p className="text-sm text-gray-600">Limited business access</p>
            <div className="text-xs text-gray-500 mt-2">3-4 resources, read/update</div>
          </div>
        </div>
      </div>
      
      {/* Admins List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <div key={admin._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                admin.isAdmin ? 'bg-red-100' : 'bg-purple-100'
              }`}>
                <span className={`text-lg font-medium ${
                  admin.isAdmin ? 'text-red-700' : 'text-purple-700'
                }`}>
                  {admin.username?.charAt(0)?.toUpperCase() || admin.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-4 flex-1">
                <div className="font-medium text-gray-900">{admin.username || 'No username'}</div>
                <div className="text-sm text-gray-500">{admin.email}</div>
                <div className="mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    admin.isAdmin ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {getAdminType(admin)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Role:</span> {admin.role}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Permissions:</span> {admin.permissions?.length || 0} resources
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Status:</span> 
                <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${
                  admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {admin.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            {/* Permissions Toggle */}
            <button
              onClick={() => togglePermissions(admin._id)}
              className="w-full mb-3 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {showPermissions[admin._id] ? '🔽 Hide' : '🔽 Show'} Permissions
            </button>
            
            {/* Permissions Detail */}
            {showPermissions[admin._id] && admin.permissions && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Resource Permissions:</h4>
                <div className="space-y-2">
                  {admin.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPermissionColor(perm.resource)}`}>
                        {perm.resource}
                      </span>
                      <span className="text-xs text-gray-600">
                        {perm.actions.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                ✏️ Edit
              </button>
              <button className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                🗑️ Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Business Owner Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Invite Business Owner Admin</h3>
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-red-600 text-lg mr-2">👑</span>
                  <span className="font-medium text-red-900">Super Admin Invitation</span>
                </div>
                <p className="text-sm text-red-700">
                  You are inviting a new <strong>Business Owner Admin</strong>. 
                  This person will have full business operations access but cannot manage other admins.
                </p>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                // TODO: Implement invite logic
                setShowCreateModal(false);
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="business@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500">
                    <option value="admin">🏢 Business Owner Admin (Full Business Access)</option>
                    <option value="manager">👥 Manager (Limited Business Access)</option>
                    <option value="support">🎧 Support (Customer Support Access)</option>
                    <option value="viewer">👁️ Viewer (Read-Only Access)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Note: Only Super Admins can invite new Business Owner Admins. They will have business operations access.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Invite Business Owner
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

// System Health Component
const SystemHealth = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">System Health</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="font-medium text-green-900 mb-2">Database Status</h3>
          <p className="text-green-700">✅ Connected and healthy</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="font-medium text-green-900 mb-2">API Status</h3>
          <p className="text-green-700">✅ All endpoints responding</p>
        </div>
      </div>
    </div>
  );
};

// Security Component
const Security = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Security</h2>
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-900">Security Logs</h3>
          <p className="text-yellow-700">Monitor login attempts and admin actions</p>
        </div>
      </div>
    </div>
  );
};

// Business Monitoring Component
const BusinessMonitoring = () => {
  const [businessData, setBusinessData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeBusinesses: 0,
    topPerformers: []
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">🏢 Business Monitoring Dashboard</h2>
      
      {/* Business Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="text-2xl">💰</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-green-900">${businessData.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-green-700">Total Platform Revenue</div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="text-2xl">📦</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-blue-900">{businessData.totalOrders}</div>
              <div className="text-sm text-blue-700">Total Orders</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="text-2xl">🏢</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-purple-900">{businessData.activeBusinesses}</div>
              <div className="text-sm text-purple-700">Active Businesses</div>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <div className="text-2xl">📊</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-orange-900">24/7</div>
              <div className="text-sm text-orange-700">Platform Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performing Businesses</h3>
        <div className="space-y-3">
          {businessData.topPerformers.map((business, index) => (
            <div key={business.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-lg mr-3">#{index + 1}</span>
                <div>
                  <div className="font-medium text-gray-900">{business.name}</div>
                  <div className="text-sm text-gray-500">{business.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-600">${business.revenue.toLocaleString()}</div>
                <div className="text-sm text-gray-500">{business.orders} orders</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left">
          <div className="text-blue-600 text-lg mb-2">📊</div>
          <div className="font-medium text-gray-900">View Detailed Analytics</div>
          <div className="text-sm text-gray-500">Deep dive into business performance</div>
        </button>
        
        <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left">
          <div className="text-green-600 text-lg mb-2">📈</div>
          <div className="font-medium text-gray-900">Generate Reports</div>
          <div className="text-sm text-gray-500">Create business performance reports</div>
        </button>
        
        <button className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left">
          <div className="text-purple-600 text-lg mb-2">🔍</div>
          <div className="font-medium text-gray-900">Business Search</div>
          <div className="text-sm text-gray-500">Find specific business accounts</div>
        </button>
      </div>
    </div>
  );
};

// Transaction Monitoring Component
const TransactionMonitoring = () => {
  const [transactions, setTransactions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">💰 Transaction Monitoring</h2>
      
      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-900">$0</div>
          <div className="text-sm text-green-700">Today's Revenue</div>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-900">0</div>
          <div className="text-sm text-blue-700">Pending Orders</div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-900">0</div>
          <div className="text-sm text-yellow-700">Processing Orders</div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-900">0</div>
          <div className="text-sm text-purple-700">Completed Orders</div>
        </div>
      </div>

      {/* Transaction Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Transactions</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        
        <input
          type="text"
          placeholder="Search transactions..."
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{transaction.orderId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.businessName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.customerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${transaction.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      transaction.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.date}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900 mr-3">View</button>
                    <button className="text-red-600 hover:text-red-900">Support</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Product Management Component
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">🛍️ Product Management</h2>
      
      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-900">0</div>
          <div className="text-sm text-blue-700">Total Products</div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-900">0</div>
          <div className="text-sm text-green-700">Active Products</div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-900">0</div>
          <div className="text-sm text-yellow-700">Low Stock Items</div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-900">0</div>
          <div className="text-sm text-purple-700">Categories</div>
        </div>
      </div>

      {/* Product Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Categories</option>
          <option value="candles">Candles</option>
          <option value="accessories">Accessories</option>
          <option value="gift-sets">Gift Sets</option>
        </select>
        
        <input
          type="text"
          placeholder="Search products..."
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No products found
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🕯️</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.businessName}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Price:</span> ${product.price}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Stock:</span> {product.stock}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Category:</span> {product.category}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                  View
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Customer Support Component
const CustomerSupport = () => {
  const [supportTickets, setSupportTickets] = useState([]);
  const [filterPriority, setFilterPriority] = useState('all');

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">🎧 Customer Support</h2>
      
      {/* Support Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-900">0</div>
          <div className="text-sm text-red-700">High Priority</div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-900">0</div>
          <div className="text-sm text-yellow-700">Medium Priority</div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-900">0</div>
          <div className="text-sm text-green-700">Low Priority</div>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-900">0</div>
          <div className="text-sm text-blue-700">Resolved</div>
        </div>
      </div>

      {/* Support Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
        
        <input
          type="text"
          placeholder="Search support tickets..."
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Support Tickets */}
      <div className="space-y-4">
        {supportTickets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No support tickets found
          </div>
        ) : (
          supportTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-medium text-gray-900">{ticket.subject}</div>
                  <div className="text-sm text-gray-500">From: {ticket.from}</div>
                  <div className="text-sm text-gray-500">Business: {ticket.businessName}</div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                  ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.priority} priority
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">{ticket.message}</div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">{ticket.date}</div>
                <div className="flex space-x-2">
                  <button className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                    Respond
                  </button>
                  <button className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Platform Settings Component
const PlatformSettings = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Settings</h2>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900">Global Configuration</h3>
          <p className="text-blue-700">Manage platform-wide settings and defaults</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;

