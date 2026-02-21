
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Page } from '@/types';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2a3038] text-white pt-12 pb-12 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-0">
      <div className="max-w-[1440px] mx-auto">

        {/* Newsletter Section */}
        <div className="text-center mb-12 md:mb-16 px-2">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
            Faisons connaissance
          </h3>
          <p className="text-gray-300 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Abonnez-vous à notre newsletter pour être le premier à découvrir nos nouvelles collections,
            offres exclusives et conseils pour votre bébé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 h-12 px-6 rounded-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ceaba2] text-sm font-medium"
            />
            <button className="bg-[#ceaba2] cursor-pointer text-white px-8 h-12 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#cc9182] transition-colors">
              S'abonner
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10 mb-12 md:mb-16 px-2">
          {/* Company Info */}
          <div className="lg:col-span-3">
            <Link href={Page.Home} className="inline-block mb-6">
              <div className="relative w-32 h-16">
                <Image
                  src="/nidolu-logo-white.png"
                  alt="Nidolu"
                  className='text-white'
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="128px"
                  priority
                />
              </div>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Votre destination de confiance pour des produits de qualité pour bébé.
              Sécurité, confort et développement au cœur de nos préoccupations.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ceaba2] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ceaba2] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ceaba2] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-white">Boutique</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href={`${Page.Catalog}?category=jouets-jeux`} className="hover:text-[#ceaba2] transition-colors">Jouets et jeux</Link></li>
              <li><Link href={`${Page.Catalog}?category=accessoires-bebe`} className="hover:text-[#ceaba2] transition-colors">Accessoires bébé</Link></li>
              <li><Link href={`${Page.Catalog}?category=mobilier`} className="hover:text-[#ceaba2] transition-colors">Mobilier</Link></li>
              <li><Link href={`${Page.Catalog}?category=vetements`} className="hover:text-[#ceaba2] transition-colors">Vêtements</Link></li>
              <li><Link href={`${Page.Catalog}?category=soin-hygiene`} className="hover:text-[#ceaba2] transition-colors">Soin et hygiène</Link></li>
              <li><Link href={`${Page.Catalog}?category=securite`} className="hover:text-[#ceaba2] transition-colors">Sécurité</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-white">Service client</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href={Page.Contact} className="hover:text-[#ceaba2] transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-[#ceaba2] transition-colors">Livraison & Retours</Link></li>
              <li><Link href="#" className="hover:text-[#ceaba2] transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-[#ceaba2] transition-colors">Suivi de commande</Link></li>
              <li><Link href="#" className="hover:text-[#ceaba2] transition-colors">Support</Link></li>
              <li><Link href={Page.Wishlist} className="hover:text-[#ceaba2] transition-colors">Liste de souhaits</Link></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-white">Entreprise</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href={Page.About} className="hover:text-[#ceaba2] transition-colors">À propos</Link></li>
              <li><Link href="#" className="hover:text-[#ceaba2] transition-colors">Carrières</Link></li>
              <li><Link href="#" className="hover:text-[#ceaba2] transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-[#ceaba2] transition-colors">Presse</Link></li>
              <li><Link href="#" className="hover:text-[#ceaba2] transition-colors">Conditions générales</Link></li>
              <li><Link href="#" className="hover:text-[#ceaba2] transition-colors">Politique de confidentialité</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-600/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-sm font-medium text-center md:text-left">
              © {new Date().getFullYear()} Nidolu. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              {/* Payment Methods */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Paiement sécurisé:</span>
                <div className="flex gap-2">
                  <Image 
                    src="/payment_methods/visa.svg" 
                    alt="Visa" 
                    width={40} 
                    height={24}
                    className="h-6 w-auto"
                  />
                  <Image 
                    src="/payment_methods/mastercard.svg" 
                    alt="Mastercard" 
                    width={40} 
                    height={24}
                    className="h-6 w-auto"
                  />
                  <Image 
                    src="/payment_methods/paypal.svg" 
                    alt="PayPal" 
                    width={40} 
                    height={24}
                    className="h-6 w-auto"
                  />
                  <Image 
                    src="/payment_methods/cartes-bancaires.svg" 
                    alt="Cartes Bancaires" 
                    width={40} 
                    height={24}
                    className="h-6 w-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;