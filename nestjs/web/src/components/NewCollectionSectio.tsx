"use client";

import React from 'react';
import Image from 'next/image';

const collectionProducts = [
  {
    id: 'p1',
    price: '42.99€',
    image: 'https://images.unsplash.com/photo-1621335829175-95f437384d7c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p2',
    price: '9.99€',
    image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=1200'
  }
];

const NewCollectionSection: React.FC = () => {
  return (
    <section className="relative flex flex-col lg:flex-row w-full h-auto lg:h-[680px] overflow-hidden font-sans border-y border-gray-100">
      {/* Côté Gauche : Image locale depuis public */}
      <div className="relative w-full lg:w-1/2 h-[500px] lg:h-full overflow-hidden">
        <Image 
          src="/newcollection/nexcollection.jpg" 
          alt="Nouvelle Collection Enfants" 
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        
        {/* Contenu Texte - Positionnement précis pour un look premium */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 text-center px-4 bg-gradient-to-t from-black/50 via-transparent to-transparent">
          <h2 className="text-white text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.85] mb-10 drop-shadow-2xl">
            NOUVELLE<br/>COLLECTION
          </h2>
          <button className="px-12 py-3.5  cursor-pointer border-2 border-white text-white font-bold text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300 rounded-sm">
            Je découvre
          </button>
        </div>
      </div>

      {/* Côté Droit : Fond Rouge avec Produits - Taille originale */}
      <div className="w-full lg:w-1/2 bg-[#B6191E] p-10 lg:p-0 flex items-center justify-center h-[500px] lg:h-full">
        <div className="flex flex-row gap-6 md:gap-10 w-full max-w-4xl justify-center overflow-x-auto pb-4 lg:pb-0 scrollbar-hide px-4">
          {collectionProducts.map((product) => (
            <div 
              key={product.id} 
              className="flex-shrink-0 w-64 md:w-72 lg:w-80 bg-white shadow-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-[1.03]"
            >
              {/* Image du produit - Taille originale */}
              <div className="aspect-[4/5] overflow-hidden bg-gray-50 flex items-center justify-center relative">
                <Image 
                  src={product.image} 
                  alt="Produit" 
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 40vw, 30vw"
                />
                
                {/* Overlay de survol avec bouton d'ajout rapide plus visible */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
                   <button className="bg-white text-black px-6 py-3 font-black text-[10px] uppercase tracking-widest shadow-2xl transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:bg-black hover:text-white">
                      Ajout Rapide
                   </button>
                </div>
              </div>

              {/* Zone de prix - Propre et minimaliste */}
              <div className="bg-white py-5 border-t border-gray-100 flex items-center justify-center">
                <p className="text-xl font-black text-gray-900 tracking-tighter">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default NewCollectionSection;