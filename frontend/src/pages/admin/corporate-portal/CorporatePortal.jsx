import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/admin/AdminAuthContext';
import { useCart } from '../../../contexts/CartContext';

const CorporatePortal = () => {
  const navigate = useNavigate();
  const { admin, loading, adminLogin, isAdminAuthenticated, isSuperAdmin } = useAdminAuth();
  const { cartCount } = useCart();
  const [showLogin, setShowLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Always show login if no admin is authenticated
  useEffect(() => {
    if (!admin) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
    }
  }, [admin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    const result = await adminLogin(loginForm.email, loginForm.password);
    
    if (result.success) {
      setShowLogin(false);
      setLoginForm({ email: '', password: '' });
    } else {
      setLoginError(result.message);
    }
  };

  const handleLogout = () => {
    // This will be handled by the AdminAuthContext
    navigate('/');
  };

  // Always show the beautiful mountain background
  const MountainBackground = () => (
    <div className="absolute inset-0">
      {/* Sky gradient - light peach to rich reddish-orange */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-100 via-orange-300 to-red-600"></div>
      
      {/* Multiple Suns for dramatic effect */}
      {/* Main sun - large and bright */}
      <div className="absolute top-20 right-24 w-28 h-28 bg-yellow-200 rounded-full opacity-90 blur-sm shadow-2xl"></div>
      
      {/* Secondary sun - smaller and more distant */}
      <div className="absolute top-32 right-40 w-16 h-16 bg-orange-300 rounded-full opacity-70 blur-sm"></div>
      
      {/* Third sun - very small and far */}
      <div className="absolute top-16 right-56 w-8 h-8 bg-red-400 rounded-full opacity-60 blur-sm"></div>
      
      {/* Sun rays/glow effect */}
      <div className="absolute top-16 right-20 w-40 h-40 bg-gradient-to-br from-yellow-200 via-orange-300 to-transparent rounded-full opacity-30 blur-xl"></div>
      
      {/* Mountain layers - clean solid shapes, no purple outlines */}
      <div className="absolute bottom-0 left-0 w-full h-80">
        {/* Far mountains - lighter purple-blue as they recede into distance */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-purple-700 to-purple-500 opacity-40" 
             style={{clipPath: 'polygon(0 100%, 8% 75%, 18% 85%, 28% 65%, 38% 80%, 48% 55%, 58% 75%, 68% 45%, 78% 70%, 88% 35%, 98% 60%, 100% 45%, 100% 100%)'}}></div>
        
        {/* Middle mountains - medium purple */}
        <div className="absolute bottom-0 left-0 w-full h-36 bg-gradient-to-t from-purple-800 to-purple-600 opacity-60" 
             style={{clipPath: 'polygon(0 100%, 5% 70%, 15% 85%, 25% 55%, 35% 75%, 45% 40%, 55% 70%, 65% 30%, 75% 65%, 85% 20%, 95% 60%, 100% 35%, 100% 100%)'}}></div>
        
        {/* Close mountains - darker reddish-purple/maroon */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-red-900 to-purple-900 opacity-75" 
             style={{clipPath: 'polygon(0 100%, 3% 60%, 12% 80%, 22% 45%, 32% 70%, 42% 30%, 52% 60%, 62% 25%, 72% 55%, 82% 15%, 92% 50%, 100% 25%, 100% 100%)'}}></div>
        
        {/* Foreground overlay for depth */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent opacity-15"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <MountainBackground />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-200 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading corporate portal...</p>
          </div>
        </div>
      </div>
    );
  }

  // Always show login if no admin is authenticated
  if (!admin || showLogin) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <MountainBackground />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="text-6xl mb-4">🏢</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Corporate Portal</h1>
              <p className="text-gray-600 mb-6">
                Please authenticate for corporate access. This area requires additional verification.
              </p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                {loginError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {loginError}
                  </div>
                )}
                
                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Access Corporate Portal
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  >
                    ← Back to Home
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin is authenticated, show corporate portal
  return (
    <div className="min-h-screen relative overflow-hidden">
      <MountainBackground />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">🏢 Corporate Portal</h1>
                <span className="ml-3 px-2 py-1 bg-white bg-opacity-20 text-xs rounded-full">
                  {isSuperAdmin() ? 'Super Admin Access' : 'Business Owner Access'}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm">
                  Welcome, {admin?.firstName || admin?.username || admin?.email}
                </span>
                <button
                  onClick={handleLogout}
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
            isSuperAdmin() 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center">
              <div className={`text-2xl mr-3 ${
                isSuperAdmin() ? 'text-red-600' : 'text-blue-600'
              }`}>
                {isSuperAdmin() ? '👑' : '🏢'}
              </div>
              <div>
                <h2 className={`font-semibold ${
                  isSuperAdmin() ? 'text-red-800' : 'text-blue-800'
                }`}>
                  {isSuperAdmin() ? 'Super Admin Access' : 'Business Owner Access'}
                </h2>
                <p className={`text-sm ${
                  isSuperAdmin() ? 'text-red-700' : 'text-blue-700'
                }`}>
                  {isSuperAdmin() 
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
                onClick={() => navigate('/customer-management')}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Manage Customers
              </button>
            </div>

            {/* Super Admin Only Features */}
            {isSuperAdmin() && (
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Name</label>
                <p className="text-gray-900">{admin?.firstName || admin?.username || 'Admin Account'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <p className="text-gray-900">{admin?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <p className="text-gray-900">
                  {isSuperAdmin() ? 'Super Administrator' : 'Business Owner'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  isSuperAdmin() 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {isSuperAdmin() ? 'Full Platform Access' : 'Business Operations'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporatePortal;
