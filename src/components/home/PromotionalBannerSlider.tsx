import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { HomepageBannerSlide } from '../../types/supabase';
import { ImageWithFallback } from '../ImageWithFallback';

interface Props {
  slides: HomepageBannerSlide[];
}

export function PromotionalBannerSlider({ slides }: Props) {
  // Only display active slides sorted by display_order
  const activeSlides = (slides || [])
    .filter((s) => s.is_active !== false)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState<number>(0);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  const totalSlides = activeSlides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay rotation (5000ms), paused when hovered or interacted
  useEffect(() => {
    if (isPaused || totalSlides <= 1 || prefersReducedMotion.current) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(interval);
  }, [isPaused, totalSlides, nextSlide]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentX = e.targetTouches[0].clientX;
    setTouchDelta(currentX - touchStart);
  };

  const handleTouchEnd = () => {
    if (touchStart === null) return;
    if (touchDelta < -45) {
      nextSlide();
    } else if (touchDelta > 45) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchDelta(0);
    setTimeout(() => setIsPaused(false), 2000);
  };

  if (totalSlides === 0) return null;

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <div
      className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden border border-[#F5D5D9] shadow-sm select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Promotional Carousel"
    >
      {/* Slide Container */}
      <div
        className={`w-full transition-all duration-700 ease-in-out bg-gradient-to-r ${
          currentSlide.bg_gradient || 'from-[#FDEEEF] via-[#FDF3F5] to-[#FCEBED]'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center p-6 sm:p-10 lg:p-12 min-h-[380px] sm:min-h-[420px]">
          
          {/* Left Text Column */}
          <div className="md:col-span-7 space-y-4 sm:space-y-6 text-center md:text-left flex flex-col justify-center">
            
            {/* Promo Badge / Tag */}
            {currentSlide.promo_badge && (
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-xs text-[#D83A6F] text-[11px] sm:text-xs font-semibold rounded-full border border-[#F3DFE5] shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#D83A6F]" />
                  <span>{currentSlide.promo_badge}</span>
                </span>
              </div>
            )}

            {/* Heading & Description */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-[#2A1810] tracking-tight leading-tight">
                {currentSlide.heading}
              </h1>
              <p className="text-sm sm:text-lg text-[#5C4033] font-normal leading-relaxed max-w-xl mx-auto md:mx-0">
                {currentSlide.description}
              </p>
            </div>

            {/* Optional Call to Action Button */}
            {currentSlide.button_label && currentSlide.button_link && (
              <div className="pt-1">
                <Link
                  to={currentSlide.button_link}
                  className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-3.5 bg-[#E87A90] hover:bg-[#D83A6F] text-white text-xs sm:text-sm font-bold tracking-wider rounded-full shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                >
                  {currentSlide.button_label}
                </Link>
              </div>
            )}

          </div>

          {/* Right Image Column */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="relative w-48 sm:w-64 lg:w-72 aspect-square rounded-3xl overflow-hidden shadow-lg border-2 border-white/80 bg-white">
              <ImageWithFallback
                src={currentSlide.image || '/src/assets/images/pastel_sprinkles_cake.jpg'}
                alt={currentSlide.heading}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Prev / Next Navigation Controls */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#2A1810] hover:text-[#D83A6F] border border-[#F3DFE5] flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#2A1810] hover:text-[#D83A6F] border border-[#F3DFE5] flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {activeSlides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-7 sm:w-8 h-2 sm:h-2.5 bg-[#D83A6F]'
                    : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[#2A1810]/25 hover:bg-[#2A1810]/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
