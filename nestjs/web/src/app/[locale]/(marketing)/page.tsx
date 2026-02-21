// web/src/app/[locale]/(marketing)/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/auth-context';
import { useWishlist } from '@/hooks/useWishlist';
import { useCartSync } from '@/hooks/useCartSync';
import TestimonialSection from '@/components/TestimonialSection';
import FeaturesSection from '@/components/FeaturesSection';
import { getProducts } from '@/lib/api';
import { Page, Category } from '@/types';
import CategorySection from '@/components/CategorySection';
import HeroSlider from '@/components/HeroSlide';
import NewCollectionSection from '@/components/NewCollectionSectio';

interface BackendProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string;
  images: { id: string; url: string; alt: string | null; order: number; isPrimary: boolean; createdAt: string; updatedAt: string; }[];
  category: string | null;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Utiliser les nouveaux hooks
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  
  // Synchronisation automatique
  useCartSync();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // On prend les 6 premiers produits pour la section accueil
  const displayProducts = products.slice(0, 6);

  // Fonction pour convertir la catégorie
  const mapCategory = (categoryName: string | null): Category => {
    if (!categoryName) return 'Vêtements';
    
    const categoryMap: Record<string, Category> = {
      'Vêtements': 'Vêtements',
      'Accessoires': 'Accessoires & Puériculture',
      'Puériculture': 'Accessoires & Puériculture',
      'Jouets': 'Jouets & Éveil',
      'Éveil': 'Jouets & Éveil',
    };
    
    return categoryMap[categoryName] || 'Vêtements';
  };

  const handleAddToCart = async (product: BackendProduct) => {
    try {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        category: mapCategory(product.category),
        image: product.images[0]?.url || '',
        description: product.description || '',
        images: product.images.map(img => img.url),
        subCategory: 'General',
      };
      await addToCart(cartProduct, isAuthenticated);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleToggleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await toggleWishlist(productId);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <div className="bg-white overflow-x-hidden">
      {/* Hero Section: Promo Banner */}
      <HeroSlider />

      <CategorySection />

      <NewCollectionSection/>

      {/* Product Section: Featured Product */}
      <div className="max-w-[1440px] mx-auto px-4 py-20">
        {loading ? (
          <div className="text-center">Chargement des produits...</div>
        ) : displayProducts.length > 0 ? (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#1b2d3d] mb-4">Produit Vedette</h2>
              <p className="text-slate-600">Découvrez notre sélection spéciale</p>
            </div>
            
            {/* Single Featured Product */}
            <div className="max-w-xs mx-auto">
              <div className="group cursor-pointer flex flex-col">
                <div 
                  className="relative aspect-square bg-[#f5f5f5] mb-4 flex items-center justify-center overflow-hidden rounded-xl"
                >
                  <Link href={`${Page.ProductDetail}/${displayProducts[0].id}`} className="w-full h-full flex items-center justify-center p-6 transition-transform duration-500 hover:scale-105">
                    <img 
                      src={displayProducts[0].images[0]?.url || ''} 
                      alt={displayProducts[0].name} 
                      className="w-4/5 h-4/5 object-contain mix-blend-multiply"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                      }}
                    />
                  </Link>
                  
                  {/* Bouton wishlist */}
                  <button 
                    onClick={(e) => handleToggleWishlist(displayProducts[0].id, e)}
                    className={`absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 ${
                      isInWishlist(displayProducts[0].id) ? 'opacity-100 translate-y-0' : ''
                    }`}
                    aria-label={isInWishlist(displayProducts[0].id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <svg 
                      width="16" height="16" viewBox="0 0 24 24"
                      fill={isInWishlist(displayProducts[0].id) ? "#ff3b30" : "none"} 
                      stroke={isInWishlist(displayProducts[0].id) ? "#ff3b30" : "#1b2d3d"} 
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                  
                  {/* Bouton ajouter au panier (apparaît au hover) */}
                  <button
                    onClick={() => handleAddToCart(displayProducts[0])}
                    className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 text-sm rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                  >
                    Ajouter au panier
                  </button>
                </div>
                
                <div className="space-y-1 text-left">
                  <h3 className="text-[14px] text-slate-700 font-medium line-clamp-2 leading-snug">
                    {displayProducts[0].name.charAt(0) + displayProducts[0].name.slice(1).toLowerCase()}
                  </h3>
                  <div className="flex items-center justify-start gap-2 text-[12px]">
                    <span className="text-[#004b91] font-bold">{displayProducts[0].price.toFixed(2)}€</span>
                    {displayProducts[0].stock < 10 && displayProducts[0].stock > 0 && (
                      <span className="text-xs text-orange-600">
                        Plus que {displayProducts[0].stock} en stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#1b2d3d] mb-4">Aucun produit disponible</h2>
            <p className="text-slate-600">Les produits seront bientôt disponibles.</p>
          </div>
        )}
      </div>

      {/* Features & Materials Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialSection />
    </div>
  );
};

export default HomePage;