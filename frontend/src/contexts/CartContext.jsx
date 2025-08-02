import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate cart count
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Load cart from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      // For non-authenticated users, load from localStorage
      loadLocalCart();
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartAPI.getCart();
      setCartItems(cartData.items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Fallback to local storage
      loadLocalCart();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalCart = () => {
    try {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      }
    } catch (error) {
      console.error('Failed to load local cart:', error);
    }
  };

  const saveLocalCart = (items) => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save local cart:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Add to backend cart
        await cartAPI.addToCart(product._id, quantity);
        await loadCart(); // Reload cart from backend
      } else {
        // Add to local cart
        const existingItem = cartItems.find(item => item._id === product._id);
        
        let newCartItems;
        if (existingItem) {
          newCartItems = cartItems.map(item =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newCartItems = [...cartItems, { ...product, quantity }];
        }
        
        setCartItems(newCartItems);
        saveLocalCart(newCartItems);
      }
    } catch (error) {
      setError('Failed to add item to cart');
      console.error('Add to cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Update in backend cart
        await cartAPI.updateCartItem(productId, quantity);
        await loadCart(); // Reload cart from backend
      } else {
        // Update in local cart
        let newCartItems;
        if (quantity <= 0) {
          newCartItems = cartItems.filter(item => item._id !== productId);
        } else {
          newCartItems = cartItems.map(item =>
            item._id === productId
              ? { ...item, quantity }
              : item
          );
        }
        
        setCartItems(newCartItems);
        saveLocalCart(newCartItems);
      }
    } catch (error) {
      setError('Failed to update cart item');
      console.error('Update cart item error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Remove from backend cart
        await cartAPI.removeFromCart(productId);
        await loadCart(); // Reload cart from backend
      } else {
        // Remove from local cart
        const newCartItems = cartItems.filter(item => item._id !== productId);
        setCartItems(newCartItems);
        saveLocalCart(newCartItems);
      }
    } catch (error) {
      setError('Failed to remove item from cart');
      console.error('Remove from cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Clear backend cart
        await cartAPI.clearCart();
        setCartItems([]);
      } else {
        // Clear local cart
        setCartItems([]);
        saveLocalCart([]);
      }
    } catch (error) {
      setError('Failed to clear cart');
      console.error('Clear cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value = {
    cartItems,
    cartCount,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 