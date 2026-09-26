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
  extractProductDetails,
  HamperContentItem,
} from '../data/categorySettings';
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
  Gift,
  Package,
  Layers,
  Flower2,
  Cookie,
  Boxes,
  CheckCircle2,
} from 'lucide-react';

const BAKERY_DIRECT_PHONE = '917976541365';

export function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
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
  const { categoryKey, categoryConfig } = extracted;

  const isHamper = categoryKey === 'hampers';
  const isBento = categoryKey === 'bento-cakes';
  const isDessert = categoryKey === 'desserts';
  const isBouquet = categoryKey === 'bouquets';
  const isCookie = categoryKey === 'cookies';
  const isCake = categoryKey === 'cakes';

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

  // States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedFlavour, setSelectedFlavour] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<CakeAddOn[]>([]);
  const [chosenCustomizations, setChosenCustomizations] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

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

  const availableAddOns: CakeAddOn[] = useMemo(() => {
    if (isHamper) return []; // Hampers use hamper customizations instead
    if (product?.addOns && product.addOns.length > 0) {
      return product.addOns;
    }
    if (isCake || isBento) {
      return STANDARD_CAKE_ADDONS;
    }
    return [];
  }, [product, isHamper, isCake, isBento]);

  // Current package contents (for Hampers or products with contents repeater)
  const currentPackageContents = useMemo<HamperContentItem[]>(() => {
    if (!isHamper) return [];
    if (extracted.contentsMode === 'all') {
      return extracted.contentsByPackage.all || [];
    }
    return (
      extracted.contentsByPackage[selectedSize] ||
      extracted.contentsByPackage.all ||
      []
    );
  }, [isHamper, extracted.contentsMode, extracted.contentsByPackage, selectedSize]);

  // Initialize defaults when product changes
  useEffect(() => {
    if (product) {
      if (availableSizesList.length > 0) {
        setSelectedSize(availableSizesList[0]);
      } else {
        setSelectedSize('');
      }

      if (flavoursList.length > 0) {
        setSelectedFlavour(flavoursList[0]);
      } else {
        setSelectedFlavour('');
      }

      // Pre-select popular customizations
      if (extracted.selectedCustomizations && extracted.selectedCustomizations.length > 0) {
        setChosenCustomizations([...extracted.selectedCustomizations.slice(0, 2)]);
      } else {
        setChosenCustomizations([]);
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
  }, [product?.id, product?.slug, availableSizesList, flavoursList, extracted.selectedCustomizations]);

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

  const handleCustomizationToggle = (opt: string) => {
    setChosenCustomizations((prev) => {
      if (prev.includes(opt)) {
        return prev.filter((o) => o !== opt);
      } else {
        return [...prev, opt];
      }
    });
  };

  // Dynamic Base Price for selected package / size & flavour
  const basePrice = useMemo(() => {
    if (!product || !selectedSize) {
      return null;
    }

    // 1. Hampers or non-flavour items: directly use size/package pricing
    if ((isHamper || isDessert || isBouquet || isCookie) && flavoursList.length === 0) {
      if (extracted.sizePricing[selectedSize] !== undefined && Number(extracted.sizePricing[selectedSize]) > 0) {
        return Number(extracted.sizePricing[selectedSize]);
      }
      return Number(product.price) || 649;
    }

    // 2. Cakes / Bento Cakes / Items with flavours: Check flavour combination price FIRST!
    if (selectedFlavour) {
      const comboPrice = getFlavourCombinationPrice(product, selectedSize, [selectedFlavour]);
      if (typeof comboPrice === 'number' && comboPrice > 0) {
        return comboPrice;
      }
    }

    // 3. Fallback to sizePricing if no specific combination price
    if (extracted.sizePricing[selectedSize] !== undefined && Number(extracted.sizePricing[selectedSize]) > 0) {
      return Number(extracted.sizePricing[selectedSize]);
    }

    const fallbackCombo = getFlavourCombinationPrice(product, selectedSize, selectedFlavour ? [selectedFlavour] : []);
    if (typeof fallbackCombo === 'number' && fallbackCombo > 0) {
      return fallbackCombo;
    }

    return Number(product.price) || 649;
  }, [product, selectedSize, selectedFlavour, isHamper, isDessert, isBouquet, isCookie, extracted.sizePricing, flavoursList.length]);

  // Add-ons subtotal
  const addOnsTotal = useMemo(() => {
    return selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  }, [selectedAddOns]);

  // Unit price (Base Price + Add-ons)
  const currentUnitPrice = useMemo(() => {
    if (basePrice === null) return null;
    return basePrice + addOnsTotal;
  }, [basePrice, addOnsTotal]);

  // Total order item price (Unit price * Quantity)
  const currentTotalPrice = useMemo(() => {
    if (currentUnitPrice === null) return null;
    return currentUnitPrice * quantity;
  }, [currentUnitPrice, quantity]);

  // Formatted WhatsApp message
  const formattedOrderMessage = useMemo(() => {
    if (!product) return '';

    const lines: string[] = [];
    lines.push(`Hello Cake N Crave! I would like to place an order.`);
    lines.push('');
    lines.push(`Product: ${product.name}`);

    if (isHamper) {
      if (extracted.typeValue) lines.push(`Hamper Type: ${extracted.typeValue}`);
      if (selectedSize) lines.push(`Package: ${selectedSize}`);
      if (currentPackageContents.length > 0) {
        lines.push('');
        lines.push(`Package Contents (${selectedSize}):`);
        currentPackageContents.forEach((item) => {
          const variantStr = item.variant ? ` (${item.variant})` : '';
          lines.push(`• ${item.quantity} × ${item.name}${variantStr}`);
        });
      }
      if (chosenCustomizations.length > 0) {
        lines.push('');
        lines.push(`Customizations: ${chosenCustomizations.join(', ')}`);
      }
    } else {
      if (selectedSize) {
        const sizeLabel = isBento ? 'Bento Size' : isDessert ? 'Pack Size' : isBouquet ? 'Arrangement' : isCookie ? 'Box Size' : 'Weight';
        lines.push(`${sizeLabel}: ${selectedSize}`);
      }
      if (selectedFlavour) {
        lines.push(`Flavour: ${selectedFlavour}`);
      }
      if (chosenCustomizations.length > 0) {
        lines.push(`Customizations: ${chosenCustomizations.join(', ')}`);
      }
      if (selectedAddOns.length > 0) {
        const addonsStr = selectedAddOns.map((a) => `${a.name} (+₹${a.price})`).join(', ');
        lines.push(`Add-ons: ${addonsStr}`);
      }
    }

    lines.push(`Quantity: ${quantity}`);
    lines.push('');
    const unitP = currentUnitPrice || product.price;
    lines.push(`Unit Price: ₹${unitP}`);
    lines.push(`Total: ₹${unitP * quantity}`);
    lines.push('');

    if (customMessage.trim()) {
      lines.push(`${isHamper ? 'Card / Box Message' : 'Message on Plaque'}: ${customMessage.trim()}`);
    }
    if (deliveryDate.trim()) {
      lines.push(`Preferred Delivery Date: ${deliveryDate.trim()}`);
    }
    if (specialInstructions.trim()) {
      lines.push(`Special Instructions: ${specialInstructions.trim()}`);
    }

    return lines.join('\n');
  }, [
    product,
    isHamper,
    isBento,
    isDessert,
    isBouquet,
    isCookie,
    extracted.typeValue,
    selectedSize,
    selectedFlavour,
    currentPackageContents,
    chosenCustomizations,
    selectedAddOns,
    quantity,
    currentUnitPrice,
    customMessage,
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
      setValidationError(
        isHamper
          ? 'Please select a hamper package (Small, Medium, or Large).'
          : isDessert
          ? 'Please select a pack size.'
          : 'Please select a size / weight.'
      );
      return false;
    }
    if (!isHamper && flavoursList.length > 0 && !selectedFlavour) {
      setValidationError('Please select a flavour for your creation.');
      return false;
    }
    if (currentUnitPrice === null) {
      setValidationError('Price calculation could not be completed. Please order via WhatsApp.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelections() || currentUnitPrice === null) return;

    // Build rich flavour or type representation
    const flavourOrType = isHamper
      ? extracted.typeValue || 'Standard Hamper'
      : selectedFlavour;

    // Attach contents summary for hampers if applicable
    const extraInstructions = isHamper && currentPackageContents.length > 0
      ? `Contents: ${currentPackageContents.map((c) => `${c.quantity}x ${c.name}`).join(', ')}`
      : undefined;

    addToCart({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: product.images[0] || '',
      selectedSize: selectedSize || undefined,
      selectedFlavour: flavourOrType || undefined,
      selectedFlavours: flavourOrType ? [flavourOrType] : undefined,
      selectedAddOns: selectedAddOns.length > 0 ? selectedAddOns : undefined,
      customMessage: customMessage.trim() || undefined,
      quantity,
      unitPrice: currentUnitPrice,
      deliveryDate: deliveryDate || undefined,
      specialInstructions: [specialInstructions.trim(), extraInstructions].filter(Boolean).join(' | ') || undefined,
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
            selectedFlavour: isHamper ? extracted.typeValue : selectedFlavour,
            selectedFlavours: isHamper ? [extracted.typeValue || 'Hamper'] : selectedFlavour ? [selectedFlavour] : undefined,
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
          
          {/* LEFT SIDE: Image Gallery */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#FFF9F6] border border-[#F3DFE5] p-3 sm:p-4 flex items-center justify-center shadow-xs">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="bg-[#D83A6F] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs">
                  {isHamper
                    ? 'Luxury Hamper'
                    : isBento
                    ? 'Korean Bento'
                    : (product as any).is_new || (product as any).isNew
                    ? 'New Signature'
                    : 'Boutique Selection'}
                </span>
                {extracted.typeValue && (
                  <span className="bg-white/95 backdrop-blur-xs text-[#2A1810] border border-[#F3DFE5] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
                    {extracted.typeValue}
                  </span>
                )}
              </div>

              {/* Eggless Emblem */}
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

            {/* Image Thumbnails */}
            {imagesList.length > 1 && (
              <div className="flex gap-3 pt-1 overflow-x-auto pb-1">
                {imagesList.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white cursor-pointer shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-[#D83A6F] shadow-sm scale-103'
                        : 'border-[#F3DFE5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      fallbackText="thumb"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#F3DFE5] text-center text-xs text-[#49312E]/75">
              <div className="p-3 rounded-2xl bg-[#FFF9F6] border border-[#F3DFE5]">
                <div className="font-bold text-[#2A1810]">100% Eggless</div>
                <div className="text-[10px] text-[#49312E]/60 mt-0.5">Baked fresh in Jaipur</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FFF9F6] border border-[#F3DFE5]">
                <div className="font-bold text-[#2A1810]">Pure Couverture</div>
                <div className="text-[10px] text-[#49312E]/60 mt-0.5">Finest ingredients</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FFF9F6] border border-[#F3DFE5]">
                <div className="font-bold text-[#2A1810]">Bespoke Packaging</div>
                <div className="text-[10px] text-[#49312E]/60 mt-0.5">Silk ribbon &amp; cards</div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Product Details, Category-Specific Controls & Actions */}
          <div className="space-y-6">
            
            {/* Title & Category Kickers */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold">
                  {product.category}
                </span>
                {extracted.selectedSubcategories.length > 0 && (
                  <>
                    <span className="text-[#2A1810]/30 font-serif">·</span>
                    <span className="text-xs text-[#2A1810]/60">
                      {extracted.selectedSubcategories.join(' · ')}
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#49312E] tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Short Description */}
              <p className="text-sm sm:text-base text-[#49312E]/80 leading-relaxed font-light mt-2.5">
                {product.description}
              </p>

              {/* Dynamic Price */}
              <div className="mt-4 pb-4 border-b border-[#F3DFE5] flex items-baseline gap-3 flex-wrap">
                {currentUnitPrice !== null ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-[#D83A6F] tabular-nums">
                      ₹{currentUnitPrice}
                    </span>
                    {quantity > 1 && (
                      <span className="text-xs text-[#49312E]/60 font-medium">
                        (₹{currentTotalPrice} for {quantity} items)
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

            {/* ========================================================================= */}
            {/* 1. HAMPERS SPECIFIC VIEW                                                  */}
            {/* ========================================================================= */}
            {isHamper ? (
              <div className="space-y-5">
                {/* Hamper Package Selector (Small / Medium / Large) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-[#49312E]">
                      Select Package Size
                    </label>
                    <span className="text-xs font-semibold text-[#D83A6F]">
                      Price updates automatically
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    {availableSizesList.map((pkg) => {
                      const isSelected = selectedSize === pkg;
                      const pkgPrice = extracted.sizePricing[pkg];

                      return (
                        <button
                          key={pkg}
                          type="button"
                          onClick={() => {
                            setSelectedSize(pkg);
                            setValidationError('');
                          }}
                          className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'border-[#D83A6F] bg-[#FCEEF2] shadow-xs text-[#49312E]'
                              : 'border-[#F3DFE5] bg-white text-[#49312E]/80 hover:border-[#D83A6F]/50 hover:bg-[#FFF9F6]'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-bold block">{pkg}</span>
                          {pkgPrice && (
                            <span className="font-serif font-bold text-sm text-[#D83A6F] tabular-nums">
                              ₹{pkgPrice}
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[10px] font-bold text-[#D83A6F] bg-white/80 px-2 py-0.5 rounded-full mt-0.5">
                              Selected
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* What's Inside This Hamper (Package Contents Display) */}
                {currentPackageContents.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#FFF9F6] to-[#FFF5F7] border border-[#F3DFE5] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#D83A6F]" />
                        <h3 className="text-xs sm:text-sm font-bold text-[#2A1810]">
                          Contents Included in {selectedSize || 'This'} Package:
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-[#D83A6F] bg-white px-2.5 py-0.5 rounded-full border border-[#F3DFE5]">
                        {currentPackageContents.length} Items
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {currentPackageContents.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white/90 backdrop-blur-xs p-2.5 rounded-2xl border border-[#F3DFE5] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-[#D83A6F] bg-[#FFF0F4] px-2 py-0.5 rounded-lg text-[11px] shrink-0 font-mono">
                              {item.quantity}×
                            </span>
                            <div className="min-w-0">
                              <span className="font-semibold text-[#2A1810] block truncate">
                                {item.name}
                              </span>
                              {item.variant && (
                                <span className="text-[10px] text-[#2A1810]/60 block truncate">
                                  {item.variant}
                                </span>
                              )}
                            </div>
                          </div>
                          {item.notes && (
                            <span className="text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hamper Customization Checkboxes */}
                {extracted.selectedCustomizations.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#F3DFE5]">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold text-[#49312E] flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-[#D83A6F]" />
                        <span>Included Customizations</span>
                      </label>
                      <span className="text-[11px] text-[#2A1810]/60">
                        Select which apply to your gift
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {extracted.selectedCustomizations.map((cust) => {
                        const isChosen = chosenCustomizations.includes(cust);
                        return (
                          <button
                            key={cust}
                            type="button"
                            onClick={() => handleCustomizationToggle(cust)}
                            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                              isChosen
                                ? 'bg-[#2A1810] text-white shadow-2xs'
                                : 'bg-white border border-[#F3DFE5] text-[#2A1810]/70 hover:border-[#D83A6F]/40'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${isChosen ? 'bg-[#D83A6F] text-white border-[#D83A6F]' : 'border-[#2A1810]/30'}`}>
                              {isChosen && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{cust}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Greeting Card Message Input */}
                <div className="space-y-1.5 pt-2 border-t border-[#F3DFE5]">
                  <label
                    htmlFor="hamper-card-message"
                    className="block text-sm font-bold text-[#49312E] flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-[#D83A6F]" />
                    <span>Personalized Greeting Card / Recipient Name (Optional)</span>
                  </label>
                  <input
                    id="hamper-card-message"
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Happy Birthday to the sweetest friend! Love, Tanya"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#F3DFE5] text-xs sm:text-sm text-[#49312E] focus:outline-hidden focus:border-[#E8A0B4] focus:ring-2 focus:ring-[#E8A0B4]/20 shadow-2xs transition-all"
                  />
                  <p className="text-[11px] text-[#49312E]/60">
                    Handwritten with gold calligraphy ink on heavy cardstock and wax-sealed.
                  </p>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* 2. STANDARD BAKERY CONTROLS (Cakes, Bento, Desserts, Bouquets, Cookies)   */
              /* ========================================================================= */
              <div className="space-y-5">
                
                {/* Weight / Size Selection */}
                {availableSizesList.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="cake-weight-select"
                        className="block text-sm font-bold text-[#49312E]"
                      >
                        {isBento
                          ? 'Select Bento Size'
                          : isDessert
                          ? 'Select Pack Size'
                          : isBouquet
                          ? 'Select Bouquet Arrangement'
                          : isCookie
                          ? 'Select Box Size'
                          : 'Select Cake Weight'}
                      </label>
                      {selectedSize && weightServingMap[selectedSize] && (
                        <span className="text-xs text-[#D83A6F] font-semibold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{weightServingMap[selectedSize]}</span>
                        </span>
                      )}
                    </div>

                    {/* Visual Pill Cards for Weights */}
                    <div className="flex flex-wrap gap-2 pt-1 pb-1">
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
                            className={`px-3 py-2 rounded-xl border text-center transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? 'border-[#D83A6F] bg-[#FCEEF2] shadow-2xs text-[#49312E]'
                                : 'border-[#F3DFE5] bg-white text-[#49312E]/80 hover:border-[#D83A6F]/50 hover:bg-[#FFF9F6]'
                            }`}
                          >
                            <span className="text-xs font-bold block">{sz}</span>
                            {szPrice && (
                              <span className="font-serif font-bold text-xs text-[#D83A6F] tabular-nums">
                                ₹{szPrice}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="relative sm:hidden">
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
                          Choose {isDessert ? 'pack size' : 'option'}
                        </option>
                        {availableSizesList.map((sz: string) => {
                          const serving = weightServingMap[sz] || '';
                          const szPrice = selectedFlavour
                            ? (getFlavourCombinationPrice(product, sz, [selectedFlavour]) ?? extracted.sizePricing[sz])
                            : extracted.sizePricing[sz];
                          const priceStr = szPrice ? ` - ₹${szPrice}` : '';
                          return (
                            <option key={sz} value={sz}>
                              {sz} {serving ? `(${serving})` : ''} {priceStr}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#49312E]/60 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Flavour Selection (if applicable) */}
                {flavoursList.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="cake-flavour-select"
                        className="block text-sm font-bold text-[#49312E]"
                      >
                        {isBento
                          ? 'Select Bento Flavour'
                          : isDessert
                          ? 'Select Flavour'
                          : isBouquet
                          ? 'Select Variety'
                          : 'Select Cake Flavour'}
                      </label>
                      <span className="text-xs text-[#D83A6F] font-semibold bg-[#FCEEF2] px-2.5 py-0.5 rounded-full border border-[#F3DFE5]">
                        Price updates per combination
                      </span>
                    </div>

                    {/* Visual Pill Cards for Flavours */}
                    <div className="flex flex-wrap gap-2 pt-1 pb-1">
                      {flavoursList.map((flav: string) => {
                        const isSelected = selectedFlavour === flav;
                        const flvPrice = selectedSize
                          ? getFlavourCombinationPrice(product, selectedSize, [flav])
                          : null;
                        return (
                          <button
                            key={flav}
                            type="button"
                            onClick={() => {
                              setSelectedFlavour(flav);
                              setValidationError('');
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-center transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'border-[#2A1810] bg-[#2A1810] text-white shadow-2xs font-semibold'
                                : 'border-[#F3DFE5] bg-white text-[#49312E]/80 hover:border-[#D83A6F]/50 hover:bg-[#FFF9F6]'
                            }`}
                          >
                            <span className="text-xs block">{flav}</span>
                            {flvPrice && (
                              <span className={`font-serif font-bold text-xs tabular-nums ${isSelected ? 'text-[#FFD1DC]' : 'text-[#D83A6F]'}`}>
                                ₹{flvPrice}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="relative sm:hidden">
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
                        {flavoursList.map((flav: string) => {
                          const flvPrice = selectedSize
                            ? getFlavourCombinationPrice(product, selectedSize, [flav])
                            : null;
                          const priceStr = flvPrice ? ` (₹${flvPrice})` : '';
                          return (
                            <option key={flav} value={flav}>
                              {flav}{priceStr}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#49312E]/60 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Custom Message on Cake / Card */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="custom-cake-message"
                    className="block text-sm font-bold text-[#49312E]"
                  >
                    {isBento
                      ? 'Custom Piped Message (Short Text)'
                      : isDessert || isCookie
                      ? 'Gift Note / Sleeve Message (Optional)'
                      : isBouquet
                      ? 'Handwritten Letter Card (Optional)'
                      : 'Custom Message on Cake (Optional)'}
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
                    Up to 35 characters.
                  </p>
                </div>

                {/* Add-ons (for Cakes & Bento) */}
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
              </div>
            )}

            {/* Quantity Selector */}
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

            {/* Preferred Delivery Date */}
            <div className="space-y-1.5 pt-2 border-t border-[#F3DFE5]">
              <label
                htmlFor="delivery-date-input"
                className="block text-sm font-bold text-[#49312E] flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-[#D83A6F]" />
                <span>Preferred Delivery Date (Jaipur)</span>
              </label>
              <input
                id="delivery-date-input"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#F3DFE5] text-xs sm:text-sm text-[#49312E] focus:outline-hidden focus:border-[#E8A0B4] focus:ring-2 focus:ring-[#E8A0B4]/20 shadow-2xs transition-all"
              />
            </div>

            {/* Special Instructions */}
            <div className="space-y-1.5 pt-2 border-t border-[#F3DFE5]">
              <label
                htmlFor="special-instructions"
                className="block text-sm font-bold text-[#49312E] flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-[#D83A6F]" />
                <span>Special Instructions / Landmark</span>
              </label>
              <textarea
                id="special-instructions"
                rows={2}
                placeholder="e.g. Ring bell twice, deliver between 5-7 PM in Vaishali Nagar..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#F3DFE5] text-xs sm:text-sm text-[#49312E] focus:outline-hidden focus:border-[#E8A0B4] focus:ring-2 focus:ring-[#E8A0B4]/20 shadow-2xs transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 px-6 bg-[#D83A6F] hover:bg-[#C42B5E] text-white rounded-2xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Add to Cart · ₹{currentTotalPrice || product.price}</span>
              </button>

              <button
                type="button"
                onClick={handleDirectWhatsAppOrder}
                className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20BE5C] text-white rounded-2xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Order Directly on WhatsApp</span>
              </button>

              {addedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Added to your patisserie cart!</span>
                  </div>
                  <Link
                    to="/cart"
                    className="font-bold underline text-emerald-900 hover:text-emerald-700 ml-2"
                  >
                    View Cart &rarr;
                  </Link>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
