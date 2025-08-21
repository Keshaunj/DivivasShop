# 🔐 Admin Permission System

## Overview
This is a professional, Shopify-like permission system that allows granular control over what different admin users can do in your system.

## 🚀 Quick Start

### 1. Create Your First Super Admin
```bash
cd backend
node setup-super-admin.js
```

**Default Super Admin Credentials:**
- Email: `admin@diviaswicka.com`
- Password: `admin123`

⚠️ **Change this password immediately after first login!**

### 2. Login to Admin Panel
1. Go to your site and login with super admin credentials
2. Click "Account" → "Admin Panel"
3. Navigate to "Admin Management" section

## 👑 Permission Levels

### **Super Admin** (`role: 'admin'` + `isAdmin: true`)
- Full access to everything
- Can manage other admins
- Cannot be demoted by other admins

### **Admin** (`role: 'admin`)
- Full access based on assigned permissions
- Can be managed by super admins

### **Manager** (`role: 'manager`)
- Limited access based on permissions
- Typically manages products and orders

### **Support** (`role: 'support`)
- Customer support access
- Can view orders and user information

### **Viewer** (`role: 'viewer`)
- Read-only access to analytics and reports

## 🔧 Available Resources & Actions

| Resource | Actions | Description |
|----------|---------|-------------|
| `products` | read, create, update, delete, manage | Product management |
| `categories` | read, create, update, delete, manage | Category management |
| `orders` | read, update, manage | Order management |
| `users` | read, update, manage | User management |
| `analytics` | read, manage | Dashboard and reports |
| `settings` | read, update, manage | System settings |
| `admin_management` | read, create, update, delete, manage | Admin user management |

## 📱 Admin Management Console Features

### **Search & Filter**
- Search admins by email, username, or role
- Real-time filtering

### **Add New Admins**
- Send email invitations
- Set specific roles and permissions
- Invitations expire in 7 days

### **Manage Permissions**
- Edit existing admin permissions
- Add/remove specific actions
- Granular control over access

### **Remove Admins**
- Safely remove admin roles
- Convert back to regular users
- Audit trail maintained

## 🛡️ Security Features

### **Permission Checking**
```javascript
// In your routes
const { canCreate, canUpdate } = require('../middleware/permissions');

router.post('/products', canCreate('products'), addProduct);
router.put('/products/:id', canUpdate('products'), updateProduct);
```

### **Role Validation**
- All admin actions require proper permissions
- Super admin bypass for critical operations
- Audit logging for admin actions

### **Invitation System**
- Secure token-based invitations
- Time-limited access
- Email verification required

## 🔄 API Endpoints

### **Admin Management**
- `POST /api/admin/invite` - Invite new admin
- `PUT /api/admin/users/:id/permissions` - Update permissions
- `PUT /api/admin/users/:id/remove-admin` - Remove admin role
- `GET /api/admin/invites` - List pending invitations
- `DELETE /api/admin/invites/:id/cancel` - Cancel invitation

### **Permission Checking**
- `GET /api/admin/me/permissions` - Get current user permissions
- `GET /api/admin/permissions` - List all available permissions

## 📊 Database Schema

### **User Model Updates**
```javascript
{
  role: 'admin' | 'manager' | 'support' | 'viewer',
  isAdmin: Boolean,
  permissions: [{
    resource: String,
    actions: [String]
  }],
  invitedBy: ObjectId,
  invitedAt: Date,
  lastAdminAction: Date,
  adminNotes: String,
  isActive: Boolean
}
```

### **AdminInvite Model**
```javascript
{
  email: String,
  role: String,
  permissions: Array,
  invitedBy: ObjectId,
  status: 'pending' | 'accepted' | 'expired' | 'cancelled',
  expiresAt: Date,
  token: String,
  notes: String
}
```

## 🚨 Best Practices

### **Permission Assignment**
1. **Principle of Least Privilege**: Only give necessary permissions
2. **Role-Based**: Use predefined roles when possible
3. **Regular Review**: Audit admin permissions quarterly

### **Security**
1. **Change Default Passwords**: Always change setup passwords
2. **Monitor Admin Actions**: Keep logs of admin activities
3. **Regular Backups**: Backup admin configurations

### **User Management**
1. **Invite Only**: Don't manually create admin accounts
2. **Time Limits**: Set expiration dates for admin access
3. **Documentation**: Keep records of why permissions were granted

## 🔍 Troubleshooting

### **Common Issues**

**"Access Denied" Errors**
- Check if user has required permissions
- Verify role and isAdmin status
- Check if permissions array is properly formatted

**Invitations Not Working**
- Check email configuration
- Verify invitation hasn't expired
- Check if user already exists

**Permission Updates Not Saving**
- Ensure user has admin_management permissions
- Check database connection
- Verify permission schema format

### **Debug Commands**
```bash
# Check admin users
node -e "require('./models/users').find({role: 'admin'}).then(console.log)"

# Check permissions
node -e "require('./models/users').find({permissions: {\$exists: true}}).then(console.log)"
```

## 📈 Future Enhancements

- [ ] Email notification system for admin actions
- [ ] Advanced audit logging
- [ ] Permission templates for common roles
- [ ] Two-factor authentication for admins
- [ ] API rate limiting for admin endpoints
- [ ] Bulk permission updates
- [ ] Permission inheritance system

## 🆘 Support

If you encounter issues:
1. Check the console logs
2. Verify database connections
3. Check permission configurations
4. Review the troubleshooting section above

---

**Built with ❤️ for Divias Wicka Shop**

