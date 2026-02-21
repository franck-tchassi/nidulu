"use client";

import React from 'react';

const HeroSlider: React.FC = () => {
  const navItems = ['Fille', 'Garçon', 'Bébé', 'Chaussures', 'Maternité', 'Chambre & rangement', 'Linge de lit & déco', 'Puériculture', 'Jouets'];

  return (
    <section className="relative w-full h-screen min-h-[700px] flex flex-col bg-[#B6191E] text-white overflow-hidden font-sans">
      {/* Texture de fond subtile */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
      
      {/* Dégradé radial */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.2)_100%)]"></div>

      {/* Barre de navigation - TEXTE AUGMENTÉ */}
      <nav className="relative z-20 pt-7 pb-4">
        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-4">
          {navItems.map((item) => (
            <li key={item}>
              <a href="#" className="text-xs md:text-sm font-bold uppercase tracking-wider hover:text-white/70 transition-colors">
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Contenu Central */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 animate-content">
        
        {/* Titre Principal */}
        <h1 className="text-6xl md:text-[10rem] font-[900] tracking-tighter leading-none mb-3 drop-shadow-2xl animate-title">
          SOLDES
        </h1>

        {/* Bloc Pourcentage */}
        <div className="flex flex-col items-center mb-10 animate-percentage">
          <div className="flex items-center">
            <span className="text-2xl md:text-4xl font-bold mr-3 self-center tracking-tighter opacity-90">Jusqu&apos;à</span>
            <span className="text-[7rem] md:text-[13rem] font-[900] leading-none tracking-tighter">
              -65
            </span>
            <span className="text-5xl md:text-7xl font-black ml-2 self-start mt-6 md:mt-9">%</span>
          </div>
          <p className="text-xs md:text-lg font-bold uppercase tracking-[0.3em] -mt-3 opacity-90">
            sur la sélection*
          </p>
        </div>

        {/* Bouton d'action */}
        <button className="group cursor-pointer relative px-16 py-4 border-2 border-white overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl animate-button">
          <div className="absolute inset-0 w-0 bg-white group-hover:w-full transition-all duration-500 ease-out"></div>
          <span className="relative z-10 text-base font-black uppercase tracking-[0.2em] group-hover:text-[#B6191E] transition-colors">
            J&apos;en profite
          </span>
        </button>
      </div>

      {/* Flèches de Navigation */}
      <button className="absolute cursor-pointer left-6 top-1/2 -translate-y-1/2 z-20 p-3 opacity-50 hover:opacity-100 transition-opacity hidden md:block">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button className="absolute cursor-pointer right-6 top-1/2 -translate-y-1/2 z-20 p-3 opacity-50 hover:opacity-100 transition-opacity hidden md:block">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>


      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes zoomIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-content {
          animation: fadeIn 1s ease-out;
        }
        
        .animate-title {
          animation: zoomIn 0.8s ease-out 0.2s both;
        }
        
        .animate-percentage {
          animation: slideUp 0.8s ease-out 0.4s both;
        }
        
        .animate-button {
          animation: slideUp 0.8s ease-out 0.6s both;
        }
      `}</style>
    </section>
  );
};

export default HeroSlider;