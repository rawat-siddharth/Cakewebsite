import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Menu,
  X,
  Phone,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { BAKERY_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { MAIN_CATEGORIES, MainCategory, SubCategory } from '../data/categories';
import { ImageWithFallback } from './ImageWithFallback';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [activeMegaCategory, setActiveMegaCategory] = useState<string | null>(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);

  const { totalCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setActiveMegaCategory(null);
  }, [location.pathname, location.search]);

  // Focus search input when toggled open
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(headerSearchQuery.trim())}`);
      setSearchOpen(false);
      setHeaderSearchQuery('');
    }
  };

  const handleMouseEnterNav = (catId: string) => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setActiveMegaCategory(catId);
  };

  const handleMouseLeaveNav = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaCategory(null);
    }, 150);
  };

  const handleSubcategoryClick = (cat: MainCategory, sub: SubCategory) => {
    setActiveMegaCategory(null);
    if (sub.isAll) {
      navigate(`/shop?category=${encodeURIComponent(cat.id)}`);
    } else {
      navigate(`/shop?category=${encodeURIComponent(cat.id)}&subcategory=${encodeURIComponent(sub.id)}`);
    }
  };

  const toggleMobileCat = (catId: string) => {
    setMobileExpandedCat((prev) => (prev === catId ? null : catId));
  };

  const activeCategoryData = MAIN_CATEGORIES.find((c) => c.id === activeMegaCategory);

  return (
    <header
      className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-[#FCE3E9]/80 shadow-xs transition-all"
      onMouseLeave={handleMouseLeaveNav}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 lg:gap-4">
          
          {/* Brand Logo with exact "CakenCrave" font styling & pink "n" */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="group flex items-center focus:outline-hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2A1810]">
                Cake<span className="text-[#D83A6F]">n</span>Crave
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links — 9 Main Categories */}
          <nav className="hidden xl:flex items-center space-x-2 2xl:space-x-3.5 text-[13px] 2xl:text-[14px] text-[#2A1810]/90">
            {MAIN_CATEGORIES.map((category) => {
              const isActive = activeMegaCategory === category.id;
              return (
                <div
                  key={category.id}
                  className="relative py-4"
                  onMouseEnter={() => handleMouseEnterNav(category.id)}
                >
                  <Link
                    to={`/shop?category=${encodeURIComponent(category.id)}`}
                    onClick={() => setActiveMegaCategory(null)}
                    className={`flex items-center gap-1 px-1.5 py-1 font-medium transition-all duration-150 rounded-lg ${
                      isActive
                        ? 'text-[#D83A6F] font-semibold'
                        : 'hover:text-[#D83A6F]'
                    }`}
                  >
                    <span>{category.name}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#2A1810]/50 transition-transform duration-200 ${
                        isActive ? 'rotate-180 text-[#D83A6F]' : ''
                      }`}
                    />
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Right Action Icons: Custom Cakes, Contact, Search & Cart */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            
            {/* Custom Cakes Link */}
            <Link
              to="/shop?category=cakes"
              className="hidden 2xl:inline-block text-xs sm:text-sm font-medium text-[#D83A6F] hover:text-[#C42B5E] transition-colors whitespace-nowrap"
            >
              Custom Cakes
            </Link>

            {/* Pink Contact Button */}
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs hover:shadow-md transition-all whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>Contact</span>
            </Link>

            {/* Search Trigger Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full text-[#2A1810] hover:bg-[#FFF0F4] hover:text-[#D83A6F] transition-colors focus:outline-hidden cursor-pointer"
              title="Search cakes & gifts"
              aria-label="Search cakes and gifts"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Cart Icon with count */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full text-[#2A1810] hover:bg-[#FFF0F4] transition-colors focus:outline-hidden"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] px-1 bg-[#D83A6F] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs tabular-nums">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="p-2 rounded-lg text-[#2A1810] hover:bg-[#FFF0F4] xl:hidden focus:outline-hidden cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 stroke-[1.8]" /> : <Menu className="w-6 h-6 stroke-[1.8]" />}
            </button>

          </div>

        </div>
      </div>

      {/* DESKTOP MEGA MENU DROPDOWN */}
      {activeCategoryData && (
        <div
          className="hidden xl:block absolute top-full left-0 w-full bg-white/98 backdrop-blur-md border-b border-[#F3DFE5] shadow-[0_20px_40px_rgba(42,24,16,0.08)] animate-in fade-in slide-in-from-top-2 duration-150 z-50"
          onMouseEnter={() => {
            if (megaMenuTimeoutRef.current) {
              clearTimeout(megaMenuTimeoutRef.current);
              megaMenuTimeoutRef.current = null;
            }
          }}
          onMouseLeave={handleMouseLeaveNav}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
            <div className="grid grid-cols-12 gap-8 items-start">
              
              {/* Left & Center: Subcategories Columns */}
              <div className="col-span-8 2xl:col-span-9">
                {/* Mega Menu Top Header */}
                <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[#F3DFE5]">
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold">
                      {activeCategoryData.name}
                    </span>
                    <span className="text-[#2A1810]/30">|</span>
                    <span className="text-xs text-[#2A1810]/70">
                      Explore subcategories tailored for every celebration
                    </span>
                  </div>
                  
                  <Link
                    to={`/shop?category=${encodeURIComponent(activeCategoryData.id)}`}
                    onClick={() => setActiveMegaCategory(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D83A6F] hover:text-[#C42B5E] transition-colors group"
                  >
                    <span>View All {activeCategoryData.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                {/* Subcategories Grid: Short, clean names without repeating parent category name */}
                <div className="grid grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-2">
                  {activeCategoryData.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSubcategoryClick(activeCategoryData, sub)}
                      className="group flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs sm:text-[13px] text-[#2A1810]/85 hover:text-[#D83A6F] hover:bg-[#FFF0F4] font-medium transition-all duration-150 cursor-pointer"
                    >
                      <span className="truncate">{sub.name}</span>
                      <ChevronRight className="w-3 h-3 text-[#2A1810]/25 group-hover:text-[#D83A6F] transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Side: Category Preview Card */}
              <div className="col-span-4 2xl:col-span-3 bg-[#FFFDFB] p-4 rounded-2xl border border-[#F3DFE5] flex flex-col justify-between">
                <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-3 bg-[#FFF5F7]">
                  <ImageWithFallback
                    src={activeCategoryData.image}
                    alt={activeCategoryData.name}
                    fallbackText={activeCategoryData.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#D83A6F] border border-[#FCE3E9]">
                    100% Eggless
                  </div>
                </div>

                <div>
                  <h4 className="font-serif text-base font-bold text-[#2A1810] mb-1">
                    {activeCategoryData.name}
                  </h4>
                  <p className="text-xs text-[#2A1810]/70 line-clamp-2 leading-relaxed mb-3">
                    {activeCategoryData.description}
                  </p>
                  
                  <Link
                    to={`/shop?category=${encodeURIComponent(activeCategoryData.id)}`}
                    onClick={() => setActiveMegaCategory(null)}
                    className="w-full py-2 bg-[#FFF0F4] hover:bg-[#D83A6F] text-[#D83A6F] hover:text-white border border-[#F3DFE5] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Browse {activeCategoryData.name}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Expandable Search Bar Drawer */}
      {searchOpen && (
        <div className="border-t border-[#F3DFE5] bg-[#FFFDFB] py-3.5 px-4 sm:px-8 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 text-[#D83A6F] absolute left-4 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search cakes, bento, jar cakes, cookies, chocolates, hampers, bouquets..."
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-3 bg-white border border-[#F3DFE5] rounded-full text-xs sm:text-sm text-[#2A1810] placeholder:text-[#2A1810]/45 focus:outline-hidden focus:border-[#D83A6F] shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-2.5 text-[11px] text-[#2A1810]/70">
              <span className="font-semibold text-[#D83A6F]">Quick Links:</span>
              <button
                type="button"
                onClick={() => {
                  navigate('/shop?category=cakes&subcategory=cakes-birthday');
                  setSearchOpen(false);
                }}
                className="hover:underline hover:text-[#D83A6F] cursor-pointer"
              >
                Birthday Cakes
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  navigate('/shop?category=bento-cakes');
                  setSearchOpen(false);
                }}
                className="hover:underline hover:text-[#D83A6F] cursor-pointer"
              >
                Bento Cakes
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  navigate('/shop?category=jar-cakes');
                  setSearchOpen(false);
                }}
                className="hover:underline hover:text-[#D83A6F] cursor-pointer"
              >
                Jar Cakes
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  navigate('/shop?category=hampers');
                  setSearchOpen(false);
                }}
                className="hover:underline hover:text-[#D83A6F] cursor-pointer"
              >
                Gift Hampers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu with Accordion Subcategories */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-[#FCE3E9] px-4 pt-3 pb-8 shadow-2xl animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#2A1810] hover:bg-[#FFF0F4]"
            >
              Home
            </Link>

            {/* 9 Main Categories Accordion */}
            {MAIN_CATEGORIES.map((cat) => {
              const isExpanded = mobileExpandedCat === cat.id;
              return (
                <div key={cat.id} className="border-b border-[#F3DFE5]/60 pb-1">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/shop?category=${encodeURIComponent(cat.id)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 px-3.5 py-2.5 text-sm font-medium text-[#2A1810] hover:text-[#D83A6F]"
                    >
                      {cat.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleMobileCat(cat.id)}
                      className="p-2 text-[#2A1810]/60 hover:text-[#D83A6F] focus:outline-hidden"
                      aria-label={`Toggle ${cat.name} subcategories`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-[#D83A6F]' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Subcategories Accordion Content */}
                  {isExpanded && (
                    <div className="bg-[#FFFDFB] rounded-2xl p-3 mb-2 grid grid-cols-2 gap-1.5 border border-[#FCE3E9]">
                      <Link
                        to={`/shop?category=${encodeURIComponent(cat.id)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="col-span-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#D83A6F] bg-[#FFF0F4]"
                      >
                        All {cat.name} →
                      </Link>
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          to={
                            sub.isAll
                              ? `/shop?category=${encodeURIComponent(cat.id)}`
                              : `/shop?category=${encodeURIComponent(cat.id)}&subcategory=${encodeURIComponent(sub.id)}`
                          }
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-2.5 py-1.5 rounded-lg text-xs text-[#2A1810]/80 hover:text-[#D83A6F] hover:bg-[#FFF0F4] font-medium truncate"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick Actions & Contact */}
            <div className="pt-4 mt-2 flex flex-col gap-2">
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-white bg-[#D83A6F] hover:bg-[#C42B5E] text-center shadow-xs"
              >
                Contact Bakery (+91 7976541365)
              </Link>

              <a
                href={`https://wa.me/${BAKERY_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-white bg-[#22C55E] hover:bg-[#16A34A] text-center flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp Baker</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
