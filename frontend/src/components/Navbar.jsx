import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  { name: 'Candles', path: '/candles' },
  { name: 'Accessories', path: '/accessories' },
  { name: 'Gift Sets', path: '/gift-sets' },
  { name: 'New Arrivals', path: '/candles' }, // For now, redirect to candles
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, login, signup, logout, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const dropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);

  // Form states
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ identifier: '', password: '' });

  // Close categories dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close account dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    }
    if (accountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountDropdownOpen]);

  const handleCategoryClick = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage('');

    try {
      const result = await login({
        username: loginForm.identifier,
        email: loginForm.identifier,
        password: loginForm.password
      });

      if (result.success) {
        setShowLogin(false);
        setLoginForm({ identifier: '', password: '' });
        setAuthMessage(result.message);
        setTimeout(() => setAuthMessage(''), 3000);
      } else {
        setAuthMessage(result.message);
      }
    } catch (error) {
      setAuthMessage('Login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage('');

    try {
      const result = await signup({
        username: registerForm.identifier,
        email: registerForm.identifier,
        password: registerForm.password
      });

      if (result.success) {
        setShowRegister(false);
        setRegisterForm({ identifier: '', password: '' });
        setAuthMessage(result.message);
        setTimeout(() => setAuthMessage(''), 3000);
      } else {
        setAuthMessage(result.message);
      }
    } catch (error) {
      setAuthMessage('Signup failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    setAuthMessage(result.message);
    setTimeout(() => setAuthMessage(''), 3000);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Categories Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              Categories
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.path)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center: Shop Name */}
          <div className="flex-1 flex justify-center">
            <button 
              onClick={() => navigate('/')}
              className="text-xl font-bold tracking-wide text-gray-800 hover:text-gray-600 transition-colors"
            >
              Divias Wicka Shop
            </button>
          </div>

          {/* Right: Auth Buttons and Cart Button */}
          <div className="flex items-center space-x-4">
            {/* Account Dropdown */}
            <div className="relative" ref={accountDropdownRef}>
              <button
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                type="button"
                onClick={() => setAccountDropdownOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={accountDropdownOpen}
              >
                Account
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  {!isAuthenticated ? (
                    <>
                      <button
                        onClick={() => { setShowLogin(true); setAccountDropdownOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => { setShowRegister(true); setAccountDropdownOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { navigate('/profile'); setAccountDropdownOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Account
                      </button>
                      {(user?.role === 'admin' || user?.isAdmin) && (
                        <button
                          onClick={() => { navigate('/admin'); setAccountDropdownOpen(false); }}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          Admin Panel
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Profile Button - Only show when logged in */}
            {isAuthenticated && (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none transition-colors"
                onClick={() => navigate('/profile')}
              >
                Profile
              </button>
            )}

            {/* Cart Button */}
            <button
              className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none relative"
              onClick={() => navigate('/cart')}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {/* Cart Badge (optional) */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      {authMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          authMessage.includes('successful') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {authMessage}
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => { setShowLogin(false); setAccountDropdownOpen(false); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Welcome Back!</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="login-identifier">Username or Email</label>
                <input
                  type="text"
                  id="login-identifier"
                  value={loginForm.identifier}
                  onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-1" htmlFor="login-password">Password</label>
                <input
                  type="password"
                  id="login-password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50 transition"
              >
                {authLoading ? 'Logging in...' : 'Log In'}
              </button>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => { setShowLogin(false); setShowRegister(true); }}
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => { setShowRegister(false); setAccountDropdownOpen(false); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Create Your Account</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Join Divias Wicka Shop to save your favorites and track orders
            </p>
            <form onSubmit={handleSignup}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="reg-identifier">Username or Email</label>
                <input
                  type="text"
                  id="reg-identifier"
                  value={registerForm.identifier}
                  onChange={(e) => setRegisterForm({ ...registerForm, identifier: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="reg-password">Password</label>
                <input
                  type="password"
                  id="reg-password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {authLoading ? 'Creating Account...' : 'Create Account'}
              </button>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => { setShowRegister(false); setShowLogin(true); }}
                  >
                    Log in here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
} 