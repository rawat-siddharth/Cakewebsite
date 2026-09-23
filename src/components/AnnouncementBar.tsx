import React from 'react';

export function AnnouncementBar() {
  return (
    <aside aria-label="Bakery Announcements" className="bg-gradient-to-r from-[#FFF5F7] via-[#FCEEF2] to-[#FFF5F7] border-b border-[#F3DFE5] py-2 px-4 text-center">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs tracking-wider text-[#2A1810]/85 font-medium">
        <span>100% Pure Eggless Pâtisserie</span>
        <span className="text-[#D83A6F]/50 font-serif">·</span>
        <span className="hidden xs:inline">Baked Fresh Daily on Order</span>
        <span className="hidden sm:inline text-[#D83A6F]/50 font-serif">·</span>
        <span className="hidden sm:inline">Handcrafted in Jaipur</span>
        <span className="text-[#D83A6F]/50 font-serif">·</span>
        <a
          href="https://wa.me/917976541365"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#D83A6F] hover:underline font-semibold"
        >
          WhatsApp: 7976541365
        </a>
      </div>
    </aside>
  );
}
