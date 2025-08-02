# 🔐 Private Admin Documentation - Utils Directory Structure

This directory contains organized utility files for the Divias Wicka Shop backend.

## 📁 Directory Structure

```
backend/utils/
├── authentication/
│   ├── jwt.js                           # Regular user JWT authentication
│   └── businessOwnerJWT.js              # Business owner JWT authentication
├── management/
│   ├── userAdminManager.js              # User admin management CLI tool
│   └── businessOwnerManager.js          # Business owner management CLI tool
├── notifications/
│   ├── userNotificationManager.js       # User (customer) notification CLI tool
│   └── businessOwnerNotificationManager.js  # Business owner notification CLI tool
└── admin.md                             # This private documentation
```

## 🔐 Authentication Utils

### `authentication/jwt.js`
- **Purpose**: JWT authentication for regular users
- **Functions**:
  - `generateToken(user)` - Generate JWT token for users
  - `verifyToken(token)` - Verify JWT token
  - `authenticateToken` - Middleware for user authentication

### `authentication/businessOwnerJWT.js`
- **Purpose**: JWT authentication for business owners
- **Functions**:
  - `generateBusinessOwnerToken(businessOwner)` - Generate JWT token for business owners
  - `verifyBusinessOwnerToken(token)` - Verify business owner JWT token
  - `authenticateBusinessOwnerToken` - Middleware for business owner authentication

## 🛠️ Management Utils

### `management/userAdminManager.js`
- **Purpose**: CLI tool for managing regular user admins
- **Commands**:
  ```bash
  node utils/management/userAdminManager.js make-admin <email>
  node utils/management/userAdminManager.js remove-admin <email>
  node utils/management/userAdminManager.js list-admins
  node utils/management/userAdminManager.js check-subscription <email>
  node utils/management/userAdminManager.js revoke-access <email> [reason]
  node utils/management/userAdminManager.js restore-access <email>
  ```

### `management/businessOwnerManager.js`
- **Purpose**: CLI tool for managing business owners
- **Commands**:
  ```bash
  node utils/management/businessOwnerManager.js list
  node utils/management/businessOwnerManager.js details <email>
  node utils/management/businessOwnerManager.js update-status <email> <status> [reason]
  node utils/management/businessOwnerManager.js update-subscription <email> <status>
  node utils/management/businessOwnerManager.js make-super-admin <email>
  node utils/management/businessOwnerManager.js remove-super-admin <email>
  node utils/management/businessOwnerManager.js list-super-admins
  node utils/management/businessOwnerManager.js add-notes <email> <notes>
  ```

## 🔔 Notification Utils

### `notifications/userNotificationManager.js`
- **Purpose**: CLI tool for sending notifications to regular users (customers)
- **Commands**:
  ```bash
  node utils/notifications/userNotificationManager.js send-user-template <email> <template>
  node utils/notifications/userNotificationManager.js send-user-custom <email> <title> <message>
  node utils/notifications/userNotificationManager.js send-to-all-users <template>
  node utils/notifications/userNotificationManager.js list-user-notifications <email>
  node utils/notifications/userNotificationManager.js mark-user-read <email> <notification_id>
  ```

### `notifications/businessOwnerNotificationManager.js`
- **Purpose**: CLI tool for sending notifications to business owners
- **Commands**:
  ```bash
  node utils/notifications/businessOwnerNotificationManager.js send-business-template <email> <template>
  node utils/notifications/businessOwnerNotificationManager.js send-business-custom <email> <title> <message>
  node utils/notifications/businessOwnerNotificationManager.js send-to-all-business-owners <template>
  node utils/notifications/businessOwnerNotificationManager.js list-business-notifications <email>
  node utils/notifications/businessOwnerNotificationManager.js mark-business-read <email> <notification_id>
  ```

## 🚀 Quick Start Examples

### Create a Test Admin User
```bash
# First, create a user through the API or database
# Then make them an admin:
node utils/management/userAdminManager.js make-admin test@example.com
```

### Manage Business Owners
```bash
# List all business owners
node utils/management/businessOwnerManager.js list

# Get details of a specific business owner
node utils/management/businessOwnerManager.js details sarah@candleshop.com

# Update business owner status
node utils/management/businessOwnerManager.js update-status sarah@candleshop.com active
```

### Send User Notifications (Customers)
```bash
# Send order confirmation to customer
node utils/notifications/userNotificationManager.js send-user-template john@example.com orderConfirmation

# Send new product alert to all customers
node utils/notifications/userNotificationManager.js send-to-all-users newProductAlert

# Send custom notification to customer
node utils/notifications/userNotificationManager.js send-user-custom sarah@email.com "Welcome" "Thanks for joining us!"
```

### Send Business Owner Notifications
```bash
# Send payment reminder to business owner
node utils/notifications/businessOwnerNotificationManager.js send-business-template sarah@candleshop.com businessOwnerPaymentReminder

# Send custom notification to business owner
node utils/notifications/businessOwnerNotificationManager.js send-business-custom sarah@candleshop.com "Important Update" "Please check your inventory"
```

## 📋 Available Templates

### User (Customer) Notification Templates
- `orderConfirmation` - Order confirmed
- `orderShipped` - Order shipped
- `orderDelivered` - Order delivered
- `accountCreated` - Welcome message
- `passwordReset` - Password reset request
- `newProductAlert` - New products available
- `saleNotification` - Sale announcements

### Business Owner Notification Templates
- `businessOwnerPaymentReminder` - Payment due soon
- `businessOwnerPaymentOverdue` - Payment overdue
- `businessOwnerNewFeature` - New features available
- `businessOwnerMaintenance` - Scheduled maintenance
- `businessOwnerOrderAlert` - New order received
- `businessOwnerInventoryLow` - Low inventory alert

## 🔧 Usage Notes

1. **All CLI tools** require MongoDB connection (handled automatically)
2. **Authentication utils** are used as middleware in routes
3. **Management tools** can be run from the backend directory
4. **User notifications** are for regular customers
5. **Business owner notifications** are for business owners only
6. **All tools** include help commands when run without parameters

## 🎯 Benefits of This Structure

- **Clear separation** of concerns
- **Separate notification systems** for different user types
- **Easy to find** specific functionality
- **Consistent naming** conventions
- **Scalable** for future additions
- **Well-documented** with examples
- **Organized** by functionality type

## 🔄 Notification System Separation

### User Notifications (Customers)
- **Order updates** (confirmation, shipped, delivered)
- **Account notifications** (welcome, password reset)
- **Promotional messages** (new products, sales)

### Business Owner Notifications
- **Payment reminders** and overdue notices
- **App updates** and maintenance alerts
- **Business alerts** (new orders, low inventory)
- **Subscription management** notifications

## 🔐 Private Access Only

This documentation is for internal use only. Do not share this file publicly as it contains sensitive information about the system's internal structure and admin commands. 