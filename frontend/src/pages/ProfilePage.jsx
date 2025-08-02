import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, handleAPIError } from '../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

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
      console.log('- Is Editing:', isEditing);
      console.log('- Is Loading:', isLoading);
      console.log('- Is Authenticated:', isAuthenticated);
      console.log('- Form Data:', formData);
      console.log('- User Data:', userData);
      console.log('- Auth User:', user);
    };
    logDebugInfo();
  }, [isEditing, isLoading, isAuthenticated, formData, userData, user]);

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
        username: profileData.username || profileData.email || '', // Use username, fallback to email
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
        username: user?.username || user?.email || '',
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
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setMessage(errorInfo.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
    setMessage('');
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
            {!isEditing ? (
              <button
                onClick={() => {
                  console.log('Enabling edit mode');
                  setIsEditing(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="space-x-3">
                <button
                  onClick={() => {
                    console.log('Canceling edit mode');
                    handleCancel();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Saving changes');
                    handleSave();
                  }}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
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
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
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
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
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
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
                placeholder="Enter your username"
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
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
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
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
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
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                  }`}
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
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                  }`}
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
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                  }`}
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
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                  }`}
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
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                  }`}
                  placeholder="Enter your country"
                />
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button className="text-blue-600 hover:text-blue-800 transition-colors">
                Change Password
              </button>
              <br />
              <button className="text-red-600 hover:text-red-800 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 