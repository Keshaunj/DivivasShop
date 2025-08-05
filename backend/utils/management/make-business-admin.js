const mongoose = require('mongoose');
const BusinessOwner = require('../../models/businessOwners');
const User = require('../../models/users');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function makeBusinessAdmin() {
  try {
    // Check for required environment variables
    if (!process.env.MONGODB_URI) {
      console.log('❌ Error: MONGODB_URI not found in .env file');
      console.log('📝 Please create a .env file in the backend folder with:');
      console.log('   MONGODB_URI=your_mongodb_connection_string');
      console.log('   JWT_SECRET=your_jwt_secret');
      return;
    }

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('👑 Make Business Owner Admin');
    console.log('=====================================\n');

    // Get email or username with clear instructions
    console.log('📧 Enter the email or username of the user you want to make a business owner:');
    console.log('   Example: keshaunjones48@gmail.com or kzeroplays\n');
    const identifier = await question('Email or Username: ');

    if (!identifier.trim()) {
      console.log('❌ Please enter a valid email or username.');
      return;
    }

    // First check if they're already a business owner
    let businessOwner = await BusinessOwner.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (businessOwner) {
      console.log('\n✅ Found existing business owner:');
      console.log(`   Name: ${businessOwner.firstName} ${businessOwner.lastName}`);
      console.log(`   Email: ${businessOwner.email}`);
      console.log(`   Business: ${businessOwner.businessName}`);
      console.log(`   Super Admin: ${businessOwner.isSuperAdmin ? 'Yes' : 'No'}`);
      console.log(`   Multi-Storefront Access: ${businessOwner.isSuperAdmin ? 'Yes - Can manage multiple storefronts' : 'No - Single storefront only'}`);
      
      if (!businessOwner.isSuperAdmin) {
        console.log('\n🔄 This business owner is not a super admin yet.');
        const makeAdmin = await question('Upgrade to super admin? (y/n): ');
        if (makeAdmin.toLowerCase() === 'y') {
          businessOwner.isSuperAdmin = true;
          businessOwner.accessLevel = 'admin';
          await businessOwner.save();
          console.log('✅ Upgraded to super admin successfully!');
          console.log('   Now can manage multiple storefronts');
        }
      }
      return;
    }

    // Check if they exist as a regular user
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      console.log('\n❌ User not found!');
      console.log('📝 Please check:');
      console.log('   - Email/username is spelled correctly');
      console.log('   - User exists in the database');
      console.log('   - Try using the exact email or username');
      return;
    }

    console.log('\n✅ Found user:');
    console.log(`   Name: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username || 'N/A'}`);

    console.log('\n🏢 This will create a business owner account for this user.');
    const proceed = await question('Continue? (y/n): ');
    
    if (proceed.toLowerCase() !== 'y') {
      console.log('❌ Cancelled.');
      return;
    }

    // Get business details with clear instructions
    console.log('\n🏢 Business Information:');
    console.log('   Enter the business details for this user:\n');
    
    const businessName = await question('Business Name (e.g., "Divias Wick Shop"): ');
    const businessLLC = await question('Business LLC (e.g., "Divias Wick Shop LLC"): ');
    const businessIndustry = await question('Business Industry (e.g., "Candles & Home Decor"): ');
    const phoneNumber = await question('Phone Number (e.g., "555-123-4567"): ');

    console.log('\n📍 Business Address:');
    console.log('   Enter the business address:\n');
    
    const street = await question('Street Address (e.g., "123 Main St"): ');
    const city = await question('City (e.g., "New York"): ');
    const state = await question('State (e.g., "NY"): ');
    const zipCode = await question('Zip Code (e.g., "10001"): ');
    const country = await question('Country (press Enter for USA): ') || 'USA';

    // Create business owner from existing user
    const newBusinessOwner = new BusinessOwner({
      firstName: user.firstName || user.username || 'Business',
      lastName: user.lastName || 'Owner',
      email: user.email,
      phoneNumber,
      businessName,
      businessLLC,
      businessType: 'LLC',
      businessIndustry,
      businessDescription: `Business owner account for ${user.email}`,
      businessAddress: {
        street,
        city,
        state,
        zipCode,
        country
      },
      username: user.username || user.email.split('@')[0],
      password: user.password, // Use existing password
      storefrontUrl: `${(user.username || user.email.split('@')[0]).toLowerCase()}.diviaswickshop.com`,
      isSuperAdmin: true,
      accessLevel: 'admin',
      subscriptionPlan: 'premium',
      subscriptionStatus: 'active',
      isActive: true,
      status: 'active'
    });

    await newBusinessOwner.save();
    
    console.log('\n✅ Business owner created successfully!');
    console.log('=====================================');
    console.log(`   Name: ${newBusinessOwner.firstName} ${newBusinessOwner.lastName}`);
    console.log(`   Email: ${newBusinessOwner.email}`);
    console.log(`   Business: ${newBusinessOwner.businessName}`);
    console.log(`   Username: ${newBusinessOwner.username}`);
    console.log(`   Storefront: ${newBusinessOwner.storefrontUrl}`);
    console.log(`   Super Admin: ${newBusinessOwner.isSuperAdmin ? 'Yes' : 'No'}`);
    console.log(`   Multi-Storefront Access: ${newBusinessOwner.isSuperAdmin ? 'Yes - Can manage multiple storefronts' : 'No - Single storefront only'}`);
    console.log('\n🎉 User is now a business owner admin!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('MONGODB_URI')) {
      console.log('\n📝 Make sure your .env file exists and contains:');
      console.log('   MONGODB_URI=your_mongodb_connection_string');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    rl.close();
  }
}

makeBusinessAdmin(); 