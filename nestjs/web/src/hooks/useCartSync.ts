// web/src/hooks/useCartSync.ts

import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/auth-context';

/**
 * Hook qui synchronise automatiquement le panier et la wishlist
 * quand l'utilisateur se connecte/déconnecte
 */
export const useCartSync = () => {
  const { syncCartWithBackend, syncWishlistWithBackend } = useCartStore();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('🔄 useCartSync: Auth state changed', { isAuthenticated });
    
    if (isAuthenticated) {
      console.log('🔄 useCartSync: User authenticated, syncing...');
      
      // Délai pour s'assurer que le token est bien disponible
      const timer = setTimeout(() => {
        syncCartWithBackend(true);
        syncWishlistWithBackend(true);
      }, 1000); // 1 seconde de délai
      
      return () => clearTimeout(timer);
    } else {
      console.log('🔄 useCartSync: User not authenticated, using local storage');
      // Quand l'utilisateur se déconnecte, le panier local reste
    }
  }, [isAuthenticated, syncCartWithBackend, syncWishlistWithBackend]);
};