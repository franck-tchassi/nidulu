// web/src/app/[locale]/(marketing)/wishlist/page.tsx
// web/src/app/[locale]/(marketing)/wishlist/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/auth-context';
import { useCartSync } from '@/hooks/useCartSync';
import { useWishlist } from '@/hooks/useWishlist';
import { getProducts } from '@/lib/api';
import { Page } from '@/types';
import Image from 'next/image';

interface BackendProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string;
  images: { 
    id: string; 
    url: string; 
    alt: string | null; 
    order: number; 
    isPrimary: boolean; 
    createdAt: string; 
    updatedAt: string; 
  }[];
  category: string | null;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const WishlistPage: React.FC = () => {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks personnalisés
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  
  // Synchronisation automatique
  useCartSync();

  // Charger les produits depuis l'API
  useEffect(() => {
    const loadWishlistProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Récupérer tous les produits depuis l'API
        const allProducts = await getProducts();
        
        // Filtrer pour ne garder que ceux qui sont dans la wishlist
        const wishlistProducts = allProducts.filter((product: any) => 
          wishlist.includes(product.id)
        );
        
        setProducts(wishlistProducts);
      } catch (err: any) {
        console.error('Error loading wishlist products:', err);
        setError(err.message || 'Failed to load wishlist products');
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlistProducts();
  }, [wishlist]);

  const handleAddToCart = async (product: BackendProduct) => {
    try {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category || 'General',
        image: product.images[0]?.url || '',
        description: product.description || '',
      };
      await addToCart(cartProduct, isAuthenticated);
      // Vous pouvez ajouter un toast de succès ici
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    try {
      await toggleWishlist(productId);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await toggleWishlist(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-lg mb-4">Erreur de chargement</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = wishlist.length === 0;
  const totalPrice = products.reduce((sum, product) => sum + product.price, 0);

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Bannière info connexion */}
      {!isAuthenticated && (
        <div className="w-full bg-gray-100/60 py-3 px-4 border-b border-gray-100 flex items-center justify-center gap-2 text-[13px] text-gray-600">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>
            <Link href={Page.Account} className="underline hover:text-black">
              Connectez-vous
            </Link>{' '}
            ou{' '}
            <Link href={Page.Account} className="underline hover:text-black">
              créez un compte
            </Link>{' '}
            pour sauvegarder votre liste de favoris.
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="mb-6 text-[14px] text-gray-500 font-medium">
          <Link href={Page.Home} className="hover:text-black transition-colors">Accueil</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-600">Vos articles favoris</span>
        </div>

        {/* En-tête SIMPLIFIÉ - boutons supprimés */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {isAuthenticated && user?.firstName ? `${user.firstName}, vo` : 'Vo'}s articles favoris
          </h1>
          <p className="text-gray-600 text-sm">
            {wishlist.length} article{wishlist.length !== 1 ? 's' : ''}
          </p>
        </div>

        {isEmpty ? (
          /* État vide */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="w-24 h-24 mb-6 border-2 border-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Aucun article sauvegardé
            </h2>

            <p className="text-gray-600 text-[15px] mb-8">
              {!isAuthenticated 
                ? "Merci de vous connecter pour accéder à votre liste d'articles favoris !"
                : "Vous n'avez pas encore d'articles dans vos favoris. Ajoutez-en en cliquant sur le cœur sur les produits !"
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {!isAuthenticated ? (
                <Link
                  href={Page.Account}
                  className="px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors text-center"
                >
                  Je me connecte
                </Link>
              ) : (
                <>
                  <Link
                    href={Page.Catalog}
                    className="px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors text-center"
                  >
                    Découvrir les produits
                  </Link>
                  <Link
                    href={Page.Home}
                    className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors text-center"
                  >
                    Retour à l'accueil
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Liste des produits */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => {
              const mainImage = product.images.find(img => img.isPrimary) || product.images[0];
              const isOutOfStock = product.stock === 0;
              
              return (
                <div key={product.id} className="group relative flex flex-col">
                  {/* Carte produit */}
                  <div className="relative aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden mb-4">
                    {/* Image produit */}
                    <Link 
                      href={`${Page.ProductDetail}/${product.id}`} 
                      className="block w-full h-full"
                    >
                      {mainImage ? (
                        <img
                          src={mainImage.url}
                          alt={mainImage.alt || product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400">Pas d'image</span>
                        </div>
                      )}
                    </Link>

                    {/* Badge rupture de stock */}
                    {isOutOfStock && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        RUPTURE
                      </div>
                    )}

                    {/* Bouton retirer de la wishlist */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md"
                      aria-label="Retirer des favoris"
                      title="Retirer des favoris"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                      </svg>
                    </button>

                    {/* Bouton ajouter au panier (apparaît au hover) */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${
                        isOutOfStock 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-black hover:bg-gray-800'
                      }`}
                      aria-label="Ajouter au panier"
                      title={isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
                    >
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2"
                      >
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                    </button>
                  </div>

                  {/* Informations produit */}
                  <div className="space-y-2">
                    {/* Catégorie */}
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      {product.category || 'Général'}
                    </div>
                    
                    {/* Nom du produit */}
                    <h3 className="text-[15px] font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
                      <Link 
                        href={`${Page.ProductDetail}/${product.id}`} 
                        className="hover:text-gray-600 transition-colors"
                      >
                        {product.name}
                      </Link>
                    </h3>
                    
                    {/* Prix */}
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-gray-900">
                        {product.price.toFixed(2)} €
                      </p>
                      {product.stock > 0 && product.stock < 10 && (
                        <span className="text-xs text-orange-600 font-medium">
                          Plus que {product.stock} en stock
                        </span>
                      )}
                    </div>
        
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Message si la wishlist est vide après filtrage (sécurité) */}
        {!isEmpty && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Certains produits de votre liste de favoris ne sont plus disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;