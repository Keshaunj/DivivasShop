# 🛠️ Business Owner Admin Commands Documentation

This document contains all the administrative commands for managing business owners and system operations in the Divias Wick Shop multi-tenant platform.

## 📋 Quick Reference

### Business Owner Management
```bash
# Create new business owner (interactive)
node register-business-owner.js

# Make existing user a business owner admin
node utils/management/make-business-admin.js

# List all business owners
node utils/management/businessOwnerManager.js list-owners

# Check business owner status
node utils/management/businessOwnerManager.js check-status <email>

# Upgrade to super admin
node utils/management/businessOwnerManager.js make-admin <email>

# Remove super admin privileges
node utils/management/businessOwnerManager.js remove-admin <email>
```

### Notification Management
```bash
# Send notification to business owners
node utils/notifications/businessOwnerNotificationManager.js

# Send notification to customers
node utils/notifications/userNotificationManager.js
```

### Emergency Tools
```bash
# Reset user password (emergency)
node utils/resetPassword.js <email> <new-password>

# Delete user (emergency)
node utils/deleteUser.js <email>
```

### Debug Tools
```bash
# Test authentication system
node utils/debug/debug-auth.js
```

---

## 🏢 Business Owner Management

### Create New Business Owner (Interactive)
**Command:** `node register-business-owner.js`

**Purpose:** Interactive script to create a new business owner with all required details.

**Features:**
- Prompts for all business owner information
- Validates email/username uniqueness
- Sets up super admin privileges
- Generates storefront URL
- Creates complete business profile

**Example:**
```bash
node register-business-owner.js
```

**What it prompts for:**
- Personal Info: Name, email, phone
- Business Info: Business name, LLC, industry
- Address: Street, city, state, zip
- Account: Username, password

### Make Existing User a Business Owner
**Command:** `node utils/management/make-business-admin.js`

**Purpose:** Converts an existing user account to a business owner admin.

**Features:**
- Finds user by email or username
- Uses existing password (no need to ask)
- Prompts for business details
- Creates business owner account
- Grants super admin privileges

**Example:**
```bash
node utils/management/make-business-admin.js
```

**What it does:**
- ✅ Finds existing user account
- ✅ Preserves existing password
- ✅ Prompts for business information
- ✅ Creates business owner profile
- ✅ Sets `isSuperAdmin: true`
- ✅ Enables multi-storefront access

### List All Business Owners
**Command:** `node utils/management/businessOwnerManager.js list-owners`

**Purpose:** Shows all business owners and their status.

**Example:**
```bash
node utils/management/businessOwnerManager.js list-owners
```

**Output:**
```
🏢 Found 2 business owner(s):
────────────────────────────────────────────────────────────────────────────────
1. keshaunjones48@gmail.com
   Business: Divias Wick Shop
   Super Admin: Yes
   Multi-Storefront: Yes
   Status: Active
   Since: 1/4/2025
```

### Check Business Owner Status
**Command:** `node utils/management/businessOwnerManager.js check-status <email>`

**Purpose:** Shows detailed business owner information and metrics.

**Example:**
```bash
node utils/management/businessOwnerManager.js check-status keshaunjones48@gmail.com
```

### Upgrade to Super Admin
**Command:** `node utils/management/businessOwnerManager.js make-admin <email>`

**Purpose:** Upgrades business owner to super admin with multi-storefront access.

**Example:**
```bash
node utils/management/businessOwnerManager.js make-admin business@divias.com
```

**What it does:**
- Sets `isSuperAdmin: true`
- Sets `accessLevel: 'admin'`
- Enables multi-storefront management
- Grants advanced platform features

### Remove Super Admin Privileges
**Command:** `node utils/management/businessOwnerManager.js remove-admin <email>`

**Purpose:** Removes super admin privileges, downgrades to single storefront.

**Example:**
```bash
node utils/management/businessOwnerManager.js remove-admin business@divias.com
```

**What it does:**
- Sets `isSuperAdmin: false`
- Limits to single storefront
- Removes advanced features

---

## 📢 Notification Management

### Send Business Owner Notifications
**Command:** `node utils/notifications/businessOwnerNotificationManager.js`

**Purpose:** Interactive tool to send notifications to business owners.

**Features:**
- Payment reminders
- System updates
- Custom business notifications
- Multi-tenant support
- Personalized messaging

### Send Customer Notifications
**Command:** `node utils/notifications/userNotificationManager.js`

**Purpose:** Interactive tool to send notifications to customers.

**Features:**
- Order updates
- Promotional messages
- System announcements
- Custom notifications

---

## 🚨 Emergency Tools

### Reset User Password (Emergency)
**Command:** `node utils/resetPassword.js <email> <new-password>`

**Purpose:** Emergency password reset when user is locked out.

**Example:**
```bash
node utils/resetPassword.js keshaunjones48@gmail.com newpassword123
```

**⚠️ Warning:** This bypasses normal password reset flow. Use only in emergencies.

### Delete User (Emergency)
**Command:** `node utils/deleteUser.js <email>`

**Purpose:** Permanently delete a user account.

**Example:**
```bash
node utils/deleteUser.js spam@example.com
```

**⚠️ Warning:** This action is irreversible. Use with extreme caution.

---

## 🔧 Debug Tools

### Test Authentication System
**Command:** `node utils/debug/debug-auth.js`

**Purpose:** Comprehensive test of authentication system.

**Tests:**
- JWT_SECRET configuration
- Password hashing
- Password comparison
- JWT token creation/verification
- Cookie settings
- Database connection

**Safety:**
- ✅ Production blocked - Won't run if `NODE_ENV=production`
- ✅ No sensitive data - Only shows counts, not user details
- ✅ Console only - Server-side logs only

---

## 📊 Common Use Cases

### New Business Owner Setup
```bash
# Option 1: Create from scratch (interactive)
node register-business-owner.js

# Option 2: Convert existing user
node utils/management/make-business-admin.js
```

### Business Owner Support
```bash
# 1. Check business owner status
node utils/management/businessOwnerManager.js check-status business@divias.com

# 2. Send notification if needed
node utils/notifications/businessOwnerNotificationManager.js
```

### Super Admin Management
```bash
# 1. Upgrade to super admin
node utils/management/businessOwnerManager.js make-admin business@divias.com

# 2. Verify super admin status
node utils/management/businessOwnerManager.js list-owners
```

### Emergency Recovery
```bash
# 1. Reset locked out user
node utils/resetPassword.js user@email.com newpassword123

# 2. Verify login works
node utils/debug/debug-auth.js
```

---

## 🎯 Best Practices

### Security
- ✅ Always verify business owner identity before making changes
- ✅ Use specific email addresses, not generic ones
- ✅ Document all admin actions
- ✅ Test commands on non-production data first

### Business Owner Management
- ✅ Check business owner status before making changes
- ✅ Use `list-owners` to verify changes
- ✅ Provide clear reasons for privilege changes
- ✅ Monitor business owner metrics

### Multi-Tenant Platform
- ✅ Super admins can manage multiple storefronts
- ✅ Regular business owners manage single storefront
- ✅ Use notifications for important platform updates
- ✅ Monitor subscription status and billing

### Emergency Procedures
- ✅ Use emergency tools only when necessary
- ✅ Document emergency actions
- ✅ Follow up with proper password reset
- ✅ Notify affected business owners

---

## 📝 Notes for Developers

### File Locations
- **Business Owner Creation:** `register-business-owner.js`, `utils/management/make-business-admin.js`
- **Business Owner Management:** `utils/management/businessOwnerManager.js`
- **Notifications:** `utils/notifications/`
- **Emergency Tools:** `utils/resetPassword.js`, `utils/deleteUser.js`
- **Debug Tools:** `utils/debug/debug-auth.js`

### Database Models
- **BusinessOwner:** `models/businessOwners.js`
- **User:** `models/users.js`

### Key Fields
- **Business Owner:** `isSuperAdmin`, `accessLevel`, `businessName`, `storefrontUrl`
- **Super Admin:** `isSuperAdmin: true` (multi-storefront access)
- **Regular Business Owner:** `isSuperAdmin: false` (single storefront)

### Environment Variables
- `JWT_SECRET` - Required for all operations
- `MONGODB_URI` - Database connection
- `NODE_ENV` - Affects cookie settings

---

## 🏗️ Platform Architecture

### Multi-Tenant Structure
- **Platform Level:** Super admins manage multiple storefronts
- **Storefront Level:** Business owners manage their individual stores
- **Customer Level:** Users shop across different storefronts

### Access Levels
- **Super Admin:** Multi-storefront management, platform-wide access
- **Business Owner:** Single storefront management, basic admin features
- **Customer:** Shopping, orders, profile management

### Future Features
- Advanced super admin perks (coming soon)
- Multi-storefront analytics
- Cross-storefront promotions
- Advanced business owner tools

---

**Last Updated:** January 4, 2025  
**Version:** 2.0  
**Platform:** Divias Wick Shop Multi-Tenant E-commerce  
**Maintainer:** Development Team 