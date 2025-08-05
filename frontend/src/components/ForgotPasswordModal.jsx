import React, { useState } from 'react';
import { authAPI } from '../proxyApi/api';

const ForgotPasswordModal = ({ isOpen, onClose, onShowLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await authAPI.requestPasswordReset(email);
      setIsSuccess(true);
      setMessage(response.message);
      
      // In development, show the reset URL
      if (response.resetUrl) {
        setMessage(`${response.message} Reset URL: ${response.resetUrl}`);
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>
        
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password?</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="forgot-email">
              Email Address
            </label>
            <input
              type="email"
              id="forgot-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your email address"
              required
            />
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              isSuccess 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => {
                  handleClose();
                  onShowLogin();
                }}
              >
                Log in here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal; 