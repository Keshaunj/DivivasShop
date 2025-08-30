// Export all user models
const Customer = require('./Customer');
const BusinessOwner = require('./BusinessOwner');
const Manager = require('./Manager');
const Support = require('./Support');
const Viewer = require('./Viewer');
const Admin = require('./Admin');

// Export individual models
module.exports = {
  Customer,
  BusinessOwner,
  Manager,
  Support,
  Viewer,
  Admin
};

// Export default user model (for backward compatibility)
module.exports.default = Customer;

