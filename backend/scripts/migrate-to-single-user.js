/**
 * Migrate from old role collections (admins, businessowners, customers, managers, supports, viewers)
 * into the single `users` collection with role + sub-schemas.
 *
 * Run: node scripts/migrate-to-single-user.js
 * Uses MONGODB_URI from .env or mongodb://localhost:27017/divias-shop
 *
 * - Preserves _id so Order/invite refs keep working.
 * - Duplicate email: first collection in order wins (Admin > BusinessOwner > Manager > Support > Viewer > Customer).
 * - Safe to run multiple times: skips if email already in users.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const BASE_FIELDS = [
  'username', 'firstName', 'lastName', 'email', 'password', 'phone', 'isActive',
  'notifications', 'profilePicture', 'preferences', 'lastLogin', 'loginAttempts',
  'lockUntil', 'passwordChangedAt', 'passwordResetToken', 'passwordResetExpires',
  'emailVerificationToken', 'emailVerificationExpires', 'isEmailVerified',
  'createdAt', 'updatedAt'
];

function pick(obj, keys) {
  const out = {};
  for (const k of keys) {
    if (obj.hasOwnProperty(k) && obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

function toUserDoc(oldDoc, role, profile, isAdmin = false) {
  const base = pick(oldDoc, BASE_FIELDS);
  const now = new Date();
  const user = {
    _id: oldDoc._id,
    ...base,
    email: (base.email || '').toLowerCase(),
    role,
    isAdmin: !!isAdmin,
    adminNotes: oldDoc.adminNotes != null ? oldDoc.adminNotes : '',
    cart: [],
    customerProfile: null,
    businessOwnerProfile: null,
    adminProfile: null,
    createdAt: base.createdAt || now,
    updatedAt: base.updatedAt || now
  };
  if (profile) {
    if (role === 'customer') user.customerProfile = profile;
    else if (role === 'business_owner') user.businessOwnerProfile = profile;
    else user.adminProfile = profile;
  }
  return user;
}

function fromAdmin(doc) {
  const adminProfile = {
    adminId: doc.adminId || null,
    adminLevel: doc.adminLevel || 'admin',
    superadmin: !!doc.superadmin,
    permissions: Array.isArray(doc.permissions) ? doc.permissions : [],
    adminSettings: doc.adminSettings || {},
    adminStatus: doc.adminStatus || 'active',
    adminNotes: doc.adminNotes || '',
    reportsTo: doc.reportsTo || null
  };
  return toUserDoc(doc, 'admin', adminProfile, true);
}

function fromBusinessOwner(doc) {
  const businessOwnerProfile = {
    businessInfo: doc.businessInfo || {},
    businessAddress: doc.businessAddress || {},
    businessMetrics: doc.businessMetrics || {},
    businessSettings: doc.businessSettings ? {
      currency: doc.businessSettings.currency,
      timezone: doc.businessSettings.timezone,
      autoAcceptOrders: doc.businessSettings.autoAcceptOrders,
      requireApproval: doc.businessSettings.requireApproval,
      minimumOrderAmount: doc.businessSettings.minimumOrderAmount
    } : {},
    paymentInfo: doc.paymentInfo ? {
      preferredPaymentMethod: doc.paymentInfo.preferredPaymentMethod,
      paypalEmail: doc.paymentInfo.paypalEmail,
      stripeAccountId: doc.paymentInfo.stripeAccountId,
      taxRate: doc.paymentInfo.taxRate,
      paymentTerms: doc.paymentInfo.paymentTerms
    } : {},
    verification: doc.verification ? {
      isVerified: doc.verification.isVerified,
      verificationDate: doc.verification.verificationDate,
      verifiedBy: doc.verification.verifiedBy
    } : {},
    businessStatus: doc.businessStatus || 'pending_verification',
    permissions: Array.isArray(doc.permissions) ? doc.permissions : [],
    adminNotes: doc.adminNotes || '',
    assignedAdmin: doc.assignedAdmin || null
  };
  return toUserDoc(doc, 'business_owner', businessOwnerProfile, !!doc.isAdmin);
}

function fromCustomer(doc) {
  const customerProfile = {
    customerId: doc.customerId || null,
    addresses: Array.isArray(doc.addresses) ? doc.addresses : [],
    metrics: doc.metrics || {},
    referralCode: doc.referralCode || undefined,
    referredBy: doc.referredBy || null,
    referrals: Array.isArray(doc.referrals) ? doc.referrals : []
  };
  return toUserDoc(doc, 'customer', customerProfile, false);
}

function fromManager(doc) {
  const adminProfile = {
    adminId: doc.managerId || null,
    adminLevel: 'moderator',
    superadmin: false,
    permissions: Array.isArray(doc.permissions) ? doc.permissions : [],
    adminSettings: doc.managerSettings || {},
    adminStatus: 'active',
    adminNotes: '',
    reportsTo: doc.reportsTo || null
  };
  return toUserDoc(doc, 'manager', adminProfile, !!doc.isAdmin);
}

function fromSupport(doc) {
  const adminProfile = {
    adminId: doc.supportId || null,
    adminLevel: 'support_admin',
    superadmin: false,
    permissions: Array.isArray(doc.permissions) ? doc.permissions : [],
    adminSettings: {},
    adminStatus: 'active',
    adminNotes: '',
    reportsTo: doc.reportsTo || null
  };
  return toUserDoc(doc, 'support', adminProfile, !!doc.isAdmin);
}

function fromViewer(doc) {
  const adminProfile = {
    adminId: doc.viewerId || null,
    adminLevel: 'admin',
    superadmin: false,
    permissions: Array.isArray(doc.permissions) ? doc.permissions : [],
    adminSettings: {},
    adminStatus: 'active',
    adminNotes: '',
    reportsTo: doc.reportsTo || null
  };
  return toUserDoc(doc, 'viewer', adminProfile, !!doc.isAdmin);
}

const COLLECTIONS = [
  { name: 'admins', role: 'admin', map: fromAdmin },
  { name: 'businessowners', role: 'business_owner', map: fromBusinessOwner },
  { name: 'managers', role: 'manager', map: fromManager },
  { name: 'supports', role: 'support', map: fromSupport },
  { name: 'viewers', role: 'viewer', map: fromViewer },
  { name: 'customers', role: 'customer', map: fromCustomer }
];

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/divias-shop';
  console.log('Connecting to', uri.replace(/\/\/[^@]+@/, '//***@'));
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  const usersCol = db.collection('users');

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const { name, role, map } of COLLECTIONS) {
    let count = 0;
    let skipped = 0;
    try {
      const col = db.collection(name);
      let total = 0;
      try {
        total = await col.countDocuments();
      } catch (_) {}
      console.log(`\n  Processing ${name} (${total} documents)...`);
      const cursor = col.find({});
      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        const email = (doc.email || '').toLowerCase();
        if (!email) {
          skipped++;
          continue;
        }
        const existing = await usersCol.findOne({ email });
        if (existing) {
          skipped++;
          totalSkipped++;
          continue;
        }
        const userDoc = map(doc);
        try {
          await usersCol.insertOne(userDoc);
          count++;
          totalInserted++;
        } catch (err) {
          if (err.code === 11000) {
            skipped++;
            totalSkipped++;
          } else throw err;
        }
      }
      console.log(`  ${name}: inserted ${count}, skipped ${skipped}`);
    } catch (err) {
      if (err.message && err.message.includes('ns not found')) {
        console.log(`  ${name}: (collection missing) 0`);
      } else {
        console.error(`  ${name}: error`, err.message);
      }
    }
  }

  console.log('\nDone. Total inserted:', totalInserted, '| Total skipped (duplicate email or already in users):', totalSkipped);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
