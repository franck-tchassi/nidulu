"use client";

import Image from "next/image";
import React from "react";

const categories = [
  {
    name: "Fille",
    image: "/top_category/fille.jpg",
  },
  {
    name: "Garçon",
    image: "/top_category/garcon.jpg",
  },
  {
    name: "Bébé",
    image: "/top_category/bebe.jpg",
  },
  {
    name: "Chaussures",
    image: "/top_category/chaussure.jpg",
  },
  {
    name: "Maternité",
    image: "/top_category/mternite.jpg",
  },
];

const CategorySection = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="group cursor-pointer flex flex-col items-center"
            >
              {/* Carte - Carrée qui devient ronde au survol */}
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                {/* Conteneur pour le border-radius */}
                <div className="absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-[2rem] group-hover:rounded-full overflow-hidden">
                  {/* Image locale depuis /public */}
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    priority={index < 2} // Prioriser les premières images
                  />

                  {/* Overlay simple */}
                  <div className="absolute inset-0 bg-black/20 transition-opacity duration-700 group-hover:opacity-40" />

                  {/* Texte */}
                  <div className="absolute inset-0 flex items-center justify-center text-center z-10">
                    <h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-wide drop-shadow-lg">
                      {cat.name}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;