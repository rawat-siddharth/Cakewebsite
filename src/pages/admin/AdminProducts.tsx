import React, { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  X,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Image as ImageIcon,
  AlertCircle,
  Star,
  CheckCircle2,
  ExternalLink,
  Layers,
  Gift,
  Cake,
  Boxes,
  Cookie,
  Flower2,
  Tag,
  ListPlus,
  Package,
  Calendar,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  Copy,
  Table
} from 'lucide-react';
import {
  getProducts,
  saveProduct,
  deleteProduct,
  getCategories,
  uploadProductImage
} from '../../lib/supabase';
import { DatabaseProduct, DatabaseCategory } from '../../types/supabase';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import {
  getCategoryConfig,
  normalizeCategoryKey,
  CategoryMasterConfig,
  extractProductDetails,
  HamperContentItem,
} from '../../data/categorySettings';

const COMMON_HAMPER_ITEM_PRESETS = [
  'Mini Cake',
  'Bento Cake',
  'Cupcakes',
  'Chocolates',
  'Brownies',
  'Greeting Card',
  'Jar Cake',
  'Cookies',
  'Scented Candle',
  'Flower Bunch',
];

export function AdminProducts() {
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft'>('All');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DatabaseProduct | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active package tab in Contents Repeater
  const [activePackageTab, setActivePackageTab] = useState<string>('Small');

  // Quick custom input states inside the modal
  const [customSubcategoryInput, setCustomSubcategoryInput] = useState('');
  const [customCustomizationInput, setCustomCustomizationInput] = useState('');
  const [customFlavourInput, setCustomFlavourInput] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');

  // -------------------------------------------------------------
  // Structured Form State (Zero JSON, Zero comma-separated strings)
  // -------------------------------------------------------------
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    slug: string;
    category: string;
    description: string;
    images: string[];
    featured: boolean;
    is_new: boolean;
    is_published: boolean;
    is_available: boolean;
    advance_order_notice: string;

    // Subcategories (Occasions)
    selectedSubcategories: string[];

    // Category-specific options
    typeValue: string; // Hamper Type, Cake Type, Bento Style, Dessert Type, etc.
    selectedSizes: string[];
    sizePricing: Record<string, number>;
    selectedFlavours: string[];
    flavourMatrixPricing: Record<string, Record<string, number>>;
    selectedCustomizations: string[];

    // Contents Repeater (for Hampers)
    contentsMode: 'all' | 'by_package';
    contentsByPackage: Record<string, HamperContentItem[]>;
  }>({
    id: '',
    name: '',
    slug: '',
    category: 'Cakes',
    description: '',
    images: [],
    featured: false,
    is_new: true,
    is_published: true,
    is_available: true,
    advance_order_notice: 'Please order at least 24 hours in advance',
    selectedSubcategories: ['Birthday'],
    typeValue: 'Classic Celebration',
    selectedSizes: ['0.5 Kg', '1 Kg'],
    sizePricing: { '0.5 Kg': 649, '1 Kg': 1199 },
    selectedFlavours: ['Belgian Chocolate Truffle'],
    flavourMatrixPricing: {
      'Belgian Chocolate Truffle': { '0.5 Kg': 649, '1 Kg': 1199 }
    },
    selectedCustomizations: ['Piped Calligraphy Message'],
    contentsMode: 'by_package',
    contentsByPackage: {
      all: [],
      Small: [],
      Medium: [],
      Large: [],
    },
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        getProducts({ onlyPublished: false }),
        getCategories({ onlyPublished: false }),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen to master category configuration updates
  useEffect(() => {
    const handleCategoryUpdate = () => {
      // Re-trigger category config fetch if modal is open
    };
    window.addEventListener('cnc_category_master_updated', handleCategoryUpdate);
    return () => window.removeEventListener('cnc_category_master_updated', handleCategoryUpdate);
  }, []);

  // Active Category Config
  const activeCategoryKey = normalizeCategoryKey(formData.category);
  const activeCategoryConfig: CategoryMasterConfig = getCategoryConfig(activeCategoryKey);
  const isHamper = activeCategoryKey === 'hampers';

  // Handle category change in the form
  const handleCategoryChange = (newCategoryName: string) => {
    const newKey = normalizeCategoryKey(newCategoryName);
    const newConfig = getCategoryConfig(newKey);

    // Initial sizes
    const initialSizes = newConfig.sizes.length > 0 ? [...newConfig.sizes.slice(0, 3)] : ['Standard'];

    // Initial pricing based on category
    const initialPricing: Record<string, number> = {};
    if (newKey === 'hampers') {
      initialPricing['Small'] = 699;
      initialPricing['Medium'] = 999;
      initialPricing['Large'] = 1499;
    } else if (newKey === 'cakes') {
      initialPricing['0.5 Kg'] = 649;
      initialPricing['1 Kg'] = 1199;
      initialPricing['1.5 Kg'] = 1699;
    } else if (newKey === 'bento-cakes') {
      initialPricing['Single Bento (250g)'] = 349;
      initialPricing['Grand Bento (350g)'] = 499;
    } else {
      initialSizes.forEach((sz, idx) => {
        initialPricing[sz] = Math.round(599 * (1 + idx * 0.4));
      });
    }

    // Default contents for hampers if applicable
    const initialContents: Record<string, HamperContentItem[]> = {
      all: [],
      Small: [
        { name: 'Mini Cake', quantity: 1, variant: 'Belgian Truffle', notes: 'Pure Eggless' },
        { name: 'Cupcakes', quantity: 2, variant: 'Assorted' },
        { name: 'Chocolates', quantity: 2, variant: 'Artisan Rochers' },
      ],
      Medium: [
        { name: 'Mini Cake', quantity: 1, variant: 'Belgian Truffle', notes: 'Pure Eggless' },
        { name: 'Cupcakes', quantity: 4, variant: 'Assorted' },
        { name: 'Brownies', quantity: 2, variant: 'Fudgy Walnut' },
        { name: 'Chocolates', quantity: 4, variant: 'Artisan Rochers' },
        { name: 'Greeting Card', quantity: 1, notes: 'Handwritten with Wax Seal' },
      ],
      Large: [
        { name: 'Bento Cake', quantity: 1, variant: 'Belgian Truffle', notes: 'Pure Eggless' },
        { name: 'Cupcakes', quantity: 6, variant: 'Assorted' },
        { name: 'Brownies', quantity: 4, variant: 'Fudgy Walnut' },
        { name: 'Chocolates', quantity: 6, variant: 'Artisan Rochers' },
        { name: 'Greeting Card', quantity: 1, notes: 'Handwritten with Wax Seal' },
      ],
    };

    const initialFlavours = newConfig.showFlavours ? newConfig.flavours.slice(0, 3) : [];
    const initialMatrix: Record<string, Record<string, number>> = {};
    initialFlavours.forEach((flv) => {
      initialMatrix[flv] = {};
      initialSizes.forEach((sz, idx) => {
        initialMatrix[flv][sz] = initialPricing[sz] || Math.round(649 * (1 + idx * 0.45));
      });
    });

    setFormData((prev) => ({
      ...prev,
      category: newCategoryName,
      typeValue: newConfig.types[0] || '',
      selectedSizes: initialSizes,
      sizePricing: initialPricing,
      selectedFlavours: initialFlavours,
      flavourMatrixPricing: initialMatrix,
      selectedSubcategories: newConfig.subcategories.slice(0, 2),
      selectedCustomizations: newConfig.customizations.slice(0, 4),
      contentsMode: 'by_package',
      contentsByPackage: initialContents,
    }));

    if (initialSizes.length > 0) {
      setActivePackageTab(initialSizes[0]);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const defaultCatName = selectedCategory !== 'All' ? selectedCategory : (categories[0]?.name || 'Cakes');
    const key = normalizeCategoryKey(defaultCatName);
    const cfg = getCategoryConfig(key);

    const initialSizes = cfg.sizes.length > 0 ? [...cfg.sizes.slice(0, 3)] : ['Standard'];
    const initialPricing: Record<string, number> = {};

    if (key === 'hampers') {
      initialPricing['Small'] = 699;
      initialPricing['Medium'] = 999;
      initialPricing['Large'] = 1499;
    } else {
      initialSizes.forEach((sz, idx) => {
        initialPricing[sz] = Math.round(649 * (1 + idx * 0.45));
      });
    }

    const initialFlavours = cfg.showFlavours ? cfg.flavours.slice(0, 3) : [];
    const initialMatrix: Record<string, Record<string, number>> = {};
    initialFlavours.forEach((flv) => {
      initialMatrix[flv] = {};
      initialSizes.forEach((sz, idx) => {
        initialMatrix[flv][sz] = initialPricing[sz] || Math.round(649 * (1 + idx * 0.45));
      });
    });

    setFormData({
      id: '',
      name: '',
      slug: '',
      category: defaultCatName,
      description: '',
      images: ['/src/assets/images/gourmet_gift_hamper_1790174308010.jpg'],
      featured: false,
      is_new: true,
      is_published: true,
      is_available: true,
      advance_order_notice: 'Please order at least 24 hours in advance',
      selectedSubcategories: cfg.subcategories.slice(0, 2),
      typeValue: cfg.types[0] || '',
      selectedSizes: initialSizes,
      sizePricing: initialPricing,
      selectedFlavours: initialFlavours,
      flavourMatrixPricing: initialMatrix,
      selectedCustomizations: cfg.customizations.slice(0, 3),
      contentsMode: 'by_package',
      contentsByPackage: {
        all: [],
        Small: [
          { name: 'Mini Cake', quantity: 1, variant: 'Belgian Truffle', notes: 'Pure Eggless' },
          { name: 'Cupcakes', quantity: 2, variant: 'Assorted' },
          { name: 'Chocolates', quantity: 2, variant: 'Artisan Rochers' },
        ],
        Medium: [
          { name: 'Mini Cake', quantity: 1, variant: 'Belgian Truffle', notes: 'Pure Eggless' },
          { name: 'Cupcakes', quantity: 4, variant: 'Assorted' },
          { name: 'Brownies', quantity: 2, variant: 'Fudgy Walnut' },
          { name: 'Chocolates', quantity: 4, variant: 'Artisan Rochers' },
          { name: 'Greeting Card', quantity: 1, notes: 'Handwritten with Wax Seal' },
        ],
        Large: [
          { name: 'Bento Cake', quantity: 1, variant: 'Belgian Truffle', notes: 'Pure Eggless' },
          { name: 'Cupcakes', quantity: 6, variant: 'Assorted' },
          { name: 'Brownies', quantity: 4, variant: 'Fudgy Walnut' },
          { name: 'Chocolates', quantity: 6, variant: 'Artisan Rochers' },
          { name: 'Greeting Card', quantity: 1, notes: 'Handwritten with Wax Seal' },
        ],
      },
    });

    setActivePackageTab(initialSizes[0] || 'Small');
    setModalOpen(true);
  };

  const handleOpenEditModal = (product: DatabaseProduct) => {
    setEditingProduct(product);

    const extracted = extractProductDetails(product);

    setFormData({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      description: product.description || '',
      images: product.images && product.images.length > 0 ? product.images : ['/src/assets/images/hero_cake_display_1790174282202.jpg'],
      featured: product.featured,
      is_new: Boolean(product.is_new),
      is_published: product.is_published,
      is_available: product.is_available,
      advance_order_notice: product.advance_order_notice || 'Please order at least 24 hours in advance',
      selectedSubcategories: extracted.selectedSubcategories,
      typeValue: extracted.typeValue,
      selectedSizes: extracted.selectedSizes,
      sizePricing: extracted.sizePricing,
      selectedFlavours: extracted.selectedFlavours,
      flavourMatrixPricing: extracted.flavourMatrixPricing || {},
      selectedCustomizations: extracted.selectedCustomizations,
      contentsMode: extracted.contentsMode,
      contentsByPackage: extracted.contentsByPackage,
    });

    setActivePackageTab(extracted.selectedSizes[0] || 'Small');
    setModalOpen(true);
  };

  // Image Upload Handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadProductImage(file);
        uploadedUrls.push(url);
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      showToast('Image uploaded successfully!');
    } catch (err) {
      console.error('Image upload failed', err);
      showToast('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setFormData((prev) => {
      const copy = [...prev.images];
      const [item] = copy.splice(indexToPrimary, 1);
      copy.unshift(item);
      return { ...prev, images: copy };
    });
    showToast('Primary image updated');
  };

  // Subcategory toggle
  const handleToggleSubcategory = (sub: string) => {
    setFormData((prev) => {
      const exists = prev.selectedSubcategories.includes(sub);
      return {
        ...prev,
        selectedSubcategories: exists
          ? prev.selectedSubcategories.filter((s) => s !== sub)
          : [...prev.selectedSubcategories, sub],
      };
    });
  };

  const handleAddCustomSubcategory = () => {
    const val = customSubcategoryInput.trim();
    if (!val) return;
    if (!formData.selectedSubcategories.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        selectedSubcategories: [...prev.selectedSubcategories, val],
      }));
    }
    setCustomSubcategoryInput('');
  };

  // Size / Package toggle
  const handleToggleSize = (sizeName: string) => {
    setFormData((prev) => {
      const exists = prev.selectedSizes.includes(sizeName);
      if (exists && prev.selectedSizes.length === 1) {
        showToast('At least one size or package is required');
        return prev;
      }
      const updatedSizes = exists
        ? prev.selectedSizes.filter((s) => s !== sizeName)
        : [...prev.selectedSizes, sizeName];

      // Update pricing map
      const updatedPricing = { ...prev.sizePricing };
      if (!exists && !updatedPricing[sizeName]) {
        updatedPricing[sizeName] = Math.round((prev.sizePricing[prev.selectedSizes[0]] || 699) * 1.3);
      }

      // Preserve and update flavour matrix columns
      const updatedMatrix = { ...prev.flavourMatrixPricing };
      if (!exists) {
        prev.selectedFlavours.forEach((flv) => {
          if (!updatedMatrix[flv]) updatedMatrix[flv] = {};
          if (updatedMatrix[flv][sizeName] === undefined) {
            const firstSize = prev.selectedSizes[0];
            const baseForFlv = firstSize && updatedMatrix[flv][firstSize] ? updatedMatrix[flv][firstSize] : (updatedPricing[sizeName] || 649);
            updatedMatrix[flv][sizeName] = updatedPricing[sizeName] || baseForFlv;
          }
        });
      }

      // Ensure contents bucket exists
      const updatedContents = { ...prev.contentsByPackage };
      if (!exists && !updatedContents[sizeName]) {
        updatedContents[sizeName] = [];
      }

      return {
        ...prev,
        selectedSizes: updatedSizes,
        sizePricing: updatedPricing,
        flavourMatrixPricing: updatedMatrix,
        contentsByPackage: updatedContents,
      };
    });
  };

  // Price change per size (fallback / non-flavour items)
  const handleSizePriceChange = (sizeName: string, price: number) => {
    setFormData((prev) => ({
      ...prev,
      sizePricing: {
        ...prev.sizePricing,
        [sizeName]: price,
      },
    }));
  };

  // Flavour toggle
  const handleToggleFlavour = (flavourName: string) => {
    setFormData((prev) => {
      const exists = prev.selectedFlavours.includes(flavourName);
      const updatedFlavours = exists
        ? prev.selectedFlavours.filter((f) => f !== flavourName)
        : [...prev.selectedFlavours, flavourName];

      const updatedMatrix = { ...prev.flavourMatrixPricing };
      // If newly checked and has no pricing row yet, preserve previous or populate defaults
      if (!exists && !updatedMatrix[flavourName]) {
        updatedMatrix[flavourName] = {};
        const referenceFlavour = prev.selectedFlavours[0];
        const referenceRow = referenceFlavour ? updatedMatrix[referenceFlavour] : null;

        prev.selectedSizes.forEach((sz, idx) => {
          if (referenceRow && referenceRow[sz] !== undefined) {
            updatedMatrix[flavourName][sz] = referenceRow[sz];
          } else if (prev.sizePricing[sz] !== undefined) {
            updatedMatrix[flavourName][sz] = prev.sizePricing[sz];
          } else {
            updatedMatrix[flavourName][sz] = Math.round(649 * (1 + idx * 0.45));
          }
        });
      }

      return {
        ...prev,
        selectedFlavours: updatedFlavours,
        flavourMatrixPricing: updatedMatrix,
      };
    });
  };

  // Matrix pricing update for individual cell (flavour x size)
  const handleMatrixPriceChange = (flavour: string, size: string, price: number) => {
    setFormData((prev) => ({
      ...prev,
      flavourMatrixPricing: {
        ...prev.flavourMatrixPricing,
        [flavour]: {
          ...(prev.flavourMatrixPricing[flavour] || {}),
          [size]: price,
        },
      },
    }));
  };

  // Copy row prices from one flavour to another
  const handleCopyRowPrices = (sourceFlavour: string, targetFlavour: string) => {
    const sourceRow = formData.flavourMatrixPricing[sourceFlavour];
    if (!sourceRow) return;

    setFormData((prev) => ({
      ...prev,
      flavourMatrixPricing: {
        ...prev.flavourMatrixPricing,
        [targetFlavour]: { ...sourceRow },
      },
    }));
    showToast(`Copied prices from "${sourceFlavour}" to "${targetFlavour}"`);
  };

  // Apply one flavour's row prices to all selected flavours
  const handleApplyRowToAll = (sourceFlavour: string) => {
    const sourceRow = formData.flavourMatrixPricing[sourceFlavour];
    if (!sourceRow) return;

    setFormData((prev) => {
      const updatedMatrix: Record<string, Record<string, number>> = { ...prev.flavourMatrixPricing };
      prev.selectedFlavours.forEach((flv) => {
        updatedMatrix[flv] = { ...sourceRow };
      });
      return {
        ...prev,
        flavourMatrixPricing: updatedMatrix,
      };
    });
    showToast(`Applied "${sourceFlavour}" prices to all flavours!`);
  };

  const handleAddCustomFlavour = () => {
    const val = customFlavourInput.trim();
    if (!val) return;
    if (!formData.selectedFlavours.includes(val)) {
      handleToggleFlavour(val);
    }
    setCustomFlavourInput('');
  };

  const handleAddCustomSize = () => {
    const val = customSizeInput.trim();
    if (!val) return;
    if (!formData.selectedSizes.includes(val)) {
      handleToggleSize(val);
    }
    setCustomSizeInput('');
  };

  // Customization toggle
  const handleToggleCustomization = (option: string) => {
    setFormData((prev) => {
      const exists = prev.selectedCustomizations.includes(option);
      return {
        ...prev,
        selectedCustomizations: exists
          ? prev.selectedCustomizations.filter((o) => o !== option)
          : [...prev.selectedCustomizations, option],
      };
    });
  };

  const handleAddCustomCustomization = () => {
    const val = customCustomizationInput.trim();
    if (!val) return;
    if (!formData.selectedCustomizations.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        selectedCustomizations: [...prev.selectedCustomizations, val],
      }));
    }
    setCustomCustomizationInput('');
  };

  // Contents Repeater Handlers
  const handleAddContentItem = (bucketKey: string) => {
    setFormData((prev) => {
      const currentList = prev.contentsByPackage[bucketKey] || [];
      const newItem: HamperContentItem = {
        name: COMMON_HAMPER_ITEM_PRESETS[0] || 'Mini Cake',
        quantity: 1,
        variant: 'Belgian Truffle',
        notes: '',
      };
      return {
        ...prev,
        contentsByPackage: {
          ...prev.contentsByPackage,
          [bucketKey]: [...currentList, newItem],
        },
      };
    });
  };

  const handleUpdateContentItem = (
    bucketKey: string,
    index: number,
    field: keyof HamperContentItem,
    value: any
  ) => {
    setFormData((prev) => {
      const currentList = [...(prev.contentsByPackage[bucketKey] || [])];
      if (!currentList[index]) return prev;
      currentList[index] = { ...currentList[index], [field]: value };
      return {
        ...prev,
        contentsByPackage: {
          ...prev.contentsByPackage,
          [bucketKey]: currentList,
        },
      };
    });
  };

  const handleRemoveContentItem = (bucketKey: string, index: number) => {
    setFormData((prev) => {
      const currentList = [...(prev.contentsByPackage[bucketKey] || [])];
      currentList.splice(index, 1);
      return {
        ...prev,
        contentsByPackage: {
          ...prev.contentsByPackage,
          [bucketKey]: currentList,
        },
      };
    });
  };

  // Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      if (!formData.name.trim()) {
        alert('Product name is required');
        setFormSubmitting(false);
        return;
      }

      if (formData.selectedSizes.length === 0) {
        alert('Please select at least one package size or weight option');
        setFormSubmitting(false);
        return;
      }

      // Prepare matrix pricing maps
      const comboPricingByWeight: Record<string, Record<string, number>> = {};
      const comboPricingByFlavour: Record<string, Record<string, number>> = {};

      formData.selectedSizes.forEach((sz) => {
        comboPricingByWeight[sz] = {};
        formData.selectedFlavours.forEach((flv) => {
          const cellPrice = Number(formData.flavourMatrixPricing[flv]?.[sz]) || Number(formData.sizePricing[sz]) || 649;
          comboPricingByWeight[sz][flv] = cellPrice;
        });
      });

      formData.selectedFlavours.forEach((flv) => {
        comboPricingByFlavour[flv] = {};
        formData.selectedSizes.forEach((sz) => {
          const cellPrice = Number(formData.flavourMatrixPricing[flv]?.[sz]) || Number(formData.sizePricing[sz]) || 649;
          comboPricingByFlavour[flv][sz] = cellPrice;
        });
      });

      // Calculate starting base price (lowest across matrix or sizes)
      let startingPrice = 999999;
      if (activeCategoryConfig.showFlavours && formData.selectedFlavours.length > 0) {
        formData.selectedFlavours.forEach((flv) => {
          formData.selectedSizes.forEach((sz) => {
            const p = comboPricingByFlavour[flv]?.[sz];
            if (p && p < startingPrice) startingPrice = p;
          });
        });
      }
      if (startingPrice === 999999) {
        const primarySize = formData.selectedSizes[0];
        startingPrice = Number(formData.sizePricing[primarySize]) || 649;
      }

      // Pack structured weight_prices JSON object without requiring manual JSON typing
      const finalWeightPrices: Record<string, any> = { ...formData.sizePricing };

      // Attach flavour matrix to weight_prices for maximum persistence and fallback resilience
      if (activeCategoryConfig.showFlavours && formData.selectedFlavours.length > 0) {
        finalWeightPrices._flavour_matrix = comboPricingByFlavour;
        finalWeightPrices._flavour_pricing = {
          byWeight: comboPricingByWeight,
          byFlavour: comboPricingByFlavour,
        };
      }

      // Attach structured contents object for hampers or products with items
      if (isHamper || activeCategoryConfig.hasContentsRepeater) {
        finalWeightPrices._contents = {
          mode: formData.contentsMode,
          byPackage: formData.contentsByPackage,
        };
      }

      const baseSlug = formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `item-${Date.now()}`;
      const targetSlug = formData.id
        ? (formData.slug.trim() || baseSlug)
        : (products.some((p) => p.slug === baseSlug) ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug);

      const payload: Partial<DatabaseProduct> & { name: string } = {
        id: formData.id || undefined,
        name: formData.name.trim(),
        slug: targetSlug,
        category: formData.category,
        description: formData.description.trim(),
        price: startingPrice,
        images: formData.images.length > 0 ? formData.images : ['/src/assets/images/hero_cake_display_1790174282202.jpg'],
        featured: formData.featured,
        is_new: formData.is_new,
        is_published: formData.is_published,
        is_available: formData.is_available,
        advance_order_notice: formData.advance_order_notice.trim(),

        // Unified Category & Option mapping
        flavour_tag: formData.typeValue || null,
        occasions: formData.selectedSubcategories,
        available_sizes: formData.selectedSizes,
        available_flavours: activeCategoryConfig.showFlavours ? formData.selectedFlavours : [],
        customization_options: formData.selectedCustomizations,
        weight_prices: finalWeightPrices,
        flavourCombinationPricing: comboPricingByWeight,
        flavourOptions: activeCategoryConfig.showFlavours ? formData.selectedFlavours : [],
        weightOptions: formData.selectedSizes,
      };

      const saved = await saveProduct(payload);
      showToast(`Product "${saved.name}" saved successfully!`);
      setModalOpen(false);

      // Immediately update local Admin state so there is zero delay in seeing the product
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [saved, ...prev];
      });

      // Clear search query & filter so the new product is visible immediately
      setSearchQuery('');
      setSelectedCategory('All');
      setStatusFilter('All');

      await loadData();
    } catch (err: any) {
      console.error('Save failed', err);
      alert(err.message || 'Failed to save product');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
      showToast('Product removed');
    } catch (err) {
      showToast('Failed to delete product');
    }
  };

  const handleTogglePublished = async (product: DatabaseProduct) => {
    const updated = !product.is_published;
    await saveProduct({ ...product, is_published: updated });
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_published: updated } : p))
    );
    showToast(`${product.name} is now ${updated ? 'Published' : 'Draft'}`);
  };

  const handleToggleAvailable = async (product: DatabaseProduct) => {
    const updated = !product.is_available;
    await saveProduct({ ...product, is_available: updated });
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_available: updated } : p))
    );
    showToast(`${product.name} is now ${updated ? 'In Stock' : 'Out of Stock'}`);
  };

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.flavour_tag && p.flavour_tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory =
      selectedCategory === 'All' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Published' && p.is_published) ||
      (statusFilter === 'Draft' && !p.is_published);

    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2A1810] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F3DFE5]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold block mb-1">
            Storefront Catalog
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2A1810]">
            Product Management
          </h1>
          <p className="mt-1 text-xs text-[#2A1810]/65">
            Manage bakery items with category-specific options: Hampers, Cakes, Bento, Desserts, Bouquets &amp; Confections.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#F3DFE5] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#2A1810]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, category, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] placeholder:text-[#2A1810]/40 focus:outline-hidden focus:border-[#D83A6F]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F] cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published Live</option>
            <option value="Draft">Draft Only</option>
          </select>
        </div>
      </div>

      {/* Products Grid & List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#2A1810]/60">
          <Sparkles className="w-6 h-6 text-[#D83A6F] animate-spin mx-auto mb-2" />
          Loading products from database...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#F3DFE5] space-y-3">
          <p className="font-serif text-2xl font-bold text-[#2A1810]">No Products Found</p>
          <p className="text-xs text-[#2A1810]/60">Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#F3DFE5] shadow-xs overflow-hidden">
          <div className="divide-y divide-[#F3DFE5]">
            {filteredProducts.map((product) => {
              const catKey = normalizeCategoryKey(product.category);
              const isHamp = catKey === 'hampers';

              return (
                <div
                  key={product.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#FFFDFB] transition-colors"
                >
                  {/* Product Thumbnail & Details */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-[#F3DFE5] bg-[#FFF5F7] shrink-0">
                      <ImageWithFallback
                        src={product.images[0] || ''}
                        alt={product.name}
                        fallbackText={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-lg font-bold text-[#2A1810]">
                          {product.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF0F4] text-[#D83A6F] border border-[#F3DFE5]">
                          {product.category}
                        </span>
                        {product.flavour_tag && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#2A1810]/5 text-[#2A1810]">
                            {product.flavour_tag}
                          </span>
                        )}
                        {product.featured && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            Featured
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#2A1810]/60 line-clamp-1">
                        {product.description || 'No description provided'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        <span className="font-bold text-[#D83A6F] tabular-nums font-serif text-base">
                          ₹{product.price}
                        </span>
                        <span className="text-[#2A1810]/40">·</span>
                        <span className="text-[#2A1810]/70">
                          {isHamp ? 'Packages' : 'Sizes'}: {product.available_sizes?.length || 0}
                        </span>
                        {!isHamp && (product.available_flavours?.length || 0) > 0 && (
                          <>
                            <span className="text-[#2A1810]/40">·</span>
                            <span className="text-[#2A1810]/70">
                              Flavours: {product.available_flavours?.length}
                            </span>
                          </>
                        )}
                        {(product.occasions?.length || 0) > 0 && (
                          <>
                            <span className="text-[#2A1810]/40">·</span>
                            <span className="text-[#2A1810]/60 text-[11px]">
                              {product.occasions?.slice(0, 2).join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Toggles */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(product)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        product.is_published
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {product.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{product.is_published ? 'Published' : 'Draft'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleAvailable(product)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        product.is_available
                          ? 'bg-[#FCEEF2] text-[#D83A6F] hover:bg-[#F9DDE5]'
                          : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      }`}
                    >
                      {product.is_available ? 'In Stock' : 'Out of Stock'}
                    </button>

                    <a
                      href={`/product/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-[#2A1810]/60 hover:text-[#D83A6F] hover:bg-[#FFF0F4] rounded-xl transition-colors cursor-pointer"
                      title="View on Storefront"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(product)}
                      className="p-2 text-[#2A1810]/70 hover:text-[#D83A6F] hover:bg-[#FFF0F4] rounded-xl transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {deleteConfirmId === product.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200">
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 rounded-lg cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(product.id)}
                        className="p-2 text-[#2A1810]/40 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT PRODUCT MODAL (Intuitive, Category-Driven, Zero-JSON)           */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl border border-[#F3DFE5] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#F3DFE5] flex items-center justify-between bg-[#FFFDFB] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF0F4] border border-[#F3DFE5] flex items-center justify-center text-[#D83A6F]">
                  {isHamper ? <Gift className="w-5 h-5" /> : <Cake className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1810]">
                    {editingProduct ? `Edit Product: ${editingProduct.name}` : `New ${formData.category} Item`}
                  </h3>
                  <p className="text-xs text-[#2A1810]/60">
                    Category: <span className="font-bold text-[#D83A6F]">{formData.category}</span> · Options adapt automatically
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full text-[#2A1810]/50 hover:text-[#2A1810] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* SECTION 1: COMMON DETAILS FOR ALL PRODUCTS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#F3DFE5]">
                  <span className="w-2 h-2 rounded-full bg-[#D83A6F]" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#2A1810]">
                    1. Common Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          name: val,
                          slug: editingProduct ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                        }));
                      }}
                      placeholder={isHamper ? "e.g. Birthday Premium Hamper" : "e.g. Belgian Chocolate Truffle Cake"}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                    />
                  </div>

                  {/* Main Category */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                      Main Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F] cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Enter appetizing product details and luxury packaging description..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>

                {/* Images Upload & Gallery */}
                <div>
                  <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                    Product Images
                  </label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {formData.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-[#F3DFE5] bg-[#FFF5F7] shadow-2xs"
                        >
                          <ImageWithFallback
                            src={img}
                            alt={`Preview ${idx}`}
                            fallbackText="img"
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-[#D83A6F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs">
                              Primary
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                title="Make primary image"
                                className="p-1 bg-white text-[#D83A6F] rounded-lg cursor-pointer"
                              >
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              title="Delete image"
                              className="p-1 bg-white text-rose-600 rounded-lg cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Image Button */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#F3DFE5] hover:border-[#D83A6F] bg-[#FFFDFB] flex flex-col items-center justify-center text-center p-2 text-[#2A1810]/60 hover:text-[#D83A6F] transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mb-1" />
                        <span className="text-[10px] font-bold leading-tight">
                          {uploadingImage ? '...' : '+ Upload'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Advance Order Notice & Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                      Advance Order Notice
                    </label>
                    <input
                      type="text"
                      value={formData.advance_order_notice}
                      onChange={(e) => setFormData((p) => ({ ...p, advance_order_notice: e.target.value }))}
                      placeholder="e.g. Please order at least 24 hours in advance"
                      className="w-full px-4 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                    />
                  </div>

                  <div className="flex items-center gap-4 sm:col-span-2 pt-2 sm:pt-6">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#2A1810] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData((p) => ({ ...p, is_published: e.target.checked }))}
                        className="rounded border-[#F3DFE5] text-[#D83A6F] focus:ring-[#D83A6F]"
                      />
                      <span>Published</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-[#2A1810] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_available}
                        onChange={(e) => setFormData((p) => ({ ...p, is_available: e.target.checked }))}
                        className="rounded border-[#F3DFE5] text-[#D83A6F] focus:ring-[#D83A6F]"
                      />
                      <span>In Stock</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-[#2A1810] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData((p) => ({ ...p, featured: e.target.checked }))}
                        className="rounded border-[#F3DFE5] text-[#D83A6F] focus:ring-[#D83A6F]"
                      />
                      <span>Bestseller</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 2: SUBCATEGORIES (From Category Settings) */}
              <div className="space-y-3 pt-3 border-t border-[#F3DFE5]">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D83A6F]" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#2A1810]">
                      2. Subcategories (Occasions &amp; Tags)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#2A1810]/60">
                    Click checkboxes to select
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 p-3 bg-[#FFFDFB] rounded-2xl border border-[#F3DFE5]">
                  {activeCategoryConfig.subcategories.map((sub) => {
                    const isSelected = formData.selectedSubcategories.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => handleToggleSubcategory(sub)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#D83A6F] text-white shadow-2xs font-semibold'
                            : 'bg-white border border-[#F3DFE5] text-[#2A1810]/70 hover:border-[#D83A6F]/40'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-white text-[#D83A6F] border-white' : 'border-[#2A1810]/30'}`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{sub}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Add Custom Subcategory */}
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    placeholder="Add custom subcategory tag..."
                    value={customSubcategoryInput}
                    onChange={(e) => setCustomSubcategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSubcategory();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubcategory}
                    className="px-3 py-1.5 bg-[#2A1810] text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* SECTION 3: CATEGORY-SPECIFIC OPTIONS (Hampers vs Cakes vs Bento etc.) */}
              <div className="space-y-4 pt-3 border-t border-[#F3DFE5]">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D83A6F]" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#2A1810]">
                      3. Category-Specific Options: {activeCategoryConfig.name}
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#D83A6F] font-bold bg-[#FFF0F4] px-2.5 py-0.5 rounded-full">
                    {isHamper ? 'Hamper Mode' : 'Bakery Item Mode'}
                  </span>
                </div>

                {/* 3A. Primary Type (Hamper Type, Cake Type, Bento Style, Dessert Type) */}
                <div className="p-4 bg-[#FFFDFB] rounded-2xl border border-[#F3DFE5] space-y-2">
                  <label className="block text-xs font-bold text-[#2A1810]">
                    {activeCategoryConfig.typesTitle}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {activeCategoryConfig.types.map((tp) => (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, typeValue: tp }))}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer flex items-center justify-between ${
                          formData.typeValue === tp
                            ? 'bg-[#2A1810] text-white border-[#2A1810] shadow-xs'
                            : 'bg-white border-[#F3DFE5] text-[#2A1810]/80 hover:border-[#D83A6F]'
                        }`}
                      >
                        <span className="truncate">{tp}</span>
                        {formData.typeValue === tp && <Check className="w-3.5 h-3.5 text-[#D83A6F] shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3B. CATEGORY OPTIONS & PRICING FLOW */}
                {activeCategoryConfig.showFlavours ? (
                  /* ========================================================================= */
                  /* FLAVOUR-BASED ITEMS (Cakes, Bento Cakes, Gourmet Desserts)                */
                  /* ========================================================================= */
                  <>
                    {/* 3B-1. Master Flavours Selection (Rows in Matrix) */}
                    <div className="p-4 bg-[#FFFDFB] rounded-2xl border border-[#F3DFE5] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h5 className="text-xs font-bold text-[#2A1810]">
                            {activeCategoryConfig.flavoursTitle || 'Master Cake Flavours'}
                          </h5>
                          <p className="text-[11px] text-[#2A1810]/60">
                            Check flavours available for this cake. Each selected flavour forms a row in the pricing matrix below.
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-[#D83A6F] bg-[#FFF0F4] px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                          {formData.selectedFlavours.length} Flavours Selected (Rows)
                        </span>
                      </div>

                      {/* Flavours Checkboxes */}
                      <div className="flex flex-wrap gap-2">
                        {activeCategoryConfig.flavours.map((flv) => {
                          const isSelected = formData.selectedFlavours.includes(flv);
                          return (
                            <button
                              key={flv}
                              type="button"
                              onClick={() => handleToggleFlavour(flv)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#2A1810] text-white shadow-2xs font-semibold'
                                  : 'bg-white border border-[#F3DFE5] text-[#2A1810]/70 hover:border-[#D83A6F]/40'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-[#D83A6F] text-white border-[#D83A6F]' : 'border-[#2A1810]/30'}`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span>{flv}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Add Custom Flavour */}
                      <div className="flex gap-2 max-w-sm pt-1">
                        <input
                          type="text"
                          placeholder="Add custom flavour (e.g. Lotus Biscoff)..."
                          value={customFlavourInput}
                          onChange={(e) => setCustomFlavourInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomFlavour();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#F3DFE5] rounded-xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomFlavour}
                          className="px-3 py-1.5 bg-[#2A1810] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-[#3D2518] transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    {/* 3B-2. Weight / Size Options (Columns in Matrix) */}
                    <div className="p-4 bg-[#FFFDFB] rounded-2xl border border-[#F3DFE5] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h5 className="text-xs font-bold text-[#2A1810]">
                            {activeCategoryConfig.sizesTitle || 'Cake Weight Options'}
                          </h5>
                          <p className="text-[11px] text-[#2A1810]/60">
                            Check weights offered for this cake. Each selected weight forms a column in the pricing matrix below.
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-[#D83A6F] bg-[#FFF0F4] px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                          {formData.selectedSizes.length} Weights Selected (Columns)
                        </span>
                      </div>

                      {/* Size Checkboxes */}
                      <div className="flex flex-wrap gap-2">
                        {activeCategoryConfig.sizes.map((sz) => {
                          const isSelected = formData.selectedSizes.includes(sz);
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleToggleSize(sz)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#D83A6F] text-white shadow-2xs'
                                  : 'bg-white border border-[#F3DFE5] text-[#2A1810]/70 hover:border-[#D83A6F]/40'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-white text-[#D83A6F] border-white' : 'border-[#2A1810]/30'}`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span>{sz}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Add Custom Weight */}
                      <div className="flex gap-2 max-w-sm pt-1">
                        <input
                          type="text"
                          placeholder="Add custom weight (e.g. 2.5 Kg)..."
                          value={customSizeInput}
                          onChange={(e) => setCustomSizeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomSize();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#F3DFE5] rounded-xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomSize}
                          className="px-3 py-1.5 bg-[#2A1810] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-[#3D2518] transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    {/* 3B-3. Flavour × Weight Pricing Matrix */}
                    <div className="p-4 bg-gradient-to-b from-[#FFFDFB] to-[#FFF5F7]/30 rounded-2xl border border-[#F3DFE5] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <Table className="w-4 h-4 text-[#D83A6F]" />
                          <h5 className="text-xs font-bold text-[#2A1810]">
                            Cake Pricing Matrix: Flavour × Weight
                          </h5>
                        </div>
                        <span className="text-[11px] text-[#2A1810]/60">
                          Each cell has its own price (Stored as variant)
                        </span>
                      </div>
                      <p className="text-[11px] text-[#2A1810]/70">
                        Enter the price for each flavour and weight combination. If you toggle flavours or weights above, this matrix updates automatically.
                      </p>

                      {formData.selectedFlavours.length === 0 ? (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center text-xs text-amber-800">
                          Please select at least one flavour above to display rows in the pricing matrix.
                        </div>
                      ) : formData.selectedSizes.length === 0 ? (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center text-xs text-amber-800">
                          Please select at least one weight option above to display columns in the pricing matrix.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-[#F3DFE5] bg-white shadow-2xs">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-[#FFF9F6] border-b border-[#F3DFE5]">
                                <th className="py-2.5 px-3.5 font-bold text-[#2A1810] min-w-[190px]">
                                  Flavour
                                </th>
                                {formData.selectedSizes.map((sz) => (
                                  <th key={sz} className="py-2.5 px-3 font-bold text-[#2A1810] text-center min-w-[110px]">
                                    <span className="inline-block px-2 py-0.5 bg-[#FFF0F4] text-[#D83A6F] rounded-md text-[11px] font-semibold">
                                      {sz}
                                    </span>
                                  </th>
                                ))}
                                <th className="py-2.5 px-3 font-bold text-[#2A1810] text-right min-w-[180px]">
                                  Quick Duplicate
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F3DFE5]">
                              {formData.selectedFlavours.map((flv) => (
                                <tr key={flv} className="hover:bg-[#FFFDFB] transition-colors">
                                  <td className="py-2.5 px-3.5 font-semibold text-[#2A1810]">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-[#D83A6F] shrink-0" />
                                      <span className="truncate max-w-[200px]" title={flv}>{flv}</span>
                                    </div>
                                  </td>
                                  {formData.selectedSizes.map((sz) => (
                                    <td key={sz} className="py-2 px-3 text-center">
                                      <div className="inline-flex items-center gap-1 bg-white border border-[#F3DFE5] rounded-lg px-2 py-1 focus-within:border-[#D83A6F] focus-within:ring-1 focus-within:ring-[#D83A6F]/20 shadow-2xs hover:border-[#D83A6F]/40 transition-colors">
                                        <span className="text-[11px] font-bold text-[#D83A6F]">₹</span>
                                        <input
                                          type="number"
                                          min={0}
                                          value={formData.flavourMatrixPricing[flv]?.[sz] ?? ''}
                                          onChange={(e) => handleMatrixPriceChange(flv, sz, Number(e.target.value) || 0)}
                                          placeholder="649"
                                          className="w-18 text-xs font-bold text-[#2A1810] bg-transparent focus:outline-hidden text-right"
                                        />
                                      </div>
                                    </td>
                                  ))}
                                  <td className="py-2 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleApplyRowToAll(flv)}
                                        title={`Apply "${flv}" prices across all other selected flavours`}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#D83A6F] bg-[#FFF0F4] hover:bg-[#FCEEF2] rounded-lg transition-colors cursor-pointer border border-[#F3DFE5]"
                                      >
                                        <Copy className="w-3 h-3" />
                                        <span>To All</span>
                                      </button>
                                      {formData.selectedFlavours.length > 1 && (
                                        <select
                                          defaultValue=""
                                          onChange={(e) => {
                                            if (e.target.value) {
                                              handleCopyRowPrices(e.target.value, flv);
                                              e.target.value = '';
                                            }
                                          }}
                                          className="px-2 py-1 text-[11px] text-[#2A1810]/70 bg-white border border-[#F3DFE5] rounded-lg cursor-pointer focus:outline-hidden hover:border-[#D83A6F]/40 max-w-[130px] truncate"
                                        >
                                          <option value="" disabled>Copy from...</option>
                                          {formData.selectedFlavours
                                            .filter((other) => other !== flv)
                                            .map((other) => (
                                              <option key={other} value={other}>
                                                From: {other}
                                              </option>
                                            ))}
                                        </select>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* ========================================================================= */
                  /* NON-FLAVOUR ITEMS (Hampers, Bouquets, Cookies, Non-Flavour Packs)         */
                  /* ========================================================================= */
                  <div className="p-4 bg-[#FFFDFB] rounded-2xl border border-[#F3DFE5] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-[#2A1810]">
                          {isHamper ? 'Select Package Sizes & Prices' : `${activeCategoryConfig.sizesTitle} & Pricing`}
                        </h5>
                        <p className="text-[11px] text-[#2A1810]/60">
                          Check packages that apply to this product and set price for each.
                        </p>
                      </div>
                    </div>

                    {/* Size Checkboxes */}
                    <div className="flex flex-wrap gap-2">
                      {activeCategoryConfig.sizes.map((sz) => {
                        const isSelected = formData.selectedSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleToggleSize(sz)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#D83A6F] text-white shadow-2xs'
                                : 'bg-white border border-[#F3DFE5] text-[#2A1810]/70 hover:border-[#D83A6F]/40'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-white text-[#D83A6F] border-white' : 'border-[#2A1810]/30'}`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{sz}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Clean Pricing Table (NO JSON!) */}
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-[#2A1810]/70 mb-2 uppercase tracking-wider">
                        Pricing per {isHamper ? 'Package' : 'Size'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {formData.selectedSizes.map((sz) => (
                          <div
                            key={sz}
                            className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#F3DFE5] shadow-2xs"
                          >
                            <span className="text-xs font-bold text-[#2A1810]">{sz}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-[#D83A6F]">₹</span>
                              <input
                                type="number"
                                min={0}
                                value={formData.sizePricing[sz] || ''}
                                onChange={(e) => handleSizePriceChange(sz, Number(e.target.value) || 0)}
                                placeholder="e.g. 699"
                                className="w-24 px-2 py-1 text-xs font-bold text-[#2A1810] bg-[#FFFDFB] border border-[#F3DFE5] rounded-lg focus:outline-hidden focus:border-[#D83A6F] text-right"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3C. HAMPERS: CONTENTS REPEATER (NO JSON!) */}
                {isHamper && (
                  <div className="p-4 bg-gradient-to-b from-[#FFFDFB] to-[#FFF5F7]/40 rounded-2xl border border-[#F3DFE5] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="text-xs font-bold text-[#2A1810] flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-[#D83A6F]" />
                          <span>Contents / Items Included (Hamper Packaging)</span>
                        </h5>
                        <p className="text-[11px] text-[#2A1810]/60">
                          Configure exact items included without writing any JSON!
                        </p>
                      </div>

                      {/* Mode Toggle: Same contents for all vs per package */}
                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#F3DFE5] text-[11px]">
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, contentsMode: 'all' }))}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                            formData.contentsMode === 'all'
                              ? 'bg-[#2A1810] text-white'
                              : 'text-[#2A1810]/60 hover:text-[#2A1810]'
                          }`}
                        >
                          Same for all
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, contentsMode: 'by_package' }))}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                            formData.contentsMode === 'by_package'
                              ? 'bg-[#2A1810] text-white'
                              : 'text-[#2A1810]/60 hover:text-[#2A1810]'
                          }`}
                        >
                          By Package Size
                        </button>
                      </div>
                    </div>

                    {/* If By Package, Tabs for Small / Medium / Large */}
                    {formData.contentsMode === 'by_package' && (
                      <div className="flex items-center gap-2 border-b border-[#F3DFE5] pb-2">
                        {formData.selectedSizes.map((pkg) => {
                          const count = (formData.contentsByPackage[pkg] || []).length;
                          const isActive = activePackageTab === pkg;
                          return (
                            <button
                              key={pkg}
                              type="button"
                              onClick={() => setActivePackageTab(pkg)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isActive
                                  ? 'bg-[#D83A6F] text-white shadow-xs'
                                  : 'bg-white border border-[#F3DFE5] text-[#2A1810]/70 hover:text-[#D83A6F]'
                              }`}
                            >
                              <span>{pkg} Package</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-[#FFF0F4] text-[#D83A6F]'}`}>
                                {count} items
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Repeater Items Table */}
                    {(() => {
                      const currentBucket = formData.contentsMode === 'all' ? 'all' : activePackageTab;
                      const itemsList = formData.contentsByPackage[currentBucket] || [];

                      return (
                        <div className="space-y-3">
                          {itemsList.length === 0 ? (
                            <div className="p-6 bg-white rounded-xl border border-dashed border-[#F3DFE5] text-center space-y-2">
                              <p className="text-xs text-[#2A1810]/60 font-medium">
                                No items added yet for this {formData.contentsMode === 'all' ? 'hamper' : `${activePackageTab} package`}.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleAddContentItem(currentBucket)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-xl cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add First Item</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {itemsList.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-xl border border-[#F3DFE5] shadow-2xs"
                                >
                                  {/* Item Name (Select or Input) */}
                                  <div className="flex-1 min-w-[140px]">
                                    <label className="block text-[10px] text-[#2A1810]/50 mb-0.5 font-medium sm:hidden">
                                      Item
                                    </label>
                                    <input
                                      type="text"
                                      list={`item-presets-${idx}`}
                                      value={item.name}
                                      onChange={(e) => handleUpdateContentItem(currentBucket, idx, 'name', e.target.value)}
                                      placeholder="e.g. Mini Cake, Cupcakes"
                                      className="w-full px-3 py-1.5 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-lg text-[#2A1810] font-medium focus:outline-hidden focus:border-[#D83A6F]"
                                    />
                                    <datalist id={`item-presets-${idx}`}>
                                      {COMMON_HAMPER_ITEM_PRESETS.map((p) => (
                                        <option key={p} value={p} />
                                      ))}
                                    </datalist>
                                  </div>

                                  {/* Quantity */}
                                  <div className="w-20">
                                    <label className="block text-[10px] text-[#2A1810]/50 mb-0.5 font-medium sm:hidden">
                                      Qty
                                    </label>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-[#2A1810]/50">×</span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={item.quantity}
                                        onChange={(e) => handleUpdateContentItem(currentBucket, idx, 'quantity', Number(e.target.value) || 1)}
                                        className="w-full px-2 py-1.5 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-lg text-[#2A1810] font-bold text-center focus:outline-hidden focus:border-[#D83A6F]"
                                      />
                                    </div>
                                  </div>

                                  {/* Variant / Flavour */}
                                  <div className="flex-1 min-w-[120px]">
                                    <label className="block text-[10px] text-[#2A1810]/50 mb-0.5 font-medium sm:hidden">
                                      Variant / Flavour (Optional)
                                    </label>
                                    <input
                                      type="text"
                                      value={item.variant || ''}
                                      onChange={(e) => handleUpdateContentItem(currentBucket, idx, 'variant', e.target.value)}
                                      placeholder="e.g. Belgian Truffle, Assorted"
                                      className="w-full px-3 py-1.5 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-lg text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                                    />
                                  </div>

                                  {/* Notes (e.g. Pure Eggless) */}
                                  <div className="flex-1 min-w-[110px]">
                                    <label className="block text-[10px] text-[#2A1810]/50 mb-0.5 font-medium sm:hidden">
                                      Notes
                                    </label>
                                    <input
                                      type="text"
                                      value={item.notes || ''}
                                      onChange={(e) => handleUpdateContentItem(currentBucket, idx, 'notes', e.target.value)}
                                      placeholder="e.g. Handwritten with wax seal"
                                      className="w-full px-3 py-1.5 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-lg text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                                    />
                                  </div>

                                  {/* Delete Item */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveContentItem(currentBucket, idx)}
                                    className="p-1.5 text-[#2A1810]/40 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer self-end sm:self-center"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}

                              {/* Add another item button */}
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleAddContentItem(currentBucket)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D83A6F] text-[#D83A6F] hover:bg-[#FFF0F4] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Add Item to {formData.contentsMode === 'all' ? 'Hamper' : activePackageTab}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 3D. Customization Options (Checkboxes) */}
                <div className="p-4 bg-[#FFFDFB] rounded-2xl border border-[#F3DFE5] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-[#2A1810]">
                        {activeCategoryConfig.customizationsTitle || 'Customization Options'}
                      </h5>
                      <p className="text-[11px] text-[#2A1810]/60">
                        Check options that customers can customize for this product.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeCategoryConfig.customizations.map((cust) => {
                      const isSelected = formData.selectedCustomizations.includes(cust);
                      return (
                        <button
                          key={cust}
                          type="button"
                          onClick={() => handleToggleCustomization(cust)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#D83A6F] text-white shadow-2xs font-semibold'
                              : 'bg-white border border-[#F3DFE5] text-[#2A1810]/70 hover:border-[#D83A6F]/40'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-white text-[#D83A6F] border-white' : 'border-[#2A1810]/30'}`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{cust}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Customization */}
                  <div className="flex gap-2 max-w-sm pt-1">
                    <input
                      type="text"
                      placeholder="Add custom option (e.g. Colour Theme)..."
                      value={customCustomizationInput}
                      onChange={(e) => setCustomCustomizationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomCustomization();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCustomization}
                      className="px-3 py-1.5 bg-[#2A1810] text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>

              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-[#F3DFE5] flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-[#2A1810]/70 hover:text-[#2A1810] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
                >
                  {formSubmitting ? 'Saving Product...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
