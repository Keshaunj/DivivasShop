require('dotenv').config();
const mongoose = require('mongoose');
const { Customer, BusinessOwner, Manager, Support, Viewer, Admin } = require('./models/users');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('🔗 Connected to MongoDB');
  
  try {
    console.log('\n🔍 CHECKING CURRENT USERS IN DATABASE');
    console.log('=' .repeat(60));
    
    // Check all collections for users
    console.log('\n📋 CUSTOMER Collection:');
    const customers = await Customer.find({});
    customers.forEach(c => {
      console.log(`- ${c.email} | Role: ${c.role} | isAdmin: ${c.isAdmin} | Admin Level: ${c.adminLevel || 'N/A'}`);
    });
    
    console.log('\n📋 BUSINESSOWNER Collection:');
    const businessOwners = await BusinessOwner.find({});
    businessOwners.forEach(b => {
      console.log(`- ${b.email} | Role: ${b.role} | isAdmin: ${b.isAdmin} | Admin Level: ${b.adminLevel || 'N/A'}`);
    });
    
    console.log('\n📋 MANAGER Collection:');
    const managers = await Manager.find({});
    managers.forEach(m => {
      console.log(`- ${m.email} | Role: ${m.role} | isAdmin: ${m.isAdmin} | Admin Level: ${m.adminLevel || 'N/A'}`);
    });
    
    console.log('\n📋 SUPPORT Collection:');
    const supports = await Support.find({});
    supports.forEach(s => {
      console.log(`- ${s.email} | Role: ${s.role} | isAdmin: ${s.isAdmin} | Admin Level: ${s.adminLevel || 'N/A'}`);
    });
    
    console.log('\n📋 VIEWER Collection:');
    const viewers = await Viewer.find({});
    viewers.forEach(v => {
      console.log(`- ${v.email} | Role: ${v.role} | isAdmin: ${v.isAdmin} | Admin Level: ${v.adminLevel || 'N/A'}`);
    });
    
    console.log('\n📋 ADMIN Collection:');
    const admins = await Admin.find({});
    admins.forEach(a => {
      console.log(`- ${a.email} | Role: ${a.role} | isAdmin: ${a.isAdmin} | Admin Level: ${a.adminLevel || 'N/A'} | Super Admin: ${a.superadmin || false}`);
    });
    
    // Check for any super admins
    const superAdmins = admins.filter(a => a.superadmin === true);
    console.log(`\n👑 SUPER ADMINS FOUND: ${superAdmins.length}`);
    
    if (superAdmins.length === 0) {
      console.log('❌ No super admin found - this is why manage-admins.js is failing');
      console.log('💡 You need to either:');
      console.log('   1. Run setup-super-admin.js');
      console.log('   2. Manually promote a user to super admin');
    } else {
      console.log('✅ Super admin(s) found - manage-admins.js should work');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
});
