# Admin Panel Structure

This folder contains all admin-related components and functionality for the Divias Wicka Shop platform.

## 📁 Folder Organization

### `/admin/`
- **AdminDashboard.jsx** - Main business owner admin panel
- **SuperAdminPanel.jsx** - Developer super admin panel with platform-wide access

### `/admin/corporate-portal/`
- **CorporatePortal.jsx** - Secure corporate portal requiring separate authentication
- **index.js** - Clean export for the corporate portal

## 🔒 Security Features

### Corporate Portal
- **Separate Authentication** - Requires login even if already authenticated in main app
- **Session Isolation** - Corporate and main app sessions are separate
- **Permission Checking** - Only admin users can access corporate features
- **Secure Access** - No direct admin panel buttons in main navigation

### Admin Access
- **Role-Based Access** - Different permissions for different admin types
- **Protected Routes** - Admin panels wrapped with authentication middleware
- **Permission Validation** - Backend checks user permissions before granting access

## 🚀 Usage

### For Business Owners
1. Navigate to `/corporate` 
2. Authenticate with corporate credentials
3. Access business management features via Admin Panel

### For Super Admins
1. Navigate to `/corporate`
2. Authenticate with super admin credentials  
3. Access platform-wide management via Super Admin Panel

## 🔧 Development

### Adding New Admin Features
- Place new admin components in appropriate subfolders
- Use consistent naming conventions
- Implement proper permission checking
- Add to relevant admin panels based on access level

### Security Considerations
- Always validate permissions on both frontend and backend
- Use separate authentication for sensitive admin functions
- Implement proper session management
- Log all admin actions for audit purposes
