import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { CustomerGalleryItem } from '../../types/supabase';
import { ImageWithFallback } from '../ImageWithFallback';

interface Props {
  items: CustomerGalleryItem[];
}

export function CustomerCakeGallery({ items }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeItems = (items || [])
    .filter((it) => it.is_active !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (activeItems.length === 0) return null;

  return (
    <section className="space-y-4 sm:space-y-6" aria-labelledby="moments-heading">
      
      {/* Header and Controls Row */}
      <div className="flex items-end justify-between">
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 text-[#D83A6F]">
            <Heart className="w-4 h-4 fill-current" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D83A6F]">
              Customer Love
            </span>
          </div>
          <h2 id="moments-heading" className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2A1810]">
            Made for Your Moments
          </h2>
          <p className="text-xs sm:text-sm text-[#9E8A85] font-light max-w-xl">
            Every cake has a story. Here are a few sweet moments shared by our customers.
          </p>
        </div>

        {/* Desktop Scroll Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FFF0F4] text-[#2A1810] hover:text-[#D83A6F] border border-[#F3DFE5] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Scroll right"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FFF0F4] text-[#2A1810] hover:text-[#D83A6F] border border-[#F3DFE5] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontally Scrolling Card Track */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 px-1 -mx-1 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {activeItems.map((item) => (
          <div
            key={item.id}
            className="w-64 sm:w-72 md:w-80 shrink-0 snap-start bg-white rounded-2xl sm:rounded-3xl border border-[#F3DFE5] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
          >
            {/* Image with Tag Overlay */}
            <div className="relative aspect-[4/3] w-full bg-[#FFFBFB] overflow-hidden">
              <ImageWithFallback
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Badge: Transparently identifies demo placeholders */}
              <div className="absolute top-2.5 left-2.5">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shadow-2xs ${
                  item.is_placeholder
                    ? 'bg-white/95 text-[#9E8A85] border-[#F3DFE5]'
                    : 'bg-[#D83A6F] text-white border-transparent'
                }`}>
                  {item.tag || (item.is_placeholder ? 'Demo Placeholder' : 'Customer Photo')}
                </span>
              </div>
            </div>

            {/* Content & Caption */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-1.5">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#2A1810]">
                  {item.title}
                </h3>
                {item.caption && (
                  <p className="text-xs text-[#5C4033]/80 font-normal leading-relaxed mt-1">
                    {item.caption}
                  </p>
                )}
              </div>

              {item.is_placeholder && (
                <div className="pt-2 text-[10px] text-[#9E8A85] italic">
                  * Temporary demo preview · Customer photos coming soon
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
