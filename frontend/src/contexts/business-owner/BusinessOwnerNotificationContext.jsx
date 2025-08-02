import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

const BusinessOwnerNotificationContext = createContext();

export const useBusinessOwnerNotifications = () => {
  const context = useContext(BusinessOwnerNotificationContext);
  if (!context) {
    throw new Error('useBusinessOwnerNotifications must be used within a BusinessOwnerNotificationProvider');
  }
  return context;
};

export const BusinessOwnerNotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pre-built business owner notification templates
  const businessOwnerNotificationTemplates = {
    // Payment notifications for business owners
    businessOwnerPaymentOverdue: {
      type: 'payment',
      title: 'Business Owner Payment Overdue',
      message: 'Your business subscription payment is overdue. Please update your payment method to continue accessing the admin panel.',
      details: 'Your admin access has been temporarily suspended due to payment issues.',
      actions: [
        'Update your business payment information',
        'Contact support if you need assistance',
        'Complete payment to restore admin access'
      ],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      primaryActionText: 'Update Payment'
    },

    businessOwnerPaymentDueSoon: {
      type: 'warning',
      title: 'Business Owner Payment Due Soon',
      message: 'Your business subscription payment is due in 3 days. Please ensure your payment method is up to date.',
      details: 'To avoid any interruption to your admin access, please process your payment before the due date.',
      actions: [
        'Review your business billing information',
        'Update payment method if needed',
        'Process payment before deadline'
      ],
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      primaryActionText: 'Process Payment'
    },

    businessOwnerPaymentSuccessful: {
      type: 'success',
      title: 'Business Owner Payment Successful',
      message: 'Thank you! Your business payment has been processed successfully.',
      details: 'Your admin access has been restored and your business subscription is active.',
      primaryActionText: 'Continue'
    },

    // Business owner app updates
    businessOwnerAppUpdate: {
      type: 'update',
      title: 'Business Owner Panel Update Available',
      message: 'A new version of the business owner admin panel is available with improved features and security updates.',
      details: 'New features include enhanced product management, improved analytics, and better business experience.',
      actions: [
        'Refresh your browser to get the latest version',
        'Review the new business features in the dashboard'
      ],
      primaryActionText: 'Got it'
    },

    // Business owner system notifications
    businessOwnerMaintenanceScheduled: {
      type: 'info',
      title: 'Business Owner Panel Maintenance',
      message: 'We will be performing scheduled maintenance on Sunday at 2:00 AM EST.',
      details: 'The business owner admin panel may be temporarily unavailable for up to 30 minutes. Please save any unsaved work.',
      actions: [
        'Save all current business work before maintenance',
        'Plan your business activities around the maintenance window'
      ],
      primaryActionText: 'Acknowledged'
    },

    // Business owner specific notifications
    businessOwnerNewOrder: {
      type: 'success',
      title: 'New Business Order Received',
      message: 'You have received a new order for your business that requires attention.',
      details: 'Please review the order details in your admin panel and process it according to your business procedures.',
      actions: [
        'Review order details in business admin panel',
        'Process the order for your business',
        'Update inventory if needed'
      ],
      primaryActionText: 'Review Order'
    },

    businessOwnerLowInventory: {
      type: 'warning',
      title: 'Business Inventory Alert',
      message: 'Some of your business products are running low on stock.',
      details: 'Please review your inventory and restock items to avoid running out of stock for your customers.',
      actions: [
        'Check inventory levels in business admin panel',
        'Order more stock for low items',
        'Update product availability'
      ],
      primaryActionText: 'Check Inventory'
    },

    // Custom business owner notifications
    businessOwnerCustom: (title, message, type = 'info', details = null, actions = null, deadline = null) => ({
      type,
      title,
      message,
      details,
      actions,
      deadline,
      primaryActionText: 'Got it'
    })
  };

  // Show a business owner notification
  const showBusinessOwnerNotification = (notification) => {
    setCurrentNotification(notification);
    setIsModalOpen(true);
  };

  // Show a pre-built business owner notification
  const showBusinessOwnerTemplateNotification = (templateName, customData = {}) => {
    const template = businessOwnerNotificationTemplates[templateName];
    if (template) {
      const notification = { ...template, ...customData };
      showBusinessOwnerNotification(notification);
    }
  };

  // Show custom business owner notification
  const showBusinessOwnerCustomNotification = (title, message, type = 'info', details = null, actions = null, deadline = null) => {
    const notification = businessOwnerNotificationTemplates.businessOwnerCustom(title, message, type, details, actions, deadline);
    showBusinessOwnerNotification(notification);
  };

  // Close current business owner notification
  const closeBusinessOwnerNotification = () => {
    setIsModalOpen(false);
    setCurrentNotification(null);
  };

  // Add business owner notification to queue
  const addBusinessOwnerNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);
  };

  // Remove business owner notification from queue
  const removeBusinessOwnerNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Check for business owner payment-related notifications
  useEffect(() => {
    if (isAuthenticated && user && (user.role === 'admin' || user.isAdmin)) {
      // Check subscription status and show appropriate business owner notifications
      checkBusinessOwnerSubscriptionNotifications();
    }
  }, [isAuthenticated, user]);

  const checkBusinessOwnerSubscriptionNotifications = () => {
    // This would typically check with your backend API
    // For now, we'll simulate some checks for business owners
    
    // Example: Check if business owner payment is overdue
    if (user?.subscriptionStatus === 'revoked') {
      showBusinessOwnerTemplateNotification('businessOwnerPaymentOverdue');
    }
    
    // Example: Check if business owner payment is due soon
    if (user?.subscriptionStatus === 'active' && user?.nextPaymentDate) {
      const daysUntilPayment = Math.ceil((new Date(user.nextPaymentDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilPayment <= 3 && daysUntilPayment > 0) {
        showBusinessOwnerTemplateNotification('businessOwnerPaymentDueSoon', {
          deadline: new Date(user.nextPaymentDate)
        });
      }
    }
  };

  // Auto-show business owner app updates
  useEffect(() => {
    if (isAuthenticated && user && (user.role === 'admin' || user.isAdmin)) {
      // Check if business owner has seen the latest update
      const lastBusinessOwnerUpdateSeen = localStorage.getItem('lastBusinessOwnerUpdateSeen');
      const currentBusinessOwnerVersion = '1.2.0'; // This would come from your app version
      
      if (lastBusinessOwnerUpdateSeen !== currentBusinessOwnerVersion) {
        // Show business owner update notification
        setTimeout(() => {
          showBusinessOwnerTemplateNotification('businessOwnerAppUpdate');
          localStorage.setItem('lastBusinessOwnerUpdateSeen', currentBusinessOwnerVersion);
        }, 2000); // Show after 2 seconds
      }
    }
  }, [isAuthenticated, user]);

  const value = {
    notifications,
    currentNotification,
    isModalOpen,
    showBusinessOwnerNotification,
    showBusinessOwnerTemplateNotification,
    showBusinessOwnerCustomNotification,
    closeBusinessOwnerNotification,
    addBusinessOwnerNotification,
    removeBusinessOwnerNotification,
    businessOwnerNotificationTemplates
  };

  return (
    <BusinessOwnerNotificationContext.Provider value={value}>
      {children}
    </BusinessOwnerNotificationContext.Provider>
  );
}; 