import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { recordPlacedOrder } from '../lib/supabase';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  generateWhatsAppOrderMessage,
  CustomerOrderDetails,
  BAKERY_WHATSAPP_NUMBER
} from '../utils/whatsapp';
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  MessageCircle,
  Calendar,
  MapPin,
  User,
  Phone,
  FileText,
  Sparkles,
  ShieldCheck,
  Truck
} from 'lucide-react';

export function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal, totalCount } = useCart();
  const { websiteSettings, deliverySettings } = useStore();

  const [customer, setCustomer] = useState<CustomerOrderDetails>({
    name: '',
    phone: '',
    deliveryDate: '',
    deliveryArea: '',
    specialInstructions: '',
  });

  const [selectedSlot, setSelectedSlot] = useState<string>(
    deliverySettings.available_slots[0] || 'Morning (10:00 AM - 1:00 PM)'
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderOnWhatsApp = async () => {
    if (items.length === 0) return;

    const instructionsWithSlot = selectedSlot
      ? `${customer.specialInstructions || ''}${customer.specialInstructions ? ' | ' : ''}Preferred Slot: ${selectedSlot}`
      : customer.specialInstructions;

    const orderPayload = {
      customer_name: customer.name || 'Guest Customer',
      customer_phone: customer.phone || '',
      delivery_date: customer.deliveryDate || '',
      delivery_area: customer.deliveryArea || deliverySettings.city || 'Jaipur',
      special_instructions: instructionsWithSlot,
      items: items.map((item) => ({
        id: item.id,
        productName: item.productName,
        selectedSize: item.selectedSize,
        selectedFlavour: item.selectedFlavours && item.selectedFlavours.length > 0
          ? item.selectedFlavours.join(' + ')
          : item.selectedFlavour,
        selectedFlavours: item.selectedFlavours,
        flavourDistribution: item.flavourDistribution,
        selectedAddOns: item.selectedAddOns,
        customMessage: item.customMessage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        specialInstructions: item.specialInstructions,
      })),
      subtotal: subtotal + (deliverySettings.delivery_fee || 0),
    };

    // Asynchronously record order in Supabase
    try {
      await recordPlacedOrder(orderPayload);
    } catch (err) {
      console.warn('Could not record order to Supabase', err);
    }

    const message = generateWhatsAppOrderMessage(
      items.map((item) => ({
        id: item.id,
        productName: item.productName,
        selectedSize: item.selectedSize,
        selectedFlavour: item.selectedFlavours && item.selectedFlavours.length > 0
          ? item.selectedFlavours.join(' + ')
          : item.selectedFlavour,
        selectedFlavours: item.selectedFlavours,
        flavourDistribution: item.flavourDistribution,
        selectedAddOns: item.selectedAddOns,
        customMessage: item.customMessage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        specialInstructions: item.specialInstructions,
      })),
      { ...customer, specialInstructions: instructionsWithSlot },
      subtotal + (deliverySettings.delivery_fee || 0)
    );

    const whatsappNum = websiteSettings.whatsapp_number || BAKERY_WHATSAPP_NUMBER;
    const whatsappUrl = `https://wa.me/91${whatsappNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#FFFDFB] min-h-[75vh] flex items-center justify-center py-20 px-4 text-[#2A1810]">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-[#F3DFE5] space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FFF0F4] mx-auto flex items-center justify-center text-[#D83A6F]">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#2A1810]">
            Your Bag is Empty
          </h2>
          <p className="text-sm text-[#2A1810]/70 font-light leading-relaxed">
            You haven’t added any cakes or gifts to your cart yet. Explore our handcrafted creations in Jaipur!
          </p>
          <div className="pt-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-full transition-colors shadow-xs"
            >
              <span>Explore Menu</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDFB] min-h-screen py-10 sm:py-16 text-[#2A1810]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 sm:mb-12 gap-3 pb-6 border-b border-[#F3DFE5]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold block mb-1">
              Curated Selection
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2A1810]">
              Your Shopping Bag
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#2A1810]/70">
              Review your customized creations before placing your order via WhatsApp.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D83A6F] hover:underline transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Add More Cakes</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-[#F3DFE5] divide-y divide-[#F3DFE5] overflow-hidden shadow-xs">
              {items.map((item) => (
                <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.slug}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#FFF5F7] border border-[#F3DFE5] shrink-0"
                  >
                    <ImageWithFallback
                      src={item.image}
                      alt={item.productName}
                      fallbackText={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Link
                      to={`/product/${item.slug}`}
                      className="font-serif text-lg sm:text-xl font-bold text-[#2A1810] hover:text-[#D83A6F] transition-colors line-clamp-1"
                    >
                      {item.productName}
                    </Link>

                    {/* Metadata lines */}
                    <div className="space-y-1 text-xs text-[#2A1810]/75">
                      {item.selectedSize && (
                        <div>
                          <span className="text-[#2A1810]/60">Weight:</span>{' '}
                          <span className="font-semibold text-[#2A1810]">{item.selectedSize}</span>
                        </div>
                      )}
                      {item.selectedFlavour || (item.selectedFlavours && item.selectedFlavours.length > 0) ? (
                        <div>
                          <span className="text-[#2A1810]/60">
                            {item.selectedFlavours && item.selectedFlavours.length > 1 ? 'Flavours:' : 'Flavour:'}
                          </span>{' '}
                          <span className="font-semibold text-[#D83A6F] bg-[#FFF0F4] px-2 py-0.5 rounded-md border border-[#F3DFE5]">
                            {item.selectedFlavour || item.selectedFlavours?.join(' + ')}
                          </span>
                        </div>
                      ) : null}
                      {item.flavourDistribution && (
                        <div>
                          <span className="text-[#2A1810]/60">Distribution:</span>{' '}
                          <span className="font-medium text-[#2A1810]">{item.flavourDistribution}</span>
                        </div>
                      )}
                      {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                        <div>
                          <span className="text-[#2A1810]/60">Add-ons:</span>{' '}
                          <span className="font-medium text-[#2A1810]">
                            {item.selectedAddOns.map((a) => `${a.name} (+₹${a.price})`).join(', ')}
                          </span>
                        </div>
                      )}
                      {item.customMessage && (
                        <div className="italic text-[#D83A6F] font-serif">
                          Piped message: "{item.customMessage}"
                        </div>
                      )}
                    </div>

                    <div className="pt-1 text-sm font-bold text-[#D83A6F] tabular-nums font-serif">
                      ₹{item.unitPrice} <span className="text-xs font-normal text-[#2A1810]/60">each</span>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                    <div className="flex items-center bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-3 py-1.5 text-xs text-[#2A1810] hover:bg-[#FFF0F4] transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3.5 py-1.5 text-xs font-bold text-[#2A1810] tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-3 py-1.5 text-xs text-[#2A1810] hover:bg-[#FFF0F4] transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-[#2A1810] tabular-nums sm:hidden font-serif">
                        ₹{item.unitPrice * item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-[#2A1810]/40 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Note on Eggless & Freshness */}
            <div className="p-4 bg-[#FFF5F7] rounded-2xl border border-[#F3DFE5] flex items-center gap-3 text-xs text-[#2A1810]/75">
              <Sparkles className="w-4 h-4 text-[#D83A6F] shrink-0" />
              <span>All items in your bag will be baked fresh and 100% pure eggless in our Jaipur boutique kitchen.</span>
            </div>
          </div>

          {/* Right Column: Order Details & WhatsApp Checkout Module */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Customer Details Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F3DFE5] shadow-xs space-y-5">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#2A1810]">
                  Delivery in Jaipur
                </h3>
                <p className="text-xs text-[#2A1810]/65 mt-1 font-light">
                  Included in your pre-formatted WhatsApp message for instant baker confirmation.
                </p>
              </div>

              <div className="space-y-4">
                {/* Customer Name */}
                <div>
                  <label htmlFor="cust-name" className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D83A6F]" />
                    <span>Your Name <span className="text-[#2A1810]/45 font-normal">(Optional)</span></span>
                  </label>
                  <input
                    id="cust-name"
                    name="name"
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={customer.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] placeholder:text-[#2A1810]/40 focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>

                {/* Customer Phone */}
                <div>
                  <label htmlFor="cust-phone" className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#D83A6F]" />
                    <span>Contact Number <span className="text-[#2A1810]/45 font-normal">(Optional)</span></span>
                  </label>
                  <input
                    id="cust-phone"
                    name="phone"
                    type="tel"
                    placeholder="e.g. 7976541365"
                    value={customer.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] placeholder:text-[#2A1810]/40 focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>

                {/* Preferred Delivery Date */}
                <div>
                  <label htmlFor="cust-date" className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#D83A6F]" />
                    <span>Preferred Delivery Date <span className="text-[#2A1810]/45 font-normal">(Optional)</span></span>
                  </label>
                  <input
                    id="cust-date"
                    name="deliveryDate"
                    type="date"
                    value={customer.deliveryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>

                {/* Delivery Area / Locality */}
                <div>
                  <label htmlFor="cust-area" className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D83A6F]" />
                    <span>Delivery Locality in Jaipur <span className="text-[#2A1810]/45 font-normal">(Optional)</span></span>
                  </label>
                  <input
                    id="cust-area"
                    name="deliveryArea"
                    type="text"
                    placeholder="e.g. Vaishali Nagar, Malviya Nagar, C-Scheme..."
                    value={customer.deliveryArea}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] placeholder:text-[#2A1810]/40 focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>

                {/* Preferred Delivery Time Slot */}
                {deliverySettings.available_slots.length > 0 && (
                  <div>
                    <label htmlFor="cust-slot" className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#D83A6F]" />
                      <span>Preferred Delivery Window</span>
                    </label>
                    <select
                      id="cust-slot"
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                    >
                      {deliverySettings.available_slots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <label htmlFor="cust-notes" className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#D83A6F]" />
                    <span>Special Delivery Notes <span className="text-[#2A1810]/45 font-normal">(Optional)</span></span>
                  </label>
                  <textarea
                    id="cust-notes"
                    name="specialInstructions"
                    rows={2}
                    placeholder="e.g. surprise gift, deliver around 6 PM..."
                    value={customer.specialInstructions}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] placeholder:text-[#2A1810]/40 focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>
              </div>

              {/* Order Summary & Pricing */}
              <div className="pt-4 border-t border-[#F3DFE5] space-y-2">
                <div className="flex justify-between text-xs text-[#2A1810]/70">
                  <span>Total Items</span>
                  <span className="font-semibold text-[#2A1810] tabular-nums">{totalCount}</span>
                </div>
                {deliverySettings.delivery_fee > 0 && (
                  <div className="flex justify-between text-xs text-[#2A1810]/70">
                    <span>Delivery Fee ({deliverySettings.city || 'Jaipur'})</span>
                    <span className="font-semibold text-[#2A1810] tabular-nums">₹{deliverySettings.delivery_fee}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#2A1810] pt-2 border-t border-[#F3DFE5]">
                  <span className="font-serif text-lg">Estimated Total</span>
                  <span className="text-2xl tabular-nums text-[#D83A6F] font-serif">
                    ₹{subtotal + (deliverySettings.delivery_fee || 0)}
                  </span>
                </div>
                <p className="text-[11px] text-[#2A1810]/55 italic pt-1">
                  100% Pure Eggless &middot; Hand-baked fresh in Jaipur upon your order.
                </p>
              </div>

              {/* Main CTA: Order on WhatsApp */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleOrderOnWhatsApp}
                  className="w-full py-4 px-6 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-2xl text-base font-semibold flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Send Order to WhatsApp</span>
                </button>

                <p className="text-center text-[11px] text-[#2A1810]/70 leading-relaxed font-light">
                  Opens WhatsApp with all items pre-filled to send directly to Cake N Crave (+91 7976541365).
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
