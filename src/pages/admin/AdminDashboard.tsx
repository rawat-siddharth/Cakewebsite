import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cake,
  FolderTree,
  ShoppingBag,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { getProducts, getCategories, getOrders, isSupabaseConfigured } from '../../lib/supabase';
import { DatabaseProduct, DatabaseCategory, DatabaseOrder } from '../../types/supabase';

export function AdminDashboard() {
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [orders, setOrders] = useState<DatabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [p, c, o] = await Promise.all([
          getProducts({ onlyPublished: false }),
          getCategories({ onlyPublished: false }),
          getOrders(),
        ]);
        setProducts(p);
        setCategories(c);
        setOrders(o);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.is_published && p.is_available).length;
  const draftProducts = products.filter((p) => !p.is_published || !p.is_available).length;
  const totalCategories = categories.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const isConfigured = isSupabaseConfigured();

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-[#FFF0F4] border border-[#F3DFE5] flex items-center justify-center text-[#D83A6F] animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="mt-3 text-xs text-[#2A1810]/60 font-medium">Loading Cake N Crave Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Greetings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F3DFE5]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold block mb-1">
            Boutique Pâtisserie Manager
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A1810]">
            Overview Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#2A1810]/65">
            Manage your Jaipur store catalog, cake prices, images, and WhatsApp orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Cake</span>
          </Link>
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#F3DFE5] hover:bg-[#FFF0F4] text-[#2A1810] text-xs font-semibold rounded-2xl shadow-xs transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[#D83A6F]" />
            <span>Storefront</span>
          </Link>
        </div>
      </div>

      {/* Supabase Status Alert if not connected */}
      {!isConfigured && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold">Supabase Environment Variables Pending</p>
              <p className="text-[11px] text-amber-800/80">
                You are currently in local sandbox mode. Add <code className="font-mono bg-white/70 px-1 rounded">VITE_SUPABASE_URL</code> &amp; <code className="font-mono bg-white/70 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> or save them in Website Settings to sync to Supabase cloud.
              </p>
            </div>
          </div>
          <Link
            to="/admin/settings"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0"
          >
            Configure Keys
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Products */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2A1810]/70 uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#FFF0F4] flex items-center justify-center text-[#D83A6F]">
              <Cake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-serif text-[#2A1810] tabular-nums">
            {totalProducts}
          </div>
          <p className="text-[11px] text-[#2A1810]/55">
            Active in catalog
          </p>
        </div>

        {/* Published Products */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2A1810]/70 uppercase tracking-wider">
              Published Live
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-serif text-emerald-600 tabular-nums">
            {publishedProducts}
          </div>
          <p className="text-[11px] text-[#2A1810]/55">
            Visible on customer storefront
          </p>
        </div>

        {/* Draft Products */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2A1810]/70 uppercase tracking-wider">
              Draft / Hidden
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-serif text-amber-600 tabular-nums">
            {draftProducts}
          </div>
          <p className="text-[11px] text-[#2A1810]/55">
            Unpublished or out-of-stock
          </p>
        </div>

        {/* Categories */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2A1810]/70 uppercase tracking-wider">
              Categories
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#FFF0F4] flex items-center justify-center text-[#D83A6F]">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-serif text-[#2A1810] tabular-nums">
            {totalCategories}
          </div>
          <p className="text-[11px] text-[#2A1810]/55">
            Cakes, Bento, Bouquets, Hampers
          </p>
        </div>

      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-3xl border border-[#F3DFE5] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F3DFE5]">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#2A1810] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D83A6F]" />
              <span>Recent WhatsApp Placed Orders</span>
            </h2>
            <p className="text-xs text-[#2A1810]/60 mt-0.5">
              Captured when customers click &ldquo;Send Order to WhatsApp&rdquo; in their shopping bag.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-[#D83A6F] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 px-4 space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FFF0F4] text-[#D83A6F] mx-auto flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#2A1810]">No Orders Recorded Yet</p>
            <p className="text-xs text-[#2A1810]/60 max-w-sm mx-auto">
              When customers configure cakes and click &ldquo;Send Order to WhatsApp&rdquo;, their order details, delivery dates, and custom messages will automatically appear here for baker management.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F3DFE5] overflow-x-auto">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2A1810]">{order.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                      order.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[#2A1810]/70">
                    Customer: <strong className="text-[#2A1810]">{order.customer_name || 'Guest'}</strong> ({order.customer_phone || 'No phone'}) · Locality: {order.delivery_area || 'Jaipur'}
                  </p>
                  <p className="text-[11px] text-[#2A1810]/55">
                    {order.items.length} item(s): {order.items.map((i) => i.productName).join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#D83A6F] tabular-nums font-serif">
                      ₹{order.subtotal}
                    </p>
                    <p className="text-[10px] text-[#2A1810]/45">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                  <Link
                    to="/admin/orders"
                    className="p-2 text-[#D83A6F] hover:bg-[#FFF0F4] rounded-xl transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
