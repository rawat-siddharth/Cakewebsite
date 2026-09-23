export interface DatabaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  item_count: number;
  display_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  flavour_tag?: string | null;
  flavourTag?: string;
  description: string | null;
  price: number;
  weight_prices?: Record<string, number> | null;
  weightPrices?: Record<string, number>;
  images: string[];
  featured: boolean;
  is_new?: boolean;
  isNew?: boolean;
  is_published: boolean;
  isPublished?: boolean;
  is_available: boolean;
  isAvailable?: boolean;
  occasions?: string[];
  available_sizes?: string[];
  availableSizes?: string[];
  available_flavours?: string[];
  availableFlavours?: string[];
  customization_options?: string[];
  customizationOptions?: string[];
  advance_order_notice?: string | null;
  advanceOrderNotice?: string;
  flavourOptions?: string[];
  weightOptions?: string[];
  maxFlavoursByWeight?: Record<string, number>;
  supportsFlavourDistribution?: boolean;
  flavourDistributionOptions?: Record<string, string[]>;
  flavourCombinationPricing?: Record<string, Record<string, number>>;
  addOns?: Array<{ id: string; name: string; price: number; description?: string }>;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseOrderItem {
  id: string;
  productName: string;
  selectedSize?: string;
  selectedFlavour?: string;
  selectedFlavours?: string[];
  flavourDistribution?: string;
  selectedAddOns?: Array<{ id: string; name: string; price: number }>;
  customMessage?: string;
  quantity: number;
  unitPrice: number;
  specialInstructions?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface DatabaseOrder {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  delivery_date?: string;
  delivery_area?: string;
  special_instructions?: string;
  items: DatabaseOrderItem[];
  subtotal: number;
  status: OrderStatus;
  internal_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseDeliverySettings {
  id: string;
  city: string;
  delivery_fee: number;
  min_order_amount: number;
  advance_hours: number;
  available_slots: string[];
  blocked_dates: string[];
  updated_at?: string;
}

export interface DatabaseWebsiteSettings {
  id: string;
  brand_name: string;
  whatsapp_number: string;
  instagram_handle: string;
  business_location: string;
  announcement_text: string;
  hero_heading: string;
  hero_description: string;
  hero_image?: string;
  updated_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
  created_at?: string;
}
