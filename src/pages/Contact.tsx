import React from 'react';
import {
  MessageCircle,
  MapPin,
  Clock,
  Sparkles,
  Heart,
  Instagram,
  Send,
  HelpCircle,
  Phone
} from 'lucide-react';
import { BAKERY_WHATSAPP_NUMBER, BAKERY_INSTAGRAM } from '../utils/whatsapp';

export function Contact() {
  const directWhatsAppLink = `https://wa.me/${BAKERY_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hello Cake N Crave! I would like to inquire about your handcrafted eggless cakes and gifts in Jaipur.'
  )}`;

  const quickInquiries = [
    {
      title: 'Custom Celebration Cake',
      desc: 'Tiered cakes, vintage Lambeth, personalized themes & flavours.',
      text: 'Hello Cake N Crave! I want to discuss a customized celebration cake for an upcoming event in Jaipur.',
    },
    {
      title: 'Hampers & Bouquets',
      desc: 'Chocolate bouquets, flower combinations, and gift boxes.',
      text: 'Hello Cake N Crave! I am interested in ordering a luxury gift hamper or chocolate bouquet.',
    },
    {
      title: 'Delivery & Date Check',
      desc: 'Confirm availability for your specific Jaipur location and date.',
      text: 'Hello Cake N Crave! I would like to check cake availability for delivery in Jaipur on a specific date.',
    },
    {
      title: 'Wedding & Grand Events',
      desc: 'Multi-tiered centerpiece cakes and tasting consultation.',
      text: 'Hello Cake N Crave! We are planning a wedding/grand event in Jaipur and would love to discuss a cake setup.',
    },
  ];

  return (
    <div className="bg-[#FFFDFB] min-h-screen py-12 sm:py-20 text-[#2A1810]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Heading */}
        <div className="text-center max-w-xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D83A6F] bg-[#FFF0F4] px-4 py-1.5 rounded-full border border-[#F3DFE5]">
            <Heart className="w-3.5 h-3.5 text-[#D83A6F] fill-[#D83A6F]" />
            <span>Jaipur Artisanal Pâtisserie</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#2A1810] tracking-tight">
            We'd Love to Hear From You
          </h1>

          <p className="text-sm sm:text-base text-[#2A1810]/75 font-light leading-relaxed">
            Planning a celebration or have a custom cake idea in mind? Connect directly with our baker on WhatsApp.
          </p>
        </div>

        {/* Central Contact Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#F3DFE5] shadow-xs space-y-8">
          
          <div className="text-center space-y-2 pb-6 border-b border-[#F3DFE5]">
            <h2 className="font-serif text-3xl font-bold text-[#2A1810]">
              Cake<span className="text-[#D83A6F]">n</span>Crave
            </h2>
            <p className="text-xs uppercase tracking-widest text-[#D83A6F] font-semibold">
              Homemade 100% Eggless Cakes & Curated Gifts · Jaipur
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            
            {/* Location */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#FFFDFB] border border-[#F3DFE5]">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] flex items-center justify-center text-[#D83A6F] shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-[#D83A6F] font-bold block">
                  Location
                </span>
                <p className="text-sm font-semibold text-[#2A1810]">
                  Jaipur, Rajasthan, India
                </p>
                <p className="text-xs text-[#2A1810]/65 font-light">
                  Home delivery across all prime areas (Vaishali Nagar, Malviya Nagar, C-Scheme, Mansarovar & more).
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#FFFDFB] border border-[#F3DFE5]">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 flex items-center justify-center text-[#16A34A] shrink-0">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-[#16A34A] font-bold block">
                  Direct Baker WhatsApp
                </span>
                <p className="text-sm font-bold text-[#2A1810] tabular-nums">
                  +91 7976541365
                </p>
                <p className="text-xs text-[#2A1810]/65 font-light">
                  Instant order confirmation, custom designs, and inquiries.
                </p>
              </div>
            </div>

            {/* Baking & Ordering Hours */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#FFFDFB] border border-[#F3DFE5]">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] flex items-center justify-center text-[#D83A6F] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-[#D83A6F] font-bold block">
                  Ordering Hours
                </span>
                <p className="text-sm font-semibold text-[#2A1810]">
                  Mon – Sun: 9:00 AM – 9:00 PM
                </p>
                <p className="text-xs text-[#2A1810]/65 font-light">
                  Please place celebration orders at least 24 hours in advance.
                </p>
              </div>
            </div>

            {/* Instagram Community */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#FFFDFB] border border-[#F3DFE5]">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] flex items-center justify-center text-[#D83A6F] shrink-0">
                <Instagram className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-[#D83A6F] font-bold block">
                  Instagram
                </span>
                <a
                  href={`https://instagram.com/${BAKERY_INSTAGRAM}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[#D83A6F] hover:underline block"
                >
                  @{BAKERY_INSTAGRAM}
                </a>
                <p className="text-xs text-[#2A1810]/65 font-light">
                  See our daily freshly piped cake reels and client photos.
                </p>
              </div>
            </div>

          </div>

          {/* Quick Inquiry Options */}
          <div className="space-y-3 pt-4 border-t border-[#F3DFE5]">
            <h3 className="font-serif text-xl font-bold text-[#2A1810]">
              Start a Conversation by Topic
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickInquiries.map((inq) => (
                <a
                  key={inq.title}
                  href={`https://wa.me/${BAKERY_WHATSAPP_NUMBER}?text=${encodeURIComponent(inq.text)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-[#FFF5F7] border border-[#F3DFE5] hover:border-[#D83A6F] hover:bg-[#FFF0F4] transition-all group flex flex-col justify-between text-left"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#2A1810] group-hover:text-[#D83A6F] transition-colors">
                      {inq.title}
                    </h4>
                    <p className="text-[11px] text-[#2A1810]/65 mt-0.5 leading-relaxed font-light">
                      {inq.desc}
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] font-semibold text-[#D83A6F] flex items-center gap-1">
                    <span>Chat on WhatsApp</span>
                    <Send className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Big Primary WhatsApp Button */}
          <div className="pt-2 text-center space-y-3">
            <a
              href={directWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 w-full py-4 px-8 bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold rounded-full shadow-sm hover:shadow-md transition-all text-sm sm:text-base cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Chat with Baker on WhatsApp (+91 7976541365)</span>
            </a>
            <p className="text-xs text-[#2A1810]/60 font-light">
              We respond promptly during baking and business hours.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
