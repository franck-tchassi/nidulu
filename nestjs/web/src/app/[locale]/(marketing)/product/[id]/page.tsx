// (marketing)/product/[id]/page.tsx
// web/src/app/[locale]/(marketing)/product/[id]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/auth-context';
import { useWishlist } from '@/hooks/useWishlist';
import { useCartSync } from '@/hooks/useCartSync';
import { getProductById } from '@/lib/api';
import { notFound } from 'next/navigation';
import { Page, Category } from '@/types'; // Ajoutez Category à l'import

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string;
  images: ProductImage[];
  category: string | null;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Hooks personnalisés
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  
  // Synchronisation automatique
  useCartSync();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !zoomActive) return;

    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));
    
    setZoomPosition({ x: boundedX, y: boundedY });
  };

  const activateZoom = () => {
    setZoomActive(true);
  };

  const deactivateZoom = () => {
    setZoomActive(false);
  };

  const handleImageClick = () => {
    if (!zoomActive) {
      activateZoom();
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        category: mapCategory(product.category), // ← CORRECTION ICI
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

  const handleToggleWishlist = async () => {
    if (!product) return;
    
    try {
      await toggleWishlist(product.id);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  if (loading) {
    return <div className="max-w-[1440px] mx-auto py-8 px-8">Loading...</div>;
  }

  if (error || !product) {
    notFound();
  }

  const gallery = product.images.map(img => img.url);
  const isWishlisted = isInWishlist(product.id);

  const nextImage = () => {
    setMainImageIdx((prev) => (prev + 1) % gallery.length);
    setZoomActive(false);
  };
  
  const prevImage = () => {
    setMainImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length);
    setZoomActive(false);
  };

  const AccordionItem = ({ id, title, content }: { id: string, title: string, content: React.ReactNode }) => (
    <div className="border-b border-slate-200">
      <button onClick={() => setOpenAccordion(openAccordion === id ? null : id)} className="w-full py-5 flex items-center justify-between text-left group text-[#1b2d3d]">
        <span className="text-[13px] font-black uppercase tracking-widest">{title}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-300 ${openAccordion === id ? '' : 'rotate-180'}`}>
          <path d="M12 5v14M5 12h14" className={openAccordion === id ? 'hidden' : ''} />
          <path d="M5 12h14" />
        </svg>
      </button>
      {openAccordion === id && (
        <div className="pb-8 animate-in slide-in-from-top-2 duration-300">
          <div className="text-[14px] text-slate-600 leading-relaxed font-medium">{content}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto py-8 px-4 md:px-8 animate-in fade-in duration-500 bg-white text-[#1b2d3d]">
      <div className="mb-6 md:mb-10 text-[11px] md:text-[12px] font-medium text-slate-400">
        <Link href={Page.Home} className="cursor-pointer hover:text-[#1b2d3d]">Bébé</Link>
        <span className="mx-2">/</span>
        <Link href={Page.Catalog} className="cursor-pointer hover:text-[#1b2d3d]">{product.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-[#1b2d3d]">Articles</span>
      </div>

      <div className="grid lg:grid-cols-[100px_1fr_450px] gap-x-6 lg:gap-x-12 items-start mb-16 lg:mb-24">
        {/* Miniatures latérales */}
        <div className="hidden lg:flex flex-col gap-3">
          {gallery.map((img, i) => (
            <button 
              key={i} 
              onClick={() => { setMainImageIdx(i); setZoomActive(false); }} 
              className={`aspect-square border transition-all ${mainImageIdx === i ? 'border-[#1b2d3d] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img 
                src={img} 
                className="w-full h-full object-cover" 
                alt={`Vue ${i + 1}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                }}
              />
            </button>
          ))}
        </div>

        {/* Section image principale */}
        <div className="relative flex flex-col">
          <div className="relative">
            <div 
              ref={imageContainerRef}
              className={`relative bg-[#fdfaf8] overflow-hidden rounded-lg aspect-square md:aspect-[4/5] flex items-center justify-center p-10 md:p-14 mb-4 ${zoomActive ? 'cursor-move' : 'cursor-zoom-in'}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={deactivateZoom}
              onClick={handleImageClick}
            >
              {/* Image principale avec zoom */}
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={gallery[mainImageIdx]} 
                  className="w-auto max-w-[80%] h-auto max-h-[80%] object-contain transition-transform duration-300"
                  alt={product.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                  }}
                  style={{
                    transform: zoomActive ? 'scale(1.5)' : 'scale(1)',
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />
                
                {/* Loupe (cercle de zoom) superposée à l'image */}
                {zoomActive && (
                  <>
                    {/* Zone de zoom (cercle de loupe) */}
                    <div 
                      className="absolute pointer-events-none rounded-full border-2 border-white shadow-lg overflow-hidden z-30"
                      style={{
                        width: '150px',
                        height: '150px',
                        left: `calc(${zoomPosition.x}% - 75px)`,
                        top: `calc(${zoomPosition.y}% - 75px)`,
                      }}
                    >
                      <div 
                        className="absolute inset-0 bg-no-repeat"
                        style={{
                          backgroundImage: `url(${gallery[mainImageIdx]})`,
                          backgroundSize: '200%',
                          backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        }}
                      />
                    </div>
                    
                    {/* Effet de loupe autour du cercle */}
                    <div 
                      className="absolute pointer-events-none rounded-full border-2 border-white/30 z-20"
                      style={{
                        width: '160px',
                        height: '160px',
                        left: `calc(${zoomPosition.x}% - 80px)`,
                        top: `calc(${zoomPosition.y}% - 80px)`,
                        boxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.3)',
                      }}
                    />
                    
                    {/* Indicateur d'instructions */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-2 z-30 pointer-events-none">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 17l4-4-4-4"/>
                        <path d="M16 7v10"/>
                      </svg>
                      <span className="font-medium">Déplacez la souris pour explorer</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Boutons de navigation */}
              {!zoomActive && mainImageIdx > 0 && (
                <button onClick={prevImage} className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#1b2d3d] opacity-80 hover:opacity-100 shadow-md transition-all hover:scale-105 z-20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>
              )}

              {!zoomActive && mainImageIdx < gallery.length - 1 && (
                <button onClick={nextImage} className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#1b2d3d] opacity-80 hover:opacity-100 shadow-md transition-all hover:scale-105 z-20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              )}

              {/* Badge de zoom */}
              {!zoomActive && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full flex items-center gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <span className="font-medium hidden md:inline">Cliquez pour zoomer</span>
                  <span className="font-medium md:hidden">Appuyez pour zoomer</span>
                </div>
              )}

              {/* Indicateur de position */}
              {!zoomActive && (
                <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md z-10">
                  {mainImageIdx + 1} / {gallery.length}
                </div>
              )}
            </div>

            {/* Miniatures en bas pour mobile/tablette */}
            <div className="flex lg:hidden gap-2 justify-center mt-4 overflow-x-auto pb-2">
              {gallery.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => { setMainImageIdx(i); setZoomActive(false); }}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded overflow-hidden border ${mainImageIdx === i ? 'border-[#1b2d3d] opacity-100' : 'border-gray-200 opacity-70 hover:opacity-100'}`}
                >
                  <img 
                    src={img} 
                    className="w-full h-full object-cover" 
                    alt={`Vue ${i + 1}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Version mobile/tablette - Bouton de zoom */}
          <button
            onClick={() => setZoomActive(!zoomActive)}
            className="lg:hidden absolute bottom-3 right-3 md:bottom-4 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-black/80 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-all z-10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
        </div>

        {/* Modal de zoom pour mobile */}
        {zoomActive && (
          <div 
            className="lg:hidden fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
            onClick={() => setZoomActive(false)}
          >
            <div className="relative w-full max-w-2xl max-h-[80vh]">
              <img 
                src={gallery[mainImageIdx]} 
                className="w-full h-full object-contain" 
                alt={`Zoom ${product.name}`}
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white text-sm px-4 py-2 rounded-lg">
                <span className="font-medium">Appuyez pour fermer</span>
              </div>
            </div>
          </div>
        )}

        {/* Section informations produit */}
        <div className="flex flex-col mt-6 lg:mt-0">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-[20px] md:text-[24px] font-bold leading-[1.2] pr-4">{product.name}</h1>
            <button 
              onClick={handleToggleWishlist} 
              className="p-2 flex-shrink-0 hover:scale-110 transition-transform"
              aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <svg 
                width="22" 
                height="22" 
                viewBox="0 0 24 24" 
                fill={isWishlisted ? "currentColor" : "none"} 
                stroke="currentColor" 
                strokeWidth="1.5"
                className={isWishlisted ? "text-red-500" : "text-gray-600"}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[16px] md:text-[18px] text-slate-400 line-through">{(product.price * 1.5).toFixed(2)} €</span>
            <span className="text-[18px] md:text-[20px] font-bold">{product.price.toFixed(2)} €</span>
          </div>
          <p className="text-[12px] md:text-[13px] font-medium mb-8 text-slate-600">
            En stock: <span className="font-bold">{product.stock}</span> unités
          </p>

          <div className="space-y-6 mb-8">
            <div className="space-y-3">
              <div className="text-[11px] md:text-[12px] font-bold uppercase tracking-wider text-slate-700">Taille</div>
              <select className="w-full bg-white border border-slate-300 py-3 px-4 text-[14px] font-medium appearance-none rounded">
                <option>Taille unique</option>
              </select>
            </div>
            <button 
              onClick={handleAddToCart} 
              className="w-full bg-black text-white py-3 md:py-4 font-bold md:font-black uppercase tracking-wider text-[12px] md:text-[13px] hover:bg-slate-800 transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'RUPTURE DE STOCK' : 'AJOUTER AU PANIER'}
            </button>
          </div>

          <div className="border-t border-slate-200">
            <AccordionItem 
              id="details" 
              title="DÉTAILS DU PRODUIT" 
              content={<p>{product.description || 'Aucune description disponible.'}</p>} 
            />
            <AccordionItem 
              id="description" 
              title="DESCRIPTION" 
              content={
                <div className="space-y-4">
                  <p><strong>SKU:</strong> {product.sku}</p>
                  <p><strong>Catégorie:</strong> {product.category || 'Non spécifiée'}</p>
                  <p><strong>Statut:</strong> {product.isActive ? 'Actif' : 'Inactif'}</p>
                </div>
              } 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;