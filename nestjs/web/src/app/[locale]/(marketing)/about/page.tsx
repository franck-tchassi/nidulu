"use client";

import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-500 text-[#1b2d3d]">
      {/* Hero */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img 
          src="/tiny-baby-grey-clothes.jpg" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.85]" 
          alt="About Hero"
        />
        <div className="relative z-10 text-center text-white px-8">
          <h1 className="text-[72px] font-bold leading-none mb-6 italic" style={{ fontFamily: 'Quicksand' }}>L'histoire de Nidolu</h1>
          <p className="text-[20px] font-medium max-w-2xl mx-auto uppercase tracking-widest">Douceur, Design et Durabilité pour vos petits trésors.</p>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-[1440px] mx-auto px-8 py-32 grid lg:grid-cols-2 gap-32 items-center">
        <div className="space-y-8">
          <span className="text-[12px] font-black uppercase tracking-[0.3em] text-pink-300">Notre Mission</span>
          <h2 className="text-[48px] font-bold leading-tight" style={{ fontFamily: 'Quicksand' }}>Créer un cocon de bien-être.</h2>
          <p className="text-[18px] text-slate-500 leading-relaxed font-medium">
            Nidolu est né de l'envie de proposer aux parents des produits qui allient l'exigence de la sécurité au raffinement du design contemporain. 
            Nous croyons que les premières années de vie méritent ce qu'il y a de plus doux, de plus pur et de plus beau.
          </p>
          <p className="text-[18px] text-slate-500 leading-relaxed font-medium">
            Chaque matière est sélectionnée avec soin, chaque motif est dessiné pour stimuler l'éveil tout en apaisant les nuits.
          </p>
        </div>
        <div className="relative flex justify-center">
          <img 
            src="/cute-baby-with-animal.jpg" 
            className="w-[36rem] h-[36rem] object-cover shadow-2xl transition-transform duration-700 hover:scale-105" 
            style={{
              clipPath: 'polygon(50% 0%, 0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%)'
            }}
            alt="Bébé avec animal" 
          />
        </div>
      </div>

      {/* Values Grid */}
      <div className="bg-[#fcfbf9] py-32 px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-[42px] font-bold uppercase tracking-tight" style={{ fontFamily: 'Quicksand' }}>Nos Valeurs Fondamentales</h2>
            <div className="w-24 h-1 bg-pink-200 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center space-y-6 group">
              <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-md group-hover:scale-110 transition-transform overflow-hidden">
                <img src="/nos_valeurs/heart.png" alt="Amour du détail" className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-[20px] font-bold">L'Amour du Détail</h3>
              <p className="text-slate-500 font-medium">Parce que chaque petite couture compte pour le confort de votre bébé.</p>
            </div>

            <div className="text-center space-y-6 group">
              <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-md group-hover:scale-110 transition-transform overflow-hidden">
                <img src="/nos_valeurs/security.png" alt="Sécurité certifiée" className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-[20px] font-bold">Sécurité Certifiée</h3>
              <p className="text-slate-500 font-medium">Toutes nos matières sont testées et garanties sans substances nocives.</p>
            </div>

            <div className="text-center space-y-6 group">
              <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-md group-hover:scale-110 transition-transform overflow-hidden">
                <img src="/nos_valeurs/support.png" alt="Fabrication responsable" className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-[20px] font-bold">Fabrication Responsable</h3>
              <p className="text-slate-500 font-medium">Nous travaillons avec des ateliers éthiques qui respectent l'humain.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
