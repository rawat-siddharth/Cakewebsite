import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Clock,
  Sparkles,
  ChevronDown,
  X,
  MessageCircle,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { BAKERY_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { useStore } from '../context/StoreContext';

export function UpperHeader() {
  const { websiteSettings, deliverySettings } = useStore();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocality, setSelectedLocality] = useState(
    deliverySettings.city ? `All ${deliverySettings.city}` : 'All Jaipur'
  );

  const whatsappNum = websiteSettings.whatsapp_number || BAKERY_WHATSAPP_NUMBER;
  const locationText = websiteSettings.business_location || 'Jaipur, Rajasthan';
  const announcement = websiteSettings.announcement_text || '100% Pure Eggless Pâtisserie · Baked Fresh Daily in Jaipur';

  const jaipurLocalities = [
    { name: 'All Jaipur Areas', pin: 'Citywide', note: 'Standard delivery' },
    { name: 'Vaishali Nagar', pin: '302021', note: 'Prompt 2h-4h slots' },
    { name: 'Malviya Nagar', pin: '302017', note: 'Fresh temperature control' },
    { name: 'C-Scheme & Civil Lines', pin: '302001', note: 'Central delivery' },
    { name: 'Mansarovar', pin: '302020', note: 'All sectors' },
    { name: 'Raja Park & Tilak Nagar', pin: '302004', note: 'Daily routes' },
    { name: 'Jagatpura', pin: '302017', note: 'Pre-order delivery' },
    { name: 'Nirman Nagar & Shyam Nagar', pin: '302019', note: 'Direct van delivery' },
    { name: 'Bani Park & MI Road', pin: '302016', note: 'Central delivery' },
    { name: 'Vidhyadhar Nagar', pin: '302039', note: 'Scheduled slots' },
  ];

  const handleSelectLocality = (loc: string) => {
    setSelectedLocality(loc);
    setShowLocationModal(false);
  };

  return (
    <>
      {/* Top Utility Header Bar */}
      <aside
        aria-label="Bakery Upper Header and Quick Services"
        className="bg-gradient-to-r from-[#FFF5F7] via-[#FCEEF2] to-[#FFF5F7] border-b border-[#F3DFE5] text-[#2A1810] text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 relative z-40"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left: Location Pin & Eggless Badge */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Clickable Jaipur Location Selector */}
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1.5 font-medium hover:text-[#D83A6F] transition-colors py-0.5 cursor-pointer group"
              title="Change Jaipur delivery locality"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D83A6F] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="hidden xs:inline text-[#2A1810]/70">Deliver to:</span>
              <span className="font-semibold text-[#2A1810] underline decoration-[#D83A6F]/40 underline-offset-2 flex items-center gap-0.5">
                {selectedLocality}
                <ChevronDown className="w-3 h-3 text-[#2A1810]/50" />
              </span>
            </button>

            {/* Pure Eggless Indicator */}
            <div className="hidden md:flex items-center gap-1.5 border-l border-[#F3DFE5] pl-3 text-[#2A1810]/80">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="font-medium">100% Pure Eggless</span>
            </div>
          </div>

          {/* Center: Fresh Bake Notice / Tagline */}
          <div className="hidden lg:flex items-center gap-2 text-center text-[#2A1810]/75 font-normal tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#D83A6F]" />
            <span>{announcement}</span>
          </div>

          {/* Right: Direct Phone/WhatsApp & Hours */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 font-medium">
            
            {/* Business Hours */}
            <div className="hidden sm:flex items-center gap-1.5 text-[#2A1810]/70">
              <Clock className="w-3 h-3 text-[#2A1810]/50" />
              <span>9 AM - 9 PM</span>
            </div>

            <div className="hidden sm:inline text-[#D83A6F]/30 font-serif">·</div>

            {/* Direct Helpline / WhatsApp */}
            <a
              href={`https://wa.me/91${whatsappNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${websiteSettings.brand_name || 'Cake N Crave'}, I would like to inquire about ordering cakes in Jaipur.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#D83A6F] hover:text-[#C42B5E] font-semibold transition-colors"
              title="Chat with baker on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current text-[#22C55E]" />
              <span className="hidden xs:inline">WhatsApp:</span>
              <span className="tabular-nums font-bold">{whatsappNum}</span>
            </a>

            {/* Direct Call link for mobile */}
            <a
              href={`tel:+91${whatsappNum.replace(/[^0-9]/g, '')}`}
              className="sm:hidden p-1 rounded-full text-[#D83A6F] hover:bg-white/60"
              title="Call Bakery"
              aria-label="Call Bakery"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>

            <div className="hidden sm:inline text-[#D83A6F]/30 font-serif">·</div>

            {/* Admin Portal Button */}
            <Link
              to="/admin"
              className="flex items-center gap-1 text-[11px] font-semibold text-[#2A1810]/70 hover:text-[#D83A6F] bg-white/70 hover:bg-white px-2 py-0.5 rounded-md border border-[#F3DFE5] transition-colors"
              title="Open Admin Dashboard"
            >
              <ShieldCheck className="w-3 h-3 text-[#D83A6F]" />
              <span>Admin</span>
            </Link>

          </div>

        </div>
      </aside>

      {/* Jaipur Delivery Locality Selection Modal / Sheet */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 border border-[#F3DFE5] shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-labelledby="location-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F3DFE5]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#FFF0F4] flex items-center justify-center text-[#D83A6F]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="location-title" className="font-serif text-xl font-bold text-[#2A1810]">
                    Select Jaipur Locality
                  </h3>
                  <p className="text-[11px] text-[#2A1810]/60">
                    Handcrafted doorstep delivery across Jaipur city
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="p-2 rounded-full text-[#2A1810]/40 hover:text-[#2A1810] hover:bg-[#FFF0F4] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notice banner */}
            <div className="p-3 bg-[#FFF5F7] rounded-2xl border border-[#F3DFE5] flex items-start gap-2.5 text-xs text-[#2A1810]/80">
              <Truck className="w-4 h-4 text-[#D83A6F] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                All cakes are packed in specialized temperature-safe boxes and delivered by car/van to keep delicate designs intact.
              </p>
            </div>

            {/* Localities Grid */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {jaipurLocalities.map((item) => {
                const isSelected = selectedLocality === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectLocality(item.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF0F4] text-[#D83A6F] font-bold border border-[#F3DFE5]'
                        : 'bg-[#FFFDFB] text-[#2A1810] hover:bg-[#FFF5F7] border border-transparent'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-[13px]">{item.name}</p>
                      <p className="text-[10px] text-[#2A1810]/55">{item.note}</p>
                    </div>
                    <span className="text-[11px] text-[#2A1810]/50 font-mono">
                      {item.pin}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Locality Prompt */}
            <div className="pt-2 text-center border-t border-[#F3DFE5]">
              <p className="text-[11px] text-[#2A1810]/60">
                Don't see your specific address?{' '}
                <a
                  href={`https://wa.me/${BAKERY_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Cake N Crave, I would like to check delivery availability for my address in Jaipur.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D83A6F] font-semibold hover:underline"
                >
                  Confirm on WhatsApp &rarr;
                </a>
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
