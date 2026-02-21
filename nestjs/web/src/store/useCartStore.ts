// web/src/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartProduct } from '@/types';
import { 
  toggleWishlistApi, 
  getWishlist, 
  removeFromWishlistApi,
  syncWishlist,
  addToCartApi,
  getCart as getCartApi,
  removeFromCartApi,
  updateCartItemApi,
  clearCartApi,
  mergeCartApi,
  CartItemResponse
} from '@/lib/api';

interface CartState {
  cart: CartProduct[];
  wishlist: string[];
  isLoading: boolean;
  isSyncing: boolean;
  addToCart: (product: Product, isAuthenticated?: boolean) => Promise<void>;
  removeFromCart: (id: string, isAuthenticated?: boolean) => Promise<void>;
  updateQuantity: (id: string, quantity: number, isAuthenticated?: boolean) => Promise<void>;
  toggleWishlist: (id: string, isAuthenticated?: boolean) => Promise<void>;
  removeFromWishlist: (id: string, isAuthenticated?: boolean) => Promise<void>;
  syncWishlistWithBackend: (isAuthenticated: boolean) => Promise<void>;
  syncCartWithBackend: (isAuthenticated: boolean) => Promise<void>;
  clearWishlist: () => void;
  clearCart: (isAuthenticated?: boolean) => Promise<void>;
  getIsInWishlist: (id: string) => boolean;
  getIsInCart: (id: string) => boolean;
}

// Fonction helper pour convertir CartItemResponse en CartProduct
const mapCartItemToCartProduct = (item: CartItemResponse): CartProduct => {
  console.log('🔍 Mapping cart item:', {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: item.product
  });
  
  // Extraire l'URL de l'image
  let imageUrl = '/placeholder-image.jpg';
  
  if (item.product?.images && item.product.images.length > 0) {
    const firstImage = item.product.images[0];
    
    if (firstImage && typeof firstImage === 'object') {
      // CAST en any pour éviter l'erreur TypeScript
      const firstImageAny = firstImage as any;
      
      // Essayez toutes les propriétés possibles
      const possibleKeys = ['url', 'imageUrl', 'path', 'src', 'image'];
      for (const key of possibleKeys) {
        if (firstImageAny[key] && typeof firstImageAny[key] === 'string') {
          imageUrl = firstImageAny[key];
          console.log(`✅ Found image in "${key}":`, imageUrl);
          break;
        }
      }
    } else if (typeof firstImage === 'string') {
      imageUrl = firstImage;
    }
  }
  
  console.log('✅ Final image URL:', imageUrl);
  
  return {
    id: item.productId,
    name: item.product.name,
    price: Number(item.product.price),
    image: imageUrl,
    quantity: item.quantity,
    cartItemId: item.id,
    productId: item.productId
  };
};


export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      isLoading: false,
      isSyncing: false,

      getIsInWishlist: (id: string) => {
        return get().wishlist.includes(id);
      },

      getIsInCart: (id: string) => {
        return get().cart.some(item => item.id === id);
      },

      // Synchroniser le panier avec le backend
      syncCartWithBackend: async (isAuthenticated: boolean) => {
        if (!isAuthenticated) return;
        
        console.log('🔄 Syncing cart with backend...');
        set({ isSyncing: true });
        
        try {
          // Récupérer le panier du backend
          const cartResponse = await getCartApi();
          console.log('📦 Backend cart response:', cartResponse);
          
          if (!cartResponse.cartItems || cartResponse.cartItems.length === 0) {
            console.log('📦 Backend cart is empty');
            set({ cart: [], isSyncing: false });
            return;
          }
          
          // Convertir les items du backend
          const backendCart = cartResponse.cartItems.map(mapCartItemToCartProduct);
          console.log('🛒 Mapped backend cart:', backendCart);
          
          // Calculer le total des quantités
          const totalQuantity = backendCart.reduce((sum, item) => sum + item.quantity, 0);
          console.log('🔢 Total quantity in backend cart:', totalQuantity);
          
          // Mettre à jour le store
          set({ cart: backendCart });
          
          console.log('✅ Cart synced successfully. New cart count:', totalQuantity);
          
        } catch (error) {
          console.error('❌ Error syncing cart with backend:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      addToCart: async (product: Product, isAuthenticated = false) => {
        const oldCart = get().cart;
        
        console.log('➕ Adding product to cart:', product);
        
        // Mise à jour locale immédiate pour une meilleure UX
        const existingIndex = oldCart.findIndex(item => item.id === product.id);
        let newCart: CartProduct[];
        
        if (existingIndex !== -1) {
          newCart = [...oldCart];
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: newCart[existingIndex].quantity + 1
          };
        } else {
          const newCartItem: CartProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            productId: product.id,
            cartItemId: undefined,
          };
          
          newCart = [...oldCart, newCartItem];
        }
        
        set({ cart: newCart });

        try {
          if (isAuthenticated) {
            console.log('🔐 Syncing with authenticated backend...');
            
            // Synchroniser avec le backend
            await addToCartApi({
              productId: product.id,
              quantity: 1
            });
            
            console.log('✅ Backend response received');
            
            // Recharger le panier depuis le backend
            await get().syncCartWithBackend(true);
          }
        } catch (err) {
          console.error('❌ Error syncing with backend:', err);
          
          // Rollback en cas d'erreur
          set({ cart: oldCart });
          throw err;
        }
      },

      removeFromCart: async (id: string, isAuthenticated = false) => {
        const oldCart = get().cart;
        const itemToRemove = oldCart.find(item => item.id === id);
        
        if (!itemToRemove) return;

        console.log('➖ Removing from cart:', itemToRemove);
        
        // Mise à jour locale immédiate
        set({ cart: oldCart.filter(p => p.id !== id) });

        try {
          if (isAuthenticated && itemToRemove.cartItemId) {
            console.log('🔐 Removing from backend cart:', itemToRemove.cartItemId);
            
            // Utiliser l'API NestJS avec cartItemId
            await removeFromCartApi(itemToRemove.cartItemId);
          }
        } catch (error) {
          console.error('❌ Error removing from backend:', error);
          
          // Rollback en cas d'erreur
          set({ cart: oldCart });
          throw error;
        }
      },

      updateQuantity: async (id: string, quantity: number, isAuthenticated = false) => {
        if (quantity < 1) {
          // Si quantité < 1, retirer du panier
          get().removeFromCart(id, isAuthenticated);
          return;
        }

        const oldCart = get().cart;
        const itemToUpdate = oldCart.find(item => item.id === id);
        
        if (!itemToUpdate) return;

        console.log('✏️ Updating quantity:', { id, quantity });
        
        // Mise à jour locale
        const newCart = oldCart.map(item =>
          item.id === id ? { ...item, quantity } : item
        );
        
        set({ cart: newCart });

        try {
          if (isAuthenticated && itemToUpdate.cartItemId) {
            console.log('🔐 Syncing quantity with backend:', { cartItemId: itemToUpdate.cartItemId, quantity });
            
            // Synchroniser avec le backend
            await updateCartItemApi(itemToUpdate.cartItemId, { quantity });
          }
        } catch (error) {
          console.error('❌ Error updating quantity on backend:', error);
          
          // Rollback en cas d'erreur
          set({ cart: oldCart });
          throw error;
        }
      },

      toggleWishlist: async (productId: string, isAuthenticated = false) => {
        set({ isLoading: true });
        try {
          const currentWishlist = get().wishlist;
          
          // Mise à jour UI immédiate
          const isInWishlist = currentWishlist.includes(productId);
          const newWishlist = isInWishlist
            ? currentWishlist.filter(id => id !== productId)
            : [...currentWishlist, productId];
          
          set({ wishlist: newWishlist });

          // Synchroniser avec backend si connecté
          if (isAuthenticated) {
            await toggleWishlistApi(productId);
          }
        } catch (error) {
          // Rollback en cas d'erreur
          const currentWishlist = get().wishlist;
          set({ wishlist: currentWishlist });
          console.error('Error toggling wishlist:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromWishlist: async (productId: string, isAuthenticated = false) => {
        set({ isLoading: true });
        try {
          const currentWishlist = get().wishlist;
          
          // Mise à jour UI
          set({ wishlist: currentWishlist.filter(id => id !== productId) });

          // Synchroniser avec backend si connecté
          if (isAuthenticated) {
            await removeFromWishlistApi(productId);
          }
        } catch (error) {
          console.error('Error removing from wishlist:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      syncWishlistWithBackend: async (isAuthenticated: boolean) => {
        if (!isAuthenticated) return;

        set({ isLoading: true });
        try {
          // Récupérer la wishlist du backend
          const backendWishlist = await getWishlist();
          console.log('Backend wishlist:', backendWishlist);
          
          // Extraire les IDs des produits
          const productIds = backendWishlist.map((item: any) => item.productId || item.product?.id);
          
          // Mettre à jour le store
          set({ wishlist: productIds });
          
          // Synchroniser le localStorage avec le backend
          const localWishlist = get().wishlist;
          if (localWishlist.length > 0 && productIds.length === 0) {
            await syncWishlist(localWishlist);
          }
        } catch (error) {
          console.error('Error syncing wishlist:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearWishlist: () => {
        set({ wishlist: [] });
      },

      clearCart: async (isAuthenticated = false) => {
        const oldCart = get().cart;
        
        // Mise à jour locale
        set({ cart: [] });

        try {
          if (isAuthenticated) {
            // Synchroniser avec le backend
            await clearCartApi();
          }
        } catch (error) {
          // Rollback en cas d'erreur
          set({ cart: oldCart });
          console.error('Error clearing cart:', error);
          throw error;
        }
      },
    }),
    {
      name: 'cart-storage',
      version: 1,
      // Ajoutez un middleware pour logger les changements
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('🔄 Storage rehydrated:', {
            cartLength: state.cart?.length || 0,
            cartCount: state.cart?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0,
            hasCart: !!state.cart
          });
        }
      },
    }
  )
);