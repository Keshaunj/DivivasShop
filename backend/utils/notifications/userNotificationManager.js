const mongoose = require('mongoose');
const User = require('../../models/users');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Pre-built user notification messages
const userNotificationTemplates = {
  // Order notifications
  orderConfirmation: {
    title: 'Order Confirmation',
    message: 'Thank you for your order! Your order has been confirmed and is being processed.',
    type: 'success',
    details: 'You will receive updates as your order progresses through our system.',
    actions: [
      'Track your order in your account',
      'Review order details',
      'Contact support if needed'
    ]
  },

  orderShipped: {
    title: 'Order Shipped',
    message: 'Great news! Your order has been shipped and is on its way to you.',
    type: 'success',
    details: 'You can track your package using the tracking number provided.',
    actions: [
      'Track your package',
      'View order details',
      'Contact support for questions'
    ]
  },

  orderDelivered: {
    title: 'Order Delivered',
    message: 'Your order has been delivered! We hope you love your new candles.',
    type: 'success',
    details: 'Please let us know how you enjoyed your purchase.',
    actions: [
      'Leave a review',
      'Shop for more candles',
      'Contact support if needed'
    ]
  },

  // Account notifications
  accountCreated: {
    title: 'Welcome to Divias Wicka Shop!',
    message: 'Your account has been created successfully. Welcome to our candle family!',
    type: 'success',
    details: 'You can now browse our products, save favorites, and track your orders.',
    actions: [
      'Browse our products',
      'Complete your profile',
      'Explore our categories'
    ]
  },

  passwordReset: {
    title: 'Password Reset Request',
    message: 'We received a request to reset your password. Click the link below to proceed.',
    type: 'info',
    details: 'If you did not request this, please ignore this message.',
    actions: [
      'Reset your password',
      'Contact support if needed',
      'Secure your account'
    ]
  },

  // Promotional notifications
  newProductAlert: {
    title: 'New Candles Available!',
    message: 'We\'ve added new scented candles to our collection. Check them out!',
    type: 'update',
    details: 'Discover our latest seasonal and limited edition candles.',
    actions: [
      'Shop new products',
      'View all candles',
      'Save favorites'
    ]
  },

  saleNotification: {
    title: 'Special Sale Alert!',
    message: 'Don\'t miss out on our special sale! Get amazing discounts on selected candles.',
    type: 'update',
    details: 'Limited time offer - shop now before items sell out.',
    actions: [
      'Shop the sale',
      'View sale items',
      'Share with friends'
    ]
  },

  // Custom user notification template
  userCustom: (title, message, type = 'info', details = null, actions = null) => ({
    title,
    message,
    type,
    details,
    actions
  })
};

// Send user notification to specific user
const sendUserNotificationToUser = async (emailOrUsername, notificationData) => {
  try {
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      console.log('❌ User not found. Please check the email or username.');
      return;
    }

    // Add notification to user's notifications array
    if (!user.notifications) {
      user.notifications = [];
    }

    const notification = {
      id: new mongoose.Types.ObjectId(),
      ...notificationData,
      sentAt: new Date(),
      read: false
    };

    user.notifications.push(notification);
    await user.save();

    console.log(`✅ User notification sent to ${user.username || user.email}!`);
    console.log(`Title: ${notification.title}`);
    console.log(`Type: ${notification.type}`);
    console.log(`Sent at: ${notification.sentAt.toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error sending user notification:', error);
  }
};

// Send user notification to all users
const sendUserNotificationToAllUsers = async (notificationData) => {
  try {
    const users = await User.find({ role: 'user' });

    if (users.length === 0) {
      console.log('❌ No users found.');
      return;
    }

    console.log(`📤 Sending user notification to ${users.length} users...`);

    for (const user of users) {
      if (!user.notifications) {
        user.notifications = [];
      }

      const notification = {
        id: new mongoose.Types.ObjectId(),
        ...notificationData,
        sentAt: new Date(),
        read: false
      };

      user.notifications.push(notification);
      await user.save();

      console.log(`✅ Sent to user: ${user.username || user.email}`);
    }

    console.log(`🎉 User notification sent to all ${users.length} users!`);
    
  } catch (error) {
    console.error('❌ Error sending user notifications:', error);
  }
};

// List all user notifications for a user
const listUserNotifications = async (emailOrUsername) => {
  try {
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      console.log('❌ User not found. Please check the email or username.');
      return;
    }

    if (!user.notifications || user.notifications.length === 0) {
      console.log(`📋 No user notifications found for ${user.username || user.email}`);
      return;
    }

    console.log(`📋 User Notifications for ${user.username || user.email}:`);
    console.log('─'.repeat(80));
    
    user.notifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title}`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Sent: ${notification.sentAt.toLocaleString()}`);
      console.log(`   Read: ${notification.read ? 'Yes' : 'No'}`);
      console.log(`   Message: ${notification.message.substring(0, 100)}...`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing user notifications:', error);
  }
};

// Mark user notification as read
const markUserNotificationAsRead = async (emailOrUsername, notificationId) => {
  try {
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      console.log('❌ User not found. Please check the email or username.');
      return;
    }

    if (!user.notifications) {
      console.log('❌ No user notifications found for this user.');
      return;
    }

    const notification = user.notifications.find(n => n.id.toString() === notificationId);
    if (!notification) {
      console.log('❌ User notification not found.');
      return;
    }

    notification.read = true;
    await user.save();

    console.log(`✅ Marked user notification as read: ${notification.title}`);
    
  } catch (error) {
    console.error('❌ Error marking user notification as read:', error);
  }
};

// Main function to handle commands
const main = async () => {
  const command = process.argv[2];
  const emailOrUsername = process.argv[3];
  const templateName = process.argv[4];
  const customTitle = process.argv[5];
  const customMessage = process.argv[6];

  switch (command) {
    case 'send-user-template':
      if (!emailOrUsername || !templateName) {
        console.log('Usage: node userNotificationManager.js send-user-template <email> <template_name>');
        console.log('Available user templates: orderConfirmation, orderShipped, orderDelivered, accountCreated, passwordReset, newProductAlert, saleNotification');
        break;
      }
      const template = userNotificationTemplates[templateName];
      if (template) {
        await sendUserNotificationToUser(emailOrUsername, template);
      } else {
        console.log('❌ User template not found. Available templates: orderConfirmation, orderShipped, orderDelivered, accountCreated, passwordReset, newProductAlert, saleNotification');
      }
      break;

    case 'send-user-custom':
      if (!emailOrUsername || !customTitle || !customMessage) {
        console.log('Usage: node userNotificationManager.js send-user-custom <email> <title> <message>');
        break;
      }
      const customNotification = userNotificationTemplates.userCustom(customTitle, customMessage);
      await sendUserNotificationToUser(emailOrUsername, customNotification);
      break;

    case 'send-to-all-users':
      if (!templateName) {
        console.log('Usage: node userNotificationManager.js send-to-all-users <template_name>');
        break;
      }
      const templateForAll = userNotificationTemplates[templateName];
      if (templateForAll) {
        await sendUserNotificationToAllUsers(templateForAll);
      } else {
        console.log('❌ User template not found.');
      }
      break;

    case 'list-user-notifications':
      if (!emailOrUsername) {
        console.log('Usage: node userNotificationManager.js list-user-notifications <email>');
        break;
      }
      await listUserNotifications(emailOrUsername);
      break;

    case 'mark-user-read':
      if (!emailOrUsername || !process.argv[4]) {
        console.log('Usage: node userNotificationManager.js mark-user-read <email> <notification_id>');
        break;
      }
      await markUserNotificationAsRead(emailOrUsername, process.argv[4]);
      break;

    default:
      console.log('👤 User Notification Management Tool');
      console.log('─'.repeat(60));
      console.log('Commands:');
      console.log('  send-user-template <email> <template>     - Send pre-built user notification');
      console.log('  send-user-custom <email> <title> <msg>    - Send custom user notification');
      console.log('  send-to-all-users <template>              - Send to all users');
      console.log('  list-user-notifications <email>           - List user notifications');
      console.log('  mark-user-read <email> <notification_id>  - Mark user notification as read');
      console.log('');
      console.log('Available User Templates:');
      console.log('  orderConfirmation, orderShipped, orderDelivered, accountCreated');
      console.log('  passwordReset, newProductAlert, saleNotification');
      console.log('');
      console.log('Examples:');
      console.log('  node userNotificationManager.js send-user-template john@example.com orderConfirmation');
      console.log('  node userNotificationManager.js send-user-custom sarah@email.com "Welcome" "Thanks for joining us!"');
      console.log('  node userNotificationManager.js send-to-all-users newProductAlert');
      console.log('  node userNotificationManager.js list-user-notifications john@example.com');
      break;
  }

  mongoose.connection.close();
};

main(); 