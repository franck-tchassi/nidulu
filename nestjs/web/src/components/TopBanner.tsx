// web/src/components/TopBanner.tsx

"use client";

import React, { useState, useEffect, useRef } from 'react';

const TopBanner: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const MESSAGE_DURATION = 5000;
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const messages = [
    {
      text: "SOLDE -65% | Profitez-en vite !",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      )
    },
    {
      text: "Livraison standard offerte dès 50€ d'achat",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      text: "Retours gratuits et simplifiés sous 30 jours",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" />
        </svg>
      )
    },
    {
      text: "Nouvelle Collection Printemps : Déjà disponible",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c.053.164.082.341.082.524 0 .931-.76 1.688-1.697 1.688-.41 0-.785-.145-1.077-.386l-1.684 1.12c.168.307.265.659.265 1.034 0 1.15-.939 2.083-2.098 2.083-1.158 0-2.098-.933-2.098-2.083 0-.375.1-.727.265-1.033l-1.684-1.12c-.292.24-.667.385-1.077.385-.938 0-1.698-.757-1.698-1.688 0-.183.029-.36.082-.524l-1.684-1.12c-.292.241-.667.386-1.077.386-.938 0-1.698-.757-1.698-1.688 0-.931.76-1.688 1.698-1.688.41 0 .785.145 1.077.386l1.684-1.121c-.053-.164-.082-.341-.082-.524 0-.931.76-1.688 1.698-1.688.41 0 .785.145 1.077.386l1.684-1.121c-.168-.306-.265-.658-.265-1.033 0-1.15.939-2.083 2.098-2.083 1.158 0 2.098.933 2.098 2.083 0 .375-.1.727-.265 1.033l1.684 1.121c.292-.24.667-.385 1.077-.385.938 0 1.698.757 1.698 1.688 0 .183-.029.36-.082.524l1.684 1.121c.292-.241.667-.386 1.077-.386.938 0 1.698.757 1.698 1.688 0 .931-.76 1.688-1.698 1.688-.41 0-.785-.145-1.077-.386l-1.684 1.121z" />
        </svg>
      )
    }
  ];

  const animate = (time: number) => {
    if (startTimeRef.current === null) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    const newProgress = (elapsed / MESSAGE_DURATION) * 100;

    if (newProgress >= 100) {
      setProgress(0);
      setCurrentMessage((msg) => (msg + 1) % messages.length);
      startTimeRef.current = time;
    } else {
      setProgress(newProgress);
    }
    
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-11 bg-[#2a3038] text-white overflow-hidden z-[70] border-b border-white/5">
      {/* Fond dégradé animé discret */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[gradient_10s_ease_infinite] bg-[length:200%_100%] pointer-events-none"></div>
      
      {/* Conteneur de messages centré */}
      <div className="relative h-full flex items-center justify-center">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`top-banner-msg absolute flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              index === currentMessage 
                ? 'opacity-100 translate-y-0 scale-100' 
                : index < currentMessage 
                  ? 'opacity-0 -translate-y-4 scale-95' 
                  : 'opacity-0 translate-y-4 scale-95'
            }`}
          >
            <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-semibold tracking-[0.25em] uppercase whitespace-nowrap">
              <span className="text-white/80 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{msg.icon}</span>
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Barre de chargement améliorée */}
      <div className="absolute bottom-0 left-0 h-[2.5px] bg-white/5 w-full">
        <div 
          className="h-full bg-[#f3eeea] shadow-[0_0_12px_rgba(243,238,234,0.6)]"
          style={{ 
            width: `${progress}%`,
            transition: 'none' 
          }}
        ></div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default TopBanner;