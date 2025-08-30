const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Debugging model imports...');

try {
  console.log('1. Testing baseUser import...');
  const baseUser = require('./models/users/baseUser');
  console.log('✅ baseUser imported:', typeof baseUser);
  
  console.log('2. Testing Customer import...');
  const Customer = require('./models/users/Customer');
  console.log('✅ Customer imported:', typeof Customer);
  console.log('Customer constructor:', Customer.constructor.name);
  
  console.log('3. Testing BusinessOwner import...');
  const BusinessOwner = require('./models/users/BusinessOwner');
  console.log('✅ BusinessOwner imported:', typeof BusinessOwner);
  
  console.log('4. Testing index import...');
  const models = require('./models/users');
  console.log('✅ Models imported:', Object.keys(models));
  
  console.log('5. Testing Customer from index...');
  const CustomerFromIndex = models.Customer;
  console.log('✅ Customer from index:', typeof CustomerFromIndex);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}

