import React from 'react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, Product } from '../data/products';
import { PromotionalBannerSlider } from '../components/home/PromotionalBannerSlider';
import { CategoryRow } from '../components/home/CategoryRow';
import { CustomerCakeGallery } from '../components/home/CustomerCakeGallery';
import { TrendingCakes } from '../components/home/TrendingCakes';
import { ShopByOccasion } from '../components/home/ShopByOccasion';

export function Home() {
  const {
    products: storeProducts,
    homepageBanners,
    customerGallery,
    trendingCakeIds,
  } = useStore();

  const allProducts = React.useMemo(() => {
    const list = storeProducts && storeProducts.length > 0 ? storeProducts : PRODUCTS;
    return list.map((p) => ({
      ...p,
      description: p.description || '',
    })) as Product[];
  }, [storeProducts]);

  return (
    <div className="bg-[#FFFBFB] min-h-screen text-[#5C4033]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12 sm:space-y-16">
        
        {/* 1. Promotional Banner Slider (4-5 Editable Bakery Slides) */}
        <section aria-label="Promotional Highlights">
          <PromotionalBannerSlider slides={homepageBanners} />
        </section>

        {/* 2. Cakes, Hampers, and Bento Cakes Category Row (1 Row on Mobile & Desktop) */}
        <CategoryRow />

        {/* 3. Customer Cake Gallery / Customer Love ("Made for Your Moments") */}
        <CustomerCakeGallery items={customerGallery} />

        {/* 4. Trending Cakes (Live Catalog Products with Starting Prices & Add Action) */}
        <TrendingCakes products={allProducts} trendingIds={trendingCakeIds} />

        {/* 5. Shop by Occasion (Pastel Rounded Occasion Cards) */}
        <ShopByOccasion />

      </div>
    </div>
  );
}
