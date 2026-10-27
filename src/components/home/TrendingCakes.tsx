import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flame, ArrowRight } from 'lucide-react';
import { Product } from '../../data/products';
import { ProductCard } from '../ProductCard';

interface Props {
  products: Product[];
  trendingIds: string[];
}

export function TrendingCakes({ products, trendingIds }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Resolve trending products by IDs in ordered sequence
  const displayProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];

    let matched: Product[] = [];
    if (trendingIds && trendingIds.length > 0) {
      trendingIds.forEach((id) => {
        const p = products.find((prod) => prod.id === id || prod.slug === id);
        if (p && !matched.some((m) => m.id === p.id)) {
          matched.push(p);
        }
      });
    }

    // If fewer than 4 matched, pad with featured or published cakes
    if (matched.length < 4) {
      const remaining = products.filter(
        (p) =>
          !matched.some((m) => m.id === p.id) &&
          (p.category?.toLowerCase() === 'cakes' || p.category?.toLowerCase() === 'cake' || p.featured)
      );
      matched = [...matched, ...remaining].slice(0, 8);
    }

    return matched;
  }, [products, trendingIds]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  if (displayProducts.length === 0) return null;

  return (
    <section className="space-y-4 sm:space-y-6" aria-labelledby="trending-heading">
      
      {/* Header and Controls Row */}
      <div className="flex items-end justify-between">
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-1.5 text-[#D83A6F]">
            <Flame className="w-4 h-4 fill-current" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D83A6F]">
              Bakery Bestsellers
            </span>
          </div>
          <h2 id="trending-heading" className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2A1810]">
            Trending Cakes
          </h2>
          <p className="text-xs sm:text-sm text-[#9E8A85] font-light max-w-xl">
            Loved by our customers, perfect for your next celebration.
          </p>
        </div>

        {/* View All Link & Scroll Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/cakes"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#D83A6F] hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Scroll left"
              className="w-8 h-8 rounded-full bg-white hover:bg-[#FFF0F4] text-[#2A1810] hover:text-[#D83A6F] border border-[#F3DFE5] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Scroll right"
              className="w-8 h-8 rounded-full bg-white hover:bg-[#FFF0F4] text-[#2A1810] hover:text-[#D83A6F] border border-[#F3DFE5] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal scrolling on small screens, neat flex track */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 px-1 -mx-1 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayProducts.map((prod) => (
          <div key={prod.id} className="w-56 sm:w-64 md:w-72 shrink-0 snap-start">
            <ProductCard product={prod} />
          </div>
        ))}
      </div>

    </section>
  );
}
