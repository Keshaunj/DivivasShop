import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, authAPI, handleAPIError } from '../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // User data state
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    phone: '',
    dateJoined: ''
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    phone: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showPasswordSuccessModal, setShowPasswordSuccessModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    const checkAuthentication = () => {
      if (!isAuthenticated) {
        navigate('/');
        return;
      }
    };
    checkAuthentication();
  }, [isAuthenticated, navigate]);

  // Debug info in console
  useEffect(() => {
    const logDebugInfo = () => {
      console.log('ProfilePage Debug Info:');
      console.log('- Is Loading:', isLoading);
      console.log('- Is Authenticated:', isAuthenticated);
      console.log('- Form Data:', formData);
      console.log('- User Data:', userData);
      console.log('- Auth User:', user);
    };
    logDebugInfo();
  }, [isLoading, isAuthenticated, formData, userData, user]);

  // Load user data on component mount
  useEffect(() => {
    const initializeUserData = () => {
      if (isAuthenticated) {
        loadUserProfile();
      }
    };
    initializeUserData();
  }, [isAuthenticated]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      console.log('Loading user profile...');
      
      const profileData = await userAPI.getProfile();
      console.log('Profile data received:', profileData);
      
      // Transform backend data to match our form structure
      const transformedData = {
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        username: profileData.username || '', // Only use actual username, no email fallback
        email: profileData.email || '',
        address: {
          street: profileData.address?.street || '',
          city: profileData.address?.city || '',
          state: profileData.address?.state || '',
          zipCode: profileData.address?.zip || '',
          country: profileData.address?.country || ''
        },
        phone: profileData.phone || '',
        dateJoined: profileData.createdAt || new Date().toISOString()
      };

      console.log('Transformed data:', transformedData);
      setUserData(transformedData);
      setFormData(transformedData);
    } catch (error) {
      console.error('Error loading profile:', error);
      const errorInfo = handleAPIError(error);
      setMessage(errorInfo.message);
      
      // Set default data if loading fails - use auth context user data
      const defaultData = {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        username: user?.username || '', // Only use actual username, no email fallback
        email: user?.email || '',
        address: {
          street: user?.address?.street || '',
          city: user?.address?.city || '',
          state: user?.address?.state || '',
          zipCode: user?.address?.zip || '',
          country: user?.address?.country || ''
        },
        phone: user?.phone || '',
        dateJoined: user?.createdAt || new Date().toISOString()
      };
      console.log('Using default data:', defaultData);
      setUserData(defaultData);
      setFormData(defaultData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', name, value);
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      // Transform form data to match backend structure
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zip: formData.address.zipCode,
          country: formData.address.country
        }
      };

      const updatedProfile = await userAPI.updateProfile(updateData);
      
      // Update local user data
      setUserData(formData);
      updateUser(updatedProfile);
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Hide modal after 3 seconds
      setTimeout(() => setShowSuccessModal(false), 3000);
      
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setMessage(errorInfo.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordMessage(''); // Clear any previous messages
  };

  const handleChangePassword = async () => {
    // Clear any previous messages
    setPasswordMessage('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage('All fields are required. Please fill in all password fields.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('New passwords do not match. Please make sure both new password fields are identical.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters long.');
      return;
    }

    // Check if new password is the same as current password
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordMessage('New password must be different from your current password.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await userAPI.changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Show success modal
      setShowPasswordSuccessModal(true);
      
      // Hide modal after 3 seconds
      setTimeout(() => setShowPasswordSuccessModal(false), 3000);

    } catch (error) {
      console.error('Password change error:', error);
      
      // Handle specific error messages from backend
      let errorMessage = 'Unable to change password. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Current password is incorrect')) {
          errorMessage = 'Current password is incorrect. Please check and try again.';
        } else if (error.message.includes('New password must be different')) {
          errorMessage = 'New password must be different from your current password.';
        } else if (error.message.includes('at least 6 characters')) {
          errorMessage = 'New password must be at least 6 characters long.';
        } else if (error.message.includes('required')) {
          errorMessage = 'All password fields are required.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setPasswordMessage(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">Manage your account information</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('Error') || message.includes('failed')
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            <button
              onClick={() => {
                console.log('Saving changes');
                handleSave();
              }}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Enter your first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Enter your last name"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Create your unique username"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Date Joined */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
              </label>
              <input
                type="text"
                value={new Date(userData.dateJoined).toLocaleDateString()}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Enter your street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Enter your city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Enter your state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Enter your ZIP code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Enter your country"
                />
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
            
            {/* Password Change Section */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">Change Password</h4>
              
              {/* Current Password - Same Size as Others */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Enter your current password"
                />
              </div>
              
              {/* New and Confirm Passwords - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Enter your new password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>
              
              {/* Change Password Button - Centered */}
              <div className="flex justify-center">
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
              
              {/* Password change message */}
              {passwordMessage && (
                <div className={`mt-3 p-3 rounded-md text-sm ${
                  passwordMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {passwordMessage}
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={async () => {
                  console.log('Logging out from profile page');
                  try {
                    await logout(); // Call backend logout
                    // The AuthContext will handle clearing the user state
                    // and the page will redirect automatically
                  } catch (error) {
                    console.error('Logout error:', error);
                    // Even if backend logout fails, clear local state
                    window.location.href = '/';
                  }
                }}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Logout
              </button>
              <br />
              <button className="text-red-600 hover:text-red-800 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
              <p className="text-sm text-gray-600 mb-6">
                Your information has been saved successfully.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Success Modal */}
      {showPasswordSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Password Updated!</h3>
              <p className="text-sm text-gray-600 mb-6">
                Your password has been changed successfully.
              </p>
              <button
                onClick={() => setShowPasswordSuccessModal(false)}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 