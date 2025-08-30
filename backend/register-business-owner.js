const mongoose = require('mongoose');
const { BusinessOwner } = require('./models/users');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function registerBusinessOwner() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🏢 Business Owner Registration\n');

    // Get user input
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    const email = await question('Email: ');
    const phoneNumber = await question('Phone Number: ');
    const businessName = await question('Business Name: ');
    const businessLLC = await question('Business LLC: ');
    const username = await question('Username: ');
    const password = await question('Password: ');

    console.log('\n📍 Business Address:');
    const street = await question('Street: ');
    const city = await question('City: ');
    const state = await question('State: ');
    const zipCode = await question('Zip Code: ');
    const country = await question('Country (default: USA): ') || 'USA';

    console.log('\n🏪 Business Details:');
    const businessIndustry = await question('Business Industry: ');
    const businessDescription = await question('Business Description (optional): ');

    // Check if business owner already exists
    const existingOwner = await BusinessOwner.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingOwner) {
      console.log('\n❌ Business owner with this email or username already exists!');
      return;
    }

    // Create new business owner
    const businessOwner = new BusinessOwner({
      firstName,
      lastName,
      email,
      phoneNumber,
      businessName,
      businessLLC,
      businessType: 'LLC', // Default
      businessIndustry,
      businessDescription,
      businessAddress: {
        street,
        city,
        state,
        zipCode,
        country
      },
      username,
      password,
      storefrontUrl: `${username.toLowerCase()}.diviaswickshop.com`,
      isSuperAdmin: true, // Make them super admin
      accessLevel: 'admin',
      subscriptionPlan: 'premium',
      subscriptionStatus: 'active',
      isActive: true,
      status: 'active'
    });

    await businessOwner.save();
    
    console.log('\n✅ Business owner created successfully!');
    console.log(`   Name: ${businessOwner.firstName} ${businessOwner.lastName}`);
    console.log(`   Email: ${businessOwner.email}`);
    console.log(`   Business: ${businessOwner.businessName}`);
    console.log(`   Username: ${businessOwner.username}`);
    console.log(`   Storefront: ${businessOwner.storefrontUrl}`);
    console.log(`   Super Admin: ${businessOwner.isSuperAdmin ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('\n❌ Error creating business owner:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    rl.close();
  }
}

registerBusinessOwner(); 