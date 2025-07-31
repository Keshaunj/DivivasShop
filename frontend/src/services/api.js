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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
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

  // Get all orders for admin
  getAllOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Get all users for admin
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  // Add new category
  addCategory: async (categoryData) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
  },

  // Update category
  updateCategory: async (categoryId, categoryData) => {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
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