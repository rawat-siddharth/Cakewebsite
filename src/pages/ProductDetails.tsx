import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { PRODUCTS, Product, CakeAddOn } from '../data/products';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { recordPlacedOrder } from '../lib/supabase';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { getFlavourCombinationPrice, STANDARD_CAKE_ADDONS } from '../utils/pricing';
import { extractProductDetails, HamperContentItem } from '../data/categorySettings';
import {
  MessageCircle,
  ShoppingBag,
  ArrowLeft,
  Check,
  AlertCircle,
  Heart,
  ChevronRight,
  Star,
  CheckCircle2,
  Share2,
  Calendar,
  Clock,
  Sparkles,
  Gift,
  FileText,
  Flame,
  Award,
  Tag
} from 'lucide-react';

const BAKERY_DIRECT_PHONE = '917976541365';

export function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products: storeProducts } = useStore();

  // Look up product in store, localStorage, or static dataset
  const localProduct = PRODUCTS.find((p) => p.slug === slug || p.id === slug);
  const storeProduct = storeProducts.find((p) => p.slug === slug || p.id === slug);

  const cachedProduct = useMemo(() => {
    if (typeof window !== 'undefined' && slug) {
      try {
        const cached = localStorage.getItem('cnc_local_products');
        if (cached) {
          const list = JSON.parse(cached);
          return list.find((p: any) => p.slug === slug || p.id === slug);
        }
      } catch (e) {}
    }
    return null;
  }, [slug]);

  const rawProduct = storeProduct || cachedProduct || localProduct || PRODUCTS[0];

  const product: Product = {
    ...rawProduct,
    description: rawProduct?.description || '',
  } as Product;

  // Extract structured options based on category
  const extracted = useMemo(() => extractProductDetails(product), [product]);
  const { categoryKey } = extracted;

  const isHamper = categoryKey === 'hampers';
  const isBento = categoryKey === 'bento-cakes';
  const isDessert = categoryKey === 'desserts';
  const isBouquet = categoryKey === 'bouquets';
  const isCookie = categoryKey === 'cookies';
  const isCake = categoryKey === 'cakes';

  // Available sizes or packages
  const availableSizesList = useMemo(() => {
    if (extracted.selectedSizes && extracted.selectedSizes.length > 0) {
      return extracted.selectedSizes;
    }
    if (product.weightOptions && product.weightOptions.length > 0) {
      return product.weightOptions;
    }
    return ['Standard'];
  }, [extracted.selectedSizes, product.weightOptions]);

  // Flavours List
  const flavoursList: string[] = useMemo(() => {
    if (isHamper) return [];
    if (extracted.selectedFlavours && extracted.selectedFlavours.length > 0) {
      return extracted.selectedFlavours;
    }
    if (product.flavourOptions && product.flavourOptions.length > 0) {
      return product.flavourOptions;
    }
    return (product as any).available_flavours || product.availableFlavours || [];
  }, [extracted.selectedFlavours, isHamper, product]);

  const flavorFromUrl = searchParams.get('flavor') || '';

  // COMPONENT STATES
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedFlavour, setSelectedFlavour] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);

  // COMPLIMENTARY ADD-ONS (DALL·E 3 Reference Matched)
  const [includeCandles, setIncludeCandles] = useState<boolean>(true);
  const [includeTopper, setIncludeTopper] = useState<boolean>(true);
  const [topperText, setTopperText] = useState<string>('Happy Birthday');
  const [includeGiftTag, setIncludeGiftTag] = useState<boolean>(true);

  // Initialize defaults
  useEffect(() => {
    if (product) {
      if (availableSizesList.length > 0) {
        setSelectedSize(availableSizesList[0]);
      } else {
        setSelectedSize('');
      }

      if (flavorFromUrl && flavoursList.some((f) => f.toLowerCase() === flavorFromUrl.toLowerCase())) {
        const matched = flavoursList.find((f) => f.toLowerCase() === flavorFromUrl.toLowerCase());
        setSelectedFlavour(matched || flavoursList[0] || '');
      } else if (flavoursList.length > 0) {
        setSelectedFlavour(flavoursList[0]);
      } else {
        setSelectedFlavour('');
      }

      setSelectedImageIndex(0);
      setCustomMessage('');
      setDeliveryDate('');
      setQuantity(1);
      setValidationError('');
      setAddedSuccess(false);

      // Check wishlist
      try {
        const stored = localStorage.getItem('cnc_wishlist');
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list) && list.includes(product.id)) {
            setIsWishlisted(true);
          }
        }
      } catch (e) {}

      window.scrollTo(0, 0);
    }
  }, [product?.id, product?.slug, availableSizesList, flavoursList, flavorFromUrl]);

  const toggleWishlist = () => {
    try {
      const stored = localStorage.getItem('cnc_wishlist');
      let list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];
      if (list.includes(product.id)) {
        list = list.filter((id: string) => id !== product.id);
        setIsWishlisted(false);
      } else {
        list.push(product.id);
        setIsWishlisted(true);
      }
      localStorage.setItem('cnc_wishlist', JSON.stringify(list));
    } catch (e) {}
  };

  // Dynamic Base Price calculation
  const basePrice = useMemo(() => {
    if (!product || !selectedSize) {
      return null;
    }

    if (selectedFlavour) {
      const comboPrice = getFlavourCombinationPrice(product, selectedSize, [selectedFlavour]);
      if (typeof comboPrice === 'number' && comboPrice > 0) {
        return comboPrice;
      }
    }

    if (extracted.sizePricing[selectedSize] !== undefined && Number(extracted.sizePricing[selectedSize]) > 0) {
      return Number(extracted.sizePricing[selectedSize]);
    }

    const fallbackCombo = getFlavourCombinationPrice(product, selectedSize, selectedFlavour ? [selectedFlavour] : []);
    if (typeof fallbackCombo === 'number' && fallbackCombo > 0) {
      return fallbackCombo;
    }

    return Number(product.price) || 649;
  }, [product, selectedSize, selectedFlavour, extracted.sizePricing]);

  const currentUnitPrice = basePrice;
  const currentTotalPrice = currentUnitPrice !== null ? currentUnitPrice * quantity : null;

  // Formatted WhatsApp message
  const formattedOrderMessage = useMemo(() => {
    if (!product) return '';

    const lines: string[] = [];
    lines.push(`Hello Cake N Crave! I would like to place an order.`);
    lines.push('');
    lines.push(`*Product:* ${product.name}`);
    if (selectedSize) lines.push(`*Weight / Size:* ${selectedSize}`);
    if (selectedFlavour) lines.push(`*Flavor:* ${selectedFlavour}`);

    // Complimentary add-ons
    const comp: string[] = [];
    if (includeCandles) comp.push('Free Candles');
    if (includeTopper) comp.push(`Free Acrylic Topper ("${topperText}")`);
    if (includeGiftTag) comp.push('Free Handwritten Gift Tag');
    if (comp.length > 0) lines.push(`*Complimentary Add-ons:* ${comp.join(' • ')}`);

    if (customMessage.trim()) lines.push(`*Gift Note / Plaque:* "${customMessage.trim()}"`);
    if (deliveryDate.trim()) lines.push(`*Preferred Delivery Date:* ${deliveryDate.trim()}`);

    lines.push(`*Quantity:* ${quantity}`);
    lines.push(`*Total Amount:* ₹${currentTotalPrice || product.price}`);

    return lines.join('\n');
  }, [
    product,
    selectedSize,
    selectedFlavour,
    includeCandles,
    includeTopper,
    topperText,
    includeGiftTag,
    customMessage,
    deliveryDate,
    quantity,
    currentTotalPrice,
  ]);

  if (!product) {
    return (
      <div className="bg-[#FFFBFB] min-h-[70vh] flex items-center justify-center py-20 px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-[#F3DFE5] space-y-4">
          <Heart className="w-8 h-8 text-[#D83A6F] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#2A1810]">
            Cake Not Found
          </h2>
          <Link
            to="/cakes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D83A6F] text-white text-xs font-semibold rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cakes</span>
          </Link>
        </div>
      </div>
    );
  }

  const validateSelections = (): boolean => {
    if (availableSizesList.length > 0 && !selectedSize) {
      setValidationError('Please select a weight or size.');
      return false;
    }
    if (!isHamper && flavoursList.length > 0 && !selectedFlavour) {
      setValidationError('Please select a flavor.');
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
      selectedFlavour: selectedFlavour || undefined,
      selectedFlavours: selectedFlavour ? [selectedFlavour] : undefined,
      customMessage: customMessage.trim() || undefined,
      quantity,
      unitPrice: currentUnitPrice,
      deliveryDate: deliveryDate || undefined,
      specialInstructions: [
        includeCandles && 'Complimentary Candles',
        includeTopper && `Topper: ${topperText}`,
        includeGiftTag && 'Handwritten Gift Tag',
      ]
        .filter(Boolean)
        .join(' | '),
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
        special_instructions: [
          includeCandles && 'Complimentary Candles',
          includeTopper && `Topper: ${topperText}`,
          includeGiftTag && 'Gift Tag',
        ]
          .filter(Boolean)
          .join(', '),
        items: [
          {
            id: product.id,
            productName: product.name,
            selectedSize: selectedSize || undefined,
            selectedFlavour: selectedFlavour || undefined,
            selectedFlavours: selectedFlavour ? [selectedFlavour] : undefined,
            customMessage: customMessage.trim() || undefined,
            quantity,
            unitPrice: currentUnitPrice,
          },
        ],
        subtotal: currentUnitPrice * quantity,
      });
    } catch (err) {
      console.warn('Could not record direct order in Supabase / LocalStorage', err);
    }

    const whatsappNum = BAKERY_DIRECT_PHONE;
    const url = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(formattedOrderMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const imagesList = product.images && product.images.length > 0 ? product.images : [''];

  return (
    <div className="bg-[#FFFBFB] min-h-screen text-[#5C4033] pb-28 md:pb-16">
      
      {/* MOBILE TOP BAR (← Product Title ♡) */}
      <div className="md:hidden border-b border-[#F3DFE5] bg-white px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1 text-[#2A1810] hover:text-[#D83A6F] cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-serif text-base font-bold text-[#2A1810] truncate max-w-[220px]">
          {product.name}
        </span>
        <button
          type="button"
          onClick={toggleWishlist}
          className={`p-1.5 text-[#2A1810] hover:text-[#D83A6F] cursor-pointer ${isWishlisted ? 'text-[#D83A6F]' : ''}`}
          aria-label="Wishlist"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current text-[#D83A6F]' : ''}`} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        
        {/* DESKTOP BREADCRUMB */}
        <div className="hidden md:flex items-center justify-between pb-6">
          <nav className="flex items-center gap-2 text-xs text-[#9E8A85]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 hover:text-[#D83A6F] transition-colors cursor-pointer mr-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <span>/</span>
            <Link to="/cakes" className="hover:text-[#D83A6F] transition-colors">
              Cakes
            </Link>
            <span>/</span>
            <span className="text-[#2A1810] font-semibold">{product.name}</span>
          </nav>

          <button
            type="button"
            onClick={toggleWishlist}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isWishlisted
                ? 'bg-[#FFF0F4] border-[#FCE3E9] text-[#D83A6F]'
                : 'border-[#F3DFE5] text-[#9E8A85] hover:text-[#D83A6F]'
            }`}
            title="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* 2-COLUMN PRODUCT DETAIL LAYOUT (DALL·E 3 Reference Matched) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* ===================================================================
              LEFT COLUMN: LARGE PRODUCT PHOTOGRAPHY & THUMBNAILS
          ==================================================================== */}
          <div className="md:col-span-6 space-y-4">
            <div className="relative aspect-square rounded-[28px] overflow-hidden bg-white border border-[#F3DFE5] shadow-xs flex items-center justify-center p-4">
              <ImageWithFallback
                src={imagesList[selectedImageIndex]}
                alt={product.name}
                fallbackText={product.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            {/* Thumbnails row */}
            {imagesList.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {imagesList.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-white cursor-pointer shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-[#D83A6F] shadow-xs scale-102'
                        : 'border-[#F3DFE5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===================================================================
              RIGHT COLUMN: CONTROLS MATCHING DALL·E 3 REFERENCE PANEL 3
              - Title: Pastel Sprinkles Cake
              - Stars: ★★★★★ 4.8 | (120 reviews)
              - Description
              - 1. Choose Flavor: [ Vanilla ] [ Chocolate ] [ Strawberry ] [ Red Velvet ]
              - 2. Choose Weight: [ 500g 1,099 ] [ 1 Kg 1,599 ] [ 1.5 Kg 1,899 ] [ 2 Kg 2,200 ]
              - Complimentary Add-ons (Candles, Happy Birthday Acrylic Topper, Gift Tag)
              - Price & Green "Order via WhatsApp" button
          ==================================================================== */}
          <div className="md:col-span-6 space-y-6">
            
            {/* Title, Stars, Description */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A1810]">
                {product.name}
              </h1>

              {/* Star Rating Badge (DALL·E 3 Reference Matched) */}
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-[#2A1810]">4.8</span>
                <span className="text-[#9E8A85]">(120 reviews)</span>
              </div>

              <p className="text-xs sm:text-sm text-[#5C4033] font-light leading-relaxed pt-1">
                {product.description}
              </p>
            </div>

            {/* Validation Notice */}
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{validationError}</span>
              </div>
            )}

            {/* =================================================================
                1. CHOOSE FLAVOR (DALL·E 3 Reference Matched)
                [ Vanilla ] [ Chocolate ] [ Strawberry ] [ Red Velvet ]
            ================================================================== */}
            {flavoursList.length > 0 && !isHamper && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#2A1810]">
                  1. Choose Flavor
                </label>

                <div className="flex flex-wrap gap-2">
                  {flavoursList.map((flav: string) => {
                    const isSelected = selectedFlavour.toLowerCase() === flav.toLowerCase();
                    return (
                      <button
                        key={flav}
                        type="button"
                        onClick={() => {
                          setSelectedFlavour(flav);
                          setValidationError('');
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2A1810] text-white border-[#2A1810] shadow-xs'
                            : 'bg-white text-[#5C4033] border-[#F3DFE5] hover:border-[#D83A6F]'
                        }`}
                      >
                        {flav}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =================================================================
                2. CHOOSE WEIGHT (DALL·E 3 Reference Matched)
                [ 500 g | 1,099 ] [ 1 Kg | 1,599 ] [ 1.5 Kg | 1,899 ] [ 2 Kg | 2,200 ]
            ================================================================== */}
            {availableSizesList.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#2A1810]">
                  2. Choose Weight
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableSizesList.map((sz: string) => {
                    const isSelected = selectedSize === sz;
                    const szPrice = selectedFlavour
                      ? (getFlavourCombinationPrice(product, sz, [selectedFlavour]) ?? extracted.sizePricing[sz])
                      : extracted.sizePricing[sz];

                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setSelectedSize(sz);
                          setValidationError('');
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'border-[#D83A6F] bg-[#FFF0F4] text-[#D83A6F] ring-1 ring-[#D83A6F]'
                            : 'border-[#F3DFE5] bg-white text-[#5C4033] hover:border-[#D83A6F]/60'
                        }`}
                      >
                        <span className="text-xs font-bold block">{sz}</span>
                        {szPrice && (
                          <span className="font-serif font-bold text-xs text-[#2A1810] tabular-nums">
                            ₹{szPrice}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =================================================================
                COMPLIMENTARY ADD-ONS (DALL·E 3 Reference Matched)
                ✨ Complimentary Add-ons
                Every cake comes with these on us!
                [ Candles ] [ Happy Birthday Acrylic Topper ] [ Gift Tag (Handwritten) ]
            ================================================================== */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF9F6] border border-[#F3DFE5] space-y-3.5">
              <div className="text-center space-y-0.5">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#2A1810]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D83A6F]" />
                  <span>Complimentary Add-ons</span>
                </div>
                <p className="text-[11px] text-[#9E8A85]">
                  Every cake comes with these on us!
                </p>
              </div>

              {/* 3 Horizontal Items with Icons */}
              <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                
                {/* 1. Candles */}
                <div
                  onClick={() => setIncludeCandles(!includeCandles)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    includeCandles ? 'bg-white border-[#D83A6F] shadow-2xs' : 'bg-white/60 border-[#F3DFE5] opacity-60'
                  }`}
                >
                  <Flame className="w-5 h-5 text-[#D83A6F]" />
                  <span className="text-[11px] font-bold text-[#2A1810] leading-tight">
                    Candles
                  </span>
                  <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                    Included
                  </span>
                </div>

                {/* 2. Happy Birthday Acrylic Topper */}
                <div
                  onClick={() => setIncludeTopper(!includeTopper)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    includeTopper ? 'bg-white border-[#D83A6F] shadow-2xs' : 'bg-white/60 border-[#F3DFE5] opacity-60'
                  }`}
                >
                  <Award className="w-5 h-5 text-[#D83A6F]" />
                  <span className="text-[11px] font-bold text-[#2A1810] leading-tight">
                    Happy Birthday Acrylic Topper
                  </span>
                  <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                    Included
                  </span>
                </div>

                {/* 3. Gift Tag (Handwritten) */}
                <div
                  onClick={() => setIncludeGiftTag(!includeGiftTag)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    includeGiftTag ? 'bg-white border-[#D83A6F] shadow-2xs' : 'bg-white/60 border-[#F3DFE5] opacity-60'
                  }`}
                >
                  <Tag className="w-5 h-5 text-[#D83A6F]" />
                  <span className="text-[11px] font-bold text-[#2A1810] leading-tight">
                    Gift Tag (Handwritten)
                  </span>
                  <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                    Included
                  </span>
                </div>

              </div>
            </div>

            {/* Optional Gift Note or Cake Plaque Message */}
            <div className="space-y-1">
              <label
                htmlFor="custom-cake-message"
                className="block text-xs font-semibold text-[#2A1810]"
              >
                Custom Plaque Message / Handwritten Note (Optional)
              </label>
              <input
                id="custom-cake-message"
                type="text"
                maxLength={40}
                placeholder="e.g. Happy Birthday Maya! 🎂"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#F3DFE5] text-xs text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
              />
            </div>

            {/* DESKTOP BOTTOM ACTION AREA (DALL·E 3 Reference Matched) */}
            <div className="hidden md:flex items-center justify-between gap-4 pt-4 border-t border-[#F3DFE5]">
              {/* Price display with selection */}
              <div>
                <span className="font-serif text-3xl font-bold text-[#2A1810] tabular-nums block">
                  ₹{currentTotalPrice || product.price}
                </span>
                <span className="text-xs text-[#9E8A85]">
                  ({selectedSize || '1 Kg'} - {selectedFlavour || 'Vanilla'})
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="px-5 py-3 rounded-full border border-[#F3DFE5] bg-white text-[#2A1810] hover:border-[#D83A6F] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={handleDirectWhatsAppOrder}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap min-h-[48px]"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Order via WhatsApp</span>
                </button>
              </div>
            </div>

            {addedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Added to your cart!</span>
                </div>
                <Link
                  to="/cart"
                  className="font-bold underline text-emerald-900 ml-2"
                >
                  View Cart &rarr;
                </Link>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* =========================================================================
          MOBILE STICKY ACTION BAR (DALL·E 3 Reference Panel 3 Mobile Screen)
          Bottom Bar: ₹1,099 (1 Kg - Vanilla) + [WhatsApp icon] Order via WhatsApp
      ========================================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-[#F3DFE5] px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="font-serif text-2xl font-bold text-[#2A1810] tabular-nums leading-tight">
            ₹{currentTotalPrice || product.price}
          </div>
          <div className="text-[11px] text-[#9E8A85]">
            ({selectedSize || '1 Kg'} - {selectedFlavour || 'Vanilla'})
          </div>
        </div>

        <button
          type="button"
          onClick={handleDirectWhatsAppOrder}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded-full shadow-md transition-all min-h-[46px] whitespace-nowrap cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Order via WhatsApp</span>
        </button>
      </div>

    </div>
  );
}
