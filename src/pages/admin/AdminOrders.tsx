import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Phone,
  Calendar,
  MapPin,
  FileText,
  User,
  Sparkles,
  Save,
  Search,
  Filter
} from 'lucide-react';
import { getOrders, updateOrderStatus } from '../../lib/supabase';
import { DatabaseOrder, OrderStatus } from '../../types/supabase';

export function AdminOrders() {
  const [orders, setOrders] = useState<DatabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DatabaseOrder | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
        setInternalNotes(data[0].internal_notes || '');
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSelectOrder = (order: DatabaseOrder) => {
    setSelectedOrder(order);
    setInternalNotes(order.internal_notes || '');
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Order status updated to "${newStatus}"`);
    } catch (err) {
      showToast('Failed to update order status');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    setSavingNotes(true);
    try {
      await updateOrderStatus(selectedOrder.id, selectedOrder.status, internalNotes);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, internal_notes: internalNotes } : o
        )
      );
      showToast('Internal baker notes saved');
    } catch (err) {
      showToast('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customer_phone && order.customer_phone.includes(searchQuery)) ||
      (order.delivery_area && order.delivery_area.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2A1810] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-5 border-b border-[#F3DFE5]">
        <span className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold block mb-1">
          Bakery Fulfillment
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#2A1810]">
          Orders &amp; WhatsApp Inquiries
        </h1>
        <p className="mt-1 text-xs text-[#2A1810]/65">
          Real order records captured directly from the customer bag before opening WhatsApp.
        </p>
      </div>

      {/* Workflow Explanation Banner */}
      <div className="p-4 bg-[#FFF5F7] rounded-3xl border border-[#F3DFE5] flex items-start gap-3 text-xs text-[#2A1810]/80">
        <Sparkles className="w-4 h-4 text-[#D83A6F] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-[11px] leading-relaxed">
          <p className="font-bold text-[#2A1810]">How Cake N Crave WhatsApp Orders are Managed:</p>
          <p>
            When a customer clicks &ldquo;Send Order to WhatsApp&rdquo; in their shopping bag, the system securely saves the order to Supabase and opens WhatsApp with the baker (+91 7976541365). You can update production stages here from <strong>Pending &rarr; Confirmed &rarr; Preparing &rarr; Ready &rarr; Delivered</strong>.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#F3DFE5] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#D83A6F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, phone, or Jaipur locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] placeholder:text-[#2A1810]/40 focus:outline-hidden focus:border-[#D83A6F]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#2A1810]/50" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing in Kitchen</option>
            <option value="ready">Ready for Pickup/Van</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Orders List on Left, Selected Order Detail on Right */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#2A1810]/60">
          <Sparkles className="w-6 h-6 text-[#D83A6F] animate-spin mx-auto mb-2" />
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#F3DFE5] space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#FFF0F4] text-[#D83A6F] mx-auto flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#2A1810]">
            No Orders Recorded Yet
          </h3>
          <p className="text-xs text-[#2A1810]/60 max-w-md mx-auto leading-relaxed">
            As customers add cakes to their bag on the storefront and proceed with WhatsApp checkout, their real customized order items, delivery dates, and calligraphy messages will be recorded here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Order List */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#F3DFE5] divide-y divide-[#F3DFE5] overflow-hidden shadow-xs max-h-[700px] overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <p className="p-6 text-center text-xs text-[#2A1810]/60">
                No orders match your filter.
              </p>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => handleSelectOrder(order)}
                    className={`w-full p-4 text-left transition-colors cursor-pointer block ${
                      isSelected ? 'bg-[#FFF0F4]' : 'hover:bg-[#FFFDFB]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-[#2A1810]">
                        {order.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#2A1810] truncate">
                        {order.customer_name || 'Guest Order'}
                      </span>
                      <span className="font-serif font-bold text-[#D83A6F] tabular-nums">
                        ₹{order.subtotal}
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] text-[#2A1810]/60 flex items-center gap-2">
                      <span>{order.items.length} item(s)</span>
                      <span>·</span>
                      <span className="truncate">{order.delivery_area || 'Jaipur'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Order Detail View */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#F3DFE5] p-6 sm:p-7 shadow-xs space-y-6">
            {selectedOrder ? (
              <>
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F3DFE5]">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#D83A6F] font-bold">
                      Order Breakdown
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#2A1810]">
                      {selectedOrder.id}
                    </h2>
                    <p className="text-[11px] text-[#2A1810]/55">
                      Placed: {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : 'Recent'}
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#2A1810]/70">Status:</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                      className="px-3 py-1.5 text-xs font-bold bg-[#FFFDFB] border border-[#F3DFE5] rounded-xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F] cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Customer Details Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FFFDFB] border border-[#F3DFE5] text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#D83A6F] block">
                      Customer
                    </span>
                    <p className="font-semibold text-[#2A1810] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#D83A6F]" />
                      <span>{selectedOrder.customer_name || 'Not provided'}</span>
                    </p>
                    <p className="text-[#2A1810]/70 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#D83A6F]" />
                      <span>{selectedOrder.customer_phone || 'No phone'}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#D83A6F] block">
                      Delivery in Jaipur
                    </span>
                    <p className="text-[#2A1810] font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D83A6F]" />
                      <span>{selectedOrder.delivery_area || 'Jaipur address'}</span>
                    </p>
                    <p className="text-[#2A1810]/70 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#D83A6F]" />
                      <span>Date: {selectedOrder.delivery_date || 'Flexible / Today'}</span>
                    </p>
                  </div>

                  {selectedOrder.special_instructions && (
                    <div className="sm:col-span-2 pt-2 border-t border-[#F3DFE5] text-[11px] text-[#2A1810]/80">
                      <span className="font-bold text-[#D83A6F]">Delivery Notes: </span>
                      <span>{selectedOrder.special_instructions}</span>
                    </div>
                  )}
                </div>

                {/* Ordered Items List */}
                <div className="space-y-3">
                  <h4 className="font-serif text-lg font-bold text-[#2A1810]">
                    Ordered Creations
                  </h4>
                  <div className="border border-[#F3DFE5] rounded-2xl divide-y divide-[#F3DFE5] overflow-hidden">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3.5 text-xs space-y-1 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2A1810]">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="font-serif font-bold text-[#D83A6F] tabular-nums">
                            ₹{item.unitPrice * item.quantity}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] text-[#2A1810]/70">
                          {item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}
                          {item.selectedFlavour && <span>· Flavour: <strong>{item.selectedFlavour}</strong></span>}
                        </div>
                        {item.customMessage && (
                          <p className="text-[11px] italic text-[#D83A6F] font-serif bg-[#FFF5F7] px-2.5 py-1 rounded-lg">
                            Calligraphy: &ldquo;{item.customMessage}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center pt-2 text-sm font-bold text-[#2A1810]">
                    <span>Total Amount</span>
                    <span className="text-xl font-serif text-[#D83A6F] tabular-nums">
                      ₹{selectedOrder.subtotal}
                    </span>
                  </div>
                </div>

                {/* Internal Baker Notes */}
                <div className="space-y-2 pt-2 border-t border-[#F3DFE5]">
                  <label className="block text-xs font-semibold text-[#2A1810] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#D83A6F]" />
                    <span>Internal Kitchen Notes (Private)</span>
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="e.g. Paid via UPI, extra sprinkles requested, driver assigned..."
                      className="flex-1 px-4 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="px-4 py-2 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingNotes ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                </div>

                {/* Direct Contact Customer Button */}
                {selectedOrder.customer_phone && (
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/91${selectedOrder.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hello ${selectedOrder.customer_name || 'there'}! This is Cake N Crave regarding your order (${selectedOrder.id}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Message Customer on WhatsApp (+91 {selectedOrder.customer_phone})</span>
                    </a>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center py-20 text-xs text-[#2A1810]/50">
                Select an order on the left to view details.
              </p>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
