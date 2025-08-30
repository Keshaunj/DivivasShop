// Utility function to clear admin tokens
export const clearAdminToken = () => {
  localStorage.removeItem('adminToken');
  console.log('Admin token cleared');
};

// Function to check if admin token exists
export const hasAdminToken = () => {
  const token = localStorage.getItem('adminToken');
  return !!token;
};

// Function to get admin token info
export const getAdminTokenInfo = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      isAdmin: payload.isAdmin,
      exp: new Date(payload.exp * 1000).toISOString(),
      isValid: payload.exp * 1000 > Date.now()
    };
  } catch (error) {
    return { error: 'Invalid token format' };
  }
};
