const Product = require('../models/products');
const Category = require('../models/categories');
const Order = require('../models/order');
const { Customer, BusinessOwner, Manager, Support, Viewer, Admin } = require('../models/users');
const jwt = require('jsonwebtoken');

// Admin middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Check if user is admin (either role is admin or isAdmin flag is true)
  if (req.user.role !== 'admin' && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// Admin login for corporate portal
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('\n🔐 ADMIN LOGIN ATTEMPT:');
    console.log('Email:', email);
    console.log('Password provided:', !!password);
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email - PRIORITIZE ADMIN COLLECTION (CandleShop.admins)
    console.log('\n🔍 STEP 1: Searching for user in Admin collection FIRST...');
    
    let user = null;
    let userCollection = null;
    
    // Check Admin collection FIRST and PRIORITY for corporate portal access
    user = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    if (user) {
      userCollection = 'Admin';
      console.log('✅ Found in ADMIN collection - corporate portal access granted');
      
      // Admin collection users get automatic access - no need to check other collections
      console.log('🔑 Admin collection user - automatic access granted');
    } else {
      console.log('⚠️ Not found in Admin collection, checking other collections as fallback...');
      
      // Check Customer collection
      user = await Customer.findOne({ email: email.toLowerCase() }).select('+password');
      if (user) {
        userCollection = 'Customer';
        console.log('✅ Found in CUSTOMER collection');
      }
    }
    
    if (!user) {
      // Check BusinessOwner collection
      user = await BusinessOwner.findOne({ email: email.toLowerCase() }).select('+password');
      if (user) {
        userCollection = 'BusinessOwner';
        console.log('✅ Found in BUSINESSOWNER collection');
      }
    }
    
    if (!user) {
      // Check Manager collection
      user = await Manager.findOne({ email: email.toLowerCase() }).select('+password');
      if (user) {
        userCollection = 'Manager';
        console.log('✅ Found in MANAGER collection');
      }
    }
    
    if (!user) {
      // Check Support collection
      user = await Support.findOne({ email: email.toLowerCase() }).select('+password');
      if (user) {
        userCollection = 'Support';
        console.log('✅ Found in SUPPORT collection');
      }
    }
    
    if (!user) {
      // Check Viewer collection
      user = await Viewer.findOne({ email: email.toLowerCase() }).select('+password');
      if (user) {
        userCollection = 'Viewer';
        console.log('✅ Found in VIEWER collection');
      }
    }
    
    if (!user) {
      console.log('❌ User not found in ANY collection');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('\n📋 STEP 2: User details found:');
    console.log('Collection:', userCollection);
    console.log('ID:', user._id);
    console.log('Email:', user.email);
    console.log('Username:', user.username);
    console.log('Role:', user.role);
    console.log('isAdmin:', user.isAdmin);
    console.log('isActive:', user.isActive);
    console.log('Permissions:', JSON.stringify(user.permissions, null, 2));
    console.log('Has password field:', !!user.password);
    
    // Check if user has admin privileges
    console.log('\n🔑 STEP 3: Checking admin privileges...');
    
    // A user can have admin access if:
    // 1. They are in the Admin collection (automatic access - CandleShop.admins)
    // 2. They have role 'admin' OR isAdmin flag is true
    // 3. They have admin permissions
    const isInAdminCollection = userCollection === 'Admin';
    const roleCheck = user.role === 'admin';
    const isAdminFlagCheck = user.isAdmin === true;
    const permissionsCheck = user.permissions && user.permissions.some(p => p.resource === 'admin_management');
    
    console.log('Is in Admin collection (CandleShop.admins):', isInAdminCollection);
    console.log('Role check (user.role === "admin"):', roleCheck);
    console.log('isAdmin flag check (user.isAdmin === true):', isAdminFlagCheck);
    console.log('Permissions check (admin_management):', permissionsCheck);
    
    const hasAdminAccess = isInAdminCollection || roleCheck || isAdminFlagCheck || permissionsCheck;
    console.log('🔑 FINAL ADMIN ACCESS CHECK:', hasAdminAccess);
    
    if (!hasAdminAccess) {
      console.log('\n❌ ADMIN ACCESS DENIED - REASON:');
      console.log('- User not in Admin collection (CandleShop.admins)');
      console.log('- User role is not "admin"');
      console.log('- isAdmin flag is not true');
      console.log('- No admin_management permissions found');
      console.log('\n💡 TO FIX: User needs one of these:');
      console.log('1. Be in Admin collection (CandleShop.admins) - PREFERRED for corporate portal');
      console.log('2. role: "admin"');
      console.log('3. isAdmin: true');
      console.log('4. permissions with resource: "admin_management"');
      
      return res.status(403).json({ 
        message: 'Admin access required. Contact your administrator to request access.',
        debug: {
          userRole: user.role,
          isAdmin: user.isAdmin,
          hasPermissions: !!user.permissions,
          permissionsCount: user.permissions ? user.permissions.length : 0,
          collection: userCollection
        }
      });
    }
    
    // Check if user is active
    console.log('\n📋 STEP 4: Checking account status...');
    console.log('isActive:', user.isActive);
    
    if (!user.isActive) {
      console.log('❌ Account is deactivated');
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    
    // Verify password using the user's comparePassword method
    console.log('\n🔐 STEP 5: Verifying password...');
    console.log('Password field exists:', !!user.password);
    
    if (!user.password) {
      console.log('❌ No password field found - cannot verify password');
      return res.status(401).json({ message: 'Invalid credentials - password field missing' });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password verification result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('✅ Password verified successfully');
    
    // Update last login
    console.log('\n📋 STEP 6: Updating last login...');
    user.lastLogin = new Date();
    await user.save();
    console.log('✅ Last login updated');
    
    // Determine admin level based on user's collection and permissions
    console.log('\n🔑 STEP 7: Determining admin level...');
    let adminLevel = 'standard';
    
    if (userCollection === 'Admin') {
      // User is in Admin collection - use their admin level
      adminLevel = user.adminLevel || 'admin';
      console.log('👑 Admin level from Admin collection (CandleShop.admins):', adminLevel);
    } else if (user.role === 'admin' && user.isAdmin === true) {
      adminLevel = 'super_admin';
      console.log('👑 Admin level: SUPER_ADMIN');
    } else if (user.permissions && user.permissions.some(p => p.resource === 'admin_management')) {
      adminLevel = 'admin';
      console.log('🏢 Admin level: ADMIN');
    } else {
      console.log('🔧 Admin level: STANDARD');
    }
    
    // Generate admin JWT token
    console.log('\n🔐 STEP 8: Generating JWT token...');
    const adminToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        username: user.username,
        role: user.role,
        isAdmin: user.isAdmin,
        adminLevel: adminLevel,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('✅ JWT token generated');
    
    // Return admin data (without password) and token
    const adminData = {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      isAdmin: user.isAdmin,
      adminLevel: adminLevel,
      permissions: user.permissions || [],
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    };
    
    console.log('\n✅ ADMIN LOGIN SUCCESSFUL!');
    console.log('User:', user.email);
    console.log('Admin level:', adminLevel);
    console.log('Collection:', userCollection);
    
    res.json({
      message: 'Admin login successful',
      admin: adminData,
      token: adminToken
    });
    
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    console.log('🔍 Dashboard stats request from user:', req.user._id);
    console.log('🔍 User role:', req.user.role);
    console.log('🔍 User isAdmin:', req.user.isAdmin);
    console.log('🔍 User permissions:', req.user.permissions);
    
    // Check if user is Super Admin
    // Primary: Has admin_management permissions
    // Fallback: Has role 'admin' and isAdmin: true (for existing admin users)
    let isSuperAdmin = false;
    
    // First check: Does user have explicit admin_management permissions?
    if (req.user.permissions && req.user.permissions.length > 0) {
      isSuperAdmin = req.user.permissions.some(p => 
        p.resource === 'admin_management' && p.actions.includes('read')
      );
    }
    
    // Second check: If no explicit permissions, check role and isAdmin flag
    if (!isSuperAdmin && req.user.role === 'admin' && req.user.isAdmin === true) {
      isSuperAdmin = true;
      console.log('🔑 User has admin role and isAdmin flag - automatically granting Super Admin access');
      
      // Auto-setup permissions for existing admin users
      if (!req.user.permissions || req.user.permissions.length === 0) {
        console.log('🔧 Setting up default permissions for existing admin user');
        
        // Set up default Super Admin permissions
        const defaultPermissions = [
          { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'orders', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'users', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'analytics', actions: ['read'] },
          { resource: 'settings', actions: ['read', 'update'] },
          { resource: 'admin_management', actions: ['read', 'create', 'update', 'delete'] }
        ];
        
        // Update user permissions in database
        try {
          await Admin.findByIdAndUpdate(req.user._id, { permissions: defaultPermissions });
          console.log('✅ Updated user permissions in database');
        } catch (error) {
          console.log('⚠️ Could not update user permissions:', error.message);
        }
      }
    }
    
    console.log('🔍 Final isSuperAdmin check:', isSuperAdmin);
    console.log('🔍 User role:', req.user.role);
    console.log('🔍 User isAdmin:', req.user.isAdmin);
    console.log('🔍 User permissions count:', req.user.permissions ? req.user.permissions.length : 0);
    
    console.log('🔍 Is Super Admin:', isSuperAdmin);
    
    if (isSuperAdmin) {
      console.log('👑 Processing Super Admin dashboard...');
      
      // Super Admin - Platform-wide statistics
      let totalProducts = 0, totalOrders = 0, totalUsers = 0, totalBusinesses = 0, totalAdmins = 0;
      let platformRevenue = 0, recentOrders = [], lowStockProducts = [];
      
      try {
        totalProducts = await Product.countDocuments();
        totalOrders = await Order.countDocuments();
        
        // Count users from all role-based collections
        const customerCount = await Customer.countDocuments();
        const businessOwnerCount = await BusinessOwner.countDocuments();
        const managerCount = await Manager.countDocuments();
        const supportCount = await Support.countDocuments();
        const viewerCount = await Viewer.countDocuments();
        const adminCount = await Admin.countDocuments();
        
        totalUsers = customerCount + businessOwnerCount + managerCount + supportCount + viewerCount + adminCount;
        totalBusinesses = businessOwnerCount;
        totalAdmins = adminCount;
        
        console.log('📊 Counts:', { totalProducts, totalOrders, totalUsers, totalBusinesses, totalAdmins });
        
        // Calculate platform revenue
        const orders = await Order.find({ status: 'completed' });
        platformRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        console.log('💰 Platform revenue:', platformRevenue);
        
        // Get recent platform orders
        recentOrders = await Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('user', 'username email');
        
        // Get low stock products across platform
        lowStockProducts = await Product.find({ stock: { $lt: 10 } })
          .select('name stock price')
          .limit(5);
          
      } catch (error) {
        console.log('⚠️ Error fetching some data:', error.message);
        // Continue with default values
      }
      
      const responseData = {
        stats: {
          totalProducts,
          totalOrders,
          platformUsers: totalUsers,
          totalBusinesses,
          totalAdmins,
          platformRevenue: platformRevenue.toFixed(2)
        },
        recentOrders,
        lowStockProducts
      };
      
      console.log('📊 Sending Super Admin stats:', responseData);
      res.json(responseData);
    } else {
      console.log('🏢 Processing Business Owner Admin dashboard...');
      
      // Business Owner Admin - Business-specific statistics
      let totalProducts = 0, totalOrders = 0, totalUsers = 0, totalRevenue = 0;
      let recentOrders = [], lowStockProducts = [];
      
      try {
        totalProducts = await Product.countDocuments();
        totalOrders = await Order.countDocuments();
        totalUsers = await User.countDocuments();
        
        console.log('📊 Business counts:', { totalProducts, totalOrders, totalUsers });
        
        // Calculate business revenue
        const orders = await Order.find({ status: 'completed' });
        totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        console.log('💰 Business revenue:', totalRevenue);
        
        // Get recent business orders
        recentOrders = await Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('user', 'username email');
        
        // Get low stock products for business
        lowStockProducts = await Product.find({ stock: { $lt: 10 } })
          .select('name stock price')
          .limit(5);
          
      } catch (error) {
        console.log('⚠️ Error fetching business data:', error.message);
        // Continue with default values
      }
      
      const responseData = {
        stats: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue: totalRevenue.toFixed(2)
        },
        recentOrders,
        lowStockProducts
      };
      
      console.log('📊 Sending Business Owner Admin stats:', responseData);
      res.json(responseData);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

// Get all products for admin
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Add new product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, featured } = req.body;
    
    const newProduct = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock) || 0,
      featured: featured || false,
      image: req.file ? req.file.path : null // If you have file upload middleware
    });
    
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Handle file upload if present
    if (req.file) {
      updates.image = req.file.path;
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    ).populate('category');
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Get all categories for admin
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Add new category
const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const newCategory = new Category({
      name,
      description
    });
    
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error adding category', error: error.message });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedCategory = await Category.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category is being used by any products
    const productsUsingCategory = await Product.find({ category: id });
    if (productsUsingCategory.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that has products. Please reassign or delete products first.' 
      });
    }
    
    const deletedCategory = await Category.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// Get all orders for admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'username email');
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// Get all users for admin
const getAllUsers = async (req, res) => {
  try {
    // Get users from all role-based collections
    const [customers, businessOwners, managers, supports, viewers, admins] = await Promise.all([
      Customer.find().select('-password'),
      BusinessOwner.find().select('-password'),
      Manager.find().select('-password'),
      Support.find().select('-password'),
      Viewer.find().select('-password'),
      Admin.find().select('-password')
    ]);

    // Combine all users with their role information
    const allUsers = [
      ...customers.map(user => ({ ...user.toObject(), userType: 'customer' })),
      ...businessOwners.map(user => ({ ...user.toObject(), userType: 'business_owner' })),
      ...managers.map(user => ({ ...user.toObject(), userType: 'manager' })),
      ...supports.map(user => ({ ...user.toObject(), userType: 'support' })),
      ...viewers.map(user => ({ ...user.toObject(), userType: 'viewer' })),
      ...admins.map(user => ({ ...user.toObject(), userType: 'admin' }))
    ];

    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const validRoles = ['customer', 'business_owner', 'admin', 'manager', 'support', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}` 
      });
    }
    
    // Find user in any collection
    let user = await Customer.findById(id);
    let userCollection = 'Customer';
    
    if (!user) {
      user = await BusinessOwner.findById(id);
      userCollection = 'BusinessOwner';
    }
    if (!user) {
      user = await Manager.findById(id);
      userCollection = 'Manager';
    }
    if (!user) {
      user = await Support.findById(id);
      userCollection = 'Support';
    }
    if (!user) {
      user = await Viewer.findById(id);
      userCollection = 'Viewer';
    }
    if (!user) {
      user = await Admin.findById(id);
      userCollection = 'Admin';
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update role in the appropriate collection
    const updateData = { role };
    if (role === 'admin') {
      updateData.isAdmin = true;
    }
    
    let updatedUser;
    switch (userCollection) {
      case 'Customer':
        updatedUser = await Customer.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        break;
      case 'BusinessOwner':
        updatedUser = await BusinessOwner.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        break;
      case 'Manager':
        updatedUser = await Manager.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        break;
      case 'Support':
        updatedUser = await Support.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        break;
      case 'Viewer':
        updatedUser = await Viewer.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        break;
      case 'Admin':
        updatedUser = await Admin.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        break;
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

// Update user business information
const updateUserBusinessInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { businessInfo } = req.body;
    
    // Validate business info structure
    if (!businessInfo || typeof businessInfo !== 'object') {
      return res.status(400).json({ message: 'Invalid business information' });
    }
    
    // Try to find and update in BusinessOwner collection first
    let updatedUser = await BusinessOwner.findByIdAndUpdate(
      id,
      { businessInfo },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      // If not found in BusinessOwner, try other collections
      updatedUser = await Customer.findByIdAndUpdate(
        id,
        { businessInfo },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Manager.findByIdAndUpdate(
        id,
        { businessInfo },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Support.findByIdAndUpdate(
        id,
        { businessInfo },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Viewer.findByIdAndUpdate(
        id,
        { businessInfo },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Admin.findByIdAndUpdate(
        id,
        { businessInfo },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user business information', error: error.message });
  }
};

// Update user email (Super Admin only)
const updateUserEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    // Validate email format
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if new email is already taken by another user across all collections
    const existingUser = await Promise.race([
      Customer.findOne({ email, _id: { $ne: id } }),
      BusinessOwner.findOne({ email, _id: { $ne: id } }),
      Manager.findOne({ email, _id: { $ne: id } }),
      Support.findOne({ email, _id: { $ne: id } }),
      Viewer.findOne({ email, _id: { $ne: id } }),
      Admin.findOne({ email, _id: { $ne: id } })
    ]);
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already taken by another user' });
    }
    
    // Update user email in the appropriate collection
    let updatedUser = await Customer.findByIdAndUpdate(
      id,
      { email },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      updatedUser = await BusinessOwner.findByIdAndUpdate(
        id,
        { email },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Manager.findByIdAndUpdate(
        id,
        { email },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Support.findByIdAndUpdate(
        id,
        { email },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Viewer.findByIdAndUpdate(
        id,
        { email },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Admin.findByIdAndUpdate(
        id,
        { email },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user email', error: error.message });
  }
};

// Update user status (Super Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    // Validate isActive is a boolean
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean value' });
    }
    
    // Check if user exists in any collection
    let user = await Customer.findById(id);
    let userCollection = 'Customer';
    
    if (!user) {
      user = await BusinessOwner.findById(id);
      userCollection = 'BusinessOwner';
    }
    if (!user) {
      user = await Manager.findById(id);
      userCollection = 'Manager';
    }
    if (!user) {
      user = await Support.findById(id);
      userCollection = 'Support';
    }
    if (!user) {
      user = await Viewer.findById(id);
      userCollection = 'Viewer';
    }
    if (!user) {
      user = await Admin.findById(id);
      userCollection = 'Admin';
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deactivating super admins
    if (user.role === 'admin' && user.isAdmin === true && !isActive) {
      return res.status(403).json({ message: 'Cannot deactivate super admin users. Contact another super admin if needed.' });
    }
    
    // Update user status in the appropriate collection
    let updatedUser;
    switch (userCollection) {
      case 'Customer':
        updatedUser = await Customer.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
        break;
      case 'BusinessOwner':
        updatedUser = await BusinessOwner.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
        break;
      case 'Manager':
        updatedUser = await Manager.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
        break;
      case 'Support':
        updatedUser = await Support.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
        break;
      case 'Viewer':
        updatedUser = await Viewer.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
        break;
      case 'Admin':
        updatedUser = await Admin.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
        break;
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};

// Remove user (Super Admin only)
const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists in any collection
    let user = await Customer.findById(id);
    let userCollection = 'Customer';
    
    if (!user) {
      user = await BusinessOwner.findById(id);
      userCollection = 'BusinessOwner';
    }
    if (!user) {
      user = await Manager.findById(id);
      userCollection = 'Manager';
    }
    if (!user) {
      user = await Support.findById(id);
      userCollection = 'Support';
    }
    if (!user) {
      user = await Viewer.findById(id);
      userCollection = 'Viewer';
    }
    if (!user) {
      user = await Admin.findById(id);
      userCollection = 'Admin';
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent removing super admins (including the requesting user)
    if (user.role === 'admin' && user.isAdmin === true) {
      return res.status(403).json({ message: 'Cannot remove super admin users. Contact another super admin if needed.' });
    }
    
    // Prevent removing the last super admin
    if (user.role === 'admin') {
      const superAdminCount = await Admin.countDocuments({ role: 'admin', isAdmin: true });
      if (superAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last super admin. At least one super admin must remain.' });
      }
    }
    
    // Remove the user from the appropriate collection
    switch (userCollection) {
      case 'Customer':
        await Customer.findByIdAndDelete(id);
        break;
      case 'BusinessOwner':
        await BusinessOwner.findByIdAndDelete(id);
        break;
      case 'Manager':
        await Manager.findByIdAndDelete(id);
        break;
      case 'Support':
        await Support.findByIdAndDelete(id);
        break;
      case 'Viewer':
        await Viewer.findByIdAndDelete(id);
        break;
      case 'Admin':
        await Admin.findByIdAndDelete(id);
        break;
    }
    
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing user', error: error.message });
  }
};

// Admin Management Functions

// Invite new admin
const inviteAdmin = async (req, res) => {
  try {
    const { email, role, permissions } = req.body;
    
    console.log('Invite admin request:', { email, role, permissions });
    
    // Check if user already exists across all collections
    const existingUser = await Promise.race([
      Customer.findOne({ email }),
      BusinessOwner.findOne({ email }),
      Manager.findOne({ email }),
      Support.findOne({ email }),
      Viewer.findOne({ email }),
      Admin.findOne({ email })
    ]);
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Set default permissions based on role if none provided
    let finalPermissions = permissions;
    if (!permissions || permissions.length === 0) {
      switch (role) {
        case 'admin':
          finalPermissions = [
            { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
            { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
            { resource: 'orders', actions: ['read', 'update'] },
            { resource: 'users', actions: ['read', 'update'] },
            { resource: 'analytics', actions: ['read'] },
            { resource: 'settings', actions: ['read', 'update'] }
          ];
          break;
        case 'manager':
          finalPermissions = [
            { resource: 'products', actions: ['read', 'create', 'update'] },
            { resource: 'categories', actions: ['read', 'create', 'update'] },
            { resource: 'orders', actions: ['read', 'update'] },
            { resource: 'users', actions: ['read'] },
            { resource: 'analytics', actions: ['read'] }
          ];
          break;
        case 'support':
          finalPermissions = [
            { resource: 'orders', actions: ['read', 'update'] },
            { resource: 'users', actions: ['read', 'update'] },
            { resource: 'analytics', actions: ['read'] }
          ];
          break;
        case 'viewer':
          finalPermissions = [
            { resource: 'products', actions: ['read'] },
            { resource: 'orders', actions: ['read'] },
            { resource: 'analytics', actions: ['read'] }
          ];
          break;
        default:
          finalPermissions = [];
      }
    }

    console.log('Final permissions:', finalPermissions);

    // Create admin invitation
    const AdminInvite = require('../models/adminInvite');
    const invite = new AdminInvite({
      email,
      role,
      permissions: finalPermissions,
      invitedBy: req.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    console.log('Created invite object:', invite);

    // Save the invite and check for token generation
    await invite.save();
    console.log('Invite saved successfully');
    console.log('Generated token:', invite.token ? 'Present' : 'Missing');
    console.log('Final invite object:', invite.toObject());

    // TODO: Send email invitation
    // await sendAdminInviteEmail(invite);

    res.status(201).json({ 
      message: 'Admin invitation sent successfully',
      invite: {
        id: invite._id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt
      }
    });
  } catch (error) {
    console.error('Error in inviteAdmin:', error);
    res.status(500).json({ message: 'Error sending admin invitation', error: error.message });
  }
};

// Update user permissions
const updateUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    
    // Find user in any collection and update permissions
    let updatedUser = await Customer.findByIdAndUpdate(
      id,
      { permissions },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      updatedUser = await BusinessOwner.findByIdAndUpdate(
        id,
        { permissions },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Manager.findByIdAndUpdate(
        id,
        { permissions },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Support.findByIdAndUpdate(
        id,
        { permissions },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Viewer.findByIdAndUpdate(
        id,
        { permissions },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Admin.findByIdAndUpdate(
        id,
        { permissions },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user permissions', error: error.message });
  }
};

// Remove admin role
const removeAdminRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user in any collection and remove admin role
    let updatedUser = await Customer.findByIdAndUpdate(
      id,
      { 
        role: 'customer',
        isAdmin: false,
        permissions: [],
        adminNotes: 'Admin role removed'
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      updatedUser = await BusinessOwner.findByIdAndUpdate(
        id,
        { 
          role: 'business_owner',
          isAdmin: false,
          permissions: [],
          adminNotes: 'Admin role removed'
        },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Manager.findByIdAndUpdate(
        id,
        { 
          role: 'manager',
          isAdmin: false,
          permissions: [],
          adminNotes: 'Admin role removed'
        },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Support.findByIdAndUpdate(
        id,
        { 
          role: 'support',
          isAdmin: false,
          permissions: [],
          adminNotes: 'Admin role removed'
        },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Viewer.findByIdAndUpdate(
        id,
        { 
          role: 'viewer',
          isAdmin: false,
          permissions: [],
          adminNotes: 'Admin role removed'
        },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await Admin.findByIdAndUpdate(
        id,
        { 
          role: 'customer',
          isAdmin: false,
          permissions: [],
          adminNotes: 'Admin role removed'
        },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Admin role removed successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error removing admin role', error: error.message });
  }
};

// Get admin invitations
const getAdminInvites = async (req, res) => {
  try {
    const AdminInvite = require('../models/adminInvite');
    const invites = await AdminInvite.find()
      .populate('invitedBy', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin invitations', error: error.message });
  }
};

// Cancel admin invitation
const cancelAdminInvite = async (req, res) => {
  try {
    const { id } = req.params;
    
    const AdminInvite = require('../models/adminInvite');
    const invite = await AdminInvite.findByIdAndDelete(id);
    
    if (!invite) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling invitation', error: error.message });
  }
};

// Get all admin users
const getAllAdmins = async (req, res) => {
  try {
    // Get admins from Admin collection
    const adminUsers = await Admin.find({ 
      $or: [{ role: 'admin' }, { isAdmin: true }] 
    }).select('-password').sort({ createdAt: -1 });

    // Get admins from other collections
    const customerAdmins = await Customer.find({ 
      $or: [{ role: 'admin' }, { isAdmin: true }] 
    }).select('-password').sort({ createdAt: -1 });

    const businessOwnerAdmins = await BusinessOwner.find({ 
      $or: [{ role: 'admin' }, { isAdmin: true }] 
    }).select('-password').sort({ createdAt: -1 });

    const managerAdmins = await Manager.find({ 
      $or: [{ role: 'admin' }, { isAdmin: true }] 
    }).select('-password').sort({ createdAt: -1 });

    const supportAdmins = await Support.find({ 
      $or: [{ role: 'admin' }, { isAdmin: true }] 
    }).select('-password').sort({ createdAt: -1 });

    const viewerAdmins = await Viewer.find({ 
      $or: [{ role: 'admin' }, { isAdmin: true }] 
    }).select('-password').sort({ createdAt: -1 });

    // Combine all admins with collection info
    const allAdmins = [
      ...adminUsers.map(admin => ({ ...admin.toObject(), collection: 'Admin' })),
      ...customerAdmins.map(admin => ({ ...admin.toObject(), collection: 'Customer' })),
      ...businessOwnerAdmins.map(admin => ({ ...admin.toObject(), collection: 'BusinessOwner' })),
      ...managerAdmins.map(admin => ({ ...admin.toObject(), collection: 'Manager' })),
      ...supportAdmins.map(admin => ({ ...admin.toObject(), collection: 'Support' })),
      ...viewerAdmins.map(admin => ({ ...admin.toObject(), collection: 'Viewer' }))
    ];

    res.json(allAdmins);
  } catch (error) {
    console.error('Error getting all admins:', error);
    res.status(500).json({ message: 'Error fetching admins', error: error.message });
  }
};

// Get admin details
const getAdminDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Search in Admin collection first
    let admin = await Admin.findById(id).select('-password');
    let collection = 'Admin';
    
    if (!admin) {
      // Search in Customer collection
      admin = await Customer.findById(id).select('-password');
      if (admin) collection = 'Customer';
    }
    
    if (!admin) {
      // Search in BusinessOwner collection
      admin = await BusinessOwner.findById(id).select('-password');
      if (admin) collection = 'BusinessOwner';
    }
    
    if (!admin) {
      // Search in Manager collection
      admin = await Manager.findById(id).select('-password');
      if (admin) collection = 'Manager';
    }
    
    if (!admin) {
      // Search in Support collection
      admin = await Support.findById(id).select('-password');
      if (admin) collection = 'Support';
    }
    
    if (!admin) {
      // Search in Viewer collection
      admin = await Viewer.findById(id).select('-password');
      if (admin) collection = 'Viewer';
    }
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    const adminData = { ...admin.toObject(), collection };
    res.json(adminData);
  } catch (error) {
    console.error('Error getting admin details:', error);
    res.status(500).json({ message: 'Error fetching admin details', error: error.message });
  }
};

// Update admin user
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields
    delete updateData.password;
    delete updateData.email; // Don't allow email changes via this endpoint
    
    // Search and update in Admin collection first
    let updatedAdmin = await Admin.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).select('-password');
    
    if (!updatedAdmin) {
      // Try Customer collection
      updatedAdmin = await Customer.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try BusinessOwner collection
      updatedAdmin = await BusinessOwner.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Manager collection
      updatedAdmin = await Manager.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Support collection
      updatedAdmin = await Support.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Viewer collection
      updatedAdmin = await Viewer.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ message: 'Admin updated successfully', admin: updatedAdmin });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Error updating admin', error: error.message });
  }
};

// Delete admin user
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if trying to delete a super admin
    let admin = await Admin.findById(id);
    if (admin && admin.isAdmin === true) {
      return res.status(403).json({ message: 'Cannot delete super admin users' });
    }
    
    // Try to delete from Admin collection first
    let deletedAdmin = await Admin.findByIdAndDelete(id);
    
    if (!deletedAdmin) {
      // Try Customer collection
      deletedAdmin = await Customer.findByIdAndDelete(id);
    }
    
    if (!deletedAdmin) {
      // Try BusinessOwner collection
      deletedAdmin = await BusinessOwner.findByIdAndDelete(id);
    }
    
    if (!deletedAdmin) {
      // Try Manager collection
      deletedAdmin = await Manager.findByIdAndDelete(id);
    }
    
    if (!deletedAdmin) {
      // Try Support collection
      deletedAdmin = await Support.findByIdAndDelete(id);
    }
    
    if (!deletedAdmin) {
      // Try Viewer collection
      deletedAdmin = await Viewer.findByIdAndDelete(id);
    }
    
    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ message: 'Admin deleted successfully', admin: deletedAdmin });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Error deleting admin', error: error.message });
  }
};

// Update admin status
const updateAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    // Update in Admin collection first
    let updatedAdmin = await Admin.findByIdAndUpdate(
      id, 
      { isActive }, 
      { new: true }
    ).select('-password');
    
    if (!updatedAdmin) {
      // Try Customer collection
      updatedAdmin = await Customer.findByIdAndUpdate(
        id, 
        { isActive }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try BusinessOwner collection
      updatedAdmin = await BusinessOwner.findByIdAndUpdate(
        id, 
        { isActive }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Manager collection
      updatedAdmin = await Manager.findByIdAndUpdate(
        id, 
        { isActive }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Support collection
      updatedAdmin = await Support.findByIdAndUpdate(
        id, 
        { isActive }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Viewer collection
      updatedAdmin = await Viewer.findByIdAndUpdate(
        id, 
        { isActive }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ message: 'Admin status updated successfully', admin: updatedAdmin });
  } catch (error) {
    console.error('Error updating admin status:', error);
    res.status(500).json({ message: 'Error updating admin status', error: error.message });
  }
};

// Update admin permissions
const updateAdminPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    
    // Update in Admin collection first
    let updatedAdmin = await Admin.findByIdAndUpdate(
      id, 
      { permissions }, 
      { new: true }
    ).select('-password');
    
    if (!updatedAdmin) {
      // Try Customer collection
      updatedAdmin = await Customer.findByIdAndUpdate(
        id, 
        { permissions }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try BusinessOwner collection
      updatedAdmin = await BusinessOwner.findByIdAndUpdate(
        id, 
        { permissions }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Manager collection
      updatedAdmin = await Manager.findByIdAndUpdate(
        id, 
        { permissions }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Support collection
      updatedAdmin = await Support.findByIdAndUpdate(
        id, 
        { permissions }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Viewer collection
      updatedAdmin = await Viewer.findByIdAndUpdate(
        id, 
        { permissions }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ message: 'Admin permissions updated successfully', admin: updatedAdmin });
  } catch (error) {
    console.error('Error updating admin permissions:', error);
    res.status(500).json({ message: 'Error updating admin permissions', error: error.message });
  }
};

// Search admins
const searchAdmins = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchRegex = new RegExp(q, 'i');
    
    // Search in Admin collection
    const adminResults = await Admin.find({
      $and: [
        { $or: [{ role: 'admin' }, { isAdmin: true }] },
        {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
            { role: searchRegex }
          ]
        }
      ]
    }).select('-password');
    
    // Search in other collections
    const customerResults = await Customer.find({
      $and: [
        { $or: [{ role: 'admin' }, { isAdmin: true }] },
        {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
            { role: searchRegex }
          ]
        }
      ]
    }).select('-password');
    
    const businessOwnerResults = await BusinessOwner.find({
      $and: [
        { $or: [{ role: 'admin' }, { isAdmin: true }] },
        {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { firstName: { $exists: true }, lastName: { $exists: true } },
            { role: searchRegex }
          ]
        }
      ]
    }).select('-password');
    
    const managerResults = await Manager.find({
      $and: [
        { $or: [{ role: 'admin' }, { isAdmin: true }] },
        {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { firstName: { $exists: true }, lastName: { name: searchRegex } },
            { role: searchRegex }
          ]
        }
      ]
    }).select('-password');
    
    const supportResults = await Support.find({
      $and: [
        { $or: [{ role: 'admin' }, { isAdmin: true }] },
        {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { firstName: { $exists: true }, lastName: { $exists: true } },
            { role: searchRegex }
          ]
        }
        ]
    }).select('-password');
    
    const viewerResults = await Viewer.find({
      $and: [
        { $or: [{ role: 'admin' }, { isAdmin: true }] },
        {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { firstName: { $exists: true }, lastName: { $exists: true } },
            { role: 'admin' } // Viewers can't be admins, but include for completeness
          ]
        }
      ]
    }).select('-password');
    
    // Combine all results
    const allResults = [
      ...adminResults.map(admin => ({ ...admin.toObject(), collection: 'Admin' })),
      ...customerResults.map(admin => ({ ...admin.toObject(), collection: 'Customer' })),
      ...businessOwnerResults.map(admin => ({ ...admin.toObject(), collection: 'BusinessOwner' })),
      ...managerResults.map(admin => ({ ...admin.toObject(), collection: 'BusinessOwner' })),
      ...supportResults.map(admin => ({ ...admin.toObject(), collection: 'Support' })),
      ...viewerResults.map(admin => ({ ...admin.toObject(), collection: 'Viewer' }))
    ];
    
    res.json(allResults);
  } catch (error) {
    console.error('Error searching admins:', error);
    res.status(500).json({ message: 'Error searching admins', error: error.message });
  }
};

// Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).select('-password').sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
};

// Get all business owners
const getAllBusinessOwners = async (req, res) => {
  try {
    const businessOwners = await BusinessOwner.find({}).select('-password').sort({ createdAt: -1 });
    res.json(businessOwners);
  } catch (error) {
    console.error('Error getting business owners:', error);
    res.status(500).json({ message: 'Error fetching business owners', error: error.message });
  }
};

// Promote user to business owner or admin
const promoteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, adminLevel, permissions, businessInfo, collection } = req.body;
    
    let promotedUser = null;
    
    if (collection === 'Customer') {
      // Promote customer to business owner
      if (role === 'business_owner') {
        // Create new business owner
        const newBusinessOwner = new BusinessOwner({
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          username: req.user.username,
          role: 'business_owner',
          isAdmin: adminLevel === 'super_admin',
          permissions: permissions || [],
          businessInfo: businessInfo || {},
          isActive: true
        });
        
        promotedUser = await newBusinessOwner.save();
        
        // Optionally deactivate the old customer account
        await Customer.findByIdAndUpdate(id, { isActive: false });
        
      } else if (role === 'admin') {
        // Promote customer to admin
        const newAdmin = new Admin({
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          username: req.user.username,
          role: 'admin',
          isAdmin: adminLevel === 'super_admin',
          permissions: permissions || [],
          isActive: true
        });
        
        promotedUser = await newAdmin.save();
        
        // Optionally deactivate the old customer account
        await Customer.findByIdAndUpdate(id, { isActive: false });
      }
    } else if (collection === 'BusinessOwner') {
      // Promote business owner to admin
      if (role === 'admin') {
        const newAdmin = new Admin({
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          username: req.user.username,
          role: 'admin',
          isAdmin: adminLevel === 'super_admin',
          permissions: permissions || [],
          isActive: true
        });
        
        promotedUser = await newAdmin.save();
        
        // Optionally deactivate the old business owner account
        await Customer.findByIdAndUpdate(id, { isActive: false });
      }
    }
    
    if (!promotedUser) {
      return res.status(400).json({ message: 'Invalid promotion request' });
    }
    
    res.json({ 
      message: `User promoted to ${role} successfully!`, 
      user: promotedUser 
    });
    
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({ message: 'Error promoting user', error: error.message });
  }
};

module.exports = {
  isAdmin,
  adminLogin,
  getDashboardStats,
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
  updateUserBusinessInfo,
  updateUserEmail,
  updateUserStatus,
  removeUser,
  inviteAdmin,
  updateUserPermissions,
  removeAdminRole,
  getAdminInvites,
  cancelAdminInvite,
  getAllAdmins,
  getAdminDetails,
  updateAdmin,
  deleteAdmin,
  updateAdminStatus,
  updateAdminPermissions,
  searchAdmins,
  getAllCustomers,
  getAllBusinessOwners,
  promoteUser
}; 