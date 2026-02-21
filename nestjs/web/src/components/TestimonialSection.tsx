"use client";

import React from 'react';

const TestimonialSection: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden border-t border-slate-50">
      {/* Image de background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/testimonial-bg.jpg)' }}
      >
        {/* Overlay sombre pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          
          <h3 className="text-white text-[32px] md:text-[42px] font-bold tracking-tight" style={{ fontFamily: 'Quicksand' }}>
            Approuvé par des milliers de parents.
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "Amélie R.",
              text: "La douceur des matières est incomparable. Mon fils ne supporte plus rien d'autre pour la nuit.",
              role: "Maman de Lucas (4 mois)"
            },
            {
              name: "Julien M.",
              text: "Enfin une marque qui allie éco-responsabilité et vrai design chic. Le packaging est sublime.",
              role: "Papa de Sofia (1 an)"
            },
            {
              name: "Clara V.",
              text: "Le cadeau de naissance parfait. Je l'ai offert à ma meilleure amie, elle a été conquise par la qualité.",
              role: "Maman de deux petits bouts"
            }
          ].map((t, i) => (
            <div key={i} className="bg-white/95 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:bg-white">
              <div className="flex gap-1 mb-6 text-[#c1a79d]">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5-6-4.5-6 4.5 2.5-7.5-6-4.5h7.5L12 2z"/></svg>
                ))}
              </div>
              <p className="text-[#1b2d3d]/80 text-[16px] leading-relaxed font-medium italic mb-8">
                "{t.text}"
              </p>
              <div className="pt-6 border-t border-[#c1a79d]/20">
                <p className="font-bold text-[#1b2d3d] text-[15px]">{t.name}</p>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#c1a79d]/80 mt-1">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Détails décoratifs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
    </section>
  );
};

export default TestimonialSection;