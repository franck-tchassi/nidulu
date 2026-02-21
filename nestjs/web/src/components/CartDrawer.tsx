// web/src/components/CartDrawer.tsx

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { useUi } from '@/context/ui-context';
import { toast } from 'sonner';
import { Page } from '@/types';
import { CartProduct } from '@/types';

// Fonction utilitaire pour extraire l'URL de l'image
const getProductImage = (item: CartProduct): string => {
  // 1. Utiliser l'image directe si disponible
  if (item.image && item.image !== '/placeholder-image.jpg') {
    return item.image;
  }
  
  // 2. Chercher dans les images du produit
  if (item.product?.images && item.product.images.length > 0) {
    const firstImage = item.product.images[0];
    
    if (typeof firstImage === 'string') return firstImage;
    if (firstImage.url) return firstImage.url;
    if (firstImage.imageUrl) return firstImage.imageUrl;
    if (firstImage.path) return firstImage.path;
    if (firstImage.src) return firstImage.src;
  }
  
  // 3. Utiliser l'image du produit
  if (item.product?.image) return item.product.image;
  
  // 4. Fallback
  return '/placeholder-image.jpg';
};

const CartDrawer: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { isCartDrawerOpen, closeCartDrawer } = useUi();
  
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    if (isCartDrawerOpen) {
      const scrollY = window.scrollY;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      document.body.dataset.scrollY = scrollY.toString();
      
      return () => {
        const scrollY = document.body.dataset.scrollY || '0';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        window.scrollTo(0, parseInt(scrollY));
      };
    }
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "NIDOLU10") {
      setAppliedDiscount(cartTotal * 0.1);
      setPromoError("");
      toast.success("Code NIDOLU10 appliqué !");
    } else {
      setPromoError("Code invalide");
      setAppliedDiscount(0);
      toast.error("Code invalide");
    }
  };

  const finalTotal = cartTotal - appliedDiscount;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-[60] transition-opacity"
        onClick={closeCartDrawer}
      />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-base font-medium text-slate-800">
            Panier <span className="text-slate-400 text-sm">({cartCount})</span>
          </h2>
          <button onClick={closeCartDrawer} className="p-3 hover:bg-slate-50 rounded-full transition-colors">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
              <div className="w-40 h-40 flex items-center justify-center overflow-hidden">
                <Image 
                  src="/abandoned-cart.png" 
                  alt="Panier vide" 
                  width={160}
                  height={160}
                  className="w-full h-full object-contain p-4"
                  priority
                />
              </div>
              <div className="space-y-3">
                <p className="text-slate-800 font-medium text-base">Votre panier est vide</p>
              </div>
              <Link 
                href={Page.Catalog}
                onClick={closeCartDrawer}
                className="mt-4 px-8 py-3 text-base border border-slate-900 hover:bg-slate-900 hover:text-white font-medium rounded-full transition-all"
              >
                Retour au shopping
              </Link>
            </div>
          ) : (
            cart.map((item) => {
              const imageUrl = getProductImage(item);
              console.log('🖼️ Cart item image:', { 
                itemId: item.id, 
                image: item.image, 
                productImages: item.product?.images,
                finalUrl: imageUrl 
              });
              
              return (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-slate-50 last:border-0">
                  <div className="w-24 h-24 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        console.error('❌ Image load error:', imageUrl);
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-slate-700">{item.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">{item.price.toFixed(2)} €</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        aria-label={`Supprimer ${item.name} du panier`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center border border-slate-200 rounded-lg">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-3 py-1 text-slate-400 hover:text-slate-800 border-r border-slate-200 transition-colors"
                          aria-label="Réduire la quantité"
                        >
                          −
                        </button>
                        <span className="px-4 text-sm font-medium text-slate-800 min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-3 py-1 text-slate-400 hover:text-slate-800 border-l border-slate-200 transition-colors"
                          aria-label="Augmenter la quantité"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        {(item.price * item.quantity).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-100 space-y-6">
            <div className="space-y-3">
              <div 
                className="flex items-center text-slate-600 hover:text-slate-800 gap-2 cursor-pointer transition-colors"
                onClick={() => setShowPromoInput(!showPromoInput)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setShowPromoInput(!showPromoInput)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
                </svg>
                <span className="text-sm">Code promo</span>
              </div>
              
              {showPromoInput && (
                <div className="flex gap-2">
                  <div className="flex-grow">
                    <input 
                      type="text" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Code promo"
                      className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    />
                    {promoError && (
                      <p className="text-[11px] text-red-500 mt-1">{promoError}</p>
                    )}
                  </div>
                  <button 
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
                  >
                    Valider
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-slate-800">Total</span>
                <div className="text-right">
                  {appliedDiscount > 0 && (
                    <p className="text-sm text-green-600 line-through">{(cartTotal).toFixed(2)} €</p>
                  )}
                  <span className="text-xl font-bold text-slate-900">{finalTotal.toFixed(2)} €</span>
                </div>
              </div>
              {appliedDiscount > 0 && (
                <p className="text-sm text-green-600">
                  ✓ Économie : {appliedDiscount.toFixed(2)} €
                </p>
              )}
              <p className="text-xs text-slate-500">
                Taxes et frais calculés à la validation.
              </p>
            </div>

            <div className="space-y-3">
              <Link 
                href={Page.Cart}
                onClick={closeCartDrawer}
                className="w-full bg-white border-2 border-slate-900 text-slate-900 py-4 rounded-lg font-semibold hover:bg-slate-50 transition-colors text-center block"
              >
                Voir panier
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;