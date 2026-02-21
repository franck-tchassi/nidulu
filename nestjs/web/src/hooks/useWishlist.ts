// web/src/hooks/useWishlist.ts
// web/src/hooks/useWishlist.ts
import { useCallback } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/auth-context';

export const useWishlist = () => {
  const { 
    wishlist, 
    toggleWishlist: toggleWishlistStore, 
    removeFromWishlist: removeFromWishlistStore,
    syncWishlistWithBackend,
    getIsInWishlist
  } = useCartStore();
  
  const { isAuthenticated } = useAuth();

  const isInWishlist = useCallback(
    (productId: string) => getIsInWishlist(productId),
    [getIsInWishlist]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      try {
        await toggleWishlistStore(productId, isAuthenticated);
        return !isInWishlist(productId);
      } catch (error) {
        console.error('Error toggling wishlist:', error);
        throw error;
      }
    },
    [toggleWishlistStore, isAuthenticated, isInWishlist]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      try {
        await removeFromWishlistStore(productId, isAuthenticated);
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
      }
    },
    [removeFromWishlistStore, isAuthenticated]
  );

  const syncWithBackend = useCallback(async () => {
    await syncWishlistWithBackend(isAuthenticated);
  }, [isAuthenticated, syncWishlistWithBackend]);

  return {
    wishlist,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    syncWithBackend,
    count: wishlist.length,
  };
};