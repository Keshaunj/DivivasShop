# Database Migration Plan: Storefront-Based Architecture

## Overview
This document outlines the migration strategy from the current role-based user collections to a storefront-centric architecture that will better support multi-store e-commerce operations.

## Current Architecture
- **Role-based collections**: `Customer`, `BusinessOwner`, `Manager`, `Support`, `Viewer`, `Admin`
- **Single business owner per store** (currently)
- **Mixed user types** in single collections

## Target Architecture
- **Storefront-centric collections**: `Storefronts`, `StorefrontProducts`, `StorefrontOrders`
- **Multi-store support** with clear storefront boundaries
- **Separated admin/developer accounts** from business data

## Migration Phases

### Phase 1: Foundation & Storefront Collections
**Timeline**: After core e-commerce features are complete
**Goal**: Add storefront infrastructure without breaking existing functionality

#### 1.1 Create New Collections
```javascript
// Storefronts collection
{
  _id: ObjectId,
  storefrontId: String,        // e.g., "candle-shop-1", "artisan-candles"
  storefrontName: String,      // e.g., "Divia's Candle Shop"
  storefrontUrl: String,       // e.g., "candleshop.diviaswickshop.com"
  businessOwnerId: ObjectId,   // Reference to BusinessOwner
  status: String,              // "active", "suspended", "maintenance"
  settings: {
    theme: String,
    currency: String,
    timezone: String,
    businessHours: Object
  },
  metadata: {
    description: String,
    tags: [String],
    categories: [String]
  },
  createdAt: Date,
  updatedAt: Date
}

// StorefrontProducts collection
{
  _id: ObjectId,
  storefrontId: ObjectId,     // Reference to Storefront
  productId: ObjectId,        // Reference to Product
  storefrontPrice: Number,    // Store-specific pricing
  storefrontStatus: String,   // "active", "inactive", "out_of_stock"
  storefrontInventory: Number,
  storefrontCategories: [String],
  storefrontTags: [String],
  createdAt: Date,
  updatedAt: Date
}

// StorefrontOrders collection
{
  _id: ObjectId,
  storefrontId: ObjectId,     // Reference to Storefront
  orderId: ObjectId,          // Reference to Order
  customerId: ObjectId,       // Reference to Customer
  businessOwnerId: ObjectId,  // Reference to BusinessOwner
  storefrontOrderNumber: String, // Store-specific order number
  storefrontStatus: String,   // Store-specific order status
  createdAt: Date,
  updatedAt: Date
}
```

#### 1.2 Add Storefront Identifiers to Existing Models
```javascript
// Update BusinessOwner model
{
  // ... existing fields ...
  storefrontId: String,       // e.g., "candle-shop-1"
  storefrontName: String,     // e.g., "Divia's Candle Shop"
  storefrontUrl: String,      // e.g., "candleshop.diviaswickshop.com"
  storefrontSettings: Object, // Store-specific settings
}

// Update Product model
{
  // ... existing fields ...
  storefrontId: String,       // Reference to storefront
  storefrontPrice: Number,    // Store-specific pricing
  storefrontStatus: String,   // Store-specific status
}
```

### Phase 2: Data Migration
**Timeline**: When ready to restructure (after Phase 1 is stable)
**Goal**: Migrate existing data to new structure

#### 2.1 Migrate Business Owners
```javascript
// Migration script: migrate-business-owners.js
const migrateBusinessOwners = async () => {
  const businessOwners = await BusinessOwner.find({});
  
  for (const bo of businessOwners) {
    // Create storefront
    const storefront = new Storefront({
      storefrontId: bo.storefrontId || `store-${bo._id}`,
      storefrontName: bo.businessName || bo.storefrontName,
      storefrontUrl: bo.storefrontUrl,
      businessOwnerId: bo._id,
      status: bo.isActive ? 'active' : 'suspended',
      settings: {
        theme: 'default',
        currency: 'USD',
        timezone: 'UTC'
      },
      metadata: {
        description: bo.businessDescription || '',
        tags: bo.tags || [],
        categories: bo.categories || []
      }
    });
    
    await storefront.save();
    
    // Update business owner with storefront reference
    bo.storefrontId = storefront.storefrontId;
    await bo.save();
  }
};
```

#### 2.2 Migrate Products
```javascript
// Migration script: migrate-products.js
const migrateProducts = async () => {
  const products = await Product.find({});
  
  for (const product of products)) {
    // Create storefront product entry
    const storefrontProduct = new StorefrontProduct({
      storefrontId: product.storefrontId,
      productId: product._id,
      storefrontPrice: product.price,
      storefrontStatus: product.status || 'active',
      storefrontInventory: product.inventory || 0,
      storefrontCategories: product.categories || [],
      storefrontTags: product.tags || []
    });
    
    await storefrontProduct.save();
  }
};
```

#### 2.3 Migrate Orders
```javascript
// Migration script: migrate-orders.js
const migrateOrders = async () => {
  const orders = await Order.find({});
  
  for (const order of orders) {
    // Create storefront order entry
    const storefrontOrder = new StorefrontOrder({
      storefrontId: order.storefrontId,
      orderId: order._id,
      customerId: order.customerId,
      businessOwnerId: order.businessOwnerId,
      storefrontOrderNumber: `SO-${order._id}`,
      storefrontStatus: order.status || 'pending'
    });
    
    await storefrontOrder.save();
  }
};
```

### Phase 3: Frontend & API Updates
**Timeline**: After data migration is complete
**Goal**: Update frontend to use new storefront structure

#### 3.1 Update API Endpoints
```javascript
// New storefront-specific endpoints
GET /api/storefronts/:storefrontId/products
GET /api/storefronts/:storefrontId/orders
GET /api/storefronts/:storefrontId/customers
GET /api/storefronts/:storefrontId/analytics

// Update existing endpoints to include storefront context
GET /api/products?storefrontId=:storefrontId
GET /api/orders?storefrontId=:storefrontId
```

#### 3.2 Update Frontend Routes
```javascript
// Store-specific routes
/store/:storefrontId/products
/store/:storefrontId/orders
/store/:storefrontId/customers
/store/:storefrontId/dashboard

// Admin routes (separate from store routes)
/admin/storefronts
/admin/storefronts/:storefrontId
```

#### 3.3 Update Admin Panel
```javascript
// Storefront management interface
- List all storefronts
- Storefront-specific analytics
- Cross-storefront reporting
- Storefront settings management
```

### Phase 4: Admin/Developer Account Separation
**Timeline**: After storefront migration is stable
**Goal**: Separate developer accounts from business data

#### 4.1 Create Developer Collection
```javascript
// Developers collection
{
  _id: ObjectId,
  developerId: String,        // e.g., "dev-001"
  username: String,           // e.g., "yt-kzerodolla"
  email: String,              // Developer email
  role: String,               // "super_admin", "developer", "support"
  permissions: [String],      // System-level permissions
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 4.2 Migrate Developer Account
```javascript
// Migration script: migrate-developer-account.js
const migrateDeveloperAccount = async () => {
  // Find current super admin (developer)
  const currentAdmin = await Admin.findOne({ 
    email: 'your-email@example.com' 
  });
  
  if (currentAdmin) {
    // Create developer account
    const developer = new Developer({
      developerId: `dev-${currentAdmin._id}`,
      username: currentAdmin.username,
      email: currentAdmin.email,
      role: 'super_admin',
      permissions: ['system_config', 'admin_management', 'security'],
      isActive: true
    });
    
    await developer.save();
    
    // Remove from Admin collection or mark as migrated
    currentAdmin.isMigrated = true;
    await currentAdmin.save();
  }
};
```

## Migration Checklist

### Pre-Migration
- [ ] Core e-commerce features are stable
- [ ] Backup current database
- [ ] Test migration scripts on staging data
- [ ] Plan downtime window (if needed)

### Phase 1
- [ ] Create new collections
- [ ] Add storefront identifiers to existing models
- [ ] Update API endpoints to support storefront context
- [ ] Test with existing data

### Phase 2
- [ ] Run business owner migration
- [ ] Run product migration
- [ ] Run order migration
- [ ] Verify data integrity
- [ ] Rollback plan ready

### Phase 3
- [ ] Update frontend routes
- [ ] Update API endpoints
- [ ] Update admin panel
- [ ] Test storefront functionality

### Phase 4
- [ ] Create developer collection
- [ ] Migrate developer account
- [ ] Update authentication to handle developer accounts
- [ ] Test admin functionality

## Rollback Plan

### If Issues Occur During Migration
1. **Immediate rollback**: Restore from backup
2. **Partial rollback**: Revert specific collections
3. **Data recovery**: Extract data from new structure back to old

### Rollback Scripts
```javascript
// rollback-business-owners.js
// rollback-products.js
// rollback-orders.js
// rollback-developer-account.js
```

## Benefits of This Approach

### Before Migration
- ✅ Keep development momentum
- ✅ Focus on core features
- ✅ Avoid complex migrations during development
- ✅ Current system works for MVP

### After Migration
- ✅ Clear storefront boundaries
- ✅ Better scalability for multiple stores
- ✅ Separated developer/admin accounts
- ✅ Improved data organization
- ✅ Better performance for store-specific queries

## Timeline Recommendations

- **Phase 1**: 1-2 weeks (after core features complete)
- **Phase 2**: 1 week (data migration)
- **Phase 3**: 2-3 weeks (frontend updates)
- **Phase 4**: 1 week (admin separation)

**Total estimated time**: 5-7 weeks

## Notes
- This plan can be executed incrementally
- Each phase can be tested independently
- Rollback is possible at any phase
- Development can continue during Phase 1
- Consider user impact and plan accordingly

## File Location
This migration plan is saved at: `backend/migration-plan.md`

## Next Steps
1. Complete core e-commerce features
2. Review and refine this plan
3. Begin Phase 1 when ready
4. Update this document as needed during migration

