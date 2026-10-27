import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../ImageWithFallback';

const CORE_CATEGORIES = [
  {
    id: 'cakes',
    name: 'Cakes',
    path: '/cakes',
    image: '/src/assets/images/pastel_sprinkles_cake.jpg',
    bgColor: 'bg-[#FCECEE]',
    borderColor: 'border-[#F5D5D9]',
    hoverTextColor: 'group-hover:text-[#D83A6F]',
    accentColor: 'text-[#D83A6F]',
  },
  {
    id: 'hampers',
    name: 'Hampers',
    path: '/shop?category=hampers',
    image: '/src/assets/images/hamper_gift_basket.jpg',
    bgColor: 'bg-[#EAE3F2]',
    borderColor: 'border-[#DCD2E7]',
    hoverTextColor: 'group-hover:text-[#644A85]',
    accentColor: 'text-[#644A85]',
  },
  {
    id: 'bento-cakes',
    name: 'Bento Cakes',
    path: '/shop?category=bento-cakes',
    image: '/src/assets/images/bento_happy_day.jpg',
    bgColor: 'bg-[#E3F2E1]',
    borderColor: 'border-[#D2E8D0]',
    hoverTextColor: 'group-hover:text-[#4A7A3E]',
    accentColor: 'text-[#4A7A3E]',
  },
];

export function CategoryRow() {
  return (
    <section className="space-y-4 sm:space-y-8" aria-labelledby="creations-heading">
      
      {/* Section Header */}
      <div className="text-center space-y-1 sm:space-y-2">
        <div className="flex items-center justify-center gap-2 text-[#D83A6F]">
          <span className="text-xs sm:text-sm">♥</span>
          <h2 id="creations-heading" className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2A1810]">
            Shop Our Creations
          </h2>
          <span className="text-xs sm:text-sm">♥</span>
        </div>
        <p className="text-xs sm:text-sm text-[#9E8A85] font-light">
          Handmade with love, just for you.
        </p>
      </div>

      {/* 3 Categories: Exactly 1 row on mobile AND desktop */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8">
        {CORE_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            to={cat.path}
            className={`group flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden ${cat.bgColor} border ${cat.borderColor} p-2.5 sm:p-5 md:p-8 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1`}
          >
            <div className="aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-white mb-2 sm:mb-4 md:mb-6 shadow-2xs flex items-center justify-center">
              <ImageWithFallback
                src={cat.image}
                alt={`${cat.name} Collection`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="space-y-1 mt-auto">
              <h3 className={`font-serif text-xs sm:text-lg md:text-2xl font-bold text-[#2A1810] ${cat.hoverTextColor} transition-colors truncate`}>
                {cat.name}
              </h3>
              <span className={`hidden sm:inline-flex items-center justify-center gap-1 text-[11px] sm:text-xs md:text-sm font-semibold ${cat.accentColor} group-hover:underline`}>
                <span>View Collection</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>

    </section>
  );
}
