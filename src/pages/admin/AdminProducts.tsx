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
  CheckCircle2
} from 'lucide-react';
import { getProducts, saveProduct, deleteProduct, getCategories, uploadProductImage } from '../../lib/supabase';
import { DatabaseProduct, DatabaseCategory } from '../../types/supabase';
import { ImageWithFallback } from '../../components/ImageWithFallback';

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

  // Form Fields State
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    slug: string;
    category: string;
    flavour_tag: string;
    description: string;
    price: number;
    weightPricesText: string; // JSON or key-value helper
    images: string[];
    featured: boolean;
    is_new: boolean;
    is_published: boolean;
    is_available: boolean;
    occasionsText: string;
    availableSizesText: string;
    availableFlavoursText: string;
    customizationOptionsText: string;
    advance_order_notice: string;
  }>({
    id: '',
    name: '',
    slug: '',
    category: 'Cakes',
    flavour_tag: '',
    description: '',
    price: 649,
    weightPricesText: '{\n  "0.5 Kg": 649,\n  "1 Kg": 1199,\n  "1.5 Kg": 1699,\n  "2 Kg": 2199\n}',
    images: [],
    featured: false,
    is_new: false,
    is_published: true,
    is_available: true,
    occasionsText: 'Birthday, Anniversary, Just Because',
    availableSizesText: '0.5 Kg, 1 Kg, 1.5 Kg, 2 Kg',
    availableFlavoursText: 'Fresh Strawberry Cream, Vanilla Strawberry Swirl',
    customizationOptionsText: 'Piped Calligraphy Message, Golden Acrylic Cake Topper',
    advance_order_notice: 'Please order at least 24 hours in advance',
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

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      id: '',
      name: '',
      slug: '',
      category: categories[0]?.name || 'Cakes',
      flavour_tag: '',
      description: '',
      price: 649,
      weightPricesText: '{\n  "0.5 Kg": 649,\n  "1 Kg": 1199,\n  "1.5 Kg": 1699,\n  "2 Kg": 2199\n}',
      images: ['/src/assets/images/hero_cake_display_1790174282202.jpg'],
      featured: false,
      is_new: true,
      is_published: true,
      is_available: true,
      occasionsText: 'Birthday, Anniversary, Just Because',
      availableSizesText: '0.5 Kg, 1 Kg, 1.5 Kg, 2 Kg',
      availableFlavoursText: '',
      customizationOptionsText: 'Piped Calligraphy Message, Custom Ribbon',
      advance_order_notice: 'Please order at least 24 hours in advance',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (product: DatabaseProduct) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      flavour_tag: product.flavour_tag || '',
      description: product.description || '',
      price: product.price,
      weightPricesText: product.weight_prices ? JSON.stringify(product.weight_prices, null, 2) : '',
      images: product.images || [],
      featured: product.featured,
      is_new: Boolean(product.is_new),
      is_published: product.is_published,
      is_available: product.is_available,
      occasionsText: (product.occasions || []).join(', '),
      availableSizesText: (product.available_sizes || []).join(', '),
      availableFlavoursText: (product.available_flavours || []).join(', '),
      customizationOptionsText: (product.customization_options || []).join(', '),
      advance_order_notice: product.advance_order_notice || '',
    });
    setModalOpen(true);
  };

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      let parsedWeightPrices: Record<string, number> | null = null;
      if (formData.weightPricesText.trim()) {
        try {
          parsedWeightPrices = JSON.parse(formData.weightPricesText.trim());
        } catch (err) {
          alert('Weight prices format is invalid JSON. E.g. {"0.5 Kg": 649, "1 Kg": 1099}');
          setFormSubmitting(false);
          return;
        }
      }

      const occasions = formData.occasionsText.split(',').map((s) => s.trim()).filter(Boolean);
      const available_sizes = formData.availableSizesText.split(',').map((s) => s.trim()).filter(Boolean);
      const available_flavours = formData.availableFlavoursText.split(',').map((s) => s.trim()).filter(Boolean);
      const customization_options = formData.customizationOptionsText.split(',').map((s) => s.trim()).filter(Boolean);

      const saved = await saveProduct({
        id: formData.id || undefined,
        name: formData.name,
        slug: formData.slug || undefined,
        category: formData.category,
        flavour_tag: formData.flavour_tag || null,
        description: formData.description,
        price: Number(formData.price),
        weight_prices: parsedWeightPrices,
        images: formData.images,
        featured: formData.featured,
        is_new: formData.is_new,
        is_published: formData.is_published,
        is_available: formData.is_available,
        occasions,
        available_sizes,
        available_flavours,
        customization_options,
        advance_order_notice: formData.advance_order_notice,
      });

      showToast(`Product "${saved.name}" saved successfully!`);
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Failed to save product', err);
      alert(err.message || 'Failed to save product');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleTogglePublish = async (product: DatabaseProduct) => {
    const updated = !product.is_published;
    await saveProduct({ ...product, is_published: updated });
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_published: updated } : p))
    );
    showToast(`${product.name} is now ${updated ? 'Published' : 'Hidden as Draft'}`);
  };

  const handleToggleFeatured = async (product: DatabaseProduct) => {
    const updated = !product.featured;
    await saveProduct({ ...product, featured: updated });
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, featured: updated } : p))
    );
    showToast(`${product.name} featured status: ${updated ? 'Yes' : 'No'}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
      showToast('Product deleted successfully');
    } catch (err) {
      console.error('Failed to delete', err);
      showToast('Failed to delete product');
    }
  };

  // Filtered list
  const filteredProducts = products.filter((product) => {
    const matchesQuery =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.flavour_tag && product.flavour_tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Published' && product.is_published) ||
      (statusFilter === 'Draft' && !product.is_published);

    return matchesQuery && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast notification */}
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
            Boutique Catalog
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2A1810]">
            Product Management
          </h1>
          <p className="mt-1 text-xs text-[#2A1810]/65">
            Create, update prices, upload cake images, and manage variations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#F3DFE5] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#D83A6F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, category, or flavour..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] placeholder:text-[#2A1810]/40 focus:outline-hidden focus:border-[#D83A6F]"
          />
        </div>

        {/* Category Filter */}
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

          {/* Status Filter */}
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

      {/* Products Grid & Table */}
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
            {filteredProducts.map((product) => (
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
                        Sizes: {product.available_sizes?.length || 0}
                      </span>
                      <span className="text-[#2A1810]/40">·</span>
                      <span className="text-[#2A1810]/70">
                        Flavours: {product.available_flavours?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions & Toggles */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F3DFE5]">
                  {/* Published Toggle */}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(product)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      product.is_published
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={product.is_published ? 'Click to Unpublish' : 'Click to Publish Live'}
                  >
                    {product.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{product.is_published ? 'Published' : 'Draft'}</span>
                  </button>

                  {/* Featured Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(product)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      product.featured
                        ? 'text-amber-500 bg-amber-50'
                        : 'text-[#2A1810]/40 hover:bg-[#FFF0F4]'
                    }`}
                    title={product.featured ? 'Featured on Homepage' : 'Not Featured'}
                  >
                    <Star className={`w-4 h-4 ${product.featured ? 'fill-current' : ''}`} />
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(product)}
                    className="p-2 text-[#2A1810]/70 hover:text-[#D83A6F] hover:bg-[#FFF0F4] rounded-xl transition-colors cursor-pointer"
                    title="Edit Product"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  {deleteConfirmId === product.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200">
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 rounded-lg cursor-pointer"
                      >
                        Confirm
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
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRODUCT ADD / EDIT RESPONSIVE MODAL */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-[#F3DFE5] shadow-2xl my-8 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#F3DFE5] flex items-center justify-between bg-[#FFFDFB]">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#2A1810]">
                  {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Cake / Creation'}
                </h3>
                <p className="text-xs text-[#2A1810]/60">
                  Update pricing, weight options, flavours, and images.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full text-[#2A1810]/50 hover:text-[#2A1810] hover:bg-[#FFF0F4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Row 1: Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                      }));
                    }}
                    placeholder="e.g. Raspberry Pistachio Dream"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. raspberry-pistachio-dream"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>
              </div>

              {/* Row 2: Category, Flavour Tag & Base Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                    Flavour Tag
                  </label>
                  <input
                    type="text"
                    value={formData.flavour_tag}
                    onChange={(e) => setFormData((prev) => ({ ...prev, flavour_tag: e.target.value }))}
                    placeholder="e.g. Dark Chocolate"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>
              </div>

              {/* Row 3: Description */}
              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Product Story &amp; Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe sponge texture, frosting notes, eggless recipe..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                />
              </div>

              {/* Weight & Variant Pricing JSON */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#2A1810]">
                    Weight / Size Pricing (JSON format)
                  </label>
                  <span className="text-[10px] text-[#2A1810]/50">
                    Actual prices per weight option
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={formData.weightPricesText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, weightPricesText: e.target.value }))}
                  placeholder={'{\n  "0.5 Kg": 649,\n  "1 Kg": 1199\n}'}
                  className="w-full px-4 py-2.5 font-mono text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                />
              </div>

              {/* Image Management Section */}
              <div className="space-y-3 p-4 bg-[#FFFDFB] rounded-2xl border border-[#F3DFE5]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#2A1810] flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#D83A6F]" />
                      <span>Product Images (Supabase Storage)</span>
                    </h4>
                    <p className="text-[11px] text-[#2A1810]/60">
                      Upload from phone or desktop. First image is used as primary thumbnail.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Images Preview Grid */}
                {formData.images.length === 0 ? (
                  <p className="text-xs text-[#2A1810]/50 italic py-2">
                    No images added yet. Click &ldquo;Upload Image&rdquo; above.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {formData.images.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative rounded-2xl overflow-hidden border border-[#F3DFE5] bg-white group aspect-square"
                      >
                        <img
                          src={imgUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#D83A6F] text-white text-[9px] font-bold rounded-full uppercase">
                            Primary
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(index)}
                              className="p-1.5 bg-white text-[#2A1810] hover:text-[#D83A6F] rounded-lg text-[10px] font-bold"
                              title="Set as Primary"
                            >
                              Make 1st
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 4: Variations & Options (Comma-separated helpers) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                    Available Sizes (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.availableSizesText}
                    onChange={(e) => setFormData((prev) => ({ ...prev, availableSizesText: e.target.value }))}
                    placeholder="0.5 Kg, 1 Kg, 1.5 Kg, 2 Kg"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                    Available Flavours (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.availableFlavoursText}
                    onChange={(e) => setFormData((prev) => ({ ...prev, availableFlavoursText: e.target.value }))}
                    placeholder="Vanilla Bean, Belgian Truffle, Nutella"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                    Customization Options (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.customizationOptionsText}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customizationOptionsText: e.target.value }))}
                    placeholder="Piped Calligraphy Message, Acrylic Topper"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                    Occasions (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.occasionsText}
                    onChange={(e) => setFormData((prev) => ({ ...prev, occasionsText: e.target.value }))}
                    placeholder="Birthday, Anniversary, Just Because"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>
              </div>

              {/* Advance Order Notice */}
              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Advance Order Requirement
                </label>
                <input
                  type="text"
                  value={formData.advance_order_notice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, advance_order_notice: e.target.value }))}
                  placeholder="Please order at least 24 hours in advance"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-[#FFF5F7] border border-[#F3DFE5]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2A1810]">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
                    className="rounded text-[#D83A6F] focus:ring-[#D83A6F]"
                  />
                  <span>Published on Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2A1810]">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                    className="rounded text-[#D83A6F] focus:ring-[#D83A6F]"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2A1810]">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_available: e.target.checked }))}
                    className="rounded text-[#D83A6F] focus:ring-[#D83A6F]"
                  />
                  <span>In Stock / Available</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F3DFE5]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-[#2A1810]/70 hover:bg-[#FFF0F4] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving to Database...' : 'Save Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
