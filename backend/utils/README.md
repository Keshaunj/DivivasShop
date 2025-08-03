# 🛠️ Backend Utilities

This directory contains utility scripts and services for the Divias Wicka Shop backend.

## 📁 Directory Structure

### `authentication/`
JWT utilities for user authentication:
- `jwt.js` - User JWT functions
- `businessOwnerJWT.js` - Business owner JWT functions

### `email/`
Email services and templates:
- `emailService.js` - Gmail SMTP integration
- `index.js` - Clean export interface
- `EMAIL_SETUP.md` - Gmail configuration guide
- `README.md` - Email utilities documentation

### `management/`
Console-based management scripts:
- `userAdminManager.js` - User admin/subscription management
- `businessOwnerManager.js` - Business owner management

### `notifications/`
Notification sending utilities:
- `userNotificationManager.js` - Customer notifications
- `businessOwnerNotificationManager.js` - Business owner notifications

### `businessNotifications/`
Business owner notification components (legacy)

## 🚀 Quick Start

```bash
# Make a user admin
node utils/management/userAdminManager.js user@example.com

# Send business owner notification
node utils/notifications/businessOwnerNotificationManager.js

# Reset user password (emergency)
node utils/resetPassword.js user@example.com newpassword
```

## 📧 Email Setup

For email functionality, see `email/EMAIL_SETUP.md` for Gmail SMTP configuration.

## 🔐 Admin Documentation

Detailed admin utilities documentation is in `admin.md` (private).

---

**Note**: These utilities are for backend administration and should not be exposed to the frontend. 