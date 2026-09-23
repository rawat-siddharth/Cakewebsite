import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  DatabaseProduct,
  DatabaseCategory,
  DatabaseWebsiteSettings,
  DatabaseDeliverySettings
} from '../types/supabase';
import {
  getProducts,
  getCategories,
  getWebsiteSettings,
  getDeliverySettings
} from '../lib/supabase';

interface StoreContextType {
  products: DatabaseProduct[];
  categories: DatabaseCategory[];
  websiteSettings: DatabaseWebsiteSettings;
  deliverySettings: DatabaseDeliverySettings;
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
  const [loading, setLoading] = useState(true);

  const refreshStoreData = useCallback(async () => {
    try {
      const [prods, cats, webSet, delSet] = await Promise.all([
        getProducts({ onlyPublished: true }),
        getCategories({ onlyPublished: true }),
        getWebsiteSettings(),
        getDeliverySettings(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setWebsiteSettings(webSet);
      setDeliverySettings(delSet);
    } catch (err) {
      console.error('Failed to load store data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStoreData();
  }, [refreshStoreData]);

  const featuredProducts = products.filter((p) => p.featured);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        websiteSettings,
        deliverySettings,
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
