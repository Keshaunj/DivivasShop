/**
 * Give an existing user in the `users` collection admin privileges.
 *
 * Usage:
 *   node scripts/make-admin.js <email>           # regular admin
 *   node scripts/make-admin.js <email> --super   # super admin (can manage other admins)
 *
 * Example:
 *   node scripts/make-admin.js you@example.com --super
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const FULL_ADMIN_PERMISSIONS = [
  { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'orders', actions: ['read', 'update'] },
  { resource: 'users', actions: ['read', 'update'] },
  { resource: 'analytics', actions: ['read'] },
  { resource: 'settings', actions: ['read', 'update'] }
];

const SUPER_ADMIN_PERMISSIONS = [
  ...FULL_ADMIN_PERMISSIONS,
  { resource: 'admin_management', actions: ['read', 'create', 'update', 'delete', 'manage'] },
  { resource: 'business_management', actions: ['read', 'create', 'update', 'delete', 'manage', 'approve', 'suspend'] },
  { resource: 'system_config', actions: ['read', 'configure'] },
  { resource: 'reports', actions: ['read', 'manage'] },
  { resource: 'security', actions: ['read', 'manage', 'audit'] },
  { resource: 'billing', actions: ['read', 'manage'] }
];

async function main() {
  const args = process.argv.slice(2);
  const email = args.find(a => !a.startsWith('--'));
  const isSuper = args.includes('--super');

  if (!email || !email.includes('@')) {
    console.log('Usage: node scripts/make-admin.js <email> [--super]');
    console.log('  --super  grant super admin (can manage other admins)');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/divias-shop';
  await mongoose.connect(uri);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error('No user found with email:', email);
    process.exit(1);
  }

  const permissions = isSuper ? SUPER_ADMIN_PERMISSIONS : FULL_ADMIN_PERMISSIONS;
  await User.findByIdAndUpdate(user._id, {
    role: 'admin',
    isAdmin: true,
    adminProfile: {
      adminId: user.adminProfile?.adminId || `ADM-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      adminLevel: isSuper ? 'super_admin' : 'admin',
      superadmin: isSuper,
      permissions,
      adminStatus: 'active'
    }
  });

  console.log('Done.');
  console.log(email, 'is now', isSuper ? 'a super admin' : 'an admin');
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
