# Role-Based User Management System

This directory contains separate user models for different roles in your e-commerce platform, replacing the single monolithic user model with a more scalable and maintainable structure.

## 🏗️ Architecture Overview

### Base User Schema (`baseUser.js`)
- **Common fields** shared across all user types
- **Security features**: password hashing, account locking, 2FA support
- **Profile management**: notifications, preferences, security tracking
- **Authentication methods**: password comparison, account status checks

### Role-Specific Models

#### 👥 **Customer** (`Customer.js`)
- **Purpose**: End consumers who purchase products
- **Features**:
  - Shopping preferences and addresses
  - Customer metrics (orders, spending, loyalty points)
  - Referral system and support tickets
  - Customer tier system (bronze → diamond)

#### 🏢 **Business Owner** (`BusinessOwner.js`)
- **Purpose**: Business owners who sell products on your platform
- **Features**:
  - Business information and verification
  - Business settings and hours
  - Payment and billing information
  - Business metrics and performance tracking

#### 👔 **Manager** (`Manager.js`)
- **Purpose**: Team leaders who manage specific departments
- **Features**:
  - Department-specific permissions
  - Team management and performance tracking
  - KPI monitoring and goal setting
  - Order approval and staff management

#### 🎧 **Support** (`Support.js`)
- **Purpose**: Customer service representatives
- **Features**:
  - Specialization and skill levels
  - Ticket management and workload tracking
  - Performance metrics and quality scoring
  - Working hours and availability

#### 👁️ **Viewer** (`Viewer.js`)
- **Purpose**: Read-only access users (analysts, auditors, etc.)
- **Features**:
  - Access level-based permissions
  - Data export and download capabilities
  - Subscription management
  - Access logging and restrictions

#### 🔐 **Admin** (`Admin.js`)
- **Purpose**: Platform administrators with varying access levels
- **Features**:
  - Admin level hierarchy (super_admin → support_admin)
  - Comprehensive permission system
  - Activity logging and audit trails
  - Security and access control

## 🚀 Benefits of New Structure

### ✅ **Scalability**
- Each role has its own collection, allowing for better performance
- Easier to add new roles without affecting existing ones
- Better database indexing and query optimization

### ✅ **Maintainability**
- Clear separation of concerns
- Role-specific business logic in dedicated models
- Easier to update and extend individual roles

### ✅ **Security**
- Granular permission control
- Role-based access restrictions
- Better audit trails and logging

### ✅ **Flexibility**
- Easy to add new fields to specific roles
- Role-specific methods and validations
- Better support for complex business rules

## 🔄 Migration Process

### 1. **Backup Your Database**
```bash
mongodump --uri="your_mongodb_uri" --out=backup_before_migration
```

### 2. **Run Migration Script**
```bash
cd backend/scripts
node migrate-users.js
```

### 3. **Verify Migration**
- Check that all users are properly categorized
- Verify permissions and settings are preserved
- Test authentication and authorization

### 4. **Update Application Code**
- Update imports to use new models
- Modify controllers to work with role-specific models
- Update frontend to handle new user structure

## 📊 Database Collections

After migration, you'll have these collections:
- `customers` - End consumers
- `businessowners` - Business sellers
- `managers` - Team leaders
- `supports` - Customer service
- `viewers` - Read-only users
- `admins` - Platform administrators

## 🔧 Usage Examples

### Creating a New Customer
```javascript
const { Customer } = require('./models/users');
const customer = new Customer({
  email: 'customer@example.com',
  password: 'securepassword',
  firstName: 'John',
  lastName: 'Doe'
});
await customer.save();
```

### Creating a Business Owner
```javascript
const { BusinessOwner } = require('./models/users');
const businessOwner = new BusinessOwner({
  email: 'business@example.com',
  password: 'securepassword',
  businessInfo: {
    businessName: 'My Candle Shop',
    businessType: 'retail'
  }
});
await businessOwner.save();
```

### Checking Permissions
```javascript
const admin = await Admin.findById(adminId);
if (admin.canPerformAction('users', 'create')) {
  // Allow user creation
}
```

## ⚠️ Important Notes

1. **Backward Compatibility**: The old user model is preserved during migration
2. **Authentication**: All models inherit from baseUser, so authentication works the same
3. **Permissions**: Each role has appropriate default permissions
4. **Validation**: Role-specific validation rules are enforced
5. **Indexes**: Each model has optimized indexes for common queries

## 🆘 Troubleshooting

### Common Issues
- **Duplicate emails**: Ensure email uniqueness across all models
- **Permission errors**: Check role-specific permission settings
- **Migration failures**: Verify database connectivity and permissions

### Support
- Check migration logs for detailed error information
- Verify that all required fields are provided
- Ensure database has sufficient storage and permissions

## 🔮 Future Enhancements

- **Role inheritance**: Support for users with multiple roles
- **Dynamic permissions**: Runtime permission modification
- **Advanced analytics**: Role-specific performance metrics
- **API rate limiting**: Role-based API access controls

