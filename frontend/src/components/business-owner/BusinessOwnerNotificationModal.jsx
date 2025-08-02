import React, { useState, useEffect } from 'react';
import { useBusinessOwnerNotifications } from '../../contexts/business-owner/BusinessOwnerNotificationContext';

const BusinessOwnerNotificationModal = () => {
  const { currentNotification, isModalOpen, closeNotification } = useBusinessOwnerNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isModalOpen && currentNotification) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isModalOpen, currentNotification]);

  if (!isModalOpen || !currentNotification) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return '💰';
      case 'warning':
        return '⚠️';
      case 'update':
        return '🆕';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'update':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getButtonColor = (type) => {
    switch (type) {
      case 'payment':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'update':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'info':
        return 'bg-gray-600 hover:bg-gray-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
      isVisible ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-0 pointer-events-none'
    }`}>
      <div className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getNotificationIcon(currentNotification.type)}</span>
            <h2 className="text-xl font-bold text-gray-900">{currentNotification.title}</h2>
          </div>
          <button
            onClick={closeNotification}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">{currentNotification.message}</p>
          
          {/* Additional details */}
          {currentNotification.details && (
            <div className={`p-3 rounded-md border ${getNotificationColor(currentNotification.type)}`}>
              <p className="text-sm">{currentNotification.details}</p>
            </div>
          )}

          {/* Action items */}
          {currentNotification.actions && currentNotification.actions.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Required Actions:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {currentNotification.actions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Deadline */}
          {currentNotification.deadline && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Deadline:</strong> {new Date(currentNotification.deadline).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3">
          {currentNotification.secondaryAction && (
            <button
              onClick={currentNotification.secondaryAction.onClick}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {currentNotification.secondaryAction.text}
            </button>
          )}
          <button
            onClick={closeNotification}
            className={`px-4 py-2 text-white rounded-md ${getButtonColor(currentNotification.type)}`}
          >
            {currentNotification.primaryActionText || 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessOwnerNotificationModal; 