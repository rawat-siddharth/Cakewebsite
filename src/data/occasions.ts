export interface Occasion {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline: string;
}

export const OCCASIONS: Occasion[] = [
  {
    id: 'birthday',
    name: 'Birthday',
    slug: 'birthday',
    description: 'Bespoke custom cakes, bento boxes, and fun party hampers.',
    tagline: 'Make their special year sweeter',
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    slug: 'anniversary',
    description: 'Romantic vintage piped cakes and rose floral bouquet pairings.',
    tagline: 'Celebrate another year of love',
  },
  {
    id: 'baby-shower',
    name: 'Baby Shower',
    slug: 'baby-shower',
    description: 'Gentle pastel cakes and thoughtful gift bundles for growing families.',
    tagline: 'Welcome the little blessing',
  },
  {
    id: 'mom-to-be',
    name: 'Mom-to-be',
    slug: 'mom-to-be',
    description: 'Pampering gourmet hampers and delicate sweetness for the mother.',
    tagline: 'Pampering gestures for mama',
  },
  {
    id: 'just-because',
    name: 'Just Because',
    slug: 'just-because',
    description: 'Spontaneous sweet cravings and thoughtful surprise deliveries.',
    tagline: 'No reason needed for cake',
  },
  {
    id: 'wedding',
    name: 'Wedding',
    slug: 'wedding',
    description: 'Grand tiered centrepieces and curated guest return hampers.',
    tagline: 'Elegant centerpieces for big days',
  },
];
