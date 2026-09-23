import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F6] text-[#49312E] selection:bg-[#FCEEF2] selection:text-[#49312E]">
      {/* Sticky Global Navigation Header */}
      <Header />

      {/* Main Route Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
