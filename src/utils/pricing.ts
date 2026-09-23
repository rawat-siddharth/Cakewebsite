import { Product, CakeAddOn } from '../data/products';

/**
 * Normalizes an array of flavour strings into a canonical, order-independent key.
 * Trims, sorts alphabetically, and joins with " + ".
 * e.g. ["Vanilla", "Chocolate"] => "Chocolate + Vanilla"
 * e.g. ["Chocolate", "Vanilla"] => "Chocolate + Vanilla"
 */
export function normalizeFlavourKey(flavours: string[]): string {
  if (!flavours || flavours.length === 0) return '';
  return [...flavours]
    .map((f) => f.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .join(' + ');
}

/**
 * Normalizes weight strings so "1kg", "1 Kg", "1.0kg", "1 kg" match consistently.
 */
export function normalizeWeightString(w: string): string {
  if (!w) return '';
  return w.trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * Gets the configured maximum number of flavours allowed for a given product and weight.
 */
export function getMaxFlavoursForWeight(product: Product, weight: string): number {
  if (product.maxFlavoursByWeight) {
    // Exact match
    if (typeof product.maxFlavoursByWeight[weight] === 'number') {
      return product.maxFlavoursByWeight[weight];
    }
    // Normalized match
    const normWeight = normalizeWeightString(weight);
    for (const [key, val] of Object.entries(product.maxFlavoursByWeight)) {
      if (normalizeWeightString(key) === normWeight) {
        return val;
      }
    }
  }

  // Sensible default based on weight value if not explicitly configured
  const norm = normalizeWeightString(weight);
  if (norm.includes('250g') || norm.includes('0.25kg')) return 1;
  if (norm.includes('500g') || norm.includes('0.5kg')) return 2;
  if (norm.includes('1.5kg') || norm.includes('1kg')) return 2;
  if (norm.includes('2kg') || norm.includes('2.5kg') || norm.includes('3kg')) return 3;

  return 2;
}

/**
 * Looks up the exact configured combination price for a product, weight, and flavours.
 * Returns the price if configured, or null if no explicit combination price exists.
 */
export function getFlavourCombinationPrice(
  product: Product,
  weight: string,
  flavours: string[]
): number | null {
  if (!product || flavours.length === 0 || !weight) {
    return null;
  }

  const normalizedComboKey = normalizeFlavourKey(flavours);
  const normalizedWeight = normalizeWeightString(weight);

  // 1. Check flavourCombinationPricing in product
  if (product.flavourCombinationPricing) {
    // Find matching weight entry in pricing
    let weightPricingMap: Record<string, number> | undefined = undefined;

    if (product.flavourCombinationPricing[weight]) {
      weightPricingMap = product.flavourCombinationPricing[weight];
    } else {
      for (const [wKey, map] of Object.entries(product.flavourCombinationPricing)) {
        if (normalizeWeightString(wKey) === normalizedWeight) {
          weightPricingMap = map;
          break;
        }
      }
    }

    if (weightPricingMap) {
      // Look up exact match
      if (typeof weightPricingMap[normalizedComboKey] === 'number') {
        return weightPricingMap[normalizedComboKey];
      }

      // Check all keys in weightPricingMap normalized
      for (const [comboKey, price] of Object.entries(weightPricingMap)) {
        const keyNorm = normalizeFlavourKey(comboKey.split('+').map((s) => s.trim()));
        if (keyNorm === normalizedComboKey) {
          return price;
        }
      }
    }
  }

  // 2. If single flavour and no multi-flavour map matched, fallback to weightPrices or product.price
  if (flavours.length === 1) {
    if (product.weightPrices) {
      if (typeof product.weightPrices[weight] === 'number') {
        return product.weightPrices[weight];
      }
      for (const [wKey, price] of Object.entries(product.weightPrices)) {
        if (normalizeWeightString(wKey) === normalizedWeight) {
          return price;
        }
      }
    }

    if (product.price) {
      return product.price;
    }
  }

  // If combination is not found, return null (never silently guess)
  return null;
}

/**
 * Generates default flavour distribution options for a given weight and selected flavours.
 */
export function getFlavourDistributionOptions(
  product: Product,
  weight: string,
  flavours: string[]
): string[] {
  if (!product.supportsFlavourDistribution || flavours.length <= 1) {
    return [];
  }

  // If product has explicitly configured options for this weight/combination
  const normalizedKey = normalizeFlavourKey(flavours);
  const comboSpecificKey = `${weight}_${normalizedKey}`;
  if (product.flavourDistributionOptions?.[comboSpecificKey]) {
    return product.flavourDistributionOptions[comboSpecificKey];
  }
  if (product.flavourDistributionOptions?.[weight]) {
    return product.flavourDistributionOptions[weight];
  }

  // Automatically generate standard splits based on weight & count
  const count = flavours.length;
  const normWeight = normalizeWeightString(weight);

  if (count === 2) {
    let halfLabel = 'Equal Half & Half';
    if (normWeight.includes('1kg')) {
      return [
        `Equal Portions (500g ${flavours[0]} + 500g ${flavours[1]})`,
        `70% ${flavours[0]} + 30% ${flavours[1]}`,
        `70% ${flavours[1]} + 30% ${flavours[0]}`
      ];
    } else if (normWeight.includes('500g') || normWeight.includes('0.5kg')) {
      return [
        `Equal Portions (250g ${flavours[0]} + 250g ${flavours[1]})`,
        `60% ${flavours[0]} + 40% ${flavours[1]}`,
        `60% ${flavours[1]} + 40% ${flavours[0]}`
      ];
    } else if (normWeight.includes('2kg')) {
      return [
        `Equal Portions (1kg ${flavours[0]} + 1kg ${flavours[1]})`,
        `75% ${flavours[0]} + 25% ${flavours[1]}`,
        `75% ${flavours[1]} + 25% ${flavours[0]}`
      ];
    } else if (normWeight.includes('1.5kg')) {
      return [
        `Equal Portions (750g ${flavours[0]} + 750g ${flavours[1]})`,
        `65% ${flavours[0]} + 35% ${flavours[1]}`,
        `65% ${flavours[1]} + 35% ${flavours[0]}`
      ];
    }
    return [
      `Equal Split (${flavours[0]} / ${flavours[1]})`,
      `Predominantly ${flavours[0]} with ${flavours[1]} layer`,
      `Predominantly ${flavours[1]} with ${flavours[0]} layer`
    ];
  }

  if (count === 3) {
    if (normWeight.includes('2kg')) {
      return [
        `Equal 3-Way Split (~670g each: ${flavours.join(', ')})`,
        `50% ${flavours[0]} + 25% ${flavours[1]} + 25% ${flavours[2]}`
      ];
    }
    return [
      `Equal 3-Way Split (${flavours.join(' / ')})`,
      `Layered Triple Fusion (${flavours.join(' + ')})`
    ];
  }

  return [`Equal distribution among ${count} flavours`];
}

/**
 * Standard cake add-on accessories available across artisanal cakes.
 */
export const STANDARD_CAKE_ADDONS: CakeAddOn[] = [
  {
    id: 'addon-sparkler-candle',
    name: 'Golden Sparkler Candle Set',
    price: 49,
    description: 'Glamorous champagne gold sparkler candles for celebration.'
  },
  {
    id: 'addon-acrylic-charm',
    name: 'Acrylic "Happy Birthday" Cake Charm',
    price: 99,
    description: 'Reusable mirror rose-gold acrylic topper.'
  },
  {
    id: 'addon-luxury-packaging',
    name: 'Luxury Silk Ribbon & Bell Gift Box',
    price: 79,
    description: 'Boutique pastel pink presentation box tied with satin ribbon.'
  },
  {
    id: 'addon-wooden-cutlery',
    name: 'Eco-Friendly Wooden Knife & 4 Dessert Plates',
    price: 39,
    description: 'Biodegradable birchwood knife and sturdy serving plates.'
  }
];
