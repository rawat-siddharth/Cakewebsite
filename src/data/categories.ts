export interface SubCategory {
  id: string;             // e.g. "cakes-birthday", "bento-birthday", "hampers-birthday"
  name: string;           // Displayed name: "Birthday", "Mom-to-Be" (never repeats main category name)
  parentCategory: string; // Parent ID: "cakes", "bento-cakes", "desserts", "jar-cakes", etc.
  slug: string;           // URL slug for subcategory: e.g. "birthday", "all"
  isAll?: boolean;        // true for "All Cakes", "All Bento Cakes", "All Jar Cakes"
  description?: string;
  matchOccasion?: string[]; // Occasions to match products with, e.g. ['Birthday']
  matchKeywords?: string[]; // Keywords in name, description, tags, e.g. ['premium', 'truffle']
}

export interface MainCategory {
  id: string;             // "cakes", "bento-cakes", "desserts", "jar-cakes", "cupcakes", "cookies", "homemade-chocolates", "hampers", "bouquets"
  name: string;           // "Cakes", "Bento Cakes", "Desserts", etc.
  slug: string;           // "cakes", "bento-cakes", etc.
  description: string;
  image: string;
  itemCount: number;
  subcategories: SubCategory[];
  aliases?: string[];     // e.g. ["Cake", "Cakes"]
}

// Backwards-compatible Category interface for existing code
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
}

export const MAIN_CATEGORIES: MainCategory[] = [
  // 1. CAKES
  {
    id: 'cakes',
    name: 'Cakes',
    slug: 'cakes',
    description: 'Bespoke luxury celebration cakes handcrafted fresh with 100% pure eggless artisanal recipes in Jaipur.',
    image: '/src/assets/images/hero_cake_display_1790174282202.jpg',
    itemCount: 8,
    aliases: ['cakes', 'cake'],
    subcategories: [
      { id: 'cakes-all', name: 'All Cakes', parentCategory: 'cakes', slug: 'all', isAll: true },
      { id: 'cakes-birthday', name: 'Birthday', parentCategory: 'cakes', slug: 'birthday', matchOccasion: ['Birthday'] },
      { id: 'cakes-premium', name: 'Premium', parentCategory: 'cakes', slug: 'premium', matchKeywords: ['belgian', 'truffle', 'lambeth', 'signature', 'royal', 'gold'] },
      { id: 'cakes-anniversary', name: 'Anniversary', parentCategory: 'cakes', slug: 'anniversary', matchOccasion: ['Anniversary'] },
      { id: 'cakes-engagement', name: 'Engagement', parentCategory: 'cakes', slug: 'engagement', matchOccasion: ['Engagement', 'Wedding'] },
      { id: 'cakes-baby-shower', name: 'Baby Shower', parentCategory: 'cakes', slug: 'baby-shower', matchOccasion: ['Baby Shower', 'Mom-to-be'] },
      { id: 'cakes-wedding', name: 'Wedding', parentCategory: 'cakes', slug: 'wedding', matchOccasion: ['Wedding'] },
      { id: 'cakes-kids', name: 'Kids', parentCategory: 'cakes', slug: 'kids', matchOccasion: ['Kids', 'Birthday'] },
      { id: 'cakes-mom-to-be', name: 'Mom-to-Be', parentCategory: 'cakes', slug: 'mom-to-be', matchOccasion: ['Mom-to-be', 'Baby Shower'] },
      { id: 'cakes-bachelorette', name: 'Bachelorette', parentCategory: 'cakes', slug: 'bachelorette', matchOccasion: ['Bachelorette', 'Party'] },
      { id: 'cakes-bride-to-be', name: 'Bride-to-Be', parentCategory: 'cakes', slug: 'bride-to-be', matchOccasion: ['Bride-to-be', 'Wedding'] },
      { id: 'cakes-groom-to-be', name: 'Groom-to-Be', parentCategory: 'cakes', slug: 'groom-to-be', matchOccasion: ['Groom-to-be', 'Wedding'] },
      { id: 'cakes-healthy-cakes', name: 'Healthy Cakes', parentCategory: 'cakes', slug: 'healthy-cakes', matchKeywords: ['healthy', 'jaggery', 'wheat', 'gluten-free', 'sugar-free'] },
      { id: 'cakes-love-theme', name: 'Love Theme', parentCategory: 'cakes', slug: 'love-theme', matchOccasion: ['Anniversary', 'Valentine', 'Romantic'] },
      { id: 'cakes-trending', name: 'Trending', parentCategory: 'cakes', slug: 'trending', matchKeywords: ['vintage', 'lambeth', 'bestseller', 'trending', 'strawberry'] },
    ],
  },

  // 2. BENTO CAKES
  {
    id: 'bento-cakes',
    name: 'Bento Cakes',
    slug: 'bento-cakes',
    description: 'Charming minimalist Korean lunchbox cakes customized with vintage shell piping and sweet notes.',
    image: '/src/assets/images/bento_cake_collection_1790174295252.jpg',
    itemCount: 6,
    aliases: ['bento cakes', 'bento cake', 'bento'],
    subcategories: [
      { id: 'bento-all', name: 'All Bento Cakes', parentCategory: 'bento-cakes', slug: 'all', isAll: true },
      { id: 'bento-birthday', name: 'Birthday', parentCategory: 'bento-cakes', slug: 'birthday', matchOccasion: ['Birthday'] },
      { id: 'bento-anniversary', name: 'Anniversary', parentCategory: 'bento-cakes', slug: 'anniversary', matchOccasion: ['Anniversary'] },
      { id: 'bento-engagement', name: 'Engagement', parentCategory: 'bento-cakes', slug: 'engagement', matchOccasion: ['Engagement', 'Wedding'] },
      { id: 'bento-premium', name: 'Premium', parentCategory: 'bento-cakes', slug: 'premium', matchKeywords: ['fudge', 'belgian', 'floral', 'ganache'] },
      { id: 'bento-baby-shower', name: 'Baby Shower', parentCategory: 'bento-cakes', slug: 'baby-shower', matchOccasion: ['Baby Shower', 'Mom-to-be'] },
      { id: 'bento-wedding', name: 'Wedding', parentCategory: 'bento-cakes', slug: 'wedding', matchOccasion: ['Wedding'] },
      { id: 'bento-kids', name: 'Kids', parentCategory: 'bento-cakes', slug: 'kids', matchOccasion: ['Kids', 'Birthday'] },
      { id: 'bento-mom-to-be', name: 'Mom-to-Be', parentCategory: 'bento-cakes', slug: 'mom-to-be', matchOccasion: ['Mom-to-be', 'Baby Shower'] },
      { id: 'bento-bachelorette', name: 'Bachelorette', parentCategory: 'bento-cakes', slug: 'bachelorette', matchOccasion: ['Bachelorette'] },
      { id: 'bento-bride-to-be', name: 'Bride-to-Be', parentCategory: 'bento-cakes', slug: 'bride-to-be', matchOccasion: ['Bride-to-be'] },
      { id: 'bento-groom-to-be', name: 'Groom-to-Be', parentCategory: 'bento-cakes', slug: 'groom-to-be', matchOccasion: ['Groom-to-be'] },
      { id: 'bento-love-theme', name: 'Love Theme', parentCategory: 'bento-cakes', slug: 'love-theme', matchOccasion: ['Anniversary', 'Valentine', 'Romantic'] },
      { id: 'bento-trending', name: 'Trending', parentCategory: 'bento-cakes', slug: 'trending', matchKeywords: ['vintage', 'floral', 'trending', 'pastel'] },
    ],
  },

  // 3. DESSERTS
  {
    id: 'desserts',
    name: 'Desserts',
    slug: 'desserts',
    description: 'Decadent artisanal French & Italian inspired individual desserts, velvety cheesecakes, and gooey brownies.',
    image: '/src/assets/images/luxury_patisserie_hero_1790175262764.jpg',
    itemCount: 5,
    aliases: ['desserts', 'dessert'],
    subcategories: [
      { id: 'desserts-jar-cakes', name: 'Jar Cakes', parentCategory: 'desserts', slug: 'jar-cakes', matchKeywords: ['jar'] },
      { id: 'desserts-cupcakes', name: 'Cupcakes', parentCategory: 'desserts', slug: 'cupcakes', matchKeywords: ['cupcake'] },
      { id: 'desserts-cheesecakes', name: 'Cheesecakes', parentCategory: 'desserts', slug: 'cheesecakes', matchKeywords: ['cheesecake', 'cheese'] },
      { id: 'desserts-brownies', name: 'Brownies', parentCategory: 'desserts', slug: 'brownies', matchKeywords: ['brownie', 'fudge'] },
      { id: 'desserts-donuts', name: 'Donuts', parentCategory: 'desserts', slug: 'donuts', matchKeywords: ['donut', 'doughnut'] },
    ],
  },

  // 4. JAR CAKES
  {
    id: 'jar-cakes',
    name: 'Jar Cakes',
    slug: 'jar-cakes',
    description: 'Portable layers of pure ecstasy, moist sponge, and Belgian fillings sealed in luxury glass jars.',
    image: '/src/assets/images/luxury_jar_cakes_1790181791942.jpg',
    itemCount: 4,
    aliases: ['jar cakes', 'jar cake', 'jar'],
    subcategories: [
      { id: 'jar-cakes-all', name: 'All Jar Cakes', parentCategory: 'jar-cakes', slug: 'all', isAll: true },
      { id: 'jar-cakes-chocolate', name: 'Chocolate', parentCategory: 'jar-cakes', slug: 'chocolate', matchKeywords: ['chocolate', 'truffle', 'nutella', 'oreo'] },
      { id: 'jar-cakes-premium', name: 'Premium', parentCategory: 'jar-cakes', slug: 'premium', matchKeywords: ['red velvet', 'strawberry', 'pistachio', 'lotus'] },
      { id: 'jar-cakes-customized', name: 'Customized', parentCategory: 'jar-cakes', slug: 'customized', matchKeywords: ['custom', 'trio', 'box', 'combo'] },
    ],
  },

  // 5. CUPCAKES
  {
    id: 'cupcakes',
    name: 'Cupcakes',
    slug: 'cupcakes',
    description: 'Petite fluffy eggless cupcakes topped with artisanal swirl buttercream and edible gold accents.',
    image: '/src/assets/images/artisan_cupcakes_1790181808080.jpg',
    itemCount: 3,
    aliases: ['cupcakes', 'cupcake'],
    subcategories: [
      { id: 'cupcakes-hampers', name: 'Cupcake Hampers', parentCategory: 'cupcakes', slug: 'hampers', matchKeywords: ['hamper', 'box of 6', 'gift box', 'gift'] },
      { id: 'cupcakes-bento-cupcakes', name: 'Bento + Cupcakes', parentCategory: 'cupcakes', slug: 'bento-cupcakes', matchKeywords: ['bento + cupcakes', 'duo', 'bento'] },
      { id: 'cupcakes-combos', name: 'Combos', parentCategory: 'cupcakes', slug: 'combos', matchKeywords: ['combo', 'assorted', 'party pack'] },
    ],
  },

  // 6. COOKIES
  {
    id: 'cookies',
    name: 'Cookies',
    slug: 'cookies',
    description: 'Traditional slow-baked Indian nankhatai and chunky Belgian chocochip butter cookies.',
    image: '/src/assets/images/artisan_cookies_1790181820909.jpg',
    itemCount: 2,
    aliases: ['cookies', 'cookie'],
    subcategories: [
      { id: 'cookies-homemade-nankhatai', name: 'Homemade Nankhatai', parentCategory: 'cookies', slug: 'homemade-nankhatai', matchKeywords: ['nankhatai', 'cardamom', 'desi ghee'] },
      { id: 'cookies-chocochip-cookies', name: 'Chocochip Cookies', parentCategory: 'cookies', slug: 'chocochip-cookies', matchKeywords: ['chocochip', 'chocolate chip', 'chocolate'] },
    ],
  },

  // 7. HOMEMADE CHOCOLATES
  {
    id: 'homemade-chocolates',
    name: 'Homemade Chocolates',
    slug: 'homemade-chocolates',
    description: 'Silky smooth single-origin couverture chocolates, roasted nut clusters, and Jaipur-infused rochers.',
    image: '/src/assets/images/artisan_chocolates_1790181836562.jpg',
    itemCount: 2,
    aliases: ['homemade chocolates', 'homemade chocolate', 'chocolates', 'chocolate'],
    subcategories: [
      { id: 'chocolates-premium-nuts', name: 'Premium Nuts Chocolate', parentCategory: 'homemade-chocolates', slug: 'premium-nuts', matchKeywords: ['nuts', 'almond', 'hazelnut', 'pistachio', 'rocher'] },
      { id: 'chocolates-flavour', name: 'Flavour Chocolates', parentCategory: 'homemade-chocolates', slug: 'flavour-chocolates', matchKeywords: ['flavour', 'rose', 'orange', 'mint', 'caramel', 'bonbon'] },
    ],
  },

  // 8. HAMPERS
  {
    id: 'hampers',
    name: 'Hampers',
    slug: 'hampers',
    description: 'Hand-curated luxury gift boxes packed with artisanal bakes, scented candles, and keepsake ribbons.',
    image: '/src/assets/images/gourmet_gift_hamper_1790174308010.jpg',
    itemCount: 4,
    aliases: ['hampers', 'hamper', 'gift hampers'],
    subcategories: [
      { id: 'hampers-birthday', name: 'Birthday', parentCategory: 'hampers', slug: 'birthday', matchOccasion: ['Birthday'] },
      { id: 'hampers-anniversary', name: 'Anniversary', parentCategory: 'hampers', slug: 'anniversary', matchOccasion: ['Anniversary'] },
      { id: 'hampers-engagement', name: 'Engagement', parentCategory: 'hampers', slug: 'engagement', matchOccasion: ['Engagement', 'Wedding'] },
      { id: 'hampers-premium', name: 'Premium', parentCategory: 'hampers', slug: 'premium', matchKeywords: ['royal', 'luxe', 'deluxe', 'signature'] },
      { id: 'hampers-baby-shower', name: 'Baby Shower', parentCategory: 'hampers', slug: 'baby-shower', matchOccasion: ['Baby Shower', 'Mom-to-be'] },
      { id: 'hampers-wedding', name: 'Wedding', parentCategory: 'hampers', slug: 'wedding', matchOccasion: ['Wedding'] },
      { id: 'hampers-kids', name: 'Kids', parentCategory: 'hampers', slug: 'kids', matchOccasion: ['Kids', 'Birthday'] },
      { id: 'hampers-mom-to-be', name: 'Mom-to-Be', parentCategory: 'hampers', slug: 'mom-to-be', matchOccasion: ['Mom-to-be', 'Baby Shower'] },
      { id: 'hampers-bachelorette', name: 'Bachelorette', parentCategory: 'hampers', slug: 'bachelorette', matchOccasion: ['Bachelorette'] },
      { id: 'hampers-bride-to-be', name: 'Bride-to-Be', parentCategory: 'hampers', slug: 'bride-to-be', matchOccasion: ['Bride-to-be', 'Wedding'] },
      { id: 'hampers-groom-to-be', name: 'Groom-to-Be', parentCategory: 'hampers', slug: 'groom-to-be', matchOccasion: ['Groom-to-be', 'Wedding'] },
      { id: 'hampers-love-theme', name: 'Love Theme', parentCategory: 'hampers', slug: 'love-theme', matchOccasion: ['Anniversary', 'Valentine', 'Romantic'] },
      { id: 'hampers-trending', name: 'Trending', parentCategory: 'hampers', slug: 'trending', matchKeywords: ['pamper', 'bloom', 'celebration', 'trending'] },
    ],
  },

  // 9. BOUQUETS
  {
    id: 'bouquets',
    name: 'Bouquets',
    slug: 'bouquets',
    description: 'Artfully tied floral bouquets and Ferrero Rocher edible chocolate arrangements wrapped in satin.',
    image: '/src/assets/images/flower_chocolate_bouquet_1790174321849.jpg',
    itemCount: 4,
    aliases: ['bouquets', 'bouquet', 'flower bouquets', 'chocolate bouquets'],
    subcategories: [
      { id: 'bouquets-chocolate', name: 'Chocolate Bouquet', parentCategory: 'bouquets', slug: 'chocolate-bouquet', matchKeywords: ['chocolate', 'ferrero', 'truffle'] },
      { id: 'bouquets-flower', name: 'Flower Bouquet', parentCategory: 'bouquets', slug: 'flower-bouquet', matchKeywords: ['flower', 'rose', 'carnation', 'floral'] },
    ],
  },
];

// Helper functions for easy lookup
export function getMainCategoryByIdOrSlug(idOrSlug: string): MainCategory | undefined {
  if (!idOrSlug) return undefined;
  const clean = idOrSlug.trim().toLowerCase();
  return MAIN_CATEGORIES.find(
    (c) =>
      c.id.toLowerCase() === clean ||
      c.slug.toLowerCase() === clean ||
      c.name.toLowerCase() === clean ||
      (c.aliases && c.aliases.some((a) => a.toLowerCase() === clean))
  );
}

export function getSubCategoryById(id: string): SubCategory | undefined {
  if (!id) return undefined;
  for (const cat of MAIN_CATEGORIES) {
    const sub = cat.subcategories.find((s) => s.id === id);
    if (sub) return sub;
  }
  return undefined;
}

export function getSubcategoriesForParent(parentCategory: string): SubCategory[] {
  const mainCat = getMainCategoryByIdOrSlug(parentCategory);
  return mainCat ? mainCat.subcategories : [];
}

export function getProductParentCategoryId(product: {
  category?: string;
  parentCategoryId?: string;
  parent_category_id?: string;
}): string {
  if (product.parentCategoryId) return product.parentCategoryId;
  if (product.parent_category_id) return product.parent_category_id;
  const cat = (product.category || '').toLowerCase().trim();
  if (cat.includes('bento')) return 'bento-cakes';
  if (cat.includes('bouquet')) return 'bouquets';
  if (cat.includes('hamper')) return 'hampers';
  if (cat.includes('jar')) return 'jar-cakes';
  if (cat.includes('cupcake')) return 'cupcakes';
  if (cat.includes('cookie') || cat.includes('nankhatai')) return 'cookies';
  if (cat.includes('chocolate')) return 'homemade-chocolates';
  if (cat.includes('dessert')) return 'desserts';
  if (cat.includes('cake')) return 'cakes';
  return 'cakes';
}

export function doesProductMatchSubcategory(product: any, subcategoryId: string): boolean {
  if (!subcategoryId) return true;
  const sub = getSubCategoryById(subcategoryId);
  if (!sub) return false;

  const productParent = getProductParentCategoryId(product);
  
  // Verify parent category matches
  if (productParent !== sub.parentCategory) {
    // Special case: Desserts can show Jar Cakes & Cupcakes
    if (sub.parentCategory === 'desserts' && (productParent === 'jar-cakes' || productParent === 'cupcakes')) {
      if (sub.id === 'desserts-jar-cakes' && productParent === 'jar-cakes') return true;
      if (sub.id === 'desserts-cupcakes' && productParent === 'cupcakes') return true;
    } else {
      return false;
    }
  }

  // All subcategories show everything in this parent
  if (sub.isAll) return true;

  // Direct subCategoryIds tag match
  if (product.subCategoryIds && Array.isArray(product.subCategoryIds) && product.subCategoryIds.includes(sub.id)) {
    return true;
  }

  // Occasion match
  if (sub.matchOccasion && sub.matchOccasion.length > 0) {
    const prodOccasions = (product.occasions || []).map((o: string) => o.toLowerCase().trim());
    if (sub.matchOccasion.some((occ) => prodOccasions.includes(occ.toLowerCase().trim()))) {
      return true;
    }
  }

  // Keyword match
  if (sub.matchKeywords && sub.matchKeywords.length > 0) {
    const textToSearch = `${product.name || ''} ${product.description || ''} ${product.flavourTag || ''} ${product.flavour_tag || ''} ${product.slug || ''}`.toLowerCase();
    if (sub.matchKeywords.some((kw) => textToSearch.includes(kw.toLowerCase()))) {
      return true;
    }
  }

  // Slug match
  const cleanSubSlug = sub.slug.toLowerCase().replace(/-/g, ' ');
  const prodOccasions = (product.occasions || []).map((o: string) => o.toLowerCase().trim());
  if (prodOccasions.some((o: string) => o.includes(cleanSubSlug) || cleanSubSlug.includes(o))) {
    return true;
  }

  return false;
}

// Backwards-compatibility with existing code relying on CATEGORIES array
export const CATEGORIES: Category[] = MAIN_CATEGORIES.map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  description: c.description,
  image: c.image,
  itemCount: c.itemCount,
}));
