import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      // Guest cart stored in localStorage
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        try {
          const parsed = JSON.parse(guestCart);
          setCart(parsed);
        } catch {
          setCart({ items: [], totalItems: 0, totalPrice: 0 });
        }
      } else {
        setCart({ items: [], totalItems: 0, totalPrice: 0 });
      }
      return;
    }

    try {
      setLoading(true);
      const data = await cartAPI.getCart();
      setCart(data || { items: [], totalItems: 0, totalPrice: 0 });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          try {
            setCart(JSON.parse(guestCart));
          } catch {
            setCart({ items: [], totalItems: 0, totalPrice: 0 });
          }
        }
      } else {
        console.error('Failed to load user cart', err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      // Manage local guest cart
      const currentItems = [...cart.items];
      const existingIndex = currentItems.findIndex((item) => item.productId === product.id);

      if (existingIndex > -1) {
        currentItems[existingIndex].quantity += quantity;
        currentItems[existingIndex].subtotal =
          currentItems[existingIndex].quantity * currentItems[existingIndex].productPrice;
      } else {
        currentItems.push({
          id: Date.now(),
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          imageUrl: product.imageUrl,
          quantity: quantity,
          subtotal: quantity * product.price,
        });
      }

      const totalItems = currentItems.reduce((acc, item) => acc + item.quantity, 0);
      const totalPrice = currentItems.reduce((acc, item) => acc + item.subtotal, 0);
      const newCart = { items: currentItems, totalItems, totalPrice };

      setCart(newCart);
      localStorage.setItem('guestCart', JSON.stringify(newCart));
      toast.success(`Added ${product.name} to cart!`);
      return;
    }

    try {
      const updatedCart = await cartAPI.addToCart(product.id, quantity);
      setCart(updatedCart);
      toast.success(`Added ${product.name} to cart!`);
    } catch (err) {
      console.error('Add to cart failed', err);
      toast.error(err.response?.data?.message || 'Could not add item to cart');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    if (!isAuthenticated) {
      const currentItems = cart.items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity,
            subtotal: quantity * item.productPrice,
          };
        }
        return item;
      });
      const totalItems = currentItems.reduce((acc, item) => acc + item.quantity, 0);
      const totalPrice = currentItems.reduce((acc, item) => acc + item.subtotal, 0);
      const newCart = { items: currentItems, totalItems, totalPrice };
      setCart(newCart);
      localStorage.setItem('guestCart', JSON.stringify(newCart));
      return;
    }

    try {
      const updated = await cartAPI.updateItemQuantity(itemId, quantity);
      setCart(updated);
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    if (!isAuthenticated) {
      const currentItems = cart.items.filter((item) => item.id !== itemId);
      const totalItems = currentItems.reduce((acc, item) => acc + item.quantity, 0);
      const totalPrice = currentItems.reduce((acc, item) => acc + item.subtotal, 0);
      const newCart = { items: currentItems, totalItems, totalPrice };
      setCart(newCart);
      localStorage.setItem('guestCart', JSON.stringify(newCart));
      toast.success('Item removed from cart');
      return;
    }

    try {
      const updated = await cartAPI.removeItem(itemId);
      setCart(updated);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
      localStorage.removeItem('guestCart');
      return;
    }

    try {
      const emptyCart = await cartAPI.clearCart();
      setCart(emptyCart);
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.totalItems || 0,
        totalPrice: cart.totalPrice || 0,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
