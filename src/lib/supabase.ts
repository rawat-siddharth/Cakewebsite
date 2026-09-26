import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DatabaseProduct,
  DatabaseCategory,
  DatabaseOrder,
  DatabaseDeliverySettings,
  DatabaseWebsiteSettings,
  OrderStatus
} from '../types/supabase';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';

// Retrieve credentials from Vite public environment variables
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to locally saved credentials if entered via admin settings
const LOCAL_SUPABASE_URL = typeof window !== 'undefined' ? localStorage.getItem('cnc_supabase_url') || '' : '';
const LOCAL_SUPABASE_ANON_KEY = typeof window !== 'undefined' ? localStorage.getItem('cnc_supabase_anon_key') || '' : '';

export const SUPABASE_URL = (ENV_SUPABASE_URL && !ENV_SUPABASE_URL.includes('your-project')) 
  ? ENV_SUPABASE_URL 
  : LOCAL_SUPABASE_URL;

export const SUPABASE_ANON_KEY = (ENV_SUPABASE_ANON_KEY && !ENV_SUPABASE_ANON_KEY.includes('your-anon'))
  ? ENV_SUPABASE_ANON_KEY
  : LOCAL_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL.startsWith('https://') &&
    SUPABASE_URL.includes('.supabase.co')
  );
};

// Singleton Supabase client instance (or dummy client if not yet connected)
let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return clientInstance;
};

export const updateSupabaseCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cnc_supabase_url', url.trim());
    localStorage.setItem('cnc_supabase_anon_key', key.trim());
    clientInstance = null; // reset client so it re-initializes
  }
};

// ==============================================================================
// LOCAL STORAGE BACKING FOR DEVELOPMENT / OFFLINE FALLBACK
// ==============================================================================
const LOCAL_PRODUCTS_KEY = 'cnc_local_products';
const LOCAL_CATEGORIES_KEY = 'cnc_local_categories';
const LOCAL_ORDERS_KEY = 'cnc_local_orders';
const LOCAL_SETTINGS_KEY = 'cnc_local_settings';
const LOCAL_DELIVERY_KEY = 'cnc_local_delivery';

// Initial local seeds converted to Database types
const INITIAL_DB_CATEGORIES: DatabaseCategory[] = CATEGORIES.map((c, idx) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  description: c.description,
  image: c.image,
  item_count: c.itemCount,
  display_order: idx + 1,
  is_published: true,
}));

const INITIAL_DB_PRODUCTS: DatabaseProduct[] = PRODUCTS.map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  category: p.category,
  flavour_tag: p.flavourTag || null,
  description: p.description,
  price: p.price,
  weight_prices: p.weightPrices || null,
  images: p.images,
  featured: p.featured,
  is_new: p.isNew || false,
  is_published: true,
  is_available: true,
  occasions: p.occasions,
  available_sizes: p.availableSizes || [],
  available_flavours: p.availableFlavours || [],
  customization_options: p.customizationOptions || [],
  advance_order_notice: p.advanceOrderNotice,
  flavourOptions: p.flavourOptions || p.availableFlavours || [],
  weightOptions: p.weightOptions || p.availableSizes || [],
  maxFlavoursByWeight: p.maxFlavoursByWeight,
  supportsFlavourDistribution: p.supportsFlavourDistribution,
  flavourDistributionOptions: p.flavourDistributionOptions,
  flavourCombinationPricing: p.flavourCombinationPricing,
}));

const DEFAULT_WEBSITE_SETTINGS: DatabaseWebsiteSettings = {
  id: 'default',
  brand_name: 'Cake N Crave',
  whatsapp_number: '7976541365',
  instagram_handle: 'cakencrave_jaipur',
  business_location: 'Jaipur, Rajasthan, India',
  announcement_text: '100% Pure Eggless Pâtisserie · Baked Fresh Daily in Jaipur · WhatsApp: 7976541365',
  hero_heading: 'Pure Eggless, Crafted for Wonder.',
  hero_description: 'Jaipur’s boutique patisserie specializing in 100% eggless vintage tiered cakes, delicate bento treats, and luxury chocolate bouquets.',
  hero_image: '/src/assets/images/luxury_patisserie_hero_1790175262764.jpg',
};

const DEFAULT_DELIVERY_SETTINGS: DatabaseDeliverySettings = {
  id: 'default',
  city: 'Jaipur',
  delivery_fee: 0,
  min_order_amount: 0,
  advance_hours: 24,
  available_slots: ['Morning (10 AM - 1 PM)', 'Afternoon (1 PM - 5 PM)', 'Evening (5 PM - 9 PM)'],
  blocked_dates: [],
};

// ==============================================================================
// PRODUCT SERVICE
// ==============================================================================
export async function getProducts(options?: { onlyPublished?: boolean }): Promise<DatabaseProduct[]> {
  let dbProducts: DatabaseProduct[] = [];
  const supabase = getSupabase();

  if (supabase) {
    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (options?.onlyPublished) {
        query = query.eq('is_published', true).eq('is_available', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        dbProducts = data.map((item: any) => {
          const wp = item.weight_prices || {};
          return {
            ...item,
            flavourOptions: item.flavourOptions || wp._flavourOptions || item.available_flavours || [],
            weightOptions: item.weightOptions || wp._weightOptions || item.available_sizes || [],
            flavourCombinationPricing: item.flavourCombinationPricing || wp._flavourCombinationPricing || undefined,
            addOns: item.addOns || wp._addOns || [],
          } as DatabaseProduct;
        });
      }
    } catch (err) {
      console.warn('Supabase product fetch failed, falling back to local dataset', err);
    }
  }

  // Get locally cached products
  let localProducts: DatabaseProduct[] = [];
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (cached) {
      try {
        localProducts = JSON.parse(cached);
      } catch (e) {
        localProducts = [];
      }
    } else {
      // First time initialization with initial DB seed
      localProducts = [...INITIAL_DB_PRODUCTS];
      try {
        localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(localProducts));
      } catch (e) {}
    }
  } else {
    localProducts = [...INITIAL_DB_PRODUCTS];
  }

  // If Supabase returned products, merge with local products so that
  // locally created products or offline changes are NEVER lost
  let combined: DatabaseProduct[] = [];
  if (dbProducts.length > 0) {
    const dbMap = new Map<string, DatabaseProduct>();
    dbProducts.forEach((p) => dbMap.set(p.id, p));

    const mergedList: DatabaseProduct[] = [...dbProducts];
    localProducts.forEach((lp) => {
      const existing = dbMap.get(lp.id);
      if (!existing) {
        mergedList.unshift(lp);
      } else {
        const localTime = new Date(lp.updated_at || 0).getTime();
        const dbTime = new Date(existing.updated_at || 0).getTime();
        if (localTime > dbTime) {
          const idx = mergedList.findIndex((p) => p.id === lp.id);
          if (idx >= 0) mergedList[idx] = lp;
        }
      }
    });
    combined = mergedList;
  } else {
    combined = localProducts.length > 0 ? localProducts : INITIAL_DB_PRODUCTS;
  }

  if (options?.onlyPublished) {
    return combined.filter((p) => p.is_published && p.is_available);
  }
  return combined;
}

export async function getProductBySlug(slug: string): Promise<DatabaseProduct | null> {
  const products = await getProducts({ onlyPublished: false });
  return products.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function saveProduct(product: Partial<DatabaseProduct> & { name: string }): Promise<DatabaseProduct> {
  const supabase = getSupabase();
  const id = product.id || `cake-${Date.now()}`;
  const slug = product.slug?.trim() || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;

  const payload: DatabaseProduct = {
    id,
    slug,
    name: product.name,
    category: product.category || 'Cakes',
    flavour_tag: product.flavour_tag || null,
    description: product.description || '',
    price: Number(product.price) || 0,
    weight_prices: product.weight_prices || null,
    images: product.images && product.images.length > 0 ? product.images : ['/src/assets/images/hero_cake_display_1790174282202.jpg'],
    featured: Boolean(product.featured),
    is_new: Boolean(product.is_new),
    is_published: product.is_published !== false,
    is_available: product.is_available !== false,
    occasions: product.occasions || ['Birthday'],
    available_sizes: product.available_sizes || ['0.5 Kg', '1 Kg'],
    available_flavours: product.available_flavours || [],
    customization_options: product.customization_options || [],
    advance_order_notice: product.advance_order_notice || 'Please order at least 24 hours in advance',
    flavourOptions: product.flavourOptions || product.available_flavours || [],
    weightOptions: product.weightOptions || product.available_sizes || [],
    flavourCombinationPricing: product.flavourCombinationPricing || (product as any).flavour_combination_pricing || undefined,
    addOns: product.addOns || [],
    updated_at: new Date().toISOString(),
  };

  // 1. ALWAYS persist locally so admin changes & newly created products are immediately available
  if (typeof window !== 'undefined') {
    try {
      const current = await getProducts({ onlyPublished: false });
      const index = current.findIndex((p) => p.id === id);
      if (index >= 0) {
        current[index] = payload;
      } else {
        current.unshift(payload);
      }
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(current));
    } catch (storageErr) {
      console.warn('LocalStorage save warning:', storageErr);
    }

    // Dispatch global event for instant storefront reactivity across context & components
    window.dispatchEvent(new CustomEvent('cnc_products_updated', { detail: payload }));
  }

  // 2. Sync to Supabase if configured (using exact columns matching PostgreSQL schema)
  if (supabase) {
    try {
      const dbPayload = {
        id: payload.id,
        slug: payload.slug,
        name: payload.name,
        category: payload.category,
        flavour_tag: payload.flavour_tag,
        description: payload.description,
        price: payload.price,
        weight_prices: {
          ...(payload.weight_prices || {}),
          _flavourOptions: payload.flavourOptions,
          _weightOptions: payload.weightOptions,
          _flavourCombinationPricing: payload.flavourCombinationPricing,
          _addOns: payload.addOns,
        },
        images: payload.images,
        featured: payload.featured,
        is_new: payload.is_new,
        is_published: payload.is_published,
        is_available: payload.is_available,
        occasions: payload.occasions,
        available_sizes: payload.available_sizes,
        available_flavours: payload.available_flavours,
        customization_options: payload.customization_options,
        advance_order_notice: payload.advance_order_notice,
        updated_at: payload.updated_at,
      };

      const { data, error } = await supabase.from('products').upsert(dbPayload).select().single();
      if (!error && data) {
        console.log('Product saved successfully to Supabase:', data.id);
      } else if (error) {
        console.warn('Supabase upsert warning (stored in local database):', error);
      }
    } catch (err) {
      console.warn('Failed to save product in Supabase (preserved in local storage)', err);
    }
  }

  return payload;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.warn('Failed to delete in Supabase, removing locally', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const current = await getProducts({ onlyPublished: false });
      const filtered = current.filter((p) => p.id !== id);
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(filtered));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('cnc_products_updated', { detail: { id, deleted: true } }));
  }
  return true;
}

// ==============================================================================
// CATEGORY SERVICE
// ==============================================================================
export async function getCategories(options?: { onlyPublished?: boolean }): Promise<DatabaseCategory[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('categories').select('*').order('display_order', { ascending: true });
      if (options?.onlyPublished) {
        query = query.eq('is_published', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as DatabaseCategory[];
      }
    } catch (err) {
      console.warn('Supabase category fetch failed, falling back to local dataset', err);
    }
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (cached) {
      try {
        const parsed: DatabaseCategory[] = JSON.parse(cached);
        if (options?.onlyPublished) {
          return parsed.filter((c) => c.is_published);
        }
        return parsed;
      } catch (e) {}
    }
  }

  if (options?.onlyPublished) {
    return INITIAL_DB_CATEGORIES.filter((c) => c.is_published);
  }
  return INITIAL_DB_CATEGORIES;
}

export async function saveCategory(category: Partial<DatabaseCategory> & { name: string }): Promise<DatabaseCategory> {
  const supabase = getSupabase();
  const id = category.id || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const slug = category.slug || id;

  const payload: DatabaseCategory = {
    id,
    name: category.name,
    slug,
    description: category.description || '',
    image: category.image || '/src/assets/images/hero_cake_display_1790174282202.jpg',
    item_count: category.item_count || 0,
    display_order: category.display_order || 1,
    is_published: category.is_published !== false,
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('categories').upsert(payload).select().single();
      if (!error && data) {
        return data as DatabaseCategory;
      }
    } catch (err) {
      console.warn('Could not save category to Supabase, saving locally', err);
    }
  }

  if (typeof window !== 'undefined') {
    const current = await getCategories({ onlyPublished: false });
    const index = current.findIndex((c) => c.id === id);
    if (index >= 0) {
      current[index] = payload;
    } else {
      current.push(payload);
    }
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(current));
  }
  return payload;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (e) {}
  }
  if (typeof window !== 'undefined') {
    const current = await getCategories({ onlyPublished: false });
    const filtered = current.filter((c) => c.id !== id);
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(filtered));
  }
  return true;
}

// ==============================================================================
// ORDER SERVICE (Records real WhatsApp placed orders)
// ==============================================================================
export async function getOrders(): Promise<DatabaseOrder[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data as DatabaseOrder[];
      }
    } catch (err) {
      console.warn('Could not load orders from Supabase', err);
    }
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
  }
  return [];
}

export async function recordPlacedOrder(order: Omit<DatabaseOrder, 'id' | 'created_at' | 'status'>): Promise<DatabaseOrder> {
  const id = `CNC-ORD-${Date.now().toString().slice(-6)}`;
  const payload: DatabaseOrder = {
    ...order,
    id,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').insert(payload).select().single();
      if (!error && data) {
        return data as DatabaseOrder;
      }
    } catch (err) {
      console.warn('Could not record order to Supabase, logging locally', err);
    }
  }

  if (typeof window !== 'undefined') {
    const orders = await getOrders();
    orders.unshift(payload);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  }
  return payload;
}

export async function updateOrderStatus(id: string, status: OrderStatus, internalNotes?: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (internalNotes !== undefined) {
        updateData.internal_notes = internalNotes;
      }
      await supabase.from('orders').update(updateData).eq('id', id);
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    const orders = await getOrders();
    const target = orders.find((o) => o.id === id);
    if (target) {
      target.status = status;
      if (internalNotes !== undefined) target.internal_notes = internalNotes;
      target.updated_at = new Date().toISOString();
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    }
  }
  return true;
}

// ==============================================================================
// SETTINGS SERVICE
// ==============================================================================
export async function getWebsiteSettings(): Promise<DatabaseWebsiteSettings> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('website_settings').select('*').eq('id', 'default').single();
      if (!error && data) {
        return data as DatabaseWebsiteSettings;
      }
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
  }
  return DEFAULT_WEBSITE_SETTINGS;
}

export async function saveWebsiteSettings(settings: Partial<DatabaseWebsiteSettings>): Promise<DatabaseWebsiteSettings> {
  const payload = { ...DEFAULT_WEBSITE_SETTINGS, ...settings, id: 'default', updated_at: new Date().toISOString() };
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('website_settings').upsert(payload).select().single();
      if (!error && data) return data as DatabaseWebsiteSettings;
    } catch (e) {}
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(payload));
  }
  return payload;
}

export async function getDeliverySettings(): Promise<DatabaseDeliverySettings> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('delivery_settings').select('*').eq('id', 'default').single();
      if (!error && data) {
        return data as DatabaseDeliverySettings;
      }
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_DELIVERY_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
  }
  return DEFAULT_DELIVERY_SETTINGS;
}

export async function saveDeliverySettings(settings: Partial<DatabaseDeliverySettings>): Promise<DatabaseDeliverySettings> {
  const payload = { ...DEFAULT_DELIVERY_SETTINGS, ...settings, id: 'default', updated_at: new Date().toISOString() };
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('delivery_settings').upsert(payload).select().single();
      if (!error && data) return data as DatabaseDeliverySettings;
    } catch (e) {}
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_DELIVERY_KEY, JSON.stringify(payload));
  }
  return payload;
}

// ==============================================================================
// STORAGE SERVICE (Product Image Uploads)
// ==============================================================================
export async function compressImageToDataUrl(file: File, maxDim = 800, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(rawResult);
        }
      };
      img.onerror = () => resolve(rawResult);
      img.src = rawResult;
    };
    reader.onerror = () => resolve('/src/assets/images/hero_cake_display_1790174282202.jpg');
    reader.readAsDataURL(file);
  });
}

export async function uploadProductImage(file: File): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) {
    // Return compressed lightweight data URL preview for offline/local storage
    return compressImageToDataUrl(file);
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (!uploadError) {
      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      if (data?.publicUrl) return data.publicUrl;
    }
  } catch (err) {
    console.warn('Storage upload error, falling back to local compressed preview', err);
  }

  // Fallback to compressed data url if bucket is not yet provisioned or upload failed
  return compressImageToDataUrl(file);
}

// ==============================================================================
// AUTHENTICATION & ROLE VERIFICATION
// ==============================================================================
export async function checkIsAdmin(userId?: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    // If Supabase is not yet configured, allow local authorized admin session
    return typeof window !== 'undefined' && localStorage.getItem('cnc_admin_authenticated') === 'true';
  }

  let userEmail = '';
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    userId = user.id;
    userEmail = user.email || '';
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === userId) {
      userEmail = user.email || '';
    }
  }

  const cleanEmail = userEmail.toLowerCase().trim();
  // Designated owner & bakery staff emails are granted full admin privileges
  if (cleanEmail === 'sidhurawat2210@gmail.com' || cleanEmail === 'admin@cakencrave.com') {
    try {
      await supabase.from('user_roles').upsert(
        { user_id: userId, role: 'admin' },
        { onConflict: 'user_id,role' }
      );
    } catch (e) {
      // Non-fatal if table doesn't exist yet
    }
    return true;
  }

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'super_admin'])
      .maybeSingle();

    if (!error && data) {
      return true;
    }

    // If no roles exist yet in the database, automatically initialize this user as the first admin
    const { count, error: countErr } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true });

    if (countErr || count === 0) {
      try {
        await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
      } catch (e) {}
      return true;
    }

    return false;
  } catch (err) {
    console.error('Failed to verify admin role', err);
    // If table query fails, fallback to authorizing the authenticated user
    return Boolean(userId);
  }
}
