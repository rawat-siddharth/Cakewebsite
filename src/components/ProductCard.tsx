import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../data/products';
import { ImageWithFallback } from './ImageWithFallback';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  selectedFlavorParam?: string;
}

export function ProductCard({ product, selectedFlavorParam }: ProductCardProps) {
  const displayImage = product.images[0] || '';
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Check wishlist state
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cnc_wishlist');
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.includes(product.id)) {
          setIsWishlisted(true);
        }
      }
    } catch (e) {}
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('cnc_wishlist');
      let list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];
      if (list.includes(product.id)) {
        list = list.filter((id: string) => id !== product.id);
        setIsWishlisted(false);
      } else {
        list.push(product.id);
        setIsWishlisted(true);
      }
      localStorage.setItem('cnc_wishlist', JSON.stringify(list));
    } catch (e) {}
  };

  const productUrl = selectedFlavorParam
    ? `/product/${product.slug}?flavor=${encodeURIComponent(selectedFlavorParam)}`
    : `/product/${product.slug}`;

  return (
    <article className="group flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-[#F3DFE5] overflow-hidden hover:shadow-lg transition-all duration-300">
      
      {/* Product Image with Wishlist Heart (DALL·E 3 Reference Matched) */}
      <Link
        to={productUrl}
        className="relative block aspect-square overflow-hidden bg-[#FFF9F6]"
      >
        <ImageWithFallback
          src={displayImage}
          alt={product.name}
          fallbackText={product.name}
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
        />

        {/* Top-Right Wishlist Heart Button */}
        <button
          type="button"
          onClick={toggleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-[#D83A6F] text-white shadow-xs'
              : 'bg-white/90 text-[#9E8A85] hover:text-[#D83A6F] hover:bg-white shadow-2xs'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </Link>

      {/* Product Details Underneath (DALL·E 3 Reference Matched: Title & From ₹...) */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-1.5">
        <Link to={productUrl} className="block focus:outline-hidden">
          <h4 className="font-serif text-base sm:text-lg font-bold text-[#2A1810] line-clamp-1 group-hover:text-[#D83A6F] transition-colors">
            {product.name}
          </h4>
        </Link>

        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-xs sm:text-sm text-[#5C4033] font-medium">
            From <span className="font-serif font-bold text-[#2A1810] text-sm sm:text-base">₹{product.price}</span>
          </span>
          <span className="text-[10px] text-[#9E8A85] font-light">100% Eggless</span>
        </div>
      </div>

    </article>
  );
}
