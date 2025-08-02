const mongoose = require('mongoose');
const User = require('../../models/users');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Make user admin
const makeUserAdmin = async (emailOrUsername) => {
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

    user.role = 'admin';
    user.isAdmin = true;
    await user.save();

    console.log(`✅ ${user.username || user.email} is now an admin!`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Is Admin: ${user.isAdmin}`);
    
  } catch (error) {
    console.error('❌ Error making user admin:', error);
  }
};

// Remove admin privileges
const removeAdmin = async (emailOrUsername) => {
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

    user.role = 'user';
    user.isAdmin = false;
    await user.save();

    console.log(`✅ Admin privileges removed from ${user.username || user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Is Admin: ${user.isAdmin}`);
    
  } catch (error) {
    console.error('❌ Error removing admin:', error);
  }
};

// List all admins
const listAdmins = async () => {
  try {
    const admins = await User.find({ 
      $or: [{ role: 'admin' }, { isAdmin: true }] 
    }).select('username email role isAdmin createdAt');

    if (admins.length === 0) {
      console.log('👑 No admin users found.');
      return;
    }

    console.log(`👑 Found ${admins.length} admin user(s):`);
    console.log('─'.repeat(80));
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.username || admin.email}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Is Admin: ${admin.isAdmin}`);
      console.log(`   Since: ${admin.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing admins:', error);
  }
};

// Check user subscription status
const checkSubscription = async (emailOrUsername) => {
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

    console.log(`📊 Subscription Status for ${user.username || user.email}:`);
    console.log('─'.repeat(60));
    console.log(`Subscription Status: ${user.subscriptionStatus || 'Not set'}`);
    console.log(`Subscription Expiry: ${user.subscriptionExpiry ? user.subscriptionExpiry.toLocaleDateString() : 'Not set'}`);
    console.log(`Access Revoked: ${user.accessRevokedAt ? user.accessRevokedAt.toLocaleDateString() : 'No'}`);
    console.log(`Revocation Reason: ${user.revocationReason || 'None'}`);
    console.log(`Billing Cycle: ${user.billingCycle || 'Not set'}`);
    console.log(`Last Payment: ${user.lastPaymentDate ? user.lastPaymentDate.toLocaleDateString() : 'Not set'}`);
    console.log(`Next Payment: ${user.nextPaymentDate ? user.nextPaymentDate.toLocaleDateString() : 'Not set'}`);
    
  } catch (error) {
    console.error('❌ Error checking subscription:', error);
  }
};

// Revoke access for non-paying customers
const revokeAccess = async (emailOrUsername, reason = 'Payment overdue') => {
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

    user.subscriptionStatus = 'revoked';
    user.accessRevokedAt = new Date();
    user.revocationReason = reason;
    await user.save();

    console.log(`✅ Access revoked for ${user.username || user.email}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Revoked at: ${user.accessRevokedAt.toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error revoking access:', error);
  }
};

// Restore access for paying customers
const restoreAccess = async (emailOrUsername) => {
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

    user.subscriptionStatus = 'active';
    user.accessRevokedAt = null;
    user.revocationReason = null;
    await user.save();

    console.log(`✅ Access restored for ${user.username || user.email}`);
    console.log(`   Subscription Status: ${user.subscriptionStatus}`);
    
  } catch (error) {
    console.error('❌ Error restoring access:', error);
  }
};

// Main function to handle commands
const main = async () => {
  const command = process.argv[2];
  const emailOrUsername = process.argv[3];
  const reason = process.argv[4];

  switch (command) {
    case 'make-admin':
      if (!emailOrUsername) {
        console.log('Usage: node userAdminManager.js make-admin <email_or_username>');
        break;
      }
      await makeUserAdmin(emailOrUsername);
      break;

    case 'remove-admin':
      if (!emailOrUsername) {
        console.log('Usage: node userAdminManager.js remove-admin <email_or_username>');
        break;
      }
      await removeAdmin(emailOrUsername);
      break;

    case 'list-admins':
      await listAdmins();
      break;

    case 'check-subscription':
      if (!emailOrUsername) {
        console.log('Usage: node userAdminManager.js check-subscription <email_or_username>');
        break;
      }
      await checkSubscription(emailOrUsername);
      break;

    case 'revoke-access':
      if (!emailOrUsername) {
        console.log('Usage: node userAdminManager.js revoke-access <email_or_username> [reason]');
        break;
      }
      await revokeAccess(emailOrUsername, reason);
      break;

    case 'restore-access':
      if (!emailOrUsername) {
        console.log('Usage: node userAdminManager.js restore-access <email_or_username>');
        break;
      }
      await restoreAccess(emailOrUsername);
      break;

    default:
      console.log('👤 User Admin Management Tool');
      console.log('─'.repeat(50));
      console.log('Commands:');
      console.log('  make-admin <email>     - Make user an admin');
      console.log('  remove-admin <email>   - Remove admin privileges');
      console.log('  list-admins            - List all admin users');
      console.log('  check-subscription <email> - Check user subscription');
      console.log('  revoke-access <email> [reason] - Revoke user access');
      console.log('  restore-access <email> - Restore user access');
      console.log('');
      console.log('Examples:');
      console.log('  node userAdminManager.js make-admin john@example.com');
      console.log('  node userAdminManager.js remove-admin sarah@candleshop.com');
      console.log('  node userAdminManager.js list-admins');
      console.log('  node userAdminManager.js revoke-access customer@email.com "Payment overdue"');
      console.log('  node userAdminManager.js restore-access customer@email.com');
      break;
  }
  mongoose.connection.close();
};

main(); 