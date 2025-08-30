const mongoose = require('mongoose');
const { BusinessOwner } = require('../../models/users');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Pre-built business owner notification messages
const businessOwnerNotificationTemplates = {
  // Business owner payment reminders
  businessOwnerPaymentReminder: {
    title: 'Business Owner Payment Reminder',
    message: (businessOwnerName) => `Hi ${businessOwnerName}, your business monthly subscription payment is due soon. Please ensure your payment method is up to date to avoid any interruption to your admin access.`,
    type: 'warning',
    details: 'To maintain uninterrupted access to your business admin panel, please process your payment before the due date.',
    actions: [
      'Log into your business account and update payment method',
      'Contact support if you need assistance',
      'Process payment before the deadline'
    ]
  },

  businessOwnerPaymentOverdue: {
    title: 'Business Owner Payment Overdue - Action Required',
    message: (businessOwnerName) => `Hi ${businessOwnerName}, your business subscription payment is overdue. Your admin access has been temporarily suspended.`,
    type: 'payment',
    details: 'To restore access to your business admin panel, please complete your payment immediately.',
    actions: [
      'Complete payment to restore business access',
      'Contact support for assistance',
      'Update payment method if needed'
    ]
  },

  // Business owner app updates
  businessOwnerNewFeature: {
    title: 'Business Owner New Feature Available',
    message: (businessOwnerName) => `Hi ${businessOwnerName}, we've added new features to your business admin panel to help you manage your business better.`,
    type: 'update',
    details: 'New features include enhanced product management, improved analytics, and better business experience.',
    actions: [
      'Refresh your browser to see new business features',
      'Check the business dashboard for updates',
      'Review the new business functionality'
    ]
  },

  businessOwnerMaintenance: {
    title: 'Business Owner Panel Maintenance Notice',
    message: (businessOwnerName) => `Hi ${businessOwnerName}, we will be performing scheduled maintenance to improve business panel performance.`,
    type: 'info',
    details: 'The business owner admin panel may be temporarily unavailable during this time. Please save any unsaved business work.',
    actions: [
      'Save all current business work before maintenance',
      'Plan your business activities around the maintenance window',
      'Check back after maintenance is complete'
    ]
  },

  // Business owner business notifications
  businessOwnerOrderAlert: {
    title: 'Business Owner New Order Received',
    message: (businessOwnerName) => `Hi ${businessOwnerName}, you have received a new order for your business that requires your attention.`,
    type: 'success',
    details: 'Please review the order details in your business admin panel and process it according to your business procedures.',
    actions: [
      'Review order details in business admin panel',
      'Process the order for your business',
      'Update business inventory if needed'
    ]
  },

  businessOwnerInventoryLow: {
    title: 'Business Owner Low Inventory Alert',
    message: (businessOwnerName) => `Hi ${businessOwnerName}, some of your business products are running low on stock.`,
    type: 'warning',
    details: 'Please review your business inventory and restock items to avoid running out of stock for your customers.',
    actions: [
      'Check inventory levels in business admin panel',
      'Order more stock for low business items',
      'Update business product availability'
    ]
  },

  // Custom business owner notification template
  businessOwnerCustom: (title, message, type = 'info', details = null, actions = null) => ({
    title,
    message,
    type,
    details,
    actions
  })
};

// Send business owner notification to specific user
const sendBusinessOwnerNotificationToUser = async (emailOrUsername, notificationData) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!businessOwner) {
      console.log('❌ Business owner not found. Please check the email or username.');
      return;
    }

    // Get business owner's display name (nickname or firstName)
    const businessOwnerName = businessOwner.nickname || businessOwner.firstName || businessOwner.username || 'there';

    // Add notification to user's notifications array
    if (!businessOwner.notifications) {
      businessOwner.notifications = [];
    }

    // Create notification with dynamic message
    const notification = {
      id: new mongoose.Types.ObjectId(),
      ...notificationData,
      message: typeof notificationData.message === 'function' 
        ? notificationData.message(businessOwnerName) 
        : notificationData.message,
      sentAt: new Date(),
      read: false
    };

    businessOwner.notifications.push(notification);
    await businessOwner.save();

    console.log(`✅ Business owner notification sent to ${businessOwner.username || businessOwner.email}!`);
    console.log(`Title: ${notification.title}`);
    console.log(`Type: ${notification.type}`);
    console.log(`Sent at: ${notification.sentAt.toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error sending business owner notification:', error);
  }
};

// Send business owner notification to all business owners
const sendBusinessOwnerNotificationToAllBusinessOwners = async (notificationData) => {
  try {
    const businessOwners = await BusinessOwner.find({});

    if (businessOwners.length === 0) {
      console.log('❌ No business owners found.');
      return;
    }

    console.log(`📤 Sending business owner notification to ${businessOwners.length} business owners...`);

    for (const businessOwner of businessOwners) {
      if (!businessOwner.notifications) {
        businessOwner.notifications = [];
      }

      // Get business owner's display name
      const businessOwnerName = businessOwner.nickname || businessOwner.firstName || businessOwner.username || 'there';

      const notification = {
        id: new mongoose.Types.ObjectId(),
        ...notificationData,
        message: typeof notificationData.message === 'function' 
          ? notificationData.message(businessOwnerName) 
          : notificationData.message,
        sentAt: new Date(),
        read: false
      };

      businessOwner.notifications.push(notification);
      await businessOwner.save();

      console.log(`✅ Sent to business owner: ${businessOwner.username || businessOwner.email}`);
    }

    console.log(`🎉 Business owner notification sent to all ${businessOwners.length} business owners!`);
    
  } catch (error) {
    console.error('❌ Error sending business owner notifications:', error);
  }
};

// List all business owner notifications for a user
const listBusinessOwnerNotifications = async (emailOrUsername) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!businessOwner) {
      console.log('❌ Business owner not found. Please check the email or username.');
      return;
    }

    if (!businessOwner.notifications || businessOwner.notifications.length === 0) {
      console.log(`📋 No business owner notifications found for ${businessOwner.username || businessOwner.email}`);
      return;
    }

    console.log(`📋 Business Owner Notifications for ${businessOwner.username || businessOwner.email}:`);
    console.log('─'.repeat(80));
    
    businessOwner.notifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title}`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Sent: ${notification.sentAt.toLocaleString()}`);
      console.log(`   Read: ${notification.read ? 'Yes' : 'No'}`);
      console.log(`   Message: ${notification.message.substring(0, 100)}...`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing business owner notifications:', error);
  }
};

// Mark business owner notification as read
const markBusinessOwnerNotificationAsRead = async (emailOrUsername, notificationId) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!businessOwner) {
      console.log('❌ Business owner not found. Please check the email or username.');
      return;
    }

    if (!businessOwner.notifications) {
      console.log('❌ No business owner notifications found for this user.');
      return;
    }

    const notification = businessOwner.notifications.find(n => n.id.toString() === notificationId);
    if (!notification) {
      console.log('❌ Business owner notification not found.');
      return;
    }

    notification.read = true;
    await businessOwner.save();

    console.log(`✅ Marked business owner notification as read: ${notification.title}`);
    
  } catch (error) {
    console.error('❌ Error marking business owner notification as read:', error);
  }
};

// Main function to handle business owner commands
const main = async () => {
  const command = process.argv[2];
  const emailOrUsername = process.argv[3];
  const templateName = process.argv[4];
  const customTitle = process.argv[5];
  const customMessage = process.argv[6];

  switch (command) {
    case 'send-business-template':
      if (!emailOrUsername || !templateName) {
        console.log('Usage: node businessOwnerNotificationManager.js send-business-template <email> <template_name>');
        console.log('Available business owner templates: businessOwnerPaymentReminder, businessOwnerPaymentOverdue, businessOwnerNewFeature, businessOwnerMaintenance, businessOwnerOrderAlert, businessOwnerInventoryLow');
        break;
      }
      const template = businessOwnerNotificationTemplates[templateName];
      if (template) {
        await sendBusinessOwnerNotificationToUser(emailOrUsername, template);
      } else {
        console.log('❌ Business owner template not found. Available templates: businessOwnerPaymentReminder, businessOwnerPaymentOverdue, businessOwnerNewFeature, businessOwnerMaintenance, businessOwnerOrderAlert, businessOwnerInventoryLow');
      }
      break;

    case 'send-business-custom':
      if (!emailOrUsername || !customTitle || !customMessage) {
        console.log('Usage: node businessOwnerNotificationManager.js send-business-custom <email> <title> <message>');
        break;
      }
      const customNotification = businessOwnerNotificationTemplates.businessOwnerCustom(customTitle, customMessage);
      await sendBusinessOwnerNotificationToUser(emailOrUsername, customNotification);
      break;

    case 'send-to-all-business-owners':
      if (!templateName) {
        console.log('Usage: node businessOwnerNotificationManager.js send-to-all-business-owners <template_name>');
        break;
      }
      const templateForAll = businessOwnerNotificationTemplates[templateName];
      if (templateForAll) {
        await sendBusinessOwnerNotificationToAllBusinessOwners(templateForAll);
      } else {
        console.log('❌ Business owner template not found.');
      }
      break;

    case 'list-business-notifications':
      if (!emailOrUsername) {
        console.log('Usage: node businessOwnerNotificationManager.js list-business-notifications <email>');
        break;
      }
      await listBusinessOwnerNotifications(emailOrUsername);
      break;

    case 'mark-business-read':
      if (!emailOrUsername || !process.argv[4]) {
        console.log('Usage: node businessOwnerNotificationManager.js mark-business-read <email> <notification_id>');
        break;
      }
      await markBusinessOwnerNotificationAsRead(emailOrUsername, process.argv[4]);
      break;

    default:
      console.log('🏢 Business Owner Notification Management Tool');
      console.log('─'.repeat(60));
      console.log('Commands:');
      console.log('  send-business-template <email> <template>     - Send pre-built business owner notification');
      console.log('  send-business-custom <email> <title> <msg>    - Send custom business owner notification');
      console.log('  send-to-all-business-owners <template>        - Send to all business owners');
      console.log('  list-business-notifications <email>           - List business owner notifications');
      console.log('  mark-business-read <email> <notification_id>  - Mark business notification as read');
      console.log('');
      console.log('Available Business Owner Templates:');
      console.log('  businessOwnerPaymentReminder, businessOwnerPaymentOverdue, businessOwnerNewFeature');
      console.log('  businessOwnerMaintenance, businessOwnerOrderAlert, businessOwnerInventoryLow');
      console.log('');
      console.log('Examples:');
      console.log('  node businessOwnerNotificationManager.js send-business-template sarah@candleshop.com businessOwnerPaymentReminder');
      console.log('  node businessOwnerNotificationManager.js send-business-custom john@example.com "Business Alert" "Please check your inventory"');
      console.log('  node businessOwnerNotificationManager.js send-to-all-business-owners businessOwnerMaintenance');
      console.log('  node businessOwnerNotificationManager.js list-business-notifications sarah@candleshop.com');
      break;
  }

  mongoose.connection.close();
};

main(); 