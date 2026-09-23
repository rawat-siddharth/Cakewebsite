import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Cake,
  FolderTree,
  ShoppingBag,
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Database
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut, isConfigured } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Cake },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Delivery Settings', path: '/admin/delivery', icon: Truck },
    { name: 'Website Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-[#2A1810] flex flex-col md:flex-row">
      
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden bg-white border-b border-[#F3DFE5] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-[#2A1810] hover:bg-[#FFF0F4] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif text-xl font-bold tracking-tight text-[#2A1810]">
            Cake<span className="text-[#D83A6F]">n</span>Crave <span className="text-xs font-sans uppercase font-bold text-[#D83A6F] bg-[#FFF0F4] px-2 py-0.5 rounded-full border border-[#F3DFE5]">Admin</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="p-2 text-[#D83A6F] hover:bg-[#FFF0F4] rounded-xl transition-colors"
            title="Open Storefront"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-[#2A1810]/60 hover:text-rose-600 rounded-xl transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#F3DFE5] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky md:top-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#F3DFE5] flex items-center justify-between">
          <div>
            <Link to="/admin" className="font-serif text-2xl font-bold text-[#2A1810] block">
              Cake<span className="text-[#D83A6F]">n</span>Crave
            </Link>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D83A6F]" />
              <span className="text-[11px] font-semibold text-[#D83A6F] uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-[#2A1810]/50 hover:text-[#2A1810]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase Status Indicator */}
        <div className="px-4 py-2.5 mx-4 my-3 rounded-2xl bg-[#FFF5F7] border border-[#F3DFE5] text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-[#D83A6F]" />
            <span className="font-medium text-[#2A1810]">
              {isConfigured ? 'Supabase Live' : 'Local Storage Mode'}
            </span>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
            title={isConfigured ? 'Connected to Supabase' : 'Configure keys in Settings'}
          />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FFF0F4] text-[#D83A6F] border border-[#F3DFE5] shadow-xs'
                    : 'text-[#2A1810]/75 hover:bg-[#FFF5F7] hover:text-[#2A1810]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D83A6F]' : 'text-[#2A1810]/50'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#F3DFE5] space-y-2 bg-[#FFFDFB]">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-[#2A1810]/70 hover:text-[#D83A6F] hover:bg-[#FFF0F4] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D83A6F]" />
              <span>View Storefront</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          {user && (
            <p className="text-[10px] text-[#2A1810]/40 px-2 truncate">
              {user.email}
            </p>
          )}
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>

    </div>
  );
}
