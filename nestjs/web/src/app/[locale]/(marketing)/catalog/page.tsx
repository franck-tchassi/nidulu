// web/src/app/[locale]/(marketing)/catalog/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/auth-context';
import { getProducts, getCategories } from '@/lib/api';
import { Page } from '@/types';
import { useWishlist } from '@/hooks/useWishlist';
import { useCartSync } from '@/hooks/useCartSync';

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

interface BackendCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  imageUrl: string | null;
  isActive: boolean;
  productCount: number;
}

const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('Tous');
  
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  
  // Synchronisation automatique
  useCartSync();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = filter === 'Tous' ? products : products.filter(p => p.category === filter);

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

  if (loading) {
    return <div className="max-w-[1440px] mx-auto py-12 px-8">Loading...</div>;
  }

  return (
    <div className="max-w-[1440px] mx-auto py-12 px-8 text-[#1b2d3d]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-[13px] font-medium text-slate-400 uppercase tracking-widest">Filtrer par :</span>
          <div className="relative group">
            <button className="flex items-center gap-10 px-6 py-3 bg-white border border-slate-200 rounded-full text-[13px] font-medium transition-all hover:border-slate-400">
              Collection
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 py-2">
              <div onClick={() => setFilter('Tous')} className="px-5 py-2 hover:bg-slate-50 cursor-pointer text-[12px]">Tous</div>
              {categories.map(c => (
                <div key={c.id} onClick={() => setFilter(c.name)} className="px-5 py-2 hover:bg-slate-50 cursor-pointer text-[12px]">{c.name}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {filteredProducts.map((p, idx) => {
          const isWishlisted = isInWishlist(p.id);
          
          return (
            <div key={p.id} className="flex flex-col group animate-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="relative aspect-square bg-[#f4f4f4] rounded-[2rem] overflow-hidden group/card shadow-sm border border-slate-50">
                <Link href={`${Page.ProductDetail}/${p.id}`} className="w-full h-full flex items-center justify-center p-8 cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
                  <img 
                    src={p.images[0]?.url || ''} 
                    alt={p.name} 
                    className="w-full h-full object-contain mix-blend-multiply" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                  />
                </Link>
                <button 
                  onClick={(e) => handleToggleWishlist(p.id, e)}
                  className="absolute top-6 right-6 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
                  aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted ? "#ff9ebc" : "none"} stroke={isWishlisted ? "#ff9ebc" : "currentColor"} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleAddToCart(p)}
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full text-sm font-medium opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                >
                  Ajouter au panier
                </button>
              </div>
              <div className="mt-6 flex flex-col space-y-2">
                <h3 className="text-[15px] font-bold leading-snug uppercase tracking-tight">{p.name}</h3>
                <p className="text-[15px] font-medium">{p.price.toFixed(2)} €</p>
                <Link 
                  href={`${Page.ProductDetail}/${p.id}`} 
                  className="mt-4 w-full bg-white border border-[#1b2d3d] py-3.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all hover:bg-[#1b2d3d] hover:text-white text-center"
                >
                  Détails
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CatalogPage;