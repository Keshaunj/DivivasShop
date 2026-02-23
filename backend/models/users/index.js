// Single User model: all traffic (customers, business owners, admins, etc.) in one collection.
// Role and optional sub-schemas: customerProfile, businessOwnerProfile, adminProfile.
const User = require('../User');

module.exports = User;
module.exports.User = User;
