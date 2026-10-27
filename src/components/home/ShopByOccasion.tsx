import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cake,
  Heart,
  Sparkles,
  Smile,
  GraduationCap,
  Gift,
  ArrowRight
} from 'lucide-react';

const OCCASIONS = [
  {
    id: 'birthdays',
    name: 'Birthday',
    path: '/cakes?occasion=Birthdays',
    icon: Cake,
    countLabel: 'Celebration cakes',
    bgColor: 'bg-[#FFF0F4]',
    borderColor: 'border-[#FCE3E9]',
    iconColor: 'text-[#D83A6F]',
    hoverBg: 'hover:bg-[#FDE2EA]',
  },
  {
    id: 'anniversaries',
    name: 'Anniversary',
    path: '/cakes?occasion=Anniversaries',
    icon: Heart,
    countLabel: 'Romantic designs',
    bgColor: 'bg-[#E2F0D9]',
    borderColor: 'border-[#CFE4C3]',
    iconColor: 'text-[#4A7A3E]',
    hoverBg: 'hover:bg-[#D4EAC7]',
  },
  {
    id: 'weddings',
    name: 'Wedding',
    path: '/cakes?occasion=Weddings',
    icon: Sparkles,
    countLabel: 'Tiered elegance',
    bgColor: 'bg-[#E8E0F0]',
    borderColor: 'border-[#D8CBE4]',
    iconColor: 'text-[#644A85]',
    hoverBg: 'hover:bg-[#DDD0E8]',
  },
  {
    id: 'baby-showers',
    name: 'Baby Shower',
    path: '/cakes?occasion=Baby%20Showers',
    icon: Smile,
    countLabel: 'Sweet welcomes',
    bgColor: 'bg-[#FFF0D9]',
    borderColor: 'border-[#FFE2B8]',
    iconColor: 'text-[#9A5A12]',
    hoverBg: 'hover:bg-[#FFE8C7]',
  },
  {
    id: 'graduations',
    name: 'Graduation',
    path: '/cakes?occasion=Graduations',
    icon: GraduationCap,
    countLabel: 'Milestone treats',
    bgColor: 'bg-[#EDE8F5]',
    borderColor: 'border-[#DFD5EB]',
    iconColor: 'text-[#5E4482]',
    hoverBg: 'hover:bg-[#DDD2ED]',
  },
  {
    id: 'other-occasions',
    name: 'Just Because',
    path: '/cakes?occasion=Other%20Occasions',
    icon: Gift,
    countLabel: 'Everyday joys',
    bgColor: 'bg-[#FFF8F0]',
    borderColor: 'border-[#F5E8D8]',
    iconColor: 'text-[#7C4A2D]',
    hoverBg: 'hover:bg-[#FEEFD9]',
  },
];

export function ShopByOccasion() {
  return (
    <section className="space-y-4 sm:space-y-6" aria-labelledby="occasion-heading">
      
      {/* Header */}
      <div className="text-center space-y-1 sm:space-y-2">
        <h2 id="occasion-heading" className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2A1810]">
          Shop by Occasion
        </h2>
        <p className="text-xs sm:text-sm text-[#9E8A85] font-light">
          Find the perfect cake for every special moment.
        </p>
      </div>

      {/* Grid of Pastel Occasion Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {OCCASIONS.map((occ) => {
          const IconComponent = occ.icon;
          return (
            <Link
              key={occ.id}
              to={occ.path}
              className={`group flex flex-col items-center justify-center text-center p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${occ.bgColor} ${occ.hoverBg} border ${occ.borderColor} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer`}
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 shadow-2xs flex items-center justify-center ${occ.iconColor} mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform`}>
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
              </div>

              <h3 className="font-serif text-sm sm:text-base font-bold text-[#2A1810] group-hover:text-[#D83A6F] transition-colors leading-tight">
                {occ.name}
              </h3>
              
              <span className="text-[10px] sm:text-[11px] text-[#9E8A85] mt-0.5 font-light">
                {occ.countLabel}
              </span>

              <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-[#D83A6F] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Browse</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>

    </section>
  );
}
