const mongoose = require('mongoose');
const { BusinessOwner } = require('../../models/users');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// List all business owners
const listBusinessOwners = async () => {
  try {
    const businessOwners = await BusinessOwner.find({})
      .select('firstName lastName email businessName businessLLC subscriptionStatus status createdAt')
      .sort({ createdAt: -1 });

    if (businessOwners.length === 0) {
      console.log('📋 No business owners found.');
      return;
    }

    console.log(`📋 Found ${businessOwners.length} business owners:`);
    console.log('─'.repeat(100));
    
    businessOwners.forEach((owner, index) => {
      console.log(`${index + 1}. ${owner.firstName} ${owner.lastName}`);
      console.log(`   Email: ${owner.email}`);
      console.log(`   Business: ${owner.businessName} (${owner.businessLLC})`);
      console.log(`   Status: ${owner.status} | Subscription: ${owner.subscriptionStatus}`);
      console.log(`   Joined: ${owner.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing business owners:', error);
  }
};

// Get business owner details
const getBusinessOwnerDetails = async (emailOrUsername) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!businessOwner) {
      console.log('❌ Business owner not found. Please check the email or username.');
      return;
    }

    console.log(`🏢 Business Owner Details for ${businessOwner.firstName} ${businessOwner.lastName}:`);
    console.log('─'.repeat(80));
    console.log(`Full Name: ${businessOwner.firstName} ${businessOwner.lastName}`);
    console.log(`Email: ${businessOwner.email}`);
    console.log(`Phone: ${businessOwner.phoneNumber}`);
    console.log(`Username: ${businessOwner.username}`);
    console.log(`Business Name: ${businessOwner.businessName}`);
    console.log(`Business LLC: ${businessOwner.businessLLC}`);
    console.log(`Business Type: ${businessOwner.businessType}`);
    console.log(`Industry: ${businessOwner.businessIndustry}`);
    console.log(`Storefront URL: ${businessOwner.storefrontUrl}`);
    console.log('');
    console.log('📍 Business Address:');
    console.log(`   ${businessOwner.businessAddress.street}`);
    console.log(`   ${businessOwner.businessAddress.city}, ${businessOwner.businessAddress.state} ${businessOwner.businessAddress.zipCode}`);
    console.log(`   ${businessOwner.businessAddress.country}`);
    console.log('');
    console.log('💰 Subscription Details:');
    console.log(`   Plan: ${businessOwner.subscriptionPlan}`);
    console.log(`   Status: ${businessOwner.subscriptionStatus}`);
    console.log(`   Billing Cycle: ${businessOwner.billingCycle}`);
    console.log(`   Monthly Fee: $${businessOwner.monthlyFee}`);
    console.log(`   Next Payment: ${businessOwner.nextPaymentDate ? businessOwner.nextPaymentDate.toLocaleDateString() : 'Not set'}`);
    console.log('');
    console.log('📊 Account Status:');
    console.log(`   Active: ${businessOwner.isActive ? 'Yes' : 'No'}`);
    console.log(`   Status: ${businessOwner.status}`);
    console.log(`   Access Level: ${businessOwner.accessLevel}`);
    console.log(`   Super Admin: ${businessOwner.isSuperAdmin ? 'Yes' : 'No'}`);
    console.log(`   Email Verified: ${businessOwner.emailVerified ? 'Yes' : 'No'}`);
    console.log('');
    console.log('📈 Limits:');
    console.log(`   Product Limit: ${businessOwner.productLimit}`);
    console.log(`   Order Limit: ${businessOwner.orderLimit}`);
    console.log(`   Storage Limit: ${businessOwner.storageLimit} MB`);
    console.log('');
    console.log('📅 Timestamps:');
    console.log(`   Created: ${businessOwner.createdAt.toLocaleString()}`);
    console.log(`   Updated: ${businessOwner.updatedAt.toLocaleString()}`);
    
    if (businessOwner.adminNotes) {
      console.log('');
      console.log('📝 Admin Notes:');
      console.log(`   ${businessOwner.adminNotes}`);
    }
    
  } catch (error) {
    console.error('❌ Error getting business owner details:', error);
  }
};

// Update business owner status
const updateBusinessOwnerStatus = async (emailOrUsername, status, reason = '') => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!businessOwner) {
      console.log('❌ Business owner not found. Please check the email or username.');
      return;
    }

    const oldStatus = businessOwner.status;
    businessOwner.status = status;
    
    if (status === 'suspended') {
      businessOwner.suspensionReason = reason;
      businessOwner.suspensionDate = new Date();
      businessOwner.isActive = false;
    } else if (status === 'active') {
      businessOwner.suspensionReason = '';
      businessOwner.suspensionDate = null;
      businessOwner.isActive = true;
    }

    await businessOwner.save();

    console.log(`✅ Business owner status updated successfully!`);
    console.log(`   ${businessOwner.firstName} ${businessOwner.lastName} (${businessOwner.email})`);
    console.log(`   Status changed from "${oldStatus}" to "${status}"`);
    
    if (reason) {
      console.log(`   Reason: ${reason}`);
    }
    
  } catch (error) {
    console.error('❌ Error updating business owner status:', error);
  }
};

// Update subscription status
const updateSubscriptionStatus = async (emailOrUsername, subscriptionStatus) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!businessOwner) {
      console.log('❌ Business owner not found. Please check the email or username.');
      return;
    }

    const oldStatus = businessOwner.subscriptionStatus;
    businessOwner.subscriptionStatus = subscriptionStatus;
    
    if (subscriptionStatus === 'active') {
      businessOwner.subscriptionStartDate = new Date();
      businessOwner.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    await businessOwner.save();

    console.log(`✅ Subscription status updated successfully!`);
    console.log(`   ${businessOwner.firstName} ${businessOwner.lastName} (${businessOwner.email})`);
    console.log(`   Subscription changed from "${oldStatus}" to "${subscriptionStatus}"`);
    
  } catch (error) {
    console.error('❌ Error updating subscription status:', error);
  }
};

// Make business owner super admin
const makeSuperAdmin = async (emailOrUsername) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!businessOwner) {
      console.log('❌ Business owner not found. Please check the email or username.');
      return;
    }

    businessOwner.isSuperAdmin = true;
    businessOwner.accessLevel = 'owner';
    await businessOwner.save();

    console.log(`✅ ${businessOwner.firstName} ${businessOwner.lastName} is now a Super Admin!`);
    console.log(`   Email: ${businessOwner.email}`);
    console.log(`   Business: ${businessOwner.businessName}`);
    
  } catch (error) {
    console.error('❌ Error making super admin:', error);
  }
};

// Remove super admin privileges
const removeSuperAdmin = async (emailOrUsername) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!businessOwner) {
      console.log('❌ Business owner not found. Please check the email or username.');
      return;
    }

    businessOwner.isSuperAdmin = false;
    await businessOwner.save();

    console.log(`✅ Super Admin privileges removed from ${businessOwner.firstName} ${businessOwner.lastName}`);
    console.log(`   Email: ${businessOwner.email}`);
    console.log(`   Business: ${businessOwner.businessName}`);
    
  } catch (error) {
    console.error('❌ Error removing super admin:', error);
  }
};

// List super admins
const listSuperAdmins = async () => {
  try {
    const superAdmins = await BusinessOwner.find({ isSuperAdmin: true })
      .select('firstName lastName email businessName createdAt');

    if (superAdmins.length === 0) {
      console.log('👑 No super admins found.');
      return;
    }

    console.log(`👑 Found ${superAdmins.length} super admin(s):`);
    console.log('─'.repeat(80));
    
    superAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.firstName} ${admin.lastName}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Business: ${admin.businessName}`);
      console.log(`   Since: ${admin.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing super admins:', error);
  }
};

// Add admin notes
const addAdminNotes = async (emailOrUsername, notes) => {
  try {
    const businessOwner = await BusinessOwner.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!businessOwner) {
      console.log('❌ Business owner not found. Please check the email or username.');
      return;
    }

    businessOwner.adminNotes = notes;
    await businessOwner.save();

    console.log(`✅ Admin notes added for ${businessOwner.firstName} ${businessOwner.lastName}`);
    console.log(`   Email: ${businessOwner.email}`);
    console.log(`   Notes: ${notes}`);
    
  } catch (error) {
    console.error('❌ Error adding admin notes:', error);
  }
};

// Main function to handle commands
const main = async () => {
  const command = process.argv[2];
  const emailOrUsername = process.argv[3];
  const status = process.argv[4];
  const reason = process.argv[5];

  switch (command) {
    case 'list':
      await listBusinessOwners();
      break;

    case 'details':
      if (!emailOrUsername) {
        console.log('Usage: node businessOwnerManager.js details <email_or_username>');
        break;
      }
      await getBusinessOwnerDetails(emailOrUsername);
      break;

    case 'update-status':
      if (!emailOrUsername || !status) {
        console.log('Usage: node businessOwnerManager.js update-status <email> <status> [reason]');
        console.log('Available statuses: active, inactive, suspended, pending_verification');
        break;
      }
      await updateBusinessOwnerStatus(emailOrUsername, status, reason);
      break;

    case 'update-subscription':
      if (!emailOrUsername || !status) {
        console.log('Usage: node businessOwnerManager.js update-subscription <email> <status>');
        console.log('Available statuses: active, inactive, suspended, cancelled, pending');
        break;
      }
      await updateSubscriptionStatus(emailOrUsername, status);
      break;

    case 'make-super-admin':
      if (!emailOrUsername) {
        console.log('Usage: node businessOwnerManager.js make-super-admin <email>');
        break;
      }
      await makeSuperAdmin(emailOrUsername);
      break;

    case 'remove-super-admin':
      if (!emailOrUsername) {
        console.log('Usage: node businessOwnerManager.js remove-super-admin <email>');
        break;
      }
      await removeSuperAdmin(emailOrUsername);
      break;

    case 'list-super-admins':
      await listSuperAdmins();
      break;

    case 'add-notes':
      if (!emailOrUsername || !process.argv[4]) {
        console.log('Usage: node businessOwnerManager.js add-notes <email> <notes>');
        break;
      }
      await addAdminNotes(emailOrUsername, process.argv[4]);
      break;

    default:
      console.log('🏢 Business Owner Management Tool');
      console.log('─'.repeat(60));
      console.log('Commands:');
      console.log('  list                                    - List all business owners');
      console.log('  details <email>                         - Get business owner details');
      console.log('  update-status <email> <status> [reason] - Update business owner status');
      console.log('  update-subscription <email> <status>    - Update subscription status');
      console.log('  make-super-admin <email>                - Make business owner super admin');
      console.log('  remove-super-admin <email>              - Remove super admin privileges');
      console.log('  list-super-admins                       - List all super admins');
      console.log('  add-notes <email> <notes>               - Add admin notes');
      console.log('');
      console.log('Examples:');
      console.log('  node businessOwnerManager.js list');
      console.log('  node businessOwnerManager.js details sarah@candleshop.com');
      console.log('  node businessOwnerManager.js update-status john@example.com suspended "Payment overdue"');
      console.log('  node businessOwnerManager.js make-super-admin sarah@candleshop.com');
      console.log('  node businessOwnerManager.js add-notes john@example.com "Contacted about payment"');
      break;
  }

  mongoose.connection.close();
};

main(); 