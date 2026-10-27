import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  ChevronDown,
  User,
  ChevronLeft,
  ChevronRight,
  Cake,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { MAIN_CATEGORIES } from '../data/categories';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);

  const { totalCount } = useCart();
  const { websiteSettings } = useStore();

  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setShopDropdownOpen(false);
  }, [location.pathname, location.search]);

  // Focus search input when opened
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

  const handleMouseEnterShop = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setShopDropdownOpen(true);
  };

  const handleMouseLeaveShop = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShopDropdownOpen(false);
    }, 150);
  };

  const brandName = websiteSettings?.brand_name || 'Cake N Crave';

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-[#F3DFE5] transition-all">
      
      {/* =========================================================================
          TOP PROMOTIONAL ANNOUNCEMENT BAR (DALL·E 3 Reference Matched)
          < Mother's Day Treats! 10% OFF all orders this week | Use Code: MOM10 | Order Now -> >
      ========================================================================== */}
      <div className="bg-[#FFF2F5] border-b border-[#FCE3E9] text-[#2A1810] py-2 px-4 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-[13px] font-medium">
          <button
            type="button"
            className="p-1 text-[#9E8A85] hover:text-[#2A1810] transition-colors cursor-pointer"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 text-center truncate">
            <span className="truncate">
              Mother's Day Treats! <strong className="font-semibold text-[#D83A6F]">10% OFF</strong> all orders this week | Use Code:{' '}
              <span className="font-bold text-[#D83A6F] bg-white px-2 py-0.5 rounded border border-[#F3DFE5] shadow-2xs">
                MOM10
              </span>
            </span>
            <span className="text-[#9E8A85] hidden sm:inline">|</span>
            <Link
              to="/cakes"
              className="inline-flex items-center gap-0.5 font-bold text-[#D83A6F] hover:underline whitespace-nowrap ml-1"
            >
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            type="button"
            className="p-1 text-[#9E8A85] hover:text-[#2A1810] transition-colors cursor-pointer"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN NAVIGATION HEADER (Logo, Centered Nav, Right Icons)
      ========================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* LEFT: Cake N Crave Brand Logo with Whisk/Cake Icon */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="group flex items-center gap-2.5 focus:outline-hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              {/* Whisk / Cake Line Art Icon */}
              <div className="w-9 h-9 rounded-full bg-[#FFF0F4] border border-[#FCE3E9] flex items-center justify-center text-[#D83A6F] shadow-2xs group-hover:scale-105 transition-transform">
                <Cake className="w-5 h-5 stroke-[1.8]" />
              </div>

              {/* Logo Typography: Script / Serif Cake N Crave + BAKERY underneath */}
              <div className="flex flex-col">
                <span className="font-serif text-2xl sm:text-[26px] font-bold tracking-tight text-[#2A1810] leading-none group-hover:text-[#D83A6F] transition-colors">
                  Cake <span className="text-[#D83A6F] italic font-normal">n</span> Crave
                </span>
                <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#9E8A85] font-semibold mt-0.5">
                  BAKERY
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-[#2A1810]">
            
            <Link
              to="/"
              className={`transition-colors py-2 ${
                location.pathname === '/'
                  ? 'text-[#D83A6F] font-bold border-b-2 border-[#D83A6F]'
                  : 'hover:text-[#D83A6F]'
              }`}
            >
              Home
            </Link>

            {/* Shop Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={handleMouseEnterShop}
              onMouseLeave={handleMouseLeaveShop}
            >
              <Link
                to="/shop"
                className={`flex items-center gap-1 transition-colors ${
                  location.pathname === '/shop' || location.pathname === '/cakes'
                    ? 'text-[#D83A6F] font-bold'
                    : 'hover:text-[#D83A6F]'
                }`}
              >
                <span>Shop</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#9E8A85] transition-transform duration-200" />
              </Link>

              {shopDropdownOpen && (
                <div
                  className="absolute top-full left-0 w-52 bg-white rounded-2xl border border-[#F3DFE5] shadow-lg py-2 animate-in fade-in zoom-in-95 duration-150 z-50"
                  onMouseEnter={handleMouseEnterShop}
                  onMouseLeave={handleMouseLeaveShop}
                >
                  <Link
                    to="/cakes"
                    className="block px-4 py-2.5 text-xs font-semibold text-[#2A1810] hover:text-[#D83A6F] hover:bg-[#FFF0F4] transition-colors"
                  >
                    🎂 Cakes (By Flavor &amp; Occasion)
                  </Link>
                  <Link
                    to="/shop?category=bento-cakes"
                    className="block px-4 py-2.5 text-xs font-semibold text-[#2A1810] hover:text-[#D83A6F] hover:bg-[#FFF0F4] transition-colors"
                  >
                    🍱 Bento Cakes
                  </Link>
                  <Link
                    to="/shop?category=hampers"
                    className="block px-4 py-2.5 text-xs font-semibold text-[#2A1810] hover:text-[#D83A6F] hover:bg-[#FFF0F4] transition-colors"
                  >
                    🎁 Gift Hampers
                  </Link>
                  <Link
                    to="/shop"
                    className="block px-4 py-2 text-[11px] font-bold text-[#D83A6F] border-t border-[#F3DFE5] mt-1 pt-2 hover:underline"
                  >
                    View All Collections →
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/contact#about"
              className="hover:text-[#D83A6F] transition-colors py-2"
            >
              About Us
            </Link>

            <Link
              to="/cakes"
              className="hover:text-[#D83A6F] transition-colors py-2"
            >
              Gallery
            </Link>

            <Link
              to="/contact#faq"
              className="hover:text-[#D83A6F] transition-colors py-2"
            >
              FAQ
            </Link>

            <Link
              to="/contact"
              className={`transition-colors py-2 ${
                location.pathname === '/contact'
                  ? 'text-[#D83A6F] font-bold border-b-2 border-[#D83A6F]'
                  : 'hover:text-[#D83A6F]'
              }`}
            >
              Contact
            </Link>

          </nav>

          {/* RIGHT: Search, Profile, Cart, Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-full text-[#2A1810] hover:bg-[#FFF0F4] hover:text-[#D83A6F] transition-colors cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Profile / Account Trigger */}
            <Link
              to="/admin/login"
              className="p-2.5 rounded-full text-[#2A1810] hover:bg-[#FFF0F4] hover:text-[#D83A6F] transition-colors"
              title="Admin & Account"
              aria-label="Account"
            >
              <User className="w-5 h-5 stroke-[1.8]" />
            </Link>

            {/* Shopping Cart Bag */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-[#2A1810] hover:bg-[#FFF0F4] hover:text-[#D83A6F] transition-colors"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {totalCount > 0 && (
                <span className="absolute 1 top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#D83A6F] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs tabular-nums">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="p-2 rounded-xl text-[#2A1810] hover:bg-[#FFF0F4] lg:hidden cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 stroke-[1.8]" /> : <Menu className="w-6 h-6 stroke-[1.8]" />}
            </button>

          </div>

        </div>
      </div>

      {/* SEARCH BAR OVERLAY */}
      {searchOpen && (
        <div className="bg-white border-b border-[#F3DFE5] py-3 px-4 shadow-sm animate-in fade-in duration-150">
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center gap-2">
            <Search className="w-4 h-4 text-[#9E8A85] shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search cakes, bento boxes, hampers by flavor or occasion..."
              value={headerSearchQuery}
              onChange={(e) => setHeaderSearchQuery(e.target.value)}
              className="flex-1 text-xs sm:text-sm text-[#2A1810] placeholder:text-[#9E8A85] focus:outline-hidden bg-transparent"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#D83A6F] text-white text-xs font-semibold rounded-full hover:bg-[#C42B5E] transition-colors cursor-pointer"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-1 text-[#9E8A85] hover:text-[#2A1810] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* MOBILE SLIDE-DOWN DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#F3DFE5] px-5 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-[#2A1810]">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#F3DFE5] hover:text-[#D83A6F]"
            >
              Home
            </Link>
            <Link
              to="/cakes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#F3DFE5] hover:text-[#D83A6F] flex items-center justify-between"
            >
              <span>Cakes (By Flavor &amp; Occasion)</span>
              <span className="text-[10px] bg-[#FFF0F4] text-[#D83A6F] px-2 py-0.5 rounded-full">New</span>
            </Link>
            <Link
              to="/shop?category=bento-cakes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#F3DFE5] hover:text-[#D83A6F]"
            >
              Bento Cakes
            </Link>
            <Link
              to="/shop?category=hampers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#F3DFE5] hover:text-[#D83A6F]"
            >
              Gift Hampers
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#F3DFE5] hover:text-[#D83A6F]"
            >
              All Creations
            </Link>
            <Link
              to="/contact#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#F3DFE5] hover:text-[#D83A6F]"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#D83A6F]"
            >
              Contact &amp; Custom Orders
            </Link>
          </nav>
        </div>
      )}

    </header>
  );
}
