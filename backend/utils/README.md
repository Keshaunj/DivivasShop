# 🛠️ Backend Utilities

This directory contains utility scripts and services for the Divias Wick Shop backend.

## 📁 Directory Structure

### `authentication/`
JWT utilities for authentication:
- `jwt.js` - User JWT functions
- `businessOwnerJWT.js` - Business owner JWT functions

### `debug/`
Development debugging tools:
- `debug-auth.js` - Authentication system testing
- `README.md` - Debug tools documentation

### `management/`
Console-based management scripts:
- `businessOwnerManager.js` - Business owner management and super admin operations
- `make-business-admin.js` - Convert user to business owner

### `notifications/`
Notification sending utilities:
- `userNotificationManager.js` - Customer notifications
- `businessOwnerNotificationManager.js` - Business owner notifications

### Root Level Scripts
- `register-business-owner.js` - Interactive business owner creation
- `resetPassword.js` - Emergency password reset
- `deleteUser.js` - Emergency user deletion

## 🚀 Quick Start

```bash
# Create new business owner (interactive)
node register-business-owner.js

# Make existing user a business owner
node utils/management/make-business-admin.js

# Send business owner notification
node utils/notifications/businessOwnerNotificationManager.js

# Reset user password (emergency)
node utils/resetPassword.js user@example.com newpassword

# Debug authentication system
node utils/debug/debug-auth.js
```

## 🔐 Admin Documentation

Detailed admin utilities documentation is in `ADMIN_COMMANDS.md` in the backend root.

## 🏗️ Platform Architecture

This is a multi-tenant e-commerce platform where:
- **Super Admins** manage multiple storefronts
- **Business Owners** manage individual storefronts  
- **Customers** shop across different storefronts

---

**Note**: These utilities are for backend administration and should not be exposed to the frontend. 