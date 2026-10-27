import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { useStore } from '../context/StoreContext';
import {
  Cake,
  Heart,
  Sparkles,
  Smile,
  GraduationCap,
  Gift,
  Check,
  X,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal
} from 'lucide-react';

// TIER 1: FLAVORS (Matching DALL·E 3 Reference Image Panel 2)
export const CAKE_FLAVORS = [
  {
    id: 'Chocolate',
    name: 'Chocolate',
    image: '/src/assets/images/flavor_chocolate.jpg',
    keywords: ['chocolate', 'truffle', 'fudge', 'dark', 'cocoa'],
  },
  {
    id: 'Vanilla',
    name: 'Vanilla',
    image: '/src/assets/images/flavor_vanilla.jpg',
    keywords: ['vanilla', 'bourbon', 'berry', 'white'],
  },
  {
    id: 'Red Velvet',
    name: 'Red Velvet',
    image: '/src/assets/images/flavor_red_velvet.jpg',
    keywords: ['red velvet', 'velvet', 'cream cheese'],
  },
  {
    id: 'Matcha',
    name: 'Matcha',
    image: '/src/assets/images/flavor_matcha.jpg',
    keywords: ['matcha', 'green tea', 'japanese'],
  },
  {
    id: 'Oreo',
    name: 'Oreo',
    image: '/src/assets/images/flavor_oreo.jpg',
    keywords: ['oreo', 'cookies', 'cream'],
  },
  {
    id: 'Lemon',
    name: 'Lemon',
    image: '/src/assets/images/flavor_lemon.jpg',
    keywords: ['lemon', 'citrus', 'curd', 'zest'],
  },
];

// TIER 2: OCCASIONS (Matching DALL·E 3 Reference Image Panel 2)
export const CAKE_OCCASIONS = [
  {
    id: 'Birthdays',
    name: 'Birthdays',
    icon: Cake,
    matchTerms: ['birthday', 'celebration', 'kids', 'birthdays'],
    pillColor: 'bg-[#FFF0F4] text-[#D83A6F] border-[#FCE3E9] hover:bg-[#FCEEF2]',
    activeColor: 'bg-[#D83A6F] text-white border-[#D83A6F]',
  },
  {
    id: 'Anniversaries',
    name: 'Anniversaries',
    icon: Heart,
    matchTerms: ['anniversary', 'love', 'romantic'],
    pillColor: 'bg-[#E2F0D9] text-[#4A7A3E] border-[#CFE4C3] hover:bg-[#D4EAC7]',
    activeColor: 'bg-[#4A7A3E] text-white border-[#4A7A3E]',
  },
  {
    id: 'Weddings',
    name: 'Weddings',
    icon: Sparkles,
    matchTerms: ['wedding', 'engagement', 'bride-to-be'],
    pillColor: 'bg-[#E8E0F0] text-[#644A85] border-[#D8CBE4] hover:bg-[#DDD0E8]',
    activeColor: 'bg-[#644A85] text-white border-[#644A85]',
  },
  {
    id: 'Baby Showers',
    name: 'Baby Showers',
    icon: Smile,
    matchTerms: ['baby shower', 'mom-to-be', 'baby'],
    pillColor: 'bg-[#FFF0D9] text-[#9A5A12] border-[#FFE2B8] hover:bg-[#FFE8C7]',
    activeColor: 'bg-[#9A5A12] text-white border-[#9A5A12]',
  },
  {
    id: 'Graduations',
    name: 'Graduations',
    icon: GraduationCap,
    matchTerms: ['graduations', 'graduation', 'milestone'],
    pillColor: 'bg-[#E8E0F0] text-[#644A85] border-[#D8CBE4] hover:bg-[#DDD0E8]',
    activeColor: 'bg-[#644A85] text-white border-[#644A85]',
  },
  {
    id: 'Other Occasions',
    name: 'Other Occasions',
    icon: Gift,
    matchTerms: ['celebration', 'just because', 'party'],
    pillColor: 'bg-white text-[#2A1810] border-[#F3DFE5] hover:bg-[#FFF5F7]',
    activeColor: 'bg-[#2A1810] text-white border-[#2A1810]',
  },
];

export function CakesCategory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products: storeProducts } = useStore();

  const allProducts = storeProducts.length > 0 ? storeProducts : PRODUCTS;

  // Filter products belonging to Cakes
  const allCakeProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      return cat === 'cakes' || cat === 'cake';
    });
  }, [allProducts]);

  const rawFlavor = searchParams.get('flavor') || '';
  const rawOccasion = searchParams.get('occasion') || '';
  const rawSort = searchParams.get('sort') || 'popular';

  const [selectedFlavor, setSelectedFlavor] = useState<string>(rawFlavor);
  const [selectedOccasion, setSelectedOccasion] = useState<string>(rawOccasion);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>(rawSort as any);

  useEffect(() => {
    setSelectedFlavor(searchParams.get('flavor') || '');
    setSelectedOccasion(searchParams.get('occasion') || '');
    setSortBy((searchParams.get('sort') as any) || 'popular');
  }, [searchParams]);

  const handleFlavorSelect = (flavorName: string) => {
    const isClearing = selectedFlavor.toLowerCase() === flavorName.toLowerCase();
    const newFlavor = isClearing ? '' : flavorName;
    setSelectedFlavor(newFlavor);

    const newParams = new URLSearchParams(searchParams);
    if (newFlavor) {
      newParams.set('flavor', newFlavor);
    } else {
      newParams.delete('flavor');
    }
    setSearchParams(newParams);
  };

  const handleOccasionSelect = (occName: string) => {
    const isClearing = selectedOccasion.toLowerCase() === occName.toLowerCase();
    const newOccasion = isClearing ? '' : occName;
    setSelectedOccasion(newOccasion);

    const newParams = new URLSearchParams(searchParams);
    if (newOccasion) {
      newParams.set('occasion', newOccasion);
    } else {
      newParams.delete('occasion');
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort: 'popular' | 'price-asc' | 'price-desc') => {
    setSortBy(newSort);
    const newParams = new URLSearchParams(searchParams);
    if (newSort === 'popular') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', newSort);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSelectedFlavor('');
    setSelectedOccasion('');
    setSearchParams({});
  };

  // Filter products by selected flavor & occasion
  const filteredCakes = useMemo(() => {
    return allCakeProducts.filter((product) => {
      // 1. Flavor filter
      if (selectedFlavor) {
        const flavorConfig = CAKE_FLAVORS.find(
          (f) => f.id.toLowerCase() === selectedFlavor.toLowerCase()
        );
        const flavorTerms = flavorConfig ? flavorConfig.keywords : [selectedFlavor.toLowerCase()];

        const searchBlob = [
          product.name,
          product.flavourTag || '',
          product.description || '',
          ...(product.flavourOptions || []),
          ...(product.availableFlavours || []),
        ]
          .join(' ')
          .toLowerCase();

        const matchesFlavor = flavorTerms.some((term) => searchBlob.includes(term.toLowerCase()));
        if (!matchesFlavor) return false;
      }

      // 2. Occasion filter
      if (selectedOccasion) {
        const occConfig = CAKE_OCCASIONS.find(
          (o) => o.id.toLowerCase() === selectedOccasion.toLowerCase()
        );
        const matchTerms = occConfig ? occConfig.matchTerms : [selectedOccasion.toLowerCase()];

        const prodOccasions = (product.occasions || []).map((o) => o.toLowerCase());
        const prodNameDesc = `${product.name} ${product.description}`.toLowerCase();

        const matchesOccasion = matchTerms.some(
          (term) => prodOccasions.some((po) => po.includes(term)) || prodNameDesc.includes(term)
        );
        if (!matchesOccasion) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [allCakeProducts, selectedFlavor, selectedOccasion, sortBy]);

  // Compute title matching DALL·E 3 reference
  const activeSectionTitle = useMemo(() => {
    if (selectedOccasion && selectedFlavor) {
      return `${selectedFlavor} ${selectedOccasion} Cakes`;
    }
    if (selectedOccasion) {
      return `${selectedOccasion} Cakes`;
    }
    if (selectedFlavor) {
      return `${selectedFlavor} Cakes`;
    }
    return 'Birthday Cakes';
  }, [selectedFlavor, selectedOccasion]);

  return (
    <div className="bg-[#FFFBFB] min-h-screen text-[#5C4033] pb-24">
      
      {/* =========================================================================
          PAGE HEADER (DALL·E 3 Reference Matched)
          Cakes
            ♡
      ========================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 text-center space-y-1">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2A1810]">
          Cakes
        </h1>
        <div className="text-xs text-[#D83A6F] select-none">
          ♡
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-10 sm:space-y-12">
        
        {/* =====================================================================
            TIER 1: CAKES BY FLAVOR (DALL·E 3 Reference Matched)
            Horizontal grid of 6 cards: Chocolate, Vanilla, Red Velvet, Matcha, Oreo, Lemon
        ====================================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1810]">
              Cakes by Flavor
            </h2>
            {selectedFlavor && (
              <button
                type="button"
                onClick={() => handleFlavorSelect(selectedFlavor)}
                className="text-xs font-semibold text-[#D83A6F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Clear Flavor</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 sm:gap-4">
            {CAKE_FLAVORS.map((flavor) => {
              const isSelected = selectedFlavor.toLowerCase() === flavor.id.toLowerCase();
              return (
                <button
                  key={flavor.id}
                  onClick={() => handleFlavorSelect(flavor.id)}
                  type="button"
                  className={`group relative flex flex-col items-center p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer text-center bg-white ${
                    isSelected
                      ? 'border-[#D83A6F] ring-2 ring-[#D83A6F]/20 shadow-md'
                      : 'border-[#F3DFE5] hover:border-[#D83A6F]/60 hover:shadow-xs'
                  }`}
                  aria-pressed={isSelected}
                >
                  {/* Photo of cake flavor */}
                  <div className="w-full aspect-square rounded-xl overflow-hidden mb-2.5 bg-[#FFF0F4] relative">
                    <ImageWithFallback
                      src={flavor.image}
                      alt={`${flavor.name} Cake`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#D83A6F] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Flavor Label */}
                  <span
                    className={`text-xs sm:text-[13px] font-bold transition-colors ${
                      isSelected ? 'text-[#D83A6F]' : 'text-[#2A1810] group-hover:text-[#D83A6F]'
                    }`}
                  >
                    {flavor.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            TIER 2: CAKES BY OCCURRENCE (DALL·E 3 Reference Matched)
            Pills: Birthdays, Anniversaries, Weddings, Baby Showers, Graduations, Other Occasions
        ====================================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1810]">
              Cakes by Occurrence
            </h2>
            {selectedOccasion && (
              <button
                type="button"
                onClick={() => handleOccasionSelect(selectedOccasion)}
                className="text-xs font-semibold text-[#D83A6F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Clear Occurrence</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {CAKE_OCCASIONS.map((occ) => {
              const isSelected = selectedOccasion.toLowerCase() === occ.id.toLowerCase();
              const IconComp = occ.icon;
              return (
                <button
                  key={occ.id}
                  onClick={() => handleOccasionSelect(occ.id)}
                  type="button"
                  className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-200 cursor-pointer shadow-2xs ${
                    isSelected ? occ.activeColor : occ.pillColor
                  }`}
                  aria-pressed={isSelected}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{occ.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            SECTION 3: FILTERING RESULT & PRODUCT LISTING (DALL·E 3 Panel 3 Left)
            Title: Birthday Cakes
            24 results | Sort by: Popular ▾ | Filter
            4 Product Cards Grid:
            - Pastel Sprinkles Cake (From ₹1099)
            - Classic Chocolate Drip Cake (From ₹799)
            - Floral Vanilla Dream (From ₹749)
            - Pink Buttercream Cake (From ₹699)
        ====================================================================== */}
        <div className="pt-6 border-t border-[#F3DFE5] space-y-6">
          
          {/* Subheader Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1810]">
                {activeSectionTitle}
              </h3>
              <p className="text-xs text-[#9E8A85] mt-0.5">
                {filteredCakes.length} results
              </p>
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-1.5 text-xs text-[#9E8A85]">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as any)}
                  className="bg-white border border-[#F3DFE5] text-[#2A1810] font-semibold rounded-full px-3 py-1.5 text-xs focus:outline-hidden focus:border-[#D83A6F] cursor-pointer"
                >
                  <option value="popular">Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {(selectedFlavor || selectedOccasion) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3.5 py-1.5 rounded-full border border-[#F3DFE5] text-xs font-semibold text-[#D83A6F] bg-[#FFF0F4] hover:bg-[#FCEEF2] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Filter</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredCakes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
              {filteredCakes.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as any}
                  selectedFlavorParam={selectedFlavor}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#F3DFE5] space-y-3 max-w-md mx-auto">
              <Cake className="w-10 h-10 text-[#D83A6F] mx-auto" />
              <h4 className="font-serif text-xl font-bold text-[#2A1810]">
                No matching cakes found
              </h4>
              <p className="text-xs text-[#9E8A85]">
                Try clearing one of your filters to see more cakes.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-[#D83A6F] text-white text-xs font-semibold rounded-full hover:bg-[#C42B5E] transition-colors cursor-pointer"
              >
                Show All Cakes
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
