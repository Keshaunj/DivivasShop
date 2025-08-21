import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminProductManager from '../../components/admin/AdminProductManager';
import { adminAPI } from '../../proxyApi/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if user is admin (Business Owner Admin or Super Admin)
  const isAdmin = user?.role === 'admin' || user?.isAdmin;
  
  // Check if user is Super Admin (has admin_management permissions)
  const isSuperAdmin = user?.role === 'admin' && user?.isAdmin === true;
  
  // Check if user is Business Owner Admin (regular admin, not super)
  const isBusinessOwnerAdmin = user?.role === 'admin' && user?.isAdmin === false;

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDashboardStats();
      setStats(data.stats);
      setRecentOrders(data.recentOrders || []);
      setLowStockProducts(data.lowStockProducts || []);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
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

  const adminSections = [
    {
      id: 'overview',
      name: 'Overview',
      icon: '📊',
      description: 'Dashboard overview and statistics'
    },
    {
      id: 'products',
      name: 'Products',
      icon: '🕯️',
      description: 'Manage products, add images, descriptions'
    },
    {
      id: 'categories',
      name: 'Categories',
      icon: '📂',
      description: 'Organize products into categories'
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: '📦',
      description: 'View and manage customer orders'
    },
    {
      id: 'users',
      name: 'Users',
      icon: '👥',
      description: 'Manage customer accounts'
    },
    // Only show Admin Management for Super Admins
    ...(isSuperAdmin ? [{
      id: 'admin-management',
      name: 'Admin Management',
      icon: '👑',
      description: 'Manage admin users and permissions (Super Admin Only)'
    }] : []),
    {
      id: 'settings',
      name: 'Settings',
      icon: '⚙️',
      description: 'Website configuration and settings'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
          case 'overview':
      return <AdminOverview stats={stats} recentOrders={recentOrders} lowStockProducts={lowStockProducts} loading={loading} isSuperAdmin={isSuperAdmin} />;
      case 'products':
        return <AdminProductManager isSuperAdmin={isSuperAdmin} />;
      case 'categories':
        return <AdminCategories isSuperAdmin={isSuperAdmin} />;
      case 'orders':
        return <AdminOrders isSuperAdmin={isSuperAdmin} />;
      case 'users':
        return <AdminUsers isSuperAdmin={isSuperAdmin} />;
      case 'admin-management':
        return <AdminAdminManagement isSuperAdmin={isSuperAdmin} />;
      case 'settings':
        return <AdminSettings isSuperAdmin={isSuperAdmin} />;
          default:
      return <AdminOverview stats={stats} recentOrders={recentOrders} lowStockProducts={lowStockProducts} loading={loading} isSuperAdmin={isSuperAdmin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username || user?.email}
              </span>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
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
              {adminSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
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

// Admin Section Components
const AdminOverview = ({ stats, recentOrders, lowStockProducts, loading, isSuperAdmin }) => {
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="text-2xl">🕯️</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-blue-900">{stats.totalProducts || 'N/A'}</div>
              <div className="text-sm text-blue-700">Total Products</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="text-2xl">📦</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-green-900">{stats.totalOrders || 'N/A'}</div>
              <div className="text-sm text-green-700">Total Orders</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="text-2xl">👥</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-purple-900">{stats.totalUsers || 'N/A'}</div>
              <div className="text-sm text-purple-700">Total Users</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <div className="text-2xl">💰</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-orange-900">${stats.totalRevenue || 'N/A'}</div>
              <div className="text-sm text-orange-700">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      {recentOrders && recentOrders.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderId || order._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user?.username || order.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(order.totalAmount || order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Low Stock Products Table */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-6">Low Stock Products</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock || product.quantity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(product.price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category?.name || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* No Data Message */}
      {(!recentOrders || recentOrders.length === 0) && (!lowStockProducts || lowStockProducts.length === 0) && (
        <div className="mt-8 text-center text-gray-500">
          <p>No recent orders or low stock products to display.</p>
        </div>
      )}
    </div>
  );
};

const AdminProducts = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Product Management</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Add New Product
        </button>
      </div>
      <p className="text-gray-600 mb-4">Manage your products, add images, and update descriptions.</p>
      {/* Product management content will go here */}
    </div>
  );
};

const AdminCategories = ({ isSuperAdmin }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Category Management</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Add New Category
        </button>
      </div>
      <p className="text-gray-600 mb-4">Organize your products into categories for better navigation.</p>
      {/* Category management content will go here */}
    </div>
  );
};

const AdminOrders = ({ isSuperAdmin }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Management</h2>
      <p className="text-gray-600 mb-4">View and manage customer orders, update status, and track shipments.</p>
      {/* Order management content will go here */}
    </div>
  );
};

const AdminUsers = ({ isSuperAdmin }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>
      <p className="text-gray-600 mb-4">Manage customer accounts, view profiles, and handle support requests.</p>
      {/* User management content will go here */}
    </div>
  );
};

const AdminAdminManagement = ({ isSuperAdmin }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [message, setMessage] = useState('');

  // Form states for inviting new admin
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'admin',
    permissions: []
  });

  // Available permissions
  const availablePermissions = [
    { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'orders', actions: ['read', 'update'] },
    { resource: 'users', actions: ['read', 'update'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'admin_management', actions: ['read', 'create', 'update', 'delete'] }
  ];

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      const adminUsers = response.filter(user => 
        user.role === 'admin' || user.isAdmin || user.permissions?.length > 0
      );
      setAdmins(adminUsers);
    } catch (error) {
      setMessage('Error loading admins: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminAPI.inviteAdmin(inviteForm);
      setMessage('Admin invitation sent successfully!');
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'admin', permissions: [] });
      loadAdmins();
    } catch (error) {
      setMessage('Error inviting admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermissions = async (adminId, newPermissions) => {
    try {
      setLoading(true);
      await adminAPI.updateUserPermissions(adminId, newPermissions);
      setMessage('Permissions updated successfully!');
      setShowEditModal(false);
      setSelectedAdmin(null);
      loadAdmins();
    } catch (error) {
      setMessage('Error updating permissions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to remove this admin?')) {
      try {
        setLoading(true);
        await adminAPI.removeAdminRole(adminId);
        setMessage('Admin role removed successfully!');
        loadAdmins();
      } catch (error) {
        setMessage('Error removing admin: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionDisplay = (permissions) => {
    if (!permissions || permissions.length === 0) return 'No permissions';
    
    return permissions.map(perm => 
      `${perm.resource}: ${perm.actions.join(', ')}`
    ).join(' | ');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading admin data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Admin Management</h2>
              {/* Only show invite button for Super Admins */}
      {isSuperAdmin ? (
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Invite New Admin
        </button>
      ) : (
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
          💡 Only Super Admins can invite new Business Owner Admins
        </div>
      )}
    </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search admins by email, username, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Admins List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAdmins.map((admin) => (
              <tr key={admin._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {admin.username?.charAt(0)?.toUpperCase() || admin.email.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {admin.username || 'No username'}
                      </div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    admin.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    admin.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    admin.role === 'support' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {getPermissionDisplay(admin.permissions)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedAdmin(admin);
                      setShowEditModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveAdmin(admin._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite New Admin Modal - Only for Super Admins */}
      {showInviteModal && isSuperAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Invite Team Member</h3>
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-purple-600 text-lg mr-2">🏢</span>
                  <span className="font-medium text-purple-900">Team Member Invitation</span>
                </div>
                <p className="text-sm text-purple-700">
                  You are inviting a <strong>team member</strong> to help manage your business. 
                  They will have limited access based on their role.
                </p>
              </div>
              <form onSubmit={handleInviteAdmin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Type
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">🏢 Business Owner Admin (Full Business Access)</option>
                    <option value="manager">👥 Manager (Limited Business Access)</option>
                    <option value="support">🎧 Support (Customer Support Access)</option>
                    <option value="viewer">👁️ Viewer (Read-Only Access)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Note: These team members will help manage your business operations. Only Super Admins can invite new Business Owner Admins.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availablePermissions.map((perm) => (
                      <div key={perm.resource} className="border rounded p-2">
                        <div className="font-medium text-sm mb-1">{perm.resource}</div>
                        <div className="flex flex-wrap gap-2">
                          {perm.actions.map((action) => (
                            <label key={action} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={inviteForm.permissions.some(p => 
                                  p.resource === perm.resource && p.actions.includes(action)
                                )}
                                onChange={(e) => {
                                  const newPermissions = [...inviteForm.permissions];
                                  const existingIndex = newPermissions.findIndex(p => p.resource === perm.resource);
                                  
                                  if (e.target.checked) {
                                    if (existingIndex >= 0) {
                                      newPermissions[existingIndex].actions.push(action);
                                    } else {
                                      newPermissions.push({
                                        resource: perm.resource,
                                        actions: [action]
                                      });
                                    }
                                  } else {
                                    if (existingIndex >= 0) {
                                      newPermissions[existingIndex].actions = newPermissions[existingIndex].actions.filter(a => a !== action);
                                      if (newPermissions[existingIndex].actions.length === 0) {
                                        newPermissions.splice(existingIndex, 1);
                                      }
                                    }
                                  }
                                  
                                  setInviteForm({...inviteForm, permissions: newPermissions});
                                }}
                                className="mr-1"
                              />
                              <span className="text-sm">{action}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Invite Team Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Admin Permissions</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{selectedAdmin.email}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-4">Current Role: {selectedAdmin.role}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Permissions
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availablePermissions.map((perm) => (
                    <div key={perm.resource} className="border rounded p-2">
                      <div className="font-medium text-sm mb-1">{perm.resource}</div>
                      <div className="flex flex-wrap gap-2">
                        {perm.actions.map((action) => (
                          <label key={action} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedAdmin.permissions?.some(p => 
                                p.resource === perm.resource && p.actions.includes(action)
                              ) || false}
                              onChange={(e) => {
                                const newPermissions = [...(selectedAdmin.permissions || [])];
                                const existingIndex = newPermissions.findIndex(p => p.resource === perm.resource);
                                
                                if (e.target.checked) {
                                  if (existingIndex >= 0) {
                                    newPermissions[existingIndex].actions.push(action);
                                  } else {
                                    newPermissions.push({
                                      resource: perm.resource,
                                      actions: [action]
                                    });
                                  }
                                } else {
                                  if (existingIndex >= 0) {
                                    newPermissions[existingIndex].actions = newPermissions[existingIndex].actions.filter(a => a !== action);
                                    if (newPermissions[existingIndex].actions.length === 0) {
                                      newPermissions.splice(existingIndex, 1);
                                    }
                                  }
                                }
                                
                                setSelectedAdmin({...selectedAdmin, permissions: newPermissions});
                              }}
                              className="mr-1"
                            />
                            <span className="text-sm">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAdmin(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdatePermissions(selectedAdmin._id, selectedAdmin.permissions)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminSettings = ({ isSuperAdmin }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Website Settings</h2>
      <p className="text-gray-600 mb-4">Configure website settings, update business information, and manage integrations.</p>
      {/* Settings content will go here */}
    </div>
  );
};

export default AdminDashboard; 