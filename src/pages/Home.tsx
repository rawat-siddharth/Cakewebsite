import React from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { CATEGORIES, MAIN_CATEGORIES } from '../data/categories';
import { OCCASIONS } from '../data/occasions';
import { ProductCard } from '../components/ProductCard';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { useStore } from '../context/StoreContext';
import {
  Sparkles,
  Heart,
  Clock,
  Gift,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Star,
  CheckCircle2,
  Cake,
  Leaf
} from 'lucide-react';
import { BAKERY_WHATSAPP_NUMBER } from '../utils/whatsapp';

export function Home() {
  const { products, categories, websiteSettings } = useStore();

  // Dynamic products fallback to static
  const liveProducts = products.length > 0 ? products : PRODUCTS;
  const signatureProducts = liveProducts.filter((p) => p.featured).slice(0, 6);
  const displayProducts = signatureProducts.length > 0 ? signatureProducts : liveProducts.slice(0, 6);

  // Dynamic categories fallback to static
  const liveCategories = categories.length > 0 ? categories : CATEGORIES;

  const whatsappNum = websiteSettings.whatsapp_number || BAKERY_WHATSAPP_NUMBER;
  const heroImage = '/src/assets/images/hero_bakery_patisserie_1790177196310.jpg';

  return (
    <div className="bg-[#FFFDFB] min-h-screen text-[#2A1810] relative">
      
      {/* SECTION 1: LUXURY HERO (Matched to Reference Image) */}
      <section className="relative overflow-hidden min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center border-b border-[#F3DFE5]">
        
        {/* Full-bleed Panoramic Background Image */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={heroImage}
            alt="Cake N Crave Artisanal Patisserie and Floral Tiered Cakes"
            className="w-full h-full object-cover object-right lg:object-center"
          />
          {/* Subtle soft white & blush gradient scrim on the left for crisp text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:via-white/70 max-w-4xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/30 lg:hidden pointer-events-none" />
        </div>

        {/* Hero Content Overlay */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-24 w-full">
          <div className="max-w-xl space-y-6 sm:space-y-7">
            
            {/* 4 Blush Pill Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FFF0F4]/95 text-[#D83A6F] border border-[#F3DFE5] shadow-2xs backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>100% Eggless</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FFF0F4]/95 text-[#D83A6F] border border-[#F3DFE5] shadow-2xs backdrop-blur-xs">
                <Cake className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>Freshly Baked</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FFF0F4]/95 text-[#D83A6F] border border-[#F3DFE5] shadow-2xs backdrop-blur-xs">
                <Clock className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>Made After Order</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FFF0F4]/95 text-[#D83A6F] border border-[#F3DFE5] shadow-2xs backdrop-blur-xs">
                <Leaf className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>No Preservatives</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#2A1810] leading-[1.08] text-balance">
              Cakes Made with <br />
              <span className="text-[#D83A6F]">Love &amp; Care</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#2A1810]/80 font-normal tracking-wide">
              Eggless &bull; Freshly Baked &bull; Made After You Order
            </p>

            {/* Two Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to="/shop?category=Cakes"
                className="px-8 py-3.5 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-sm sm:text-base font-semibold rounded-full shadow-md hover:shadow-lg transition-all hover:scale-[1.02] text-center whitespace-nowrap"
              >
                Explore Cakes
              </Link>
              
              <Link
                to="/contact"
                className="px-8 py-3.5 bg-white hover:bg-[#FFF5F7] text-[#2A1810] border border-[#E5D5DA] text-sm sm:text-base font-semibold rounded-full shadow-xs hover:shadow-sm transition-all hover:scale-[1.02] text-center whitespace-nowrap"
              >
                Custom Orders
              </Link>
            </div>

            {/* Social Proof / Happy Customers */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center -space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#FFF0F4] border-2 border-white flex items-center justify-center text-sm shadow-xs">
                  🎂
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FCE3E9] border-2 border-white flex items-center justify-center text-sm shadow-xs">
                  🎂
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FFF0F4] border-2 border-white flex items-center justify-center text-sm shadow-xs">
                  🎂
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FCE3E9] border-2 border-white flex items-center justify-center text-sm shadow-xs">
                  🎂
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#2A1810]/80">
                <span className="font-bold text-[#2A1810]">500+</span> Happy Customers
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: SHOP BY ARTISANAL CATEGORY — 9 MAIN CATEGORIES */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#F3DFE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold">
              Shop by Category
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2A1810]">
              Explore Our Categories
            </h2>
            <p className="text-sm sm:text-base text-[#2A1810]/70 font-light">
              From bespoke celebration cakes to Korean bento boxes, dessert jars, cookies, and luxury hampers.
            </p>
          </div>

          {/* 9 Main Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {MAIN_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${encodeURIComponent(category.id)}`}
                className="group flex flex-col bg-[#FFFDFB] rounded-3xl overflow-hidden border border-[#F3DFE5] hover:border-[#D83A6F] hover:shadow-[0_12px_36px_rgba(216,58,111,0.09)] transition-all duration-300"
              >
                <div className="aspect-4/3 overflow-hidden bg-[#FFF5F7] relative">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.name}
                    fallbackText={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-[#D83A6F] border border-[#FCE3E9] shadow-xs">
                    {category.subcategories.length} Options
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1810] group-hover:text-[#D83A6F] transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#2A1810]/65 line-clamp-2 mt-1.5 leading-relaxed font-light">
                      {category.description}
                    </p>
                  </div>

                  {/* Explore Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFF0F4] group-hover:bg-[#D83A6F] text-[#D83A6F] group-hover:text-white rounded-full text-xs font-semibold transition-colors duration-200">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-xs text-[#2A1810]/50 font-medium group-hover:text-[#D83A6F] transition-colors">
                      100% Eggless
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 3: SIGNATURE BESTSELLERS */}
      <section className="py-16 sm:py-24 bg-[#FFF9F6] border-b border-[#F3DFE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 sm:mb-16 gap-4 text-center sm:text-left">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold block mb-1">
                Client Favourites
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2A1810]">
                Signature Creations
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#2A1810]/70 font-light">
                Handcrafted masterpieces loved across Jaipur birthdays, anniversaries, and grand celebrations.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#2A1810] hover:text-[#D83A6F] border-b border-[#2A1810]/30 pb-0.5 transition-colors"
            >
              <span>View Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 4: THE ART OF EGGLESS PATISSERIE (LUXURY CRAFTSMANSHIP) */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#F3DFE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Photo Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="aspect-4/3 rounded-3xl overflow-hidden border border-[#F3DFE5] shadow-xl bg-[#FFF9F6]">
                <ImageWithFallback
                  src="/src/assets/images/luxury_belgian_truffle_cake_1790175278847.jpg"
                  alt="Cake N Crave Belgian Chocolate Truffle Cake craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute -bottom-6 -right-6 hidden sm:block w-48 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-[#F3DFE5] shadow-lg">
                <div className="flex items-center gap-1.5 text-[#D83A6F] mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs font-bold text-[#2A1810]">"Melt-in-mouth texture"</p>
                <p className="text-[10px] text-[#2A1810]/60">500+ celebrations across Jaipur</p>
              </div>
            </div>

            {/* Right Story Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-block text-xs uppercase tracking-widest text-[#D83A6F] font-bold">
                Boutique Craftsmanship
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2A1810] leading-tight">
                The Art of Pure <br />
                <span className="italic font-normal text-[#D83A6F]">Eggless Pâtisserie</span>
              </h2>

              <p className="text-base sm:text-lg text-[#2A1810]/80 leading-relaxed font-light">
                We believe an eggless cake should never compromise on heavenly fluffiness, rich aroma, or decadent luxury.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-[#D83A6F] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#2A1810]">Single-Origin Belgian Couverture</h4>
                    <p className="text-xs text-[#2A1810]/70 font-light mt-0.5">
                      Silky 54% dark chocolate and pure cocoa butter for a deeply decadent ganache.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-[#D83A6F] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#2A1810]">Real Strawberries & Fruits</h4>
                    <p className="text-xs text-[#2A1810]/70 font-light mt-0.5">
                      Homemade fruit reductions with zero synthetic essences or artificial colorings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-[#D83A6F] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#2A1810]">Bespoke Hand-Piped Artistry</h4>
                    <p className="text-xs text-[#2A1810]/70 font-light mt-0.5">
                      Vintage Lambeth piping, customized calligraphy plaques, and satin ribbons tailored to your occasion.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#D83A6F] hover:underline"
                >
                  <span>Connect with our head baker</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: HOW TO ORDER IN 3 SIMPLE STEPS */}
      <section className="py-16 sm:py-20 bg-[#FFF5F7] border-b border-[#F3DFE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold">
              Effortless Gifting
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A1810]">
              How WhatsApp Ordering Works
            </h2>
            <p className="text-sm text-[#2A1810]/70 font-light">
              No complicated registrations or payments. Simply curate your cake and chat with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white rounded-3xl p-7 border border-[#F3DFE5] space-y-3 relative shadow-xs">
              <span className="font-serif text-4xl font-bold text-[#D83A6F]/30 block">01</span>
              <h3 className="font-serif text-xl font-bold text-[#2A1810]">Select & Customize</h3>
              <p className="text-xs sm:text-sm text-[#2A1810]/75 font-light leading-relaxed">
                Choose your favorite cake, preferred weight (from 0.5 Kg to 3 Kg), flavour, and personalized message.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-[#F3DFE5] space-y-3 relative shadow-xs">
              <span className="font-serif text-4xl font-bold text-[#D83A6F]/30 block">02</span>
              <h3 className="font-serif text-xl font-bold text-[#2A1810]">Click WhatsApp Order</h3>
              <p className="text-xs sm:text-sm text-[#2A1810]/75 font-light leading-relaxed">
                Our system instantly creates a neat formatted summary message ready to send with one click.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-[#F3DFE5] space-y-3 relative shadow-xs">
              <span className="font-serif text-4xl font-bold text-[#D83A6F]/30 block">03</span>
              <h3 className="font-serif text-xl font-bold text-[#2A1810]">Confirm & Enjoy in Jaipur</h3>
              <p className="text-xs sm:text-sm text-[#2A1810]/75 font-light leading-relaxed">
                We confirm baking schedule, delivery timing, and address details. Freshly baked and delivered to your doorstep.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 6: CLIENT REVIEWS */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#F3DFE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold">
              Sweet Words
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A1810]">
              Loved by Jaipur Celebrations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 bg-[#FFF9F6] rounded-3xl border border-[#F3DFE5] space-y-3">
              <div className="flex text-[#D83A6F]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#2A1810]/80 font-light italic leading-relaxed">
                "Ordered the Strawberry Dream for my sister's birthday in C-Scheme Jaipur. It was so fresh, gorgeous in photos, and 100% eggless. The WhatsApp ordering was effortless!"
              </p>
              <div className="pt-2 border-t border-[#F3DFE5]">
                <p className="text-xs font-bold text-[#2A1810]">Ananya Sharma</p>
                <p className="text-[10px] text-[#2A1810]/60">C-Scheme, Jaipur</p>
              </div>
            </div>

            <div className="p-6 bg-[#FFF9F6] rounded-3xl border border-[#F3DFE5] space-y-3">
              <div className="flex text-[#D83A6F]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#2A1810]/80 font-light italic leading-relaxed">
                "The Belgian Dark Truffle is on another level. Pure luxury chocolate with edible gold dust. My guests couldn't believe it was eggless. Will definitely order again."
              </p>
              <div className="pt-2 border-t border-[#F3DFE5]">
                <p className="text-xs font-bold text-[#2A1810]">Rohit Malpani</p>
                <p className="text-[10px] text-[#2A1810]/60">Vaishali Nagar, Jaipur</p>
              </div>
            </div>

            <div className="p-6 bg-[#FFF9F6] rounded-3xl border border-[#F3DFE5] space-y-3">
              <div className="flex text-[#D83A6F]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#2A1810]/80 font-light italic leading-relaxed">
                "The customized gift hamper with flowers and chocolate was packed so aesthetically with silk ribbons. Cake N Crave is our go-to for all family events."
              </p>
              <div className="pt-2 border-t border-[#F3DFE5]">
                <p className="text-xs font-bold text-[#2A1810]">Pooja & Karan</p>
                <p className="text-[10px] text-[#2A1810]/60">Malviya Nagar, Jaipur</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 7: FINAL LUXURY CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-b from-[#FFF5F7] to-[#FCEEF2] text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="w-14 h-14 rounded-full bg-white mx-auto flex items-center justify-center text-[#D83A6F] shadow-sm">
            <Heart className="w-6 h-6 stroke-[1.6]" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2A1810]">
            Planning a Sweet Celebration?
          </h2>

          <p className="text-base sm:text-lg text-[#2A1810]/75 max-w-xl mx-auto font-light leading-relaxed">
            Let us bake something unforgettable for your moments. We prepare each cake with devotion in Jaipur.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-[#2A1810] text-white hover:bg-[#D83A6F] text-xs sm:text-sm font-semibold rounded-full shadow-sm transition-all whitespace-nowrap"
            >
              Browse Full Cake Menu
            </Link>
            <a
              href={`https://wa.me/${BAKERY_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp: 7976541365</span>
            </a>
          </div>
        </div>
      </section>

      {/* FLOATING GREEN "CHAT WITH US" BUTTON (Matched to Reference Image) */}
      <a
        href={`https://wa.me/91${whatsappNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${websiteSettings.brand_name || 'Cake N Crave'}, I would like to chat with you about cakes and customized orders!`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-[#10B981] hover:bg-[#059669] text-white text-sm sm:text-base font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        title="Chat with us on WhatsApp"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span>Chat with us</span>
      </a>

    </div>
  );
}
