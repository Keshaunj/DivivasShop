const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Authentication API
export const authAPI = {
  // Sign up new user
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Login user
  login: async (credentials) => {
    console.log('=== AUTH API LOGIN START ===');
    console.log('1. Login function called with credentials:', { 
      email: credentials.email, 
      hasPassword: !!credentials.password 
    });
    
    const url = `${API_BASE_URL}/auth/login`;
    console.log('2. Making request to URL:', url);
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify(credentials),
    };
    
    console.log('3. Request options:', {
      method: requestOptions.method,
      headers: requestOptions.headers,
      credentials: requestOptions.credentials,
      bodyLength: requestOptions.body.length
    });
    
    console.log('4. About to make fetch request...');
    
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('5. FETCH TIMEOUT - Request taking too long, aborting...');
        controller.abort();
      }, 5000); // 5 second timeout
      
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('5. Fetch response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        console.error('6. Response not OK, calling handleResponse...');
        return handleResponse(response);
      }
      
      console.log('6. Response is OK, parsing JSON...');
      const data = await response.json();
      console.log('7. JSON parsed successfully:', data);
      console.log('=== AUTH API LOGIN SUCCESS ===');
      return data;
      
    } catch (fetchError) {
      console.error('=== AUTH API LOGIN FETCH ERROR ===');
      console.error('Fetch error type:', typeof fetchError);
      console.error('Fetch error name:', fetchError.name);
      console.error('Fetch error message:', fetchError.message);
      console.error('Fetch error stack:', fetchError.stack);
      console.error('Full fetch error:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        console.error('REQUEST TIMED OUT - Backend is not responding within 5 seconds');
        console.error('Possible causes:');
        console.error('- Backend server crashed or stopped');
        console.error('- Backend is hanging on the login route');
        console.error('- Database connection issues');
        console.error('- Backend process is frozen');
      }
      
      throw fetchError;
    }
  },

  // Logout user
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Check if user is authenticated
  checkAuth: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });
    return handleResponse(response);
  },

  // Verify reset token
  verifyResetToken: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token/${token}`, {
      method: 'GET',
    });
    return handleResponse(response);
  },
};

// User Profile API
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(passwordData),
    });
    return handleResponse(response);
  },

  // Delete account
  deleteAccount: async () => {
    const response = await fetch(`${API_BASE_URL}/users/delete`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

// Products API
export const productsAPI = {
  // Get all products
  getAllProducts: async (category = null) => {
    const url = category 
      ? `${API_BASE_URL}/products?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/products`;
    
    const response = await fetch(url);
    return handleResponse(response);
  },

  // Get single product
  getProduct: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    return handleResponse(response);
  },

  // Get categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return handleResponse(response);
  },

  // Admin: Add new product
  addProduct: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData, // FormData for file uploads
    });
    return handleResponse(response);
  },

  // Admin: Update product
  updateProduct: async (productId, formData) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: formData, // FormData for file uploads
    });
    return handleResponse(response);
  },

  // Admin: Delete product
  deleteProduct: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

// Admin API
export const adminAPI = {
  // Get admin dashboard stats
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Products management
  getAllProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  addProduct: async (productData) => {
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  updateProduct: async (id, productData) => {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  deleteProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Categories management
  getAllCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  addCategory: async (categoryData) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
  },

  deleteCategory: async (categoryId) => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Orders management
  getAllOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  // Users management
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateUserRole: async (userId, role) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ role }),
    });
    return handleResponse(response);
  },

  updateUserBusinessInfo: async (userId, businessInfo) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/business-info`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ businessInfo }),
    });
    return handleResponse(response);
  },

  updateUserEmail: async (userId, email) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/email`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  removeUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateUserStatus: async (userId, isActive) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ isActive }),
    });
    return handleResponse(response);
  },

  // Admin Management API endpoints
  inviteAdmin: async (inviteData) => {
    const response = await fetch(`${API_BASE_URL}/admin/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(inviteData),
    });
    return handleResponse(response);
  },

  updateUserPermissions: async (userId, permissions) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/permissions`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ permissions }),
    });
    return handleResponse(response);
  },

  removeAdminRole: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/remove-admin`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Remove admin role (frontend version)
  removeAdminRoleFrontend: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/remove-admin`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getAdminInvites: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/invites`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  cancelAdminInvite: async (inviteId) => {
    const response = await fetch(`${API_BASE_URL}/admin/invites/${inviteId}/cancel`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

// Cart API
export const cartAPI = {
  // Get user's cart
  getCart: async () => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ productId, quantity }),
    });
    return handleResponse(response);
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ productId, quantity }),
    });
    return handleResponse(response);
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Checkout
  checkout: async (checkoutData) => {
    const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(checkoutData),
    });
    return handleResponse(response);
  },
};

// Orders API
export const ordersAPI = {
  // Get user's orders
  getUserOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Get single order
  getOrder: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

// Error handling utility
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  return {
    message: error.message || 'An unexpected error occurred',
    type: 'error'
  };
};

// Success message utility
export const createSuccessMessage = (message) => ({
  message,
  type: 'success'
}); 