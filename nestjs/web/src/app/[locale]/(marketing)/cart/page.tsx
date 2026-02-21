// web/src/app/[locale]/(marketing)/cart/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useOrders } from '@/hooks/useOrders';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { Page } from '@/types';
import { CartProduct } from '@/types';
import Image from 'next/image';

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

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const { createOrder } = useOrders();
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { toggleWishlist } = useWishlist();
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Calcul du nombre total d'articles (quantités cumulées)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calcul du total final avec réduction
  const subtotal = cartTotal;
  const finalTotal = subtotal - discountAmount;

  // Définition des méthodes de paiement avec leurs images
  const paymentMethods = [
    { id: 'cartes-bancaires', name: 'Cartes Bancaires', image: '/payment_methods/cartes-bancaires.svg' },
    { id: 'visa', name: 'Visa', image: '/payment_methods/visa.svg' },
    { id: 'mastercard', name: 'Mastercard', image: '/payment_methods/mastercard.svg' },
    { id: 'paypal', name: 'PayPal', image: '/payment_methods/paypal.svg' }
  ];

  const handleApplyPromo = () => {
    setPromoError('');
    
    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code promo');
      return;
    }

    // Exemple de codes promo
    const validPromoCodes = {
      'NIDOLU10': 0.10, // 10% de réduction
      'WELCOME20': 0.20, // 20% de réduction
      'FREESHIP': 0, // Livraison gratuite (si vous la réintégrez)
    };

    const promo = validPromoCodes[promoCode.toUpperCase() as keyof typeof validPromoCodes];
    
    if (promo !== undefined) {
      // Calculer la réduction
      const discount = subtotal * promo;
      setDiscountAmount(discount);
      setAppliedPromo(promoCode.toUpperCase());
      setPromoCode('');
      setShowPromoInput(false);
    } else {
      setPromoError('Code promo invalide');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-[#1b2d3d] bg-white px-8">
        <h1 className="text-[32px] font-bold uppercase tracking-tight mb-8">VOTRE PANIER</h1>
        <div className="py-20 flex flex-col items-center justify-center space-y-8 border-y border-slate-100 w-full max-w-4xl text-center">
          <p className="text-slate-400 font-medium text-lg">Votre panier est vide.</p>
          <Link 
            href={Page.Catalog}
            className="bg-black text-white px-10 py-4 font-black text-[12px] uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Découvrir nos produits
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    setCheckoutError(null);
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setCheckoutLoading(true);
    try {
      // Préparer les items pour l'API
      const items = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));
      // Créer la commande
      const order = await createOrder({ items });
      localStorage.setItem('currentOrderId', order.data.id);
      router.push('/checkout');
    } catch (e: any) {
      setCheckoutError(e.message || 'Erreur lors de la validation du panier');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-500 text-[#1b2d3d]">
      <div className="max-w-[1440px] mx-auto px-8 py-16 grid lg:grid-cols-[1fr_450px] gap-20">
        
        {/* Left Side: Items */}
        <div className="space-y-12">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight">
              Votre panier :
            </h1>
            <p className=" text-base font-bold">
              {totalItems} {totalItems > 1 ? 'Article(s)' : 'Article'}
            </p>
          </div>

          <div className="space-y-16">
            {cart.map((item, index) => {
              const imageUrl = getProductImage(item);
              const itemTotal = item.price * item.quantity;
              
              return (
                <div key={item.id} className="space-y-6">
                  <div className="flex gap-2 items-center text-base font-medium pb-2 border-b border-slate-100">
                    vendu par <span className="font-bold text-slate-800 underline">Nidolu</span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-32 h-32 bg-slate-50 flex-shrink-0 flex items-center justify-center p-2">
                      <img 
                        src={imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          console.error('❌ Image load error:', imageUrl);
                          (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>

                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-[#1b2d3d] bg-slate-100 px-2 py-0.5 rounded-sm uppercase tracking-widest inline-block mb-2">
                            EN STOCK
                          </span>
                          <h3 className="text-[15px] font-bold leading-tight uppercase">{item.name}</h3>
                        </div>
                    
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="flex items-center gap-2 text-[12px] font-bold text-slate-500 hover:text-black transition-colors uppercase"
                            aria-label={`Supprimer ${item.name} du panier`}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                          <button 
                            onClick={() => toggleWishlist(item.id)} 
                            className="flex items-center gap-2 text-[12px] font-bold text-slate-500 hover:text-black transition-colors uppercase"
                            aria-label={`Déplacer ${item.name} vers les favoris`}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Prix à droite */}
                      <div className="flex gap-4 items-center mt-4">
                        Prix: 
                        <div className="text-[15px] font-bold">
                          {itemTotal.toFixed(2)} €
                        </div>
                      </div>

                      {/* Sélecteur de quantité avec boutons + et - */}
                      <div className="flex gap-4 items-center mt-3">
                        Quantité: 
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
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Secure Payment Sidebar */}
        <div className="bg-[#fcfbf9] p-10 h-fit sticky top-28 space-y-10 border border-slate-100">
          
          <div className="space-y-4">
            <div className="flex justify-between text-[14px] font-medium">
              <span className="text-slate-500">Articles</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            
            {/* Affichage de la réduction si appliquée */}
            {appliedPromo && discountAmount > 0 && (
              <div className="flex justify-between text-[14px] font-medium text-green-600">
                <span>Réduction ({appliedPromo})</span>
                <span>-{discountAmount.toFixed(2)} €</span>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-200 space-y-2 text-right">
            <div className="flex justify-between items-center text-[18px] font-bold uppercase tracking-widest">
              <span>TOTAL</span>
              <span>{finalTotal.toFixed(2)} €</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="w-full bg-black text-white py-5 font-black text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkoutLoading ? 'Validation...' : 'JE VALIDE MON PANIER'}
          </button>
          {checkoutError && (
            <div className="mt-4 text-red-600 text-sm text-center">{checkoutError}</div>
          )}

          {/* NOUVEAU: Code promo avec icône */}
          <div className="space-y-3 pt-6">
            {appliedPromo ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-600">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
                  </svg>
                  <span className="text-sm font-medium text-green-700">Code appliqué: {appliedPromo}</span>
                </div>
                <button 
                  onClick={handleRemovePromo}
                  className="text-xs text-slate-500 hover:text-slate-700"
                  aria-label="Retirer le code promo"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Méthodes de paiement */}
          <div className="pt-6">
            <div className="flex items-center gap-4">
              <Image
                src="/payment_methods/visa.svg"
                alt="Visa"
                width={80}
                height={32}
                className="h-8 w-auto"
              />
              <Image
                src="/payment_methods/mastercard.svg"
                alt="Mastercard"
                width={80}
                height={32}
                className="h-8 w-auto"
              />
              <Image
                src="/payment_methods/paypal.svg"
                alt="PayPal"
                width={80}
                height={32}
                className="h-8 w-auto"
              />
              <Image
                src="/payment_methods/cartes-bancaires.svg"
                alt="Cartes Bancaires"
                width={80}
                height={32}
                className="h-8 w-auto"
              />
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Paiement 100% sécurisé</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Retours gratuits sous 30 jours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;