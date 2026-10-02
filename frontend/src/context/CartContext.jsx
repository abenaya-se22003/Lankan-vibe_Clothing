import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const normalizeCart = (rawCart) => {
  if (!rawCart) {
    return { items: [], totalItems: 0, totalPrice: 0, totalAmount: 0, totalQuantity: 0 };
  }
  const items = Array.isArray(rawCart.items)
    ? rawCart.items.map((item) => {
        const unitPrice =
          Number(
            item.unitPrice ??
              item.productPrice ??
              (item.subtotal && item.quantity ? item.subtotal / item.quantity : 0)
          ) || 0;
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const subtotal =
          Number(item.subtotal != null ? item.subtotal : unitPrice * quantity) || 0;
        return {
          ...item,
          id: item.id != null ? item.id : item.productId,
          productId: item.productId ?? item.id,
          productName: item.productName || item.name || 'Apparel Item',
          imageUrl: item.imageUrl || item.image || '',
          unitPrice,
          productPrice: unitPrice,
          quantity,
          subtotal,
        };
      })
    : [];

  const totalItems =
    rawCart.totalItems ??
    rawCart.totalQuantity ??
    items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const totalPrice =
    rawCart.totalPrice ??
    rawCart.totalAmount ??
    items.reduce((sum, i) => sum + (Number(i.subtotal) || 0), 0);

  return {
    ...rawCart,
    items,
    totalItems: Number(totalItems) || 0,
    totalQuantity: Number(totalItems) || 0,
    totalPrice: Number(totalPrice) || 0,
    totalAmount: Number(totalPrice) || 0,
  };
};

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
          setCart(normalizeCart(parsed));
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
      setCart(normalizeCart(data));
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          try {
            setCart(normalizeCart(JSON.parse(guestCart)));
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
    const qty = Math.max(1, Number(quantity) || 1);
    const prodPrice = Number(product.price) || 0;

    if (!isAuthenticated) {
      setCart((prev) => {
        const currentItems = [...(prev.items || [])];
        const existingIndex = currentItems.findIndex(
          (item) => String(item.productId) === String(product.id) || String(item.id) === String(product.id)
        );

        if (existingIndex > -1) {
          const itemPrice = Number(currentItems[existingIndex].unitPrice) || prodPrice;
          currentItems[existingIndex].quantity += qty;
          currentItems[existingIndex].subtotal = currentItems[existingIndex].quantity * itemPrice;
        } else {
          currentItems.push({
            id: Date.now(),
            productId: product.id,
            productName: product.name,
            unitPrice: prodPrice,
            productPrice: prodPrice,
            imageUrl: product.imageUrl,
            quantity: qty,
            subtotal: qty * prodPrice,
          });
        }

        const normalized = normalizeCart({ ...prev, items: currentItems });
        localStorage.setItem('guestCart', JSON.stringify(normalized));
        return normalized;
      });
      toast.success(`Added ${product.name} to cart!`);
      return;
    }

    try {
      const updatedCart = await cartAPI.addToCart(product.id, qty);
      setCart(normalizeCart(updatedCart));
      toast.success(`Added ${product.name} to cart!`);
    } catch (err) {
      console.error('Add to cart failed', err);
      toast.error(err.response?.data?.message || 'Could not add item to cart');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    const newQty = Number(quantity);
    if (newQty <= 0) {
      await removeItem(itemId);
      return;
    }

    // Capture the target item before state changes so we know the backend itemId
    let targetBackendItemId = itemId;

    // Instant optimistic local state update for super snappy UX
    setCart((prev) => {
      const currentItems = (prev.items || []).map((item) => {
        if (String(item.id) === String(itemId) || String(item.productId) === String(itemId)) {
          if (item.id != null) {
            targetBackendItemId = item.id;
          }
          const unitPrice =
            Number(
              item.unitPrice ??
                item.productPrice ??
                (item.subtotal && item.quantity ? item.subtotal / item.quantity : 0)
            ) || 0;
          return {
            ...item,
            quantity: newQty,
            unitPrice,
            productPrice: unitPrice,
            subtotal: newQty * unitPrice,
          };
        }
        return item;
      });

      const normalized = normalizeCart({ ...prev, items: currentItems });
      if (!isAuthenticated) {
        localStorage.setItem('guestCart', JSON.stringify(normalized));
      }
      return normalized;
    });

    if (!isAuthenticated) {
      return;
    }

    try {
      const updated = await cartAPI.updateQuantity(targetBackendItemId, newQty);
      if (updated && updated.items) {
        setCart(normalizeCart(updated));
      }
    } catch (err) {
      console.error('Failed to update quantity on backend', err);
    }
  };

  const removeItem = async (itemId) => {
    let targetBackendItemId = itemId;

    // Instant optimistic local state update
    setCart((prev) => {
      const target = (prev.items || []).find(
        (item) => String(item.id) === String(itemId) || String(item.productId) === String(itemId)
      );
      if (target && target.id != null) {
        targetBackendItemId = target.id;
      }

      const updatedItems = (prev.items || []).filter(
        (item) => String(item.id) !== String(itemId) && String(item.productId) !== String(itemId)
      );

      const normalized = normalizeCart({ ...prev, items: updatedItems });
      if (!isAuthenticated) {
        localStorage.setItem('guestCart', JSON.stringify(normalized));
      }
      return normalized;
    });

    toast.success('Item removed from cart');

    if (!isAuthenticated) {
      return;
    }

    try {
      const updated = await cartAPI.removeItem(targetBackendItemId);
      if (updated && updated.items) {
        setCart(normalizeCart(updated));
      }
    } catch (err) {
      console.error('Failed to remove item on backend', err);
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
      setCart(normalizeCart(emptyCart));
    } catch (err) {
      console.error('Failed to clear cart', err);
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
