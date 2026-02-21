// web/src/components/FeaturesSection.tsx

"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Hotspot {
  id: number;
  x: number;
  y: number;
  label: string;
}

const FeaturesSection: React.FC = () => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([
    { id: 1, x: 18, y: 70, label: 'Doudou' },
    { id: 2, x: 78, y: 78, label: 'Pyjama' },
    { id: 3, x: 78, y: 25, label: 'Bavoir' },
    { id: 4, x: 50, y: 70, label: 'Couverture' }
  ]);
  
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId === null || !imageContainerRef.current) return;

    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Limiter les positions dans les limites de l'image
    const boundedX = Math.max(5, Math.min(95, x));
    const boundedY = Math.max(5, Math.min(95, y));

    setHotspots(prev => prev.map(hotspot => 
      hotspot.id === draggingId 
        ? { ...hotspot, x: boundedX, y: boundedY }
        : hotspot
    ));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // Ajouter des écouteurs d'événements globaux pour le drag
  useEffect(() => {
    if (draggingId) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingId]);

  const handleMouseMoveGlobal = (e: MouseEvent) => {
    if (draggingId === null || !imageContainerRef.current) return;

    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const boundedX = Math.max(5, Math.min(95, x));
    const boundedY = Math.max(5, Math.min(95, y));

    setHotspots(prev => prev.map(hotspot => 
      hotspot.id === draggingId 
        ? { ...hotspot, x: boundedX, y: boundedY }
        : hotspot
    ));
  };

  const addHotspot = () => {
    const newId = hotspots.length > 0 ? Math.max(...hotspots.map(h => h.id)) + 1 : 1;
    setHotspots([...hotspots, { 
      id: newId, 
      x: 50, 
      y: 50, 
      label: `Produit ${newId}` 
    }]);
  };

  const removeHotspot = (id: number) => {
    setHotspots(hotspots.filter(hotspot => hotspot.id !== id));
  };

  const updateHotspotLabel = (id: number, label: string) => {
    setHotspots(prev => prev.map(hotspot => 
      hotspot.id === id ? { ...hotspot, label } : hotspot
    ));
  };

  return (
    <section className="w-full flex flex-col">
      {/* 1. Lifestyle Image with Hotspots */}
      <div 
        ref={imageContainerRef}
        className="relative w-full aspect-[21/9] min-h-[400px] overflow-hidden bg-[#D2B48C] select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Image de background depuis public */}
        <div className="absolute inset-0">
          <img 
            src="/produits_sans_bouton.png" 
            alt="Produits Nidolu" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Superposition sombre pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Contenu texte sur l'image */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 md:px-8 z-10">
          <div className="max-w-3xl text-center">
            <h2 className="text-[28px] md:text-[42px] font-bold mb-6" style={{ fontFamily: 'Quicksand', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Des Matières Naturelles pour Bébé
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
              Notre collection exclusive alliant douceur et qualité, 
              conçue avec amour pour le bien-être de votre enfant
            </p>
          </div>
        </div>
        
        {/* Hotspots - Boutons ronds interactifs */}
        {hotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 ${draggingId === hotspot.id ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            onMouseDown={(e) => handleMouseDown(hotspot.id, e)}
          >
            {/* Bouton rond principal */}
            <div className="relative group">
              {/* Cercle externe avec animation pulse réduite */}
              <div className="absolute inset-0 animate-pulse bg-gray-300/30 rounded-full transform scale-125" />
              
              {/* Bouton rond avec plus */}
              <div className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-gray-300">
                <span className="text-gray-800 font-bold text-lg">+</span>
                
                {/* Tooltip/label */}
                {showLabels && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-black/80 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap">
                      {hotspot.label}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Hand-drawn Doodles (SVG Overlays) */}
        <div className="absolute inset-0 pointer-events-none select-none z-5">
          {/* Heart Top Left */}
          <svg className="absolute top-10 left-10 md:left-20 w-16 md:w-24 text-white opacity-80 rotate-[-15deg]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M50 30 C50 10, 10 10, 10 40 C10 70, 50 90, 50 90 C50 90, 90 70, 90 40 C90 10, 50 10, 50 30" strokeDasharray="5 3" />
          </svg>
          
          {/* Stars */}
          <svg className="absolute top-20 right-40 w-12 text-white opacity-60" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5-6-4.5-6 4.5 2.5-7.5-6-4.5h7.5L12 2z" />
          </svg>
          <svg className="absolute bottom-20 left-1/4 w-8 text-white opacity-70 rotate-12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5-6-4.5-6 4.5 2.5-7.5-6-4.5h7.5L12 2z" />
          </svg>
          
          {/* Doodle heart Right */}
          <svg className="absolute top-1/4 right-10 md:right-20 w-20 md:w-32 text-white opacity-90 rotate-[10deg]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
             <path d="M50 35 C50 20, 20 20, 20 45 C20 70, 50 85, 50 85 C50 85, 80 70, 80 45 C80 20, 50 20, 50 35" />
             <path d="M35 45 L45 55 M55 45 L65 55" strokeWidth="2" opacity="0.5" />
          </svg>
        </div>
      </div>

      {/* 2. Benefits Section */}
      <div className="bg-[#F3EEEA] py-20 px-6 relative">
        <div className="max-w-[1440px] mx-auto text-center">
          <h2 className="text-[#4A3728] text-[24px] md:text-[32px] font-bold mb-12" style={{ fontFamily: 'Quicksand' }}>
            Pourquoi nous utilisons un mélange bambou/coton
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Card 1 - Très doux */}
            <div className="bg-white p-10 rounded-2xl flex flex-col items-center shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-24 h-24 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img 
                  src="/doux.png" 
                  alt="Très doux" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[#4A3728] font-bold text-[18px]">Très doux</span>
              <p className="text-[#4A3728]/70 mt-2 text-sm text-center">
                Pour la peau délicate de bébé
              </p>
            </div>

            {/* Card 2 - Respirant */}
            <div className="bg-white p-10 rounded-2xl flex flex-col items-center shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-24 h-24 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img 
                  src="/respirant.png" 
                  alt="Respirant" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[#4A3728] font-bold text-[18px]">Respirant</span>
              <p className="text-[#4A3728]/70 mt-2 text-sm text-center">
                Évite la transpiration excessive
              </p>
            </div>

            {/* Card 3 - Hypoallergénique */}
            <div className="bg-white p-10 rounded-2xl flex flex-col items-center shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-24 h-24 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img 
                  src="/leaves.png" 
                  alt="Hypoallergénique" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[#4A3728] font-bold text-[18px]">Hypoallergénique</span>
              <p className="text-[#4A3728]/70 mt-2 text-sm text-center">
                Sans produits chimiques agressifs
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Wave to Footer */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] translate-y-[98%]">
          <svg className="relative block w-full h-12 text-[#F3EEEA] fill-current" viewBox="0 0 1440 48" preserveAspectRatio="none">
            <path d="M0 48h1440V0C1440 0 1140 48 720 48S0 0 0 0v48z" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;