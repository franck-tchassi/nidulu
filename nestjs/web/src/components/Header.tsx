// web/src/components/Header.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/auth-context';
import { useUi } from '@/context/ui-context';
import { useWishlist } from '@/hooks/useWishlist';
import { Page } from '@/types';
import TopBanner from './TopBanner';
import Image from 'next/image';
import Sidebar from './Sidebar';
import { SlHandbag } from "react-icons/sl";
import { useCartSync } from '@/hooks/useCartSync';

const Header: React.FC = () => {
  useCartSync();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();
  const { openCartDrawer } = useUi();
  
  const [isSearching, setIsSearching] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsAccountMenuOpen(false);
      setIsMobileMenuOpen(false);
      setIsSearching(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full flex flex-col shadow-sm bg-white px-2 sm:px-4 md:px-6 lg:px-8 xl:px-0">
        {/* Announcement Bar */}
        <TopBanner />

        {/* Main Navigation */}
        <nav className="w-full border-b border-slate-200 relative">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between relative">
            
            {/* Left Section */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Hamburger Button */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-[#1b2d3d] hover:bg-slate-50 cursor-pointer rounded-full transition-colors ml-1"
                aria-label="Menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                </svg>
              </button>

              {/* Logo */}
              <Link href={Page.Home} className="flex items-center">
                <div className="relative w-28 h-12">
                  <Image
                    src="/nidolu-logo.png"
                    alt="Nidolu"
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="112px"
                    priority
                  />
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-10 text-[12px] font-bold uppercase tracking-[0.18em] text-[#1b2d3d]">
                <Link 
                  href={Page.About} 
                  className={`cursor-pointer transition-colors h-20 flex items-center ${pathname === Page.About ? 'text-gray-700' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  À PROPOS
                </Link>
                <Link 
                  href={Page.Contact} 
                  className={`cursor-pointer transition-colors h-20 flex items-center ${pathname === Page.Contact ? 'text-gray-700' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  CONTACT
                </Link>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-7 text-[#1b2d3d]">
              {/* Search Button */}
              <button 
                onClick={() => setIsSearching(true)} 
                className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors p-2"
                aria-label="Rechercher"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>

              {/* Wishlist */}
              <Link 
                href={Page.Wishlist} 
                className={`relative transition-colors text-gray-500 cursor-pointer p-2 ${pathname === Page.Wishlist ? 'text-gray-700' : 'hover:text-gray-700'}`}
                aria-label="Liste de souhaits"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 md:-top-1 md:-right-2 bg-black text-white text-[9px] md:text-[9px] w-5 h-5 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold shadow-md animate-in zoom-in duration-300">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              
              {/* Account Menu */}
              <div className="relative" ref={accountMenuRef}>
                <button 
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} 
                  className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors p-2"
                  aria-label="Compte"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>

                {isAccountMenuOpen && (
  <div className="absolute right-0 top-full mt-4 w-[280px] md:w-[340px] bg-white shadow-[0_4px_30px_rgba(0,0,0,0.15)] border border-slate-100 p-6 md:p-8 z-[100] animate-in fade-in duration-200">
    <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-slate-100 rotate-45"></div>
    {!isAuthenticated ? (
      <div className="flex flex-col">
        <Link 
          href={Page.Account} 
          onClick={() => setIsAccountMenuOpen(false)} 
          className="w-full bg-black text-white font-black py-4 text-[13px] tracking-widest hover:bg-slate-800 transition-colors uppercase mb-4 text-center"
        >
          SE CONNECTER
        </Link>
        <p className="text-[14px] text-slate-800 mb-6">
          Pas encore de compte ?{" "}
          <Link 
            href={Page.Account} 
            onClick={() => setIsAccountMenuOpen(false)} 
            className="font-bold underline decoration-1"
          >
            S'inscrire
          </Link>
        </p>
        <div className="w-full h-px bg-slate-100 mb-4"></div>
        <div className="flex flex-col gap-5">
          <Link 
            href={Page.Account} 
            onClick={() => setIsAccountMenuOpen(false)} 
            className="flex items-center gap-4 text-slate-800 hover:text-slate-600 transition-colors group text-[15px]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="font-medium">Mon Compte</span>
          </Link>
          {/* MES COMMANDES pour utilisateur non connecté */}
          <Link 
            href={Page.Account}  // Redirige vers la page de connexion
            onClick={() => setIsAccountMenuOpen(false)} 
            className="flex items-center gap-4 text-slate-800 hover:text-slate-600 transition-colors group text-[15px]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-medium">Mes Commandes</span>
          </Link>
          <Link 
            href={Page.Wishlist} 
            onClick={() => setIsAccountMenuOpen(false)} 
            className="flex items-center gap-4 text-slate-800 hover:text-slate-600 transition-colors group text-[15px]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="font-medium">Mes Favoris ({wishlistCount})</span>
          </Link>
        </div>
      </div>
    ) : (
      <div className="flex flex-col animate-in slide-in-from-top-2 duration-300">
        <h3 className="text-[14px] font-bold text-[#1b2d3d] uppercase tracking-wide mb-2">
          COMPTE CLIENT
        </h3>
        <p className="text-[14px] text-slate-600 mb-6">
          Bonjour, {user?.firstName || user?.email}
        </p>
        
        {/* Menu du compte */}
        <div className="w-full h-px bg-slate-100 mb-4"></div>
        <div className="flex flex-col gap-4 mb-6">
          <Link 
            href={Page.Account} 
            onClick={() => setIsAccountMenuOpen(false)} 
            className="flex items-center gap-3 text-slate-800 hover:text-slate-600 transition-colors text-[15px] py-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Mon Profil</span>
          </Link>
          
          {/* MES COMMANDES pour utilisateur connecté */}
          <Link 
            href="/orders"  // Redirige vers la vraie page des commandes
            onClick={() => setIsAccountMenuOpen(false)} 
            className="flex items-center gap-3 text-slate-800 hover:text-slate-600 transition-colors text-[15px] py-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Mes Commandes</span>
          </Link>
          
          <Link 
            href={Page.Wishlist} 
            onClick={() => setIsAccountMenuOpen(false)} 
            className="flex items-center gap-3 text-slate-800 hover:text-slate-600 transition-colors text-[15px] py-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>Mes Favoris ({wishlistCount})</span>
          </Link>
        </div>
        
        <div className="w-full h-px bg-slate-100 mb-6"></div>
        <button 
          onClick={() => { logout(); setIsAccountMenuOpen(false); }} 
          className="w-full border border-black text-black py-3 font-bold text-[12px] uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded"
        >
          SE DÉCONNECTER
        </button>
      </div>
    )}
  </div>
)}
              </div>

              {/* Cart avec SlHandbag */}
              <button 
                onClick={openCartDrawer} 
                className="relative text-gray-500 hover:text-gray-700 cursor-pointer transition-colors p-2"
                aria-label="Panier"
              >
                <SlHandbag size={25} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 md:-top-1 md:-right-1 bg-black text-white text-[9px] md:text-[9px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold shadow-md animate-in zoom-in duration-300">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Search Overlay */}
            {isSearching && (
              <div className="absolute inset-0 bg-white z-[60] flex items-center justify-center animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="w-full max-w-[1440px] px-4 md:px-8 flex items-center justify-center relative">
                  <div className="relative w-full max-w-2xl">
                    <input 
                      type="text" 
                      placeholder="Que cherchez-vous ?" 
                      className="w-full bg-[#f8f9fa] border-2 border-slate-100 rounded-full py-3 px-8 text-[15px] font-medium focus:outline-none focus:border-[#1b2d3d] text-[#1b2d3d] placeholder:text-slate-400 transition-all" 
                      autoFocus 
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSearching(false)} 
                    className="ml-6 p-2 text-slate-400 cursor-pointer hover:text-[#1b2d3d] transition-colors"
                    aria-label="Fermer la recherche"
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 z-[60] animate-in fade-in" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-[80%] max-w-sm bg-white z-[70] shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <Link href={Page.Home} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="relative w-24 h-10">
                    <Image
                      src="/nidolu-logo.png"
                      alt="Nidolu"
                      fill
                      style={{ objectFit: 'contain' }}
                      sizes="96px"
                    />
                  </div>
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-2"
                  aria-label="Fermer le menu"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="flex flex-col p-6 space-y-6 overflow-y-auto">
                <Link 
                  href={Page.About} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-bold uppercase tracking-widest text-left ${pathname === Page.About ? 'text-gray-700' : 'text-[#1b2d3d]'}`}
                >
                  À PROPOS
                </Link>
                <Link 
                  href={Page.Contact} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-bold uppercase tracking-widest text-left ${pathname === Page.Contact ? 'text-gray-700' : 'text-[#1b2d3d]'}`}
                >
                  CONTACT
                </Link>
                <Link 
                  href={Page.Account} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-bold uppercase tracking-widest text-left ${pathname === Page.Account ? 'text-gray-700' : 'text-[#1b2d3d]'}`}
                >
                  MON COMPTE
                </Link>
                {/* NOUVEAU: Mes Commandes dans mobile menu */}
                <Link 
                  href={Page.AccountOrders} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-bold uppercase tracking-widest text-left ${pathname === Page.AccountOrders ? 'text-gray-700' : 'text-[#1b2d3d]'}`}
                >
                  MES COMMANDES
                </Link>
                <Link 
                  href={Page.Wishlist} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-bold uppercase tracking-widest text-left ${pathname === Page.Wishlist ? 'text-gray-700' : 'text-[#1b2d3d]'} flex items-center justify-between`}
                >
                  <span>FAVORIS</span>
                  {wishlistCount > 0 && (
                    <span className="bg-black text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </div>
              <div className="mt-auto p-6 bg-slate-50">
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-4">
                  Suivez-nous
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <span className="text-xs font-bold">IG</span>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <span className="text-xs font-bold">FB</span>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <span className="text-xs font-bold">TK</span>
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Sidebar avec animation de fermeture */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};

export default Header;