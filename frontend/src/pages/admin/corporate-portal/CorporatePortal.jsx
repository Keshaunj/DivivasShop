import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';

const CorporatePortal = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const { cartCount } = useCart();
  const [loading, setLoading] = useState(true);
  const [accessLevel, setAccessLevel] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [corporateAuthenticated, setCorporateAuthenticated] = useState(false);
  const [corporateUser, setCorporateUser] = useState(null);

  useEffect(() => {
    // Check if user has corporate access (even if authenticated in main app)
    if (isAuthenticated) {
      determineAccessLevel();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Check if user has corporate access permissions
  const hasCorporateAccess = () => {
    return user?.role === 'admin' || user?.isAdmin;
  };

  const determineAccessLevel = () => {
    if (user?.role === 'admin' && user?.isAdmin) {
      setAccessLevel('super-admin');
    } else if (user?.role === 'admin' || user?.isAdmin) {
      setAccessLevel('admin');
    } else {
      setAccessLevel('denied');
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      // First, authenticate the user
      const result = await login(loginForm);
      if (result.success) {
        // Check if the authenticated user has corporate access
        if (hasCorporateAccess()) {
          setCorporateAuthenticated(true);
          setCorporateUser(result.user);
          setShowLogin(false);
          setLoginForm({ email: '', password: '' });
        } else {
          setLoginError('Access denied. This account does not have corporate privileges.');
        }
      } else {
        setLoginError(result.message);
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // Show corporate login form for all users (even if authenticated in main app)
  if (!corporateAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">🏢</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Corporate Portal</h1>
            <p className="text-gray-600 mb-6">
              {isAuthenticated 
                ? 'Please authenticate for corporate access. This area requires additional verification.'
                : 'Please login to access corporate features. This area is restricted to business owners and administrators.'
              }
            </p>
            
            {!showLogin ? (
              <div className="space-y-3">
                <button
                  onClick={() => setShowLogin(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {isAuthenticated ? '🔐 Authenticate for Corporate' : '🔐 Login with Email'}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  ← Back to Home
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                {loginError && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                    {loginError}
                  </div>
                )}
                
                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {isAuthenticated ? '🔐 Authenticate' : '🔐 Login'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLogin(false)}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Determine access level for corporate user
  const corporateAccessLevel = corporateUser?.role === 'admin' && corporateUser?.isAdmin ? 'super-admin' : 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">🏢 Corporate Portal</h1>
              <span className="ml-3 px-2 py-1 bg-white bg-opacity-20 text-xs rounded-full">
                {accessLevel === 'super-admin' ? 'Super Admin Access' : 'Business Owner Access'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                Welcome, {corporateUser?.username || corporateUser?.email}
              </span>
              <button
                onClick={() => {
                  setCorporateAuthenticated(false);
                  setCorporateUser(null);
                  navigate('/corporate');
                }}
                className="px-3 py-1 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors text-sm"
              >
                🔒 Logout Corporate
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-3 py-1 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors text-sm"
              >
                ← Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Notice */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-yellow-600 text-lg mr-3">🔒</div>
            <div>
              <h3 className="font-semibold text-yellow-800">Security Notice</h3>
              <p className="text-sm text-yellow-700">
                You are accessing the corporate portal with elevated privileges. 
                Remember to logout when finished to maintain security.
              </p>
            </div>
          </div>
        </div>

        {/* Access Level Banner */}
        <div className={`mb-8 p-4 rounded-lg ${
          corporateAccessLevel === 'super-admin' 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center">
            <div className={`text-2xl mr-3 ${
              corporateAccessLevel === 'super-admin' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {corporateAccessLevel === 'super-admin' ? '👑' : '🏢'}
            </div>
            <div>
              <h2 className={`font-semibold ${
                corporateAccessLevel === 'super-admin' ? 'text-red-800' : 'text-blue-800'
              }`}>
                {corporateAccessLevel === 'super-admin' ? 'Super Admin Access' : 'Business Owner Access'}
              </h2>
              <p className={`text-sm ${
                corporateAccessLevel === 'super-admin' ? 'text-red-700' : 'text-blue-700'
              }`}>
                {corporateAccessLevel === 'super-admin' 
                  ? 'You have full platform access and can manage all business operations.'
                  : 'You have access to manage your business storefront and operations.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Storefront Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-3xl mb-4">🛍️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Storefront Management</h3>
            <p className="text-gray-600 mb-4">Manage your products, categories, and store appearance.</p>
            <button
              onClick={() => navigate('/admin')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Manage Store
            </button>
          </div>

          {/* Business Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Analytics</h3>
            <p className="text-gray-600 mb-4">View sales reports, customer insights, and performance metrics.</p>
            <button
              onClick={() => navigate('/admin')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              View Analytics
            </button>
          </div>

          {/* Customer Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Management</h3>
            <p className="text-gray-600 mb-4">Manage customer accounts, orders, and support requests.</p>
            <button
              onClick={() => navigate('/admin')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Manage Customers
            </button>
          </div>

          {/* Super Admin Only Features */}
          {corporateAccessLevel === 'super-admin' && (
            <>
              {/* Platform Management */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Management</h3>
                <p className="text-gray-600 mb-4">Manage all business accounts and platform settings.</p>
                <button
                  onClick={() => navigate('/super-admin')}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Super Admin Panel
                </button>
              </div>

              {/* Business Onboarding */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-3xl mb-4">➕</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Business</h3>
                <p className="text-gray-600 mb-4">Onboard new business owners to the platform.</p>
                <button
                  onClick={() => navigate('/super-admin')}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Onboard Business
                </button>
              </div>

              {/* System Health */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-3xl mb-4">🏥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">System Health</h3>
                <p className="text-gray-600 mb-4">Monitor platform performance and system status.</p>
                <button
                  onClick={() => navigate('/super-admin')}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  System Status
                </button>
              </div>
            </>
          )}
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <p className="text-gray-900">{corporateUser?.username || 'Business Account'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <p className="text-gray-900">{corporateUser?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <p className="text-gray-900">
                {corporateAccessLevel === 'super-admin' ? 'Super Administrator' : 'Business Owner'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                corporateAccessLevel === 'super-admin' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {corporateAccessLevel === 'super-admin' ? 'Full Platform Access' : 'Business Operations'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporatePortal;
