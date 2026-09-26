/**
 * Cake N Crave - Central Category Master Settings & Options Engine
 * Manages reusable master options per category:
 * - Subcategories
 * - Types (e.g. Hamper Types, Cake Types, Bento Styles, Dessert Types, Bouquet Types)
 * - Sizes / Packages (e.g. Small/Medium/Large, 0.5 Kg/1 Kg, Box sizes)
 * - Flavours (for Cakes, Bento, Desserts, Chocolates)
 * - Customization Options (e.g. Message Card, Name on Box, Satin Ribbon)
 * 
 * Non-technical admins manage these once in Category Settings,
 * and they automatically power the Product form and Storefront.
 */

export interface HamperContentItem {
  id?: string;
  name: string;
  quantity: number | string;
  variant?: string;
  notes?: string;
}

export interface CategoryMasterConfig {
  id: string; // 'cakes' | 'bento-cakes' | 'desserts' | 'hampers' | 'bouquets' | 'cookies' | 'homemade-chocolates' | 'jar-cakes' | 'cupcakes'
  name: string;
  slug: string;
  subcategories: string[];
  
  // Master Types
  typesTitle: string; // e.g. "Hamper Types", "Cake Types", "Bento Styles"
  typesDescription?: string;
  types: string[];
  
  // Master Sizes / Packages
  sizesTitle: string; // e.g. "Package Sizes", "Weight Options", "Bento Sizes"
  sizesDescription?: string;
  sizes: string[];
  
  // Master Flavours
  showFlavours: boolean;
  flavoursTitle?: string;
  flavours: string[];
  
  // Master Customization Options
  customizationsTitle?: string;
  customizations: string[];
  
  // Specific features
  hasContentsRepeater?: boolean;
}

export const DEFAULT_CATEGORY_CONFIGS: Record<string, CategoryMasterConfig> = {
  // 1. HAMPERS
  hampers: {
    id: 'hampers',
    name: 'Hampers',
    slug: 'hampers',
    subcategories: [
      'Birthday',
      'Anniversary',
      'For Girlfriend',
      'For Boyfriend',
      'Engagement',
      'Wedding',
      'Baby Shower',
      'Festive Diwali',
      'Corporate Luxe',
      'Valentine Love',
      'Trending',
    ],
    typesTitle: 'Hamper Types',
    typesDescription: 'Master reusable hamper categories (e.g. Standard, Premium, Chocolate)',
    types: [
      'Standard Hamper',
      'Premium Hamper',
      'Chocolate Hamper',
      'Dessert Hamper',
      'Custom Hamper',
      'Royal Festive Hamper',
    ],
    sizesTitle: 'Package Sizes',
    sizesDescription: 'Selectable package sizes for this hamper',
    sizes: ['Small', 'Medium', 'Large'],
    showFlavours: false,
    flavours: [],
    customizationsTitle: 'Hamper Customization Options',
    customizations: [
      'Message Card',
      'Name',
      'Ribbon',
      'Colour Theme',
      'Personalized Greeting Card',
    ],
    hasContentsRepeater: true,
  },

  // 2. CAKES
  cakes: {
    id: 'cakes',
    name: 'Cakes',
    slug: 'cakes',
    subcategories: [
      'Birthday',
      'Anniversary',
      'Engagement',
      'Wedding',
      'Kids',
      'Baby Shower',
      'Mom-to-Be',
      'Bride-to-Be',
      'Groom-to-Be',
      'Love Theme',
      'Healthy Cakes',
      'Trending',
    ],
    typesTitle: 'Cake Types & Styles',
    typesDescription: 'Artisanal cake silhouettes and finish styles',
    types: [
      'Classic Celebration',
      'Vintage Lambeth',
      'Tiered Wedding',
      'Minimalist Floral',
      'Pinata / Heart',
      'Royal Belgian Truffle',
    ],
    sizesTitle: 'Cake Weight Options',
    sizesDescription: 'Standard eggless cake weight increments',
    sizes: ['0.5 Kg', '1 Kg', '1.5 Kg', '2 Kg', '2.5 Kg', '3 Kg'],
    showFlavours: true,
    flavoursTitle: 'Master Cake Flavours',
    flavours: [
      'Belgian Chocolate Truffle',
      'Fresh Strawberry Cream',
      'Pineapple Classic',
      'Red Velvet Cream Cheese',
      'Butterscotch Crunch',
      'Nutella Hazelnut',
      'Dark Ganache Truffle',
      'Blueberry Bliss',
      'Black Forest Royal',
      'Biscoff Caramel Crunch',
    ],
    customizationsTitle: 'Cake Customization Options',
    customizations: [
      'Piped Calligraphy Message',
      'Golden Acrylic Cake Topper',
      'Artisanal Sparkler Candle',
      'Fondant Name Charm',
      'Vintage Pearl Sugar Border',
    ],
  },

  // 3. BENTO CAKES
  'bento-cakes': {
    id: 'bento-cakes',
    name: 'Bento Cakes',
    slug: 'bento-cakes',
    subcategories: [
      'Birthday',
      'Anniversary',
      'Love Theme',
      'For Girlfriend',
      'For Boyfriend',
      'Just Because',
      'Congratulations',
      'Trending Pastel',
    ],
    typesTitle: 'Bento Styles',
    typesDescription: 'Korean lunchbox cake piping & artistic motifs',
    types: [
      'Korean Shell Border',
      'Cute Aesthetic Illustration',
      'Vintage Text Plaque',
      'Pastel Floral Border',
      'Minimalist Heart',
    ],
    sizesTitle: 'Bento Sizes',
    sizesDescription: 'Portion sizes for Korean bento boxes',
    sizes: ['Single Bento (250g)', 'Grand Bento (350g)', 'Bento Duo Set'],
    showFlavours: true,
    flavoursTitle: 'Bento Cake Flavours',
    flavours: [
      'Belgian Chocolate Truffle',
      'Fresh Vanilla Strawberry',
      'Red Velvet & Cheese Cream',
      'Lotus Biscoff',
      'Dark Fudge Ganache',
      'Blueberry Swirl',
    ],
    customizationsTitle: 'Bento Customizations',
    customizations: [
      'Custom Piped Message (Short Text)',
      'Eco Wooden Spoon Included',
      'Pastel Taper Candle',
      'Cute Satin Bow',
    ],
  },

  // 4. DESSERTS
  desserts: {
    id: 'desserts',
    name: 'Desserts',
    slug: 'desserts',
    subcategories: [
      'Jar Cakes',
      'Cupcakes',
      'Cheesecakes',
      'Brownies',
      'Donuts',
      'Party Packs',
      'Assorted Combos',
    ],
    typesTitle: 'Dessert Types',
    typesDescription: 'Individual patisserie & dessert category type',
    types: [
      'Jar Cake',
      'Cupcake Box',
      'Cheesecake Slice',
      'Fudgy Brownie',
      'Artisan Donut',
      'Tasting Box',
    ],
    sizesTitle: 'Pack Sizes',
    sizesDescription: 'Box counts and portions',
    sizes: ['Single Pack', 'Box of 2', 'Box of 4', 'Box of 6', 'Party Box of 12'],
    showFlavours: true,
    flavoursTitle: 'Dessert Flavours',
    flavours: [
      'Nutella Rocher',
      'Belgian Dark Truffle',
      'Red Velvet & White Chocolate',
      'Lotus Biscoff',
      'Blueberry Cream Cheese',
      'Walnut Fudge',
      'Salted Caramel',
    ],
    customizationsTitle: 'Dessert Customizations',
    customizations: [
      'Luxury Ribbon Tie',
      'Personalized Gift Sleeve',
      'Assorted Flavour Mix',
      'Eggless Assurance Tag',
    ],
  },

  // 5. BOUQUETS
  bouquets: {
    id: 'bouquets',
    name: 'Bouquets',
    slug: 'bouquets',
    subcategories: [
      'Chocolate Bouquet',
      'Flower Bouquet',
      'Hybrid Flower & Chocolate',
      'Birthday',
      'Anniversary',
      'Romantic Surprise',
    ],
    typesTitle: 'Bouquet Types',
    typesDescription: 'Handcrafted floral and confection arrangement style',
    types: [
      'Ferrero Rocher Chocolate Bouquet',
      'Fresh Flower Bouquet',
      'Luxury Hybrid Flower & Chocolate',
      'Cadbury & Truffle Mix Bouquet',
    ],
    sizesTitle: 'Bouquet Sizes / Count',
    sizesDescription: 'Arrangement stem & item counts',
    sizes: ['Petite (7 Items)', 'Classic (14 Items)', 'Grand Luxe (21 Items)'],
    showFlavours: true,
    flavoursTitle: 'Flower & Confection Varieties',
    flavours: [
      'Scarlet Red Roses',
      'Ferrero Rocher Gold',
      'Blush Pink Carnations',
      'Cadbury Celebration Mix',
      'Pastel Mixed Blooms',
      'White Orchid Accents',
    ],
    customizationsTitle: 'Bouquet Customizations',
    customizations: [
      'Handwritten Letter Card',
      'Luxury Satin Wrap Colour',
      'Fairy Lights Add-on',
      'Glitter Sparkle Finish',
    ],
  },

  // 6. COOKIES & HOMEMADE CHOCOLATES
  cookies: {
    id: 'cookies',
    name: 'Cookies & Chocolates',
    slug: 'cookies',
    subcategories: [
      'Nankhatai',
      'Chocochip Cookies',
      'Roasted Nut Chocolates',
      'Truffles & Rochers',
      'Heritage Gift Tins',
    ],
    typesTitle: 'Confection Variety',
    typesDescription: 'Artisanal bake and chocolate variety style',
    types: [
      'Homemade Desi Ghee Nankhatai',
      'Belgian Chocochip Butter Cookies',
      'Roasted Almond Nut Clusters',
      'Dark Couverture Rochers',
      'Artisan Bonbon Trio',
    ],
    sizesTitle: 'Pack / Box Sizes',
    sizesDescription: 'Weight or count packaging',
    sizes: ['200g Box', '400g Box', 'Box of 6', 'Box of 12', 'Heritage Gift Tin'],
    showFlavours: true,
    flavoursTitle: 'Flavour Varieties',
    flavours: [
      'Traditional Desi Ghee Cardamom',
      'Dark Belgian Chocolate',
      'Roasted Almond & Hazelnut',
      'Pistachio Saffron',
      'Orange Zest Dark Cocoa',
    ],
    customizationsTitle: 'Packaging Customizations',
    customizations: [
      'Luxury Gift Packaging',
      'Personalized Tag & Wax Seal',
      'Keepsake Metal Tin',
    ],
  },
};

const MASTER_STORAGE_KEY = 'cnc_category_master_settings_v2';
const EVENT_NAME = 'cnc_category_master_updated';

/**
 * Normalizes a category key to match our master configs
 */
export function normalizeCategoryKey(rawCategory: string): string {
  if (!rawCategory) return 'cakes';
  const clean = rawCategory.toLowerCase().trim();
  if (clean.includes('hamper')) return 'hampers';
  if (clean.includes('bento')) return 'bento-cakes';
  if (clean.includes('bouquet')) return 'bouquets';
  if (clean.includes('cookie') || clean.includes('chocolate') || clean.includes('nankhatai')) return 'cookies';
  if (clean.includes('dessert') || clean.includes('jar') || clean.includes('cupcake')) return 'desserts';
  if (clean.includes('cake')) return 'cakes';
  return 'cakes';
}

/**
 * Retrieves all category master configs from localStorage or defaults
 */
export function getAllCategoryConfigs(): Record<string, CategoryMasterConfig> {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_CATEGORY_CONFIGS };
  }

  try {
    const raw = localStorage.getItem(MASTER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_CATEGORY_CONFIGS,
        ...parsed,
      };
    }
  } catch (err) {
    console.warn('Could not read category master settings from localStorage', err);
  }

  return { ...DEFAULT_CATEGORY_CONFIGS };
}

/**
 * Retrieves the master configuration for a specific category
 */
export function getCategoryConfig(categoryKeyOrName: string): CategoryMasterConfig {
  const all = getAllCategoryConfigs();
  const key = normalizeCategoryKey(categoryKeyOrName);
  return all[key] || DEFAULT_CATEGORY_CONFIGS[key] || DEFAULT_CATEGORY_CONFIGS.cakes;
}

/**
 * Saves an updated category master config to localStorage and notifies listeners
 */
export function saveCategoryConfig(config: CategoryMasterConfig): void {
  if (typeof window === 'undefined') return;

  try {
    const all = getAllCategoryConfigs();
    all[config.id] = config;
    localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(all));

    // Dispatch event so active forms update instantly
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { categoryId: config.id } }));
  } catch (err) {
    console.error('Failed to save category master config', err);
  }
}

/**
 * Resets a category config to pristine bakery defaults
 */
export function resetCategoryConfig(categoryId: string): CategoryMasterConfig {
  const key = normalizeCategoryKey(categoryId);
  const defaultCfg = DEFAULT_CATEGORY_CONFIGS[key] || DEFAULT_CATEGORY_CONFIGS.cakes;
  saveCategoryConfig({ ...defaultCfg });
  return defaultCfg;
}

/**
 * Extracts unified structured data for any product regardless of category
 */
export function extractProductDetails(product: any): {
  categoryKey: string;
  categoryConfig: CategoryMasterConfig;
  typeValue: string;
  selectedSizes: string[];
  sizePricing: Record<string, number>;
  selectedFlavours: string[];
  flavourMatrixPricing: Record<string, Record<string, number>>;
  selectedSubcategories: string[];
  selectedCustomizations: string[];
  contentsMode: 'all' | 'by_package';
  contentsByPackage: Record<string, HamperContentItem[]>;
} {
  const categoryKey = normalizeCategoryKey(product?.category || '');
  const config = getCategoryConfig(categoryKey);

  // 1. Primary Type (e.g. Hamper Type, Cake Type, Bento Style)
  let typeValue = product?.flavour_tag || product?.flavourTag || '';
  if (!typeValue && config.types.length > 0) {
    typeValue = config.types[0];
  }

  // 2. Sizes / Packages
  let selectedSizes: string[] = [];
  const rawSizes = product?.available_sizes || product?.availableSizes || [];
  if (Array.isArray(rawSizes) && rawSizes.length > 0) {
    selectedSizes = rawSizes;
  } else if (config.sizes.length > 0) {
    selectedSizes = [...config.sizes];
  } else {
    selectedSizes = ['Standard'];
  }

  // 3. Size / Package Pricing
  const weightPrices = product?.weight_prices || product?.weightPrices || {};
  const sizePricing: Record<string, number> = {};
  const basePrice = Number(product?.price) || 649;

  selectedSizes.forEach((size, idx) => {
    if (weightPrices[size] !== undefined && Number(weightPrices[size]) > 0) {
      sizePricing[size] = Number(weightPrices[size]);
    } else {
      // Sensible tiered fallback based on base price
      const multiplier = 1 + idx * 0.45;
      sizePricing[size] = Math.round(basePrice * multiplier);
    }
  });

  // 4. Flavours
  let selectedFlavours: string[] = [];
  const rawFlavours = product?.available_flavours || product?.availableFlavours || [];
  if (Array.isArray(rawFlavours) && rawFlavours.length > 0) {
    selectedFlavours = rawFlavours;
  } else if (config.showFlavours && config.flavours.length > 0) {
    selectedFlavours = config.flavours.slice(0, 4);
  }

  // 4B. Flavour x Weight Matrix Pricing (flavour -> weight -> price)
  const flavourMatrixPricing: Record<string, Record<string, number>> = {};
  const comboPricing = product?.flavourCombinationPricing || product?.flavour_combination_pricing;
  const matrixInWeightPrices = weightPrices._flavour_matrix;
  const pricingInWeightPrices = weightPrices._flavour_pricing;

  selectedFlavours.forEach((flavour) => {
    flavourMatrixPricing[flavour] = {};
    selectedSizes.forEach((size, sIdx) => {
      let foundPrice: number | undefined = undefined;

      // Check comboPricing[size][flavour]
      if (comboPricing && typeof comboPricing[size] === 'object' && typeof comboPricing[size][flavour] === 'number') {
        foundPrice = comboPricing[size][flavour];
      }
      // Check comboPricing[flavour][size]
      else if (comboPricing && typeof comboPricing[flavour] === 'object' && typeof comboPricing[flavour][size] === 'number') {
        foundPrice = comboPricing[flavour][size];
      }
      // Check matrixInWeightPrices[flavour][size]
      else if (matrixInWeightPrices && typeof matrixInWeightPrices[flavour] === 'object' && typeof matrixInWeightPrices[flavour][size] === 'number') {
        foundPrice = matrixInWeightPrices[flavour][size];
      }
      // Check pricingInWeightPrices.byFlavour[flavour][size]
      else if (pricingInWeightPrices?.byFlavour && typeof pricingInWeightPrices.byFlavour[flavour] === 'object' && typeof pricingInWeightPrices.byFlavour[flavour][size] === 'number') {
        foundPrice = pricingInWeightPrices.byFlavour[flavour][size];
      }
      // Check pricingInWeightPrices.byWeight[size][flavour]
      else if (pricingInWeightPrices?.byWeight && typeof pricingInWeightPrices.byWeight[size] === 'object' && typeof pricingInWeightPrices.byWeight[size][flavour] === 'number') {
        foundPrice = pricingInWeightPrices.byWeight[size][flavour];
      }

      if (foundPrice !== undefined && foundPrice > 0) {
        flavourMatrixPricing[flavour][size] = foundPrice;
      } else {
        const baseForSize = sizePricing[size] || Math.round(basePrice * (1 + sIdx * 0.45));
        flavourMatrixPricing[flavour][size] = baseForSize;
      }
    });
  });

  // 5. Subcategories (Occasions)
  let selectedSubcategories: string[] = [];
  const rawOccasions = product?.occasions || [];
  if (Array.isArray(rawOccasions) && rawOccasions.length > 0) {
    selectedSubcategories = rawOccasions;
  } else {
    selectedSubcategories = config.subcategories.slice(0, 2);
  }

  // 6. Customizations
  let selectedCustomizations: string[] = [];
  const rawCustom = product?.customization_options || product?.customizationOptions || [];
  if (Array.isArray(rawCustom) && rawCustom.length > 0) {
    selectedCustomizations = rawCustom;
  } else {
    selectedCustomizations = config.customizations.slice(0, 3);
  }

  // 7. Contents (for Hampers or products with contents repeater)
  let contentsMode: 'all' | 'by_package' = 'all';
  const contentsByPackage: Record<string, HamperContentItem[]> = {
    all: [],
  };
  config.sizes.forEach((s) => {
    contentsByPackage[s] = [];
  });

  if (weightPrices._contents) {
    const saved = weightPrices._contents;
    if (saved.mode) contentsMode = saved.mode;
    if (saved.byPackage) Object.assign(contentsByPackage, saved.byPackage);
  } else if (weightPrices._hamper_contents) {
    const saved = weightPrices._hamper_contents;
    if (saved.mode) contentsMode = saved.mode;
    if (saved.byPackage) Object.assign(contentsByPackage, saved.byPackage);
  } else if (Array.isArray(product?.hamper_items) && product.hamper_items.length > 0) {
    contentsByPackage.all = product.hamper_items;
  } else if (categoryKey === 'hampers') {
    // Default luxury sample items for hampers
    contentsByPackage.all = [
      { name: 'Mini Cake', quantity: 1, variant: 'Belgian Truffle', notes: 'Pure Eggless' },
      { name: 'Artisan Cupcakes', quantity: 4, variant: 'Assorted Berries & Cream' },
      { name: 'Gourmet Brownies', quantity: 2, variant: 'Fudgy Walnut' },
      { name: 'Belgian Chocolate Bar', quantity: 1, variant: '54% Dark Couverture' },
      { name: 'Personalized Greeting Card', quantity: 1, notes: 'Handwritten with Wax Seal' },
    ];
    contentsByPackage.Small = [
      { name: 'Mini Cake', quantity: 1, variant: 'Belgian Truffle', notes: 'Pure Eggless' },
      { name: 'Cupcakes', quantity: 2, variant: 'Assorted' },
      { name: 'Chocolates', quantity: 2, variant: 'Artisan Rochers' },
    ];
    contentsByPackage.Medium = [
      { name: 'Mini Cake', quantity: 1, variant: 'Belgian Truffle', notes: 'Pure Eggless' },
      { name: 'Cupcakes', quantity: 4, variant: 'Assorted' },
      { name: 'Brownies', quantity: 2, variant: 'Fudgy Walnut' },
      { name: 'Chocolates', quantity: 4, variant: 'Artisan Rochers' },
      { name: 'Greeting Card', quantity: 1, notes: 'Handwritten with Wax Seal' },
    ];
    contentsByPackage.Large = [
      { name: 'Bento Cake', quantity: 1, variant: 'Belgian Truffle', notes: 'Pure Eggless' },
      { name: 'Cupcakes', quantity: 6, variant: 'Assorted' },
      { name: 'Brownies', quantity: 4, variant: 'Fudgy Walnut' },
      { name: 'Chocolates', quantity: 6, variant: 'Artisan Rochers' },
      { name: 'Greeting Card', quantity: 1, notes: 'Handwritten with Wax Seal' },
    ];
  }

  return {
    categoryKey,
    categoryConfig: config,
    typeValue,
    selectedSizes,
    sizePricing,
    selectedFlavours,
    flavourMatrixPricing,
    selectedSubcategories,
    selectedCustomizations,
    contentsMode,
    contentsByPackage,
  };
}
