import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import {
  MAIN_CATEGORIES,
  MainCategory,
  SubCategory,
  getMainCategoryByIdOrSlug,
  getSubCategoryById,
  getProductParentCategoryId,
  doesProductMatchSubcategory
} from '../data/categories';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { Cake, Sparkles, Check } from 'lucide-react';

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products: storeProducts } = useStore();

  const allProducts = storeProducts.length > 0 ? storeProducts : PRODUCTS;

  // URL state synchronization
  const rawCategoryParam = searchParams.get('category') || 'all';
  const rawSubCategoryParam = searchParams.get('subcategory') || '';
  const rawOccasionParam = searchParams.get('occasion') || 'All';
  const rawSearchParam = searchParams.get('search') || '';

  // Resolve main category object
  const activeMainCat: MainCategory | undefined =
    rawCategoryParam.toLowerCase() !== 'all'
      ? getMainCategoryByIdOrSlug(rawCategoryParam)
      : undefined;

  const [selectedCategory, setSelectedCategory] = useState<string>(
    activeMainCat ? activeMainCat.id : 'all'
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(rawSubCategoryParam);
  const [selectedOccasion, setSelectedOccasion] = useState<string>(rawOccasionParam);
  const [searchQuery, setSearchQuery] = useState<string>(rawSearchParam);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Sync state if URL search params change (e.g. from header mega menu clicks or links)
  useEffect(() => {
    const catParam = searchParams.get('category') || 'all';
    const subParam = searchParams.get('subcategory') || '';
    const occParam = searchParams.get('occasion') || 'All';
    const searchParam = searchParams.get('search') || '';

    const resolvedMain = catParam.toLowerCase() !== 'all' ? getMainCategoryByIdOrSlug(catParam) : undefined;
    setSelectedCategory(resolvedMain ? resolvedMain.id : 'all');
    setSelectedSubCategory(subParam);
    setSelectedOccasion(occParam);
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Handle Main Category Change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(''); // Reset subcategory when switching main category

    const newParams = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      newParams.delete('category');
      newParams.delete('subcategory');
    } else {
      newParams.set('category', categoryId);
      newParams.delete('subcategory');
    }
    setSearchParams(newParams);
  };

  // Handle Subcategory Change
  const handleSubCategoryChange = (subId: string) => {
    const sub = getSubCategoryById(subId);
    const isClearing = selectedSubCategory === subId || sub?.isAll;

    const newParams = new URLSearchParams(searchParams);
    if (isClearing) {
      setSelectedSubCategory('');
      newParams.delete('subcategory');
    } else {
      setSelectedSubCategory(subId);
      newParams.set('subcategory', subId);
      // Ensure parent category is synced in URL
      if (sub && sub.parentCategory) {
        newParams.set('category', sub.parentCategory);
        setSelectedCategory(sub.parentCategory);
      }
    }
    setSearchParams(newParams);
  };

  const handleOccasionChange = (occasion: string) => {
    setSelectedOccasion(occasion);
    const newParams = new URLSearchParams(searchParams);
    if (occasion === 'All') {
      newParams.delete('occasion');
    } else {
      newParams.set('occasion', occasion);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSubCategory('');
    setSelectedOccasion('All');
    setSearchQuery('');
    setSortBy('featured');
    setSearchParams({});
  };

  // Resolve current active main category and subcategory info
  const currentCategoryData =
    selectedCategory !== 'all' ? getMainCategoryByIdOrSlug(selectedCategory) : undefined;
  const currentSubCategoryData = selectedSubCategory
    ? getSubCategoryById(selectedSubCategory)
    : undefined;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // 1. Filter by Main Category
    if (selectedCategory !== 'all' && currentCategoryData) {
      const targetParentId = currentCategoryData.id;
      result = result.filter((p) => {
        const prodParent = getProductParentCategoryId(p);
        if (prodParent === targetParentId) return true;
        // Direct category name match
        const catStr = (p.category || '').toLowerCase();
        if (catStr === currentCategoryData.name.toLowerCase() || catStr === currentCategoryData.id.toLowerCase()) {
          return true;
        }
        // Special case: Desserts includes jar cakes, cupcakes, brownies, donuts, cheesecakes
        if (targetParentId === 'desserts') {
          return prodParent === 'jar-cakes' || prodParent === 'cupcakes' || catStr.includes('dessert');
        }
        return false;
      });
    }

    // 2. Filter by Subcategory (using exact parentCategory and subcategory ID)
    if (selectedSubCategory && currentSubCategoryData) {
      result = result.filter((p) =>
        doesProductMatchSubcategory(p, selectedSubCategory)
      );
    }

    // 3. Filter by Occasion
    if (selectedOccasion !== 'All') {
      result = result.filter((p) =>
        (p.occasions || []).some(
          (occ) => occ.toLowerCase() === selectedOccasion.toLowerCase()
        )
      );
    }

    // 4. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.flavourTag && p.flavourTag.toLowerCase().includes(q))
      );
    }

    // 5. Sort products
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else {
      // featured first
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [
    allProducts,
    selectedCategory,
    currentCategoryData,
    selectedSubCategory,
    currentSubCategoryData,
    selectedOccasion,
    searchQuery,
    sortBy,
  ]);

  return (
    <div className="bg-[#FFFDFB] min-h-screen py-10 sm:py-16 text-[#2A1810]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D83A6F] bg-[#FFF0F4] px-4 py-1.5 rounded-full border border-[#F3DFE5]">
            <Sparkles className="w-3.5 h-3.5 text-[#D83A6F]" />
            <span>Jaipur Artisanal Bakery</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2A1810]">
            {currentCategoryData ? currentCategoryData.name : 'The Patisserie Menu'}
          </h1>

          <p className="text-sm sm:text-base text-[#2A1810]/75 font-light leading-relaxed">
            {currentCategoryData
              ? currentCategoryData.description
              : '100% pure eggless celebration cakes, vintage Lambeth creations, bento treats, and bespoke gift hampers. Baked fresh to order in Jaipur.'}
          </p>
        </div>

        {/* 1. MAIN CATEGORY TABS (All 9 Categories + "All Items") */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-4 scrollbar-none gap-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#D83A6F] text-white shadow-xs'
                : 'bg-white text-[#2A1810]/80 hover:bg-[#FFF0F4] hover:text-[#D83A6F] border border-[#F3DFE5]'
            }`}
          >
            All Items
          </button>

          {MAIN_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#D83A6F] text-white shadow-xs'
                    : 'bg-white text-[#2A1810]/80 hover:bg-[#FFF0F4] hover:text-[#D83A6F] border border-[#F3DFE5]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* 2. SUBCATEGORY FILTER BAR (Shown when a category is selected) */}
        {currentCategoryData && currentCategoryData.subcategories.length > 0 && (
          <div className="mb-8 bg-[#FFF5F7]/70 border border-[#FCE3E9] rounded-2xl p-3.5 sm:p-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2 mb-2.5 px-1">
              <span className="text-xs uppercase tracking-widest font-bold text-[#D83A6F]">
                {currentCategoryData.name} Subcategories:
              </span>
              {selectedSubCategory && (
                <button
                  onClick={() => handleSubCategoryChange('')}
                  className="text-xs text-[#D83A6F] hover:underline font-semibold"
                >
                  View All {currentCategoryData.name}
                </button>
              )}
            </div>

            {/* Subcategory Pill/Chip Row: Short, Clean Names without Repeating Parent Category */}
            <div className="flex flex-wrap items-center gap-2">
              {currentCategoryData.subcategories.map((sub) => {
                const isSubSelected =
                  selectedSubCategory === sub.id || (!selectedSubCategory && sub.isAll);
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubCategoryChange(sub.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                      isSubSelected
                        ? 'bg-[#D83A6F] text-white shadow-xs font-semibold'
                        : 'bg-white text-[#2A1810]/80 hover:bg-white hover:text-[#D83A6F] border border-[#F3DFE5]'
                    }`}
                  >
                    <span>{sub.name}</span>
                    {isSubSelected && !sub.isAll && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between text-xs sm:text-sm text-[#2A1810]/70">
          <span>
            Showing <strong className="font-bold text-[#2A1810] tabular-nums">{filteredProducts.length}</strong> artisanal creations
            {currentCategoryData ? ` in ${currentCategoryData.name}` : ''}
            {currentSubCategoryData && !currentSubCategoryData.isAll ? ` · ${currentSubCategoryData.name}` : ''}
          </span>
          <span className="text-[#D83A6F] font-serif italic hidden sm:inline">
            100% Eggless Pâtisserie in Jaipur
          </span>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-[#F3DFE5] max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FFF0F4] mx-auto flex items-center justify-center text-[#D83A6F]">
              <Cake className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#2A1810]">
              No creations found
            </h3>
            <p className="text-sm text-[#2A1810]/70 leading-relaxed font-light">
              We couldn't find any creations matching your current selection ({currentCategoryData?.name}
              {currentSubCategoryData ? ` - ${currentSubCategoryData.name}` : ''}).
              Try resetting filters or choosing a different category.
            </p>
            <div className="pt-2">
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
