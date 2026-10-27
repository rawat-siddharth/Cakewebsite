import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  DatabaseProduct,
  DatabaseCategory,
  DatabaseWebsiteSettings,
  DatabaseDeliverySettings,
  HomepageBannerSlide,
  CustomerGalleryItem
} from '../types/supabase';
import {
  getProducts,
  getCategories,
  getWebsiteSettings,
  getDeliverySettings,
  getHomepageBanners,
  getCustomerGallery,
  getTrendingCakeIds,
  DEFAULT_HOMEPAGE_BANNERS,
  DEFAULT_CUSTOMER_GALLERY,
  DEFAULT_TRENDING_CAKE_IDS
} from '../lib/supabase';
import { getDynamicHeaderCategories, MainCategory } from '../data/categories';

interface StoreContextType {
  products: DatabaseProduct[];
  categories: DatabaseCategory[];
  mainCategories: MainCategory[];
  websiteSettings: DatabaseWebsiteSettings;
  deliverySettings: DatabaseDeliverySettings;
  homepageBanners: HomepageBannerSlide[];
  customerGallery: CustomerGalleryItem[];
  trendingCakeIds: string[];
  loading: boolean;
  refreshStoreData: () => Promise<void>;
  featuredProducts: DatabaseProduct[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [websiteSettings, setWebsiteSettings] = useState<DatabaseWebsiteSettings>({
    id: 'default',
    brand_name: 'Cake N Crave',
    whatsapp_number: '7976541365',
    instagram_handle: 'cakencrave_jaipur',
    business_location: 'Jaipur, Rajasthan, India',
    announcement_text: '100% Pure Eggless Pâtisserie · Baked Fresh Daily in Jaipur · WhatsApp: 7976541365',
    hero_heading: 'Pure Eggless, Crafted for Wonder.',
    hero_description: 'Jaipur’s boutique patisserie specializing in 100% eggless vintage tiered cakes, delicate bento treats, and luxury chocolate bouquets.',
    hero_image: '/src/assets/images/luxury_patisserie_hero_1790175262764.jpg',
  });
  const [deliverySettings, setDeliverySettings] = useState<DatabaseDeliverySettings>({
    id: 'default',
    city: 'Jaipur',
    delivery_fee: 0,
    min_order_amount: 0,
    advance_hours: 24,
    available_slots: ['Morning (10 AM - 1 PM)', 'Afternoon (1 PM - 5 PM)', 'Evening (5 PM - 9 PM)'],
    blocked_dates: [],
  });
  const [homepageBanners, setHomepageBanners] = useState<HomepageBannerSlide[]>(DEFAULT_HOMEPAGE_BANNERS);
  const [customerGallery, setCustomerGallery] = useState<CustomerGalleryItem[]>(DEFAULT_CUSTOMER_GALLERY);
  const [trendingCakeIds, setTrendingCakeIds] = useState<string[]>(DEFAULT_TRENDING_CAKE_IDS);
  const [loading, setLoading] = useState(true);

  const refreshStoreData = useCallback(async () => {
    try {
      const [prods, cats, webSet, delSet, banners, gallery, trendingIds] = await Promise.all([
        getProducts({ onlyPublished: true }),
        getCategories({ onlyPublished: true }),
        getWebsiteSettings(),
        getDeliverySettings(),
        getHomepageBanners(),
        getCustomerGallery(),
        getTrendingCakeIds(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setWebsiteSettings(webSet);
      setDeliverySettings(delSet);
      setHomepageBanners(banners);
      setCustomerGallery(gallery);
      setTrendingCakeIds(trendingIds);
    } catch (err) {
      console.error('Failed to load store data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStoreData();

    const handleDataUpdated = () => {
      refreshStoreData();
    };

    window.addEventListener('cnc_products_updated', handleDataUpdated);
    window.addEventListener('cnc_categories_updated', handleDataUpdated);
    window.addEventListener('cnc_category_master_updated', handleDataUpdated);
    window.addEventListener('cnc_homepage_updated', handleDataUpdated);
    window.addEventListener('storage', handleDataUpdated);

    return () => {
      window.removeEventListener('cnc_products_updated', handleDataUpdated);
      window.removeEventListener('cnc_categories_updated', handleDataUpdated);
      window.removeEventListener('cnc_category_master_updated', handleDataUpdated);
      window.removeEventListener('cnc_homepage_updated', handleDataUpdated);
      window.removeEventListener('storage', handleDataUpdated);
    };
  }, [refreshStoreData]);

  const mainCategories = useMemo(() => {
    return getDynamicHeaderCategories(categories);
  }, [categories]);

  const featuredProducts = products.filter((p) => p.featured);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        mainCategories,
        websiteSettings,
        deliverySettings,
        homepageBanners,
        customerGallery,
        trendingCakeIds,
        loading,
        refreshStoreData,
        featuredProducts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
