import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../proxyApi/api';

const ResetPasswordModal = ({ isOpen, onClose, onShowLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      await authAPI.verifyResetToken(token);
      setIsValidToken(true);
    } catch (error) {
      setIsValidToken(false);
      setMessage('Invalid or expired reset link. Please request a new one.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validation
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword(token, newPassword);
      setIsSuccess(true);
      setMessage('Password reset successfully! You can now log in with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        handleClose();
        onShowLogin();
      }, 3000);
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
    setIsSuccess(false);
    setIsValidToken(false);
    onClose();
    navigate('/');
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
        
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Your Password</h2>
        
        {!isValidToken ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              {message || 'Verifying reset link...'}
            </p>
            <button
              onClick={handleClose}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 text-center mb-6">
              Enter your new password below.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="new-password">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter your new password"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Confirm your new password"
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
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal; 