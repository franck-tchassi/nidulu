"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

interface SubCategory {
  enCeMoment: string[];
  nosProduitsHeader: string;
  nosProduits: string[];
  showPromo?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('Mode');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  
  // Bloque le scroll du body lorsque la sidebar est ouverte
  useEffect(() => {
    if (isOpen) {
      // Sauvegarde la position actuelle du scroll
      const scrollY = window.scrollY;
      // Sauvegarde la largeur de la scrollbar pour éviter le décalage
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Bloque le scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Stocke la position du scroll pour la restaurer plus tard
      document.body.dataset.scrollY = scrollY.toString();
      
      return () => {
        // Restaure le scroll
        const scrollY = document.body.dataset.scrollY || '0';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Restaure la position du scroll
        window.scrollTo(0, parseInt(scrollY));
      };
    }
  }, [isOpen]);

  const tabs = ['Mode', 'Maison', 'Puériculture', 'Jouet'];
  
  // Données des onglets principaux
  const modeCategories = [
    { name: 'Naissance', range: '0-18 mois' },
    { name: 'Bébé fille', range: '0-4 ans' },
    { name: 'Bébé garçon', range: '0-4 ans' },
    { name: 'Fille', range: '2-16 ans' },
    { name: 'Garçon', range: '2-16 ans' },
    { name: 'Chaussures', range: '' },
    { name: 'Femme', range: '' },
  ];

  const maisonCategories = [
    'Chambre & rangement',
    'Linge de lit & déco',
    'Animaux de compagnie'
  ];

  const puericultureCategories = [
    'Toilette & soin',
    'Les sorties',
    'Le repas',
    'L\'éveil',
    'Le dodo',
    'Voir toute la puériculture'
  ];

  const jouetSelections = [
    'Jouets de 0 à 24 mois',
    'Jouets de 2 à 4 ans',
    'Jouets de 5 à 7 ans',
    'Jouets 8 ans et +',
    'Jouets en bois',
    'Leurs héros préférés'
  ];
  
  const jouetUnivers = [
    'Premier âge',
    'Jeux d\'imitation'
  ];

  // Configuration des sous-menus
  const subMenus: Record<string, SubCategory> = {
    'Femme': {
      enCeMoment: ['Valise de maman', 'Envie de fraise 🍓'],
      nosProduitsHeader: 'NOS PRODUITS',
      nosProduits: ['Vêtements Allaitement', 'Manteau, veste', 'Pantalon', 'Pull, gilet, sweat'],
      showPromo: true
    },
    'Chaussures': {
      enCeMoment: ['Sélection Grand Froid ❄️', 'Produits entretien, pédimètre, semelles'],
      nosProduitsHeader: 'Chaussures bébé',
      nosProduits: ['Premiers pas 17-23', 'Marche fille 19-26', 'Marche garçon 19-26', 'Chaussons'],
      showPromo: true
    },
    'Fille': {
      enCeMoment: ['Les pantalons chauds', 'Collection Ado'],
      nosProduitsHeader: 'NOS PRODUITS',
      nosProduits: ['Manteau, veste', 'Pull, gilet, sweat', 'Robe', 'Pantalon'],
      showPromo: true
    },
    'Garçon': {
      enCeMoment: ['Les pantalons chauds', 'Collection Ado'],
      nosProduitsHeader: 'NOS PRODUITS',
      nosProduits: ['Manteau, veste', 'Pull, gilet, sweat', 'Pantalon', 'Jean'],
      showPromo: true
    },
    'Bébé garçon': {
      enCeMoment: ['Cadeaux de naissance 🎁'],
      nosProduitsHeader: 'NOS PRODUITS',
      nosProduits: ['Naissance garçon 0-18 mois', 'Pyjama, dors-bien', "Manteau, combipilote, nid d'ange", 'Body', 'Ensemble'],
      showPromo: true
    },
    'Bébé fille': {
      enCeMoment: ['Cadeaux de naissance 🎁'],
      nosProduitsHeader: 'NOS PRODUITS',
      nosProduits: ['Naissance fille 0-18 mois', 'Pyjama, dors-bien', "Manteau, combipilote, nid d'ange", 'Body', 'Ensemble'],
      showPromo: true
    },
    'Naissance': {
      enCeMoment: [],
      nosProduitsHeader: 'NOS PRODUITS',
      nosProduits: ['Naissance fille', 'Naissance garçon', 'Voir toute la naissance'],
      showPromo: true
    },
    'Chambre & rangement': {
      enCeMoment: [],
      nosProduitsHeader: 'Chambre',
      nosProduits: ['Lit bébé', 'Lit enfant', 'Bureau, table', 'Lit combiné, surélevé, superposé', 'Accessoires de bureau', 'Chaise, tabouret, fauteuil'],
      showPromo: true
    },
    'Linge de lit & déco': {
      enCeMoment: ['Ambiance bébé Nuage ☁️'],
      nosProduitsHeader: 'Linge de lit bébé',
      nosProduits: ['Gigoteuse', 'Drap-housse', 'Couverture, édredon', 'Housse de couette', "Taie d'oreiller"],
      showPromo: true
    },
    'Animaux de compagnie': {
      enCeMoment: [],
      nosProduitsHeader: 'NOS PRODUITS',
      nosProduits: ['Paniers et matelas', 'Jouets', 'Promenade', 'Voir toute la collection'],
      showPromo: false
    }
  };

  const currentSubMenu = currentCategory ? subMenus[currentCategory] : null;

  const handleBack = () => {
    setCurrentCategory(null);
  };

  const handleCategoryClick = (name: string) => {
    if (subMenus[name]) {
      setCurrentCategory(name);
    }
  };

  // Empêche la fermeture de la sidebar quand on clique à l'intérieur
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const PromoButtons = () => (
    <div className="space-y-3 mb-6">
      <button className="flex items-center justify-between w-full bg-[#B6191E] text-white p-4 rounded-xl hover:brightness-110 transition-all group shadow-sm">
        <span className="font-black uppercase tracking-widest text-sm">SOLDES</span>
        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button className="flex items-center justify-between w-full bg-[#6484B6] text-white p-4 rounded-xl hover:brightness-110 transition-all group shadow-sm">
        <span className="font-black uppercase tracking-widest text-sm">NOUVELLE COLLECTION</span>
        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );

  const CategoryItem: React.FC<{ name: string; range?: string; onClick?: () => void }> = ({ name, range, onClick }) => (
    <button 
      onClick={onClick}
      className="flex items-center justify-between w-full p-4 bg-gray-50/80 hover:bg-gray-100/80 transition-all rounded-xl group text-left"
    >
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-gray-900 text-sm">{name}</span>
        {range && <span className="text-[10px] text-gray-400 font-medium">{range}</span>}
      </div>
      <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );

  // Empêche les interactions avec le contenu derrière
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay avec flou très léger */}
      <div 
        className="fixed inset-0 bg-black/30 z-[100]"
        onClick={handleOverlayClick}
      />

      {/* Sidebar */}
      <div 
        className="fixed top-0 left-0 h-full w-[400px] max-w-[90vw] bg-white z-[101] shadow-2xl"
        style={{ 
          animation: 'slideIn 0.3s ease-out forwards',
          transform: 'translateX(0)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-gray-100">
            {/* Logo */}
              <Link href={"/"} className="flex items-center">
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
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="flex px-8 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentCategory(null); }}
                className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-black" />
                )}
              </button>
            ))}
          </div>

          {/* Back Button */}
          {currentCategory && (
            <div className="px-4 py-4 border-b border-gray-50 flex items-center bg-white sticky top-0 z-10">
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
                {currentCategory}
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            
            {/* Vue principale par onglet */}
            {!currentCategory && (
              <div>
                <PromoButtons />
                
                {activeTab === 'Mode' && (
                  <>
                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest px-2 mb-4">Tous nos univers mode</p>
                    <div className="space-y-3">
                      {modeCategories.map((cat) => (
                        <CategoryItem key={cat.name} name={cat.name} range={cat.range} onClick={() => handleCategoryClick(cat.name)} />
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'Maison' && (
                  <>
                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest px-2 mb-4">Tous nos univers maison</p>
                    <div className="space-y-3">
                      {maisonCategories.map((item) => (
                        <CategoryItem key={item} name={item} onClick={() => handleCategoryClick(item)} />
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'Puériculture' && (
                  <>
                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest px-2 mb-4">Tous nos univers Puériculture</p>
                    <div className="space-y-3">
                      {puericultureCategories.map((item) => (
                        <CategoryItem key={item} name={item} />
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'Jouet' && (
                  <div className="space-y-8">
                    <div>
                      <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest px-2 mb-4">NOS SELECTIONS</p>
                      <div className="space-y-3">
                        {jouetSelections.map((item) => (
                          <CategoryItem key={item} name={item} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest px-2 mb-4">Tous nos univers jouets</p>
                      <div className="space-y-3">
                        {jouetUnivers.map((item) => (
                          <CategoryItem key={item} name={item} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vue sous-catégorie */}
            {currentCategory && (
              <div>
                
                {/* Section EN CE MOMENT */}
                {(currentSubMenu?.showPromo !== false || (currentSubMenu?.enCeMoment && currentSubMenu.enCeMoment.length > 0)) && (
                  <div>
                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest px-2 mb-4">EN CE MOMENT</p>
                    <div className="space-y-3">
                      {currentSubMenu?.showPromo !== false && <PromoButtons />}
                      {currentSubMenu?.enCeMoment.map((item) => (
                        <CategoryItem key={item} name={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Section LISTE PRODUITS */}
                <div>
                  <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest px-2 mb-4">
                    {currentSubMenu?.nosProduitsHeader}
                  </p>
                  <div className="space-y-3">
                    {currentSubMenu?.nosProduits.map((item) => (
                      <CategoryItem key={item} name={item} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styles CSS */}
      <style jsx global>{`
        /* Animation de la sidebar */
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        /* Empêche le scroll quand la sidebar est ouverte */
        body.sidebar-open {
          overflow: hidden !important;
          position: fixed;
          width: 100%;
        }

        /* Scrollbar styling pour la sidebar */
        .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>
    </>
  );
};

export default Sidebar;