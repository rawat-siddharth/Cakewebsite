import React, { useState } from 'react';
import { Cake } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

export function ImageWithFallback({
  src,
  alt = 'Cake N Crave Artisanal Bakery',
  className = '',
  fallbackText,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#FCEEF2] via-[#FFF9F6] to-[#FCEEF2] border border-[#E8A0B4]/30 text-[#49312E] p-6 text-center select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#E8A0B4] shadow-xs mb-2">
          <Cake className="w-6 h-6 stroke-[1.5]" />
        </div>
        <span className="text-xs font-serif italic text-[#C08081] tracking-wide">Cake N Crave · Jaipur</span>
        {fallbackText && (
          <span className="text-xs font-medium text-[#49312E]/80 mt-1 max-w-[180px] truncate">{fallbackText}</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className={className}
      {...props}
    />
  );
}
