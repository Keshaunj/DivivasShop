import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pre-built notification templates
  const notificationTemplates = {
    // Payment notifications
    paymentOverdue: {
      type: 'payment',
      title: 'Payment Overdue',
      message: 'Your subscription payment is overdue. Please update your payment method to continue accessing the admin panel.',
      details: 'Your admin access has been temporarily suspended due to payment issues.',
      actions: [
        'Update your payment information',
        'Contact support if you need assistance',
        'Complete payment to restore access'
      ],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      primaryActionText: 'Update Payment'
    },

    paymentDueSoon: {
      type: 'warning',
      title: 'Payment Due Soon',
      message: 'Your subscription payment is due in 3 days. Please ensure your payment method is up to date.',
      details: 'To avoid any interruption to your admin access, please process your payment before the due date.',
      actions: [
        'Review your billing information',
        'Update payment method if needed',
        'Process payment before deadline'
      ],
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      primaryActionText: 'Process Payment'
    },

    paymentSuccessful: {
      type: 'success',
      title: 'Payment Successful',
      message: 'Thank you! Your payment has been processed successfully.',
      details: 'Your admin access has been restored and your subscription is active.',
      primaryActionText: 'Continue'
    },

    // App updates
    appUpdate: {
      type: 'update',
      title: 'App Update Available',
      message: 'A new version of the admin panel is available with improved features and security updates.',
      details: 'New features include enhanced product management, improved analytics, and better user experience.',
      actions: [
        'Refresh your browser to get the latest version',
        'Review the new features in the dashboard'
      ],
      primaryActionText: 'Got it'
    },

    // System notifications
    maintenanceScheduled: {
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'We will be performing scheduled maintenance on Sunday at 2:00 AM EST.',
      details: 'The admin panel may be temporarily unavailable for up to 30 minutes. Please save any unsaved work.',
      actions: [
        'Save all current work before maintenance',
        'Plan your activities around the maintenance window'
      ],
      primaryActionText: 'Acknowledged'
    },

    // Custom notifications
    custom: (title, message, type = 'info', details = null, actions = null, deadline = null) => ({
      type,
      title,
      message,
      details,
      actions,
      deadline,
      primaryActionText: 'Got it'
    })
  };

  // Show a notification
  const showNotification = (notification) => {
    setCurrentNotification(notification);
    setIsModalOpen(true);
  };

  // Show a pre-built notification
  const showTemplateNotification = (templateName, customData = {}) => {
    const template = notificationTemplates[templateName];
    if (template) {
      const notification = { ...template, ...customData };
      showNotification(notification);
    }
  };

  // Show custom notification
  const showCustomNotification = (title, message, type = 'info', details = null, actions = null, deadline = null) => {
    const notification = notificationTemplates.custom(title, message, type, details, actions, deadline);
    showNotification(notification);
  };

  // Close current notification
  const closeNotification = () => {
    setIsModalOpen(false);
    setCurrentNotification(null);
  };

  // Add notification to queue
  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);
  };

  // Remove notification from queue
  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Check for payment-related notifications (for admin users)
  useEffect(() => {
    if (isAuthenticated && user && (user.role === 'admin' || user.isAdmin)) {
      // Check subscription status and show appropriate notifications
      checkSubscriptionNotifications();
    }
  }, [isAuthenticated, user]);

  const checkSubscriptionNotifications = () => {
    // This would typically check with your backend API
    // For now, we'll simulate some checks
    
    // Example: Check if payment is overdue
    if (user?.subscriptionStatus === 'revoked') {
      showTemplateNotification('paymentOverdue');
    }
    
    // Example: Check if payment is due soon
    if (user?.subscriptionStatus === 'active' && user?.nextPaymentDate) {
      const daysUntilPayment = Math.ceil((new Date(user.nextPaymentDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilPayment <= 3 && daysUntilPayment > 0) {
        showTemplateNotification('paymentDueSoon', {
          deadline: new Date(user.nextPaymentDate)
        });
      }
    }
  };

  // Auto-show app updates (example)
  useEffect(() => {
    if (isAuthenticated && user && (user.role === 'admin' || user.isAdmin)) {
      // Check if user has seen the latest update
      const lastUpdateSeen = localStorage.getItem('lastUpdateSeen');
      const currentVersion = '1.2.0'; // This would come from your app version
      
      if (lastUpdateSeen !== currentVersion) {
        // Show update notification
        setTimeout(() => {
          showTemplateNotification('appUpdate');
          localStorage.setItem('lastUpdateSeen', currentVersion);
        }, 2000); // Show after 2 seconds
      }
    }
  }, [isAuthenticated, user]);

  const value = {
    notifications,
    currentNotification,
    isModalOpen,
    showNotification,
    showTemplateNotification,
    showCustomNotification,
    closeNotification,
    addNotification,
    removeNotification,
    notificationTemplates
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 