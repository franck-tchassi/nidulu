// web/src/hooks/useCart.ts
import { useCallback } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/auth-context';
import { Product } from '@/types';

export const useCart = () => {
  const {
    cart,
    isLoading,
    isSyncing,
    addToCart: addToCartStore,
    removeFromCart: removeFromCartStore,
    updateQuantity: updateQuantityStore,
    clearCart: clearCartStore,
    syncCartWithBackend,
    getIsInCart
  } = useCartStore();
  
  const { isAuthenticated } = useAuth();

  const addToCart = useCallback(async (product: Product) => {
    try {
      await addToCartStore(product, isAuthenticated);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }, [addToCartStore, isAuthenticated]);

  const removeFromCart = useCallback(async (id: string) => {
    try {
      await removeFromCartStore(id, isAuthenticated);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }, [removeFromCartStore, isAuthenticated]);

  const updateQuantity = useCallback(async (id: string, delta: number) => {
    const item = cart.find(item => item.id === id);
    if (!item) return;
    
    const newQuantity = item.quantity + delta;
    try {
      await updateQuantityStore(id, newQuantity, isAuthenticated);
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  }, [updateQuantityStore, cart, isAuthenticated]);

  const clearCart = useCallback(async () => {
    try {
      await clearCartStore(isAuthenticated);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }, [clearCartStore, isAuthenticated]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return {
    cart,
    cartCount, // Calculé localement
    cartTotal,
    isLoading,
    isSyncing,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCartWithBackend: () => syncCartWithBackend(isAuthenticated),
    isInCart: getIsInCart
  };
};