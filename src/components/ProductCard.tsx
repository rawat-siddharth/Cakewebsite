import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../data/products';
import { ImageWithFallback } from './ImageWithFallback';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { BAKERY_WHATSAPP_NUMBER } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const displayImage = product.images[0] || '';

  const handleQuickWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = encodeURIComponent(
      `Hello Cake N Crave, I would like to inquire about ordering "${product.name}" (₹${product.price}). Is it available for delivery in Jaipur?`
    );
    window.open(`https://wa.me/${BAKERY_WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className="group flex flex-col bg-white rounded-3xl border border-[#F3DFE5] overflow-hidden hover:shadow-[0_12px_36px_rgba(216,58,111,0.09)] hover:-translate-y-1 transition-all duration-300">
      
      {/* Product Image Slot with Luxury Tint & Badges */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-4/3 sm:aspect-square overflow-hidden bg-gradient-to-b from-[#FFF5F7] to-[#FCEEF2]"
      >
        <ImageWithFallback
          src={displayImage}
          alt={product.name}
          fallbackText={product.name}
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
        />

        {/* Top Indicators */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          {product.isNew ? (
            <span className="bg-[#D83A6F] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              Signature
            </span>
          ) : product.featured ? (
            <span className="bg-white/95 backdrop-blur-xs text-[#D83A6F] border border-[#F3DFE5] text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
              Bestseller
            </span>
          ) : (
            <span />
          )}

          <div
            className="w-5 h-5 bg-white/95 rounded-md border border-[#D83A6F] flex items-center justify-center shadow-xs"
            title="100% Eggless Pure Confectionery"
          >
            <div className="w-2 h-2 rounded-full bg-[#D83A6F]" />
          </div>
        </div>

        {/* Advance Notice badge */}
        {product.advanceOrderNotice && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#2A1810]/75 border border-[#F3DFE5]/80 shadow-xs">
            {product.advanceOrderNotice}
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
        <div>
          {/* Category & Region Kicker */}
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#D83A6F] font-semibold mb-1">
            <span>{product.category}</span>
            <span className="text-[#2A1810]/30 font-serif">·</span>
            <span className="text-[#2A1810]/60 font-medium normal-case tracking-normal">Jaipur</span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`} className="block focus:outline-hidden">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1810] line-clamp-1 group-hover:text-[#D83A6F] transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Short description */}
          <p className="mt-2 text-xs sm:text-sm text-[#2A1810]/70 line-clamp-2 leading-relaxed font-light">
            {product.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="pt-4 border-t border-[#F3DFE5] flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-[#2A1810]/55 block font-normal leading-none">Starting from</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#D83A6F] tabular-nums mt-0.5 block">
              ₹{product.price}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick WhatsApp Inquiry */}
            <button
              type="button"
              onClick={handleQuickWhatsApp}
              className="p-2.5 rounded-full bg-[#22C55E]/10 hover:bg-[#22C55E] text-[#16A34A] hover:text-white transition-all cursor-pointer"
              title="Quick WhatsApp Order"
              aria-label={`Inquire about ${product.name} on WhatsApp`}
            >
              <MessageCircle className="w-4 h-4 fill-current" />
            </button>

            {/* View Details / Customize */}
            <Link
              to={`/product/${product.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#2A1810] hover:bg-[#D83A6F] px-4 py-2.5 rounded-full shadow-xs transition-colors whitespace-nowrap"
            >
              <span>Order</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </article>
  );
}
