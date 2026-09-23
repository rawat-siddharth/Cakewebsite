import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PRODUCTS, Product, CakeAddOn } from '../data/products';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { recordPlacedOrder } from '../lib/supabase';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  getFlavourCombinationPrice,
  STANDARD_CAKE_ADDONS,
} from '../utils/pricing';
import {
  generateSingleProductOrderMessage,
} from '../utils/whatsapp';
import {
  MessageCircle,
  ShoppingBag,
  ArrowLeft,
  Check,
  AlertCircle,
  Heart,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Users,
  Clock,
  Plus,
  Minus,
  Calendar,
  FileText,
} from 'lucide-react';

const BAKERY_DIRECT_PHONE = '917976541365';

export function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products: storeProducts } = useStore();

  // Combine with local product data so all options & pricing tables are present
  const localProduct = PRODUCTS.find((p) => p.slug === slug || p.id === slug);
  const storeProduct = storeProducts.find((p) => p.slug === slug || p.id === slug);
  const rawProduct = localProduct
    ? { ...storeProduct, ...localProduct }
    : storeProduct || PRODUCTS[0];

  const product: Product = {
    ...rawProduct,
    description: rawProduct?.description || '',
  } as Product;

  const standardCakeWeights = ['500g', '1kg', '2kg'];

  const weightServingMap: Record<string, string> = {
    '250g': 'Serves 1-2',
    '250g (Single Bento)': 'Serves 1-2',
    '350g': 'Serves 2-3',
    '350g (Grand Bento)': 'Serves 2-3',
    '500g': 'Serves 4-6',
    '0.5 Kg': 'Serves 4-6',
    '1kg': 'Serves 8-10',
    '1 Kg': 'Serves 8-10',
    '1.5kg': 'Serves 12-14',
    '1.5 Kg': 'Serves 12-14',
    '2kg': 'Serves 16-20',
    '2 Kg': 'Serves 16-20',
    '2.5 Kg': 'Serves 20-24',
    '3kg': 'Party (25+)',
    '3 Kg': 'Party (25+)',
  };

  const availableSizesList = useMemo(() => {
    if (!product) return [];
    if (product.weightOptions && product.weightOptions.length > 0) {
      return product.weightOptions;
    }
    const sizes = (product as any).available_sizes || product.availableSizes;
    if (product.category === 'Cakes') {
      return sizes && sizes.length > 0 ? sizes : standardCakeWeights;
    }
    return sizes || [];
  }, [product]);

  const flavoursList: string[] = useMemo(() => {
    if (!product) return [];
    if (product.flavourOptions && product.flavourOptions.length > 0) {
      return product.flavourOptions;
    }
    return (product as any).available_flavours || product.availableFlavours || [];
  }, [product]);

  const availableAddOns: CakeAddOn[] = useMemo(() => {
    if (product?.addOns && product.addOns.length > 0) {
      return product.addOns;
    }
    if (product?.category === 'Cakes' || product?.category === 'Bento Cakes') {
      return STANDARD_CAKE_ADDONS;
    }
    return [];
  }, [product]);

  // States - strictly single flavour per cake
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedFlavour, setSelectedFlavour] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<CakeAddOn[]>([]);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState<boolean>(false);

  // Initialize defaults when product changes
  useEffect(() => {
    if (product) {
      if (product.slug === 'strawberry-dream') {
        setSelectedSize('1 Kg');
      } else if (product.slug === 'custom-birthday-cake') {
        setSelectedSize('1kg');
      } else if (availableSizesList.length > 0) {
        setSelectedSize(availableSizesList[0]);
      } else {
        setSelectedSize('');
      }

      if (flavoursList.length > 0) {
        setSelectedFlavour(flavoursList[0]);
      } else {
        setSelectedFlavour('');
      }

      setSelectedImageIndex(0);
      setSelectedAddOns([]);
      setCustomMessage('');
      setDeliveryDate('');
      setSpecialInstructions('');
      setQuantity(1);
      setValidationError('');
      setAddedSuccess(false);
      window.scrollTo(0, 0);
    }
  }, [product?.id, product?.slug]);

  const handleAddOnToggle = (addOn: CakeAddOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addOn.id);
      if (exists) {
        return prev.filter((a) => a.id !== addOn.id);
      } else {
        return [...prev, addOn];
      }
    });
  };

  // Dynamic Base Cake Price for selected weight & single chosen flavour
  const baseCakePrice = useMemo(() => {
    if (!product || !selectedSize) {
      return null;
    }
    if (flavoursList.length > 0 && !selectedFlavour) {
      return null;
    }
    const flavours = selectedFlavour ? [selectedFlavour] : [];
    return getFlavourCombinationPrice(product, selectedSize, flavours);
  }, [product, selectedSize, selectedFlavour, flavoursList.length]);

  // Add-ons subtotal
  const addOnsTotal = useMemo(() => {
    return selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  }, [selectedAddOns]);

  // Unit price (Base Cake + Add-ons)
  const currentUnitPrice = useMemo(() => {
    if (baseCakePrice === null) return null;
    return baseCakePrice + addOnsTotal;
  }, [baseCakePrice, addOnsTotal]);

  // Total order item price (Unit price * Quantity)
  const currentTotalPrice = useMemo(() => {
    if (currentUnitPrice === null) return null;
    return currentUnitPrice * quantity;
  }, [currentUnitPrice, quantity]);

  // Today's minimum date for Jaipur deliveries (YYYY-MM-DD)
  const minDeliveryDate = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Formatted WhatsApp message preview
  const formattedOrderMessage = useMemo(() => {
    if (!product) return '';
    return generateSingleProductOrderMessage({
      productName: product.name,
      selectedSize: selectedSize || undefined,
      selectedFlavour: selectedFlavour || undefined,
      selectedFlavours: selectedFlavour ? [selectedFlavour] : undefined,
      selectedAddOns,
      customMessage: customMessage || undefined,
      quantity,
      price: currentUnitPrice || product.price,
      unitPrice: currentUnitPrice || product.price,
      deliveryDate: deliveryDate || undefined,
      specialInstructions: specialInstructions || undefined,
    });
  }, [
    product,
    selectedSize,
    selectedFlavour,
    selectedAddOns,
    customMessage,
    quantity,
    currentUnitPrice,
    deliveryDate,
    specialInstructions,
  ]);

  if (!product) {
    return (
      <div className="bg-[#FFFDFB] min-h-[70vh] flex items-center justify-center py-20 px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-[#F3DFE5] space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#FCEEF2] mx-auto flex items-center justify-center text-[#D83A6F]">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#49312E]">
            Creation Not Found
          </h2>
          <p className="text-sm text-[#49312E]/70 font-light">
            The bake you are looking for is currently unavailable or has moved.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-full transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Collection</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const validateSelections = (): boolean => {
    if (availableSizesList.length > 0 && !selectedSize) {
      setValidationError('Please select a cake weight.');
      return false;
    }
    if (flavoursList.length > 0 && !selectedFlavour) {
      setValidationError('Please select a flavour for your cake.');
      return false;
    }
    if (baseCakePrice === null) {
      setValidationError(
        'This flavour selection is available via custom request. Please tap "Order on WhatsApp" to order directly.'
      );
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelections() || currentUnitPrice === null) return;

    addToCart({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: product.images[0] || '',
      selectedSize: selectedSize || undefined,
      selectedFlavour: selectedFlavour,
      selectedFlavours: selectedFlavour ? [selectedFlavour] : undefined,
      selectedAddOns: selectedAddOns.length > 0 ? selectedAddOns : undefined,
      customMessage: customMessage.trim() || undefined,
      quantity,
      unitPrice: currentUnitPrice,
      deliveryDate: deliveryDate || undefined,
      specialInstructions: specialInstructions || undefined,
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 4500);
  };

  const handleDirectWhatsAppOrder = async () => {
    if (!validateSelections() || currentUnitPrice === null) return;

    try {
      await recordPlacedOrder({
        customer_name: 'WhatsApp Customer',
        customer_phone: '',
        delivery_date: deliveryDate || '',
        delivery_area: 'Jaipur',
        special_instructions: specialInstructions || '',
        items: [
          {
            id: product.id,
            productName: product.name,
            selectedSize: selectedSize || undefined,
            selectedFlavour: selectedFlavour,
            selectedFlavours: selectedFlavour ? [selectedFlavour] : undefined,
            selectedAddOns: selectedAddOns.length > 0 ? selectedAddOns : undefined,
            customMessage: customMessage.trim() || undefined,
            quantity,
            unitPrice: currentUnitPrice,
            specialInstructions: specialInstructions || undefined,
          },
        ],
        subtotal: currentUnitPrice * quantity,
      });
    } catch (err) {
      console.warn('Could not record direct order in Supabase', err);
    }

    const whatsappNum = BAKERY_DIRECT_PHONE;
    const url = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
      formattedOrderMessage
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const imagesList = product.images && product.images.length > 0 ? product.images : [''];

  return (
    <div className="bg-[#FFFDFB] min-h-screen pb-24 text-[#49312E]">
      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-[#F3DFE5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-[#49312E]/70 font-medium">
            <Link to="/" className="hover:text-[#D83A6F] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#49312E]/35" />
            <Link
              to={`/shop?category=${encodeURIComponent(product.category)}`}
              className="hover:text-[#D83A6F] transition-colors"
            >
              {product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#49312E]/35" />
            <span className="text-[#49312E] font-semibold truncate max-w-[260px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Details Layout: 50% Left / 50% Right on Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          
          {/* ========================================================
              LEFT SIDE (50% width on Desktop):
              - Large cake/product image
              - Image gallery thumbnails below
              - Rounded corners, clean soft cream background
          ======================================================== */}
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Main Showcase Image Container */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#FFF9F6] border border-[#F3DFE5] p-3 sm:p-4 flex items-center justify-center shadow-xs">
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-[#D83A6F] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs">
                  {((product as any).is_new ?? (product as any).isNew)
                    ? 'New Signature'
                    : 'Boutique Selection'}
                </span>
              </div>

              {/* Pure Eggless Indicator */}
              <div
                className="absolute top-4 right-4 z-10 w-7 h-7 bg-white rounded-lg border-2 border-[#D83A6F] flex items-center justify-center shadow-2xs"
                title="100% Pure Eggless Confectionery"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#D83A6F]" />
              </div>

              <div className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-2xs">
                <ImageWithFallback
                  src={imagesList[selectedImageIndex]}
                  alt={product.name}
                  fallbackText={product.name}
                  className="w-full h-full object-cover rounded-2xl transition-transform duration-500 hover:scale-103"
                />
              </div>
            </div>

            {/* Image Gallery Thumbnails */}
            {imagesList.length > 1 && (
              <div className="flex gap-3 pt-1 overflow-x-auto pb-1">
                {imagesList.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-18 h-18 sm:w-20 sm:h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#D83A6F] ring-2 ring-[#D83A6F]/25 scale-102 shadow-xs'
                        : 'border-[#F3DFE5] opacity-75 hover:opacity-100 bg-[#FFF9F6]'
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fallbackText={product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Artisanal Guarantee Badge */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#F3DFE5] space-y-2 text-xs text-[#49312E]/75 shadow-2xs">
              <div className="flex items-center gap-2 font-serif text-sm font-bold text-[#49312E]">
                <Sparkles className="w-4 h-4 text-[#D83A6F]" />
                <span>Cake N Crave Artisanal Promise</span>
              </div>
              <p className="font-light leading-relaxed">
                Handcrafted freshly upon your order in small batches in Jaipur. 100% Eggless, gelatine-free, using finest bakery ingredients.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[#D83A6F] font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {((product as any).advance_order_notice ||
                    (product as any).advanceOrderNotice) ||
                    'Freshly baked to order in Jaipur.'}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT SIDE (50% width on Desktop):
              Clean vertical layout in exact requested order:
              1. Product name
              2. Short product description
              3. Dynamic price
              4. Weight dropdown
              5. Flavour dropdown (Single flavour only)
              6. Custom cake message input
              7. Add-ons (if applicable)
              8. Quantity selector
              9. Preferred delivery date
              10. Special instructions
              11. Selection summary
              12. Add to Cart button
              13. Order on WhatsApp button
          ======================================================== */}
          <div className="space-y-6">
            
            {/* 1. Product Name */}
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#49312E] tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* 2. Short Product Description */}
              <p className="text-sm sm:text-base text-[#49312E]/80 leading-relaxed font-light mt-2">
                {product.description}
              </p>

              {/* 3. Dynamic Price (Prominently displayed) */}
              <div className="mt-3.5 pb-4 border-b border-[#F3DFE5] flex items-baseline gap-3 flex-wrap">
                {currentUnitPrice !== null ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-[#D83A6F] tabular-nums">
                      ₹{currentUnitPrice}
                    </span>
                    {quantity > 1 && (
                      <span className="text-xs text-[#49312E]/60 font-medium">
                        (₹{currentTotalPrice} for {quantity} cakes)
                      </span>
                    )}
                    <span className="text-xs text-[#49312E]/60 font-medium">
                      · 100% Pure Eggless
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-serif font-bold text-amber-700">
                    Custom Pricing on Request
                  </span>
                )}
              </div>
            </div>

            {/* Validation Notice if any */}
            {validationError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2 shadow-2xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{validationError}</span>
              </div>
            )}

            {/* 4. Weight Dropdown */}
            {availableSizesList.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="cake-weight-select"
                    className="block text-sm font-bold text-[#49312E]"
                  >
                    Select Cake Weight
                  </label>
                  {selectedSize && weightServingMap[selectedSize] && (
                    <span className="text-xs text-[#D83A6F] font-semibold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{weightServingMap[selectedSize]}</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <select
                    id="cake-weight-select"
                    value={selectedSize}
                    onChange={(e) => {
                      setSelectedSize(e.target.value);
                      setValidationError('');
                    }}
                    className="w-full bg-white border border-[#F3DFE5] focus:border-[#E8A0B4] focus:ring-2 focus:ring-[#E8A0B4]/20 rounded-2xl px-4 py-3 text-sm text-[#49312E] font-medium appearance-none cursor-pointer pr-10 shadow-2xs transition-all"
                  >
                    <option value="" disabled>
                      Choose weight
                    </option>
                    {availableSizesList.map((weight: string) => {
                      const serving = weightServingMap[weight] || '';
                      return (
                        <option key={weight} value={weight}>
                          {weight} {serving ? `(${serving})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#49312E]/60 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* 5. Flavour Dropdown (Single Flavour Selection Only) */}
            {flavoursList.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="cake-flavour-select"
                    className="block text-sm font-bold text-[#49312E]"
                  >
                    Select Cake Flavour
                  </label>
                  <span className="text-xs text-[#D83A6F] font-semibold bg-[#FCEEF2] px-2.5 py-0.5 rounded-full border border-[#F3DFE5]">
                    1 Flavour per Cake
                  </span>
                </div>

                <div className="relative">
                  <select
                    id="cake-flavour-select"
                    value={selectedFlavour}
                    onChange={(e) => {
                      setSelectedFlavour(e.target.value);
                      setValidationError('');
                    }}
                    className="w-full bg-white border border-[#F3DFE5] focus:border-[#E8A0B4] focus:ring-2 focus:ring-[#E8A0B4]/20 rounded-2xl px-4 py-3 text-sm text-[#49312E] font-medium appearance-none cursor-pointer pr-10 shadow-2xs transition-all"
                  >
                    <option value="" disabled>
                      Choose flavour
                    </option>
                    {flavoursList.map((flav: string) => (
                      <option key={flav} value={flav}>
                        {flav}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#49312E]/60 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* 6. Custom Cake Message Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="custom-cake-message"
                className="block text-sm font-bold text-[#49312E]"
              >
                Custom Message on Cake (Optional)
              </label>
              <input
                id="custom-cake-message"
                type="text"
                maxLength={35}
                placeholder="e.g. Happy Birthday Priya! 🎂"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#F3DFE5] text-xs sm:text-sm text-[#49312E] focus:outline-hidden focus:border-[#E8A0B4] focus:ring-2 focus:ring-[#E8A0B4]/20 shadow-2xs transition-all"
              />
              <p className="text-[11px] text-[#49312E]/60">
                Piped in artisan fresh cream on cake plaque (up to 35 characters).
              </p>
            </div>

            {/* 7. Add-ons (if applicable) */}
            {availableAddOns.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#F3DFE5]">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-[#49312E]">
                    Celebration Add-ons (Optional)
                  </label>
                  {selectedAddOns.length > 0 && (
                    <span className="text-xs text-[#D83A6F] font-semibold">
                      +{selectedAddOns.length} selected (+₹{addOnsTotal})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableAddOns.map((addon) => {
                    const isSelected = selectedAddOns.some((a) => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => handleAddOnToggle(addon)}
                        className={`p-2.5 sm:p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#D83A6F] bg-[#FCEEF2] text-[#49312E] shadow-2xs'
                            : 'border-[#F3DFE5] bg-white text-[#49312E]/80 hover:bg-[#FFF9F6]'
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="text-xs font-semibold text-[#49312E]">
                            {addon.name}
                          </div>
                          {addon.description && (
                            <div className="text-[10px] text-[#49312E]/60 line-clamp-1">
                              {addon.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-[#D83A6F] tabular-nums font-serif">
                            +₹{addon.price}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#D83A6F] border-[#D83A6F] text-white'
                                : 'border-[#F3DFE5] bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. Quantity Selector */}
            <div className="space-y-1.5 pt-2 border-t border-[#F3DFE5]">
              <label className="block text-sm font-bold text-[#49312E]">
                Quantity
              </label>
              <div className="inline-flex items-center bg-white border border-[#F3DFE5] rounded-2xl overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 text-xs text-[#49312E] hover:bg-[#FCEEF2] transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-5 py-2.5 text-sm font-bold text-[#49312E] tabular-nums min-w-[3rem] text-center font-serif">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2.5 text-xs text-[#49312E] hover:bg-[#FCEEF2] transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 9. Preferred Delivery Date */}
            <div className="space-y-1.5 pt-2 border-t border-[#F3DFE5]">
              <label
                htmlFor="delivery-date-input"
                className="block text-sm font-bold text-[#49312E] flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-[#D83A6F]" />
                <span>Preferred Delivery Date</span>
              </label>
              <input
                id="delivery-date-input"
                type="date"
                min={minDeliveryDate}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#F3DFE5] text-xs sm:text-sm text-[#49312E] font-medium focus:outline-hidden focus:border-[#E8A0B4] focus:ring-2 focus:ring-[#E8A0B4]/20 shadow-2xs transition-all"
              />
              <p className="text-[11px] text-[#49312E]/60">
                Freshly prepared on your chosen celebration date in Jaipur.
              </p>
            </div>

            {/* 10. Special Instructions */}
            <div className="space-y-1.5 pt-2 border-t border-[#F3DFE5]">
              <label
                htmlFor="special-instructions-input"
                className="block text-sm font-bold text-[#49312E] flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-[#D83A6F]" />
                <span>Special Instructions / Dietary Notes (Optional)</span>
              </label>
              <input
                id="special-instructions-input"
                type="text"
                placeholder="e.g. Less sweet, nut allergy, call before delivery..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#F3DFE5] text-xs sm:text-sm text-[#49312E] focus:outline-hidden focus:border-[#E8A0B4] focus:ring-2 focus:ring-[#E8A0B4]/20 shadow-2xs transition-all"
              />
            </div>

            {/* ========================================================
                11. SELECTION SUMMARY (Instant Live Update)
            ======================================================== */}
            <div className="p-4 sm:p-5 bg-[#FFF9F6] rounded-2xl border border-[#F3DFE5] space-y-3 shadow-2xs">
              <div className="text-xs font-bold text-[#49312E] uppercase tracking-wider">
                Your Selection
              </div>

              <div className="space-y-1.5 text-xs text-[#49312E]/80">
                <div className="flex justify-between">
                  <span className="text-[#49312E]/60">Weight:</span>
                  <span className="font-semibold text-[#49312E]">
                    {selectedSize || 'Not selected'}
                  </span>
                </div>
                {flavoursList.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#49312E]/60">Flavour:</span>
                    <span className="font-semibold text-[#D83A6F]">
                      {selectedFlavour || 'Not selected'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#49312E]/60">Quantity:</span>
                  <span className="font-semibold text-[#49312E]">
                    {quantity}
                  </span>
                </div>
                {deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-[#49312E]/60">Delivery Date:</span>
                    <span className="font-medium text-[#49312E]">
                      {deliveryDate}
                    </span>
                  </div>
                )}
                {customMessage && (
                  <div className="flex justify-between">
                    <span className="text-[#49312E]/60">Cake Message:</span>
                    <span className="font-medium italic text-[#D83A6F]">
                      "{customMessage}"
                    </span>
                  </div>
                )}
              </div>

              {/* Price Calculation Lines */}
              <div className="pt-2.5 border-t border-[#F3DFE5] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#49312E]/75">
                  <span>Cake Price:</span>
                  <span className="font-medium text-[#49312E] tabular-nums">
                    {baseCakePrice !== null ? `₹${baseCakePrice * quantity}` : '—'}
                  </span>
                </div>

                {addOnsTotal > 0 && (
                  <div className="flex justify-between text-[#49312E]/75">
                    <span>Add-ons:</span>
                    <span className="font-medium text-[#49312E] tabular-nums">
                      +₹{addOnsTotal * quantity}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#F3DFE5] flex justify-between items-baseline font-bold text-[#49312E]">
                  <span className="text-sm">Total:</span>
                  <span className="text-xl font-serif text-[#D83A6F] tabular-nums">
                    {currentTotalPrice !== null ? `₹${currentTotalPrice}` : 'Custom Pricing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Added to Cart Success Notification */}
            {addedSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>
                    Added <strong>{product.name}</strong> ({selectedFlavour}) to your bag!
                  </span>
                </div>
                <Link
                  to="/cart"
                  className="font-bold underline text-emerald-900 hover:text-emerald-700 ml-3 shrink-0"
                >
                  View Cart &rarr;
                </Link>
              </div>
            )}

            {/* 12. Add to Cart Button & 13. Order on WhatsApp Button */}
            <div className="space-y-2.5 pt-1">
              {currentUnitPrice !== null ? (
                <>
                  {/* Prominent Pink Button: Add to Cart */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-4 px-6 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-sm font-bold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  {/* Secondary Button: Order on WhatsApp */}
                  <button
                    type="button"
                    onClick={handleDirectWhatsAppOrder}
                    className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Order on WhatsApp</span>
                  </button>
                </>
              ) : (
                <a
                  href={`https://wa.me/${BAKERY_DIRECT_PHONE}?text=${encodeURIComponent(
                    `Hello Cake N Crave! I would like to get custom pricing for ${product.name} (${selectedSize}) in flavour: ${selectedFlavour}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Enquire Custom Pricing on WhatsApp</span>
                </a>
              )}

              {/* Message preview toggle */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppPreview(!showWhatsAppPreview)}
                  className="text-[11px] text-[#49312E]/60 hover:text-[#D83A6F] transition-colors underline cursor-pointer"
                >
                  {showWhatsAppPreview ? 'Hide WhatsApp Message Preview' : 'Preview WhatsApp Order Message'}
                </button>

                {showWhatsAppPreview && (
                  <div className="mt-3 p-3.5 bg-[#FFF9F6] rounded-2xl border border-[#F3DFE5] text-left font-mono text-[11px] text-[#49312E] whitespace-pre-wrap select-all overflow-x-auto">
                    {formattedOrderMessage}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
