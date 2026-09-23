import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { BAKERY_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { useStore } from '../context/StoreContext';

export function Footer() {
  const { websiteSettings } = useStore();
  const currentYear = new Date().getFullYear();
  const whatsappNum = websiteSettings.whatsapp_number || BAKERY_WHATSAPP_NUMBER;
  const brandName = websiteSettings.brand_name || 'Cake N Crave';
  const location = websiteSettings.business_location || 'Jaipur, Rajasthan, India';

  return (
    <footer className="bg-white border-t border-[#F3DFE5] pt-16 pb-12 text-[#2A1810]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-[#F3DFE5]">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#2A1810]">
                Cake<span className="text-[#D83A6F]">n</span>Crave
              </span>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed text-[#2A1810]/75 font-light">
              Boutique 100% pure eggless pâtisserie, customized celebration cakes, and curated floral gift hampers in Jaipur.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#D83A6F] bg-[#FFF0F4] px-3.5 py-1.5 rounded-full border border-[#F3DFE5]">
              <Sparkles className="w-3.5 h-3.5 text-[#D83A6F]" />
              <span>100% Pure Vegetarian &amp; Eggless</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold mb-4">
              Explore Menu
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/" className="text-[#2A1810]/75 hover:text-[#D83A6F] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-[#2A1810]/75 hover:text-[#D83A6F] transition-colors">
                  Shop All Collections
                </Link>
              </li>
              <li>
                <Link to="/product/strawberry-dream" className="text-[#2A1810]/75 hover:text-[#D83A6F] transition-colors">
                  Signature Strawberry Dream
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-[#2A1810]/75 hover:text-[#D83A6F] transition-colors">
                  Your Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#2A1810]/75 hover:text-[#D83A6F] transition-colors">
                  Contact &amp; Baker Inquiry
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold mb-4">
              Artisanal Categories
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/shop?category=cakes" className="text-[#2A1810]/75 hover:text-[#D83A6F] transition-colors">
                  Cakes
                </Link>
              </li>
              <li>
                <Link to="/shop?category=bento-cakes" className="text-[#2A1810]/75 hover:text-[#D83A6F] transition-colors">
                  Bento Cakes
                </Link>
              </li>
              <li>
                <Link to="/shop?category=desserts" className="text-[#2A1810]/75 hover:text-[#D83A6F] transition-colors">
                  Desserts &amp; Jar Cakes
                </Link>
              </li>
              <li>
                <Link to="/shop?category=cupcakes" className="text-[#2A1810]/75 hover:text-[#D83A6F] transition-colors">
                  Cupcakes &amp; Combos
                </Link>
              </li>
              <li>
                <Link to="/shop?category=cookies" className="text-[#2A1810]/75 hover:text-[#D83A6F] transition-colors">
                  Cookies &amp; Chocolates
                </Link>
              </li>
              <li>
                <Link to="/shop?category=hampers" className="text-[#2A1810]/75 hover:text-[#D83A6F] transition-colors">
                  Hampers &amp; Bouquets
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3.5">
            <h3 className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold mb-4">
              Bakery Concierge
            </h3>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2A1810]/80">
              <MapPin className="w-4 h-4 text-[#D83A6F] shrink-0 mt-0.5" />
              <span>{location}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2A1810]/80">
              <MessageCircle className="w-4 h-4 text-[#22C55E] fill-current shrink-0 mt-0.5" />
              <a
                href={`https://wa.me/91${whatsappNum.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-semibold text-[#2A1810]"
              >
                +91 {whatsappNum} (WhatsApp)
              </a>
            </div>
            <div className="pt-2">
              <a
                href={`https://wa.me/91${whatsappNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${brandName}! I would like to inquire about your cakes.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFF0F4] hover:bg-[#FDE8EE] text-[#D83A6F] border border-[#F3DFE5] text-xs font-semibold rounded-full transition-colors"
              >
                <span>Direct WhatsApp Chat</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#2A1810]/60 gap-4">
          <p>
            &copy; {currentYear} {brandName}. All rights reserved. Handcrafted in Jaipur.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>Handcrafted with</span>
              <Heart className="w-3.5 h-3.5 text-[#D83A6F] fill-[#D83A6F] inline" />
              <span>for your sweet celebrations</span>
            </div>
            <span>&middot;</span>
            <Link
              to="/admin"
              className="hover:text-[#D83A6F] flex items-center gap-1 transition-colors text-[11px] opacity-75 hover:opacity-100"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D83A6F]" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
