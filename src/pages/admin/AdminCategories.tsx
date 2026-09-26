import React, { useEffect, useState, useRef } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Sliders,
  Gift,
  Cake,
  Boxes,
  Cookie,
  Flower2,
  Layers,
  RotateCcw,
  Check,
  Tag
} from 'lucide-react';
import { getCategories, saveCategory, deleteCategory, uploadProductImage } from '../../lib/supabase';
import { DatabaseCategory } from '../../types/supabase';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import {
  getAllCategoryConfigs,
  saveCategoryConfig,
  resetCategoryConfig,
  CategoryMasterConfig,
  DEFAULT_CATEGORY_CONFIGS,
} from '../../data/categorySettings';

export function AdminCategories() {
  const [activeTab, setActiveTab] = useState<'categories' | 'settings'>('categories');
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Category Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DatabaseCategory | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    display_order: number;
    is_published: boolean;
  }>({
    id: '',
    name: '',
    slug: '',
    description: '',
    image: '',
    display_order: 1,
    is_published: true,
  });

  // Master Category Settings State
  const [masterConfigs, setMasterConfigs] = useState<Record<string, CategoryMasterConfig>>({});
  const [selectedConfigKey, setSelectedConfigKey] = useState<string>('hampers');

  // Input states for adding options in Master Settings
  const [inputValues, setInputValues] = useState<{
    subcategory: string;
    type: string;
    size: string;
    flavour: string;
    customization: string;
  }>({
    subcategory: '',
    type: '',
    size: '',
    flavour: '',
    customization: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories({ onlyPublished: false });
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMasterConfigs = () => {
    const configs = getAllCategoryConfigs();
    setMasterConfigs(configs);
  };

  useEffect(() => {
    loadCategories();
    loadMasterConfigs();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      id: '',
      name: '',
      slug: '',
      description: '',
      image: '/src/assets/images/hero_cake_display_1790174282202.jpg',
      display_order: categories.length + 1,
      is_published: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat: DatabaseCategory) => {
    setEditingCategory(cat);
    setFormData({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      display_order: cat.display_order || 1,
      is_published: cat.is_published,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      setFormData((prev) => ({ ...prev, image: url }));
      showToast('Category image uploaded');
    } catch (err) {
      console.error('Upload failed', err);
      showToast('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const saved = await saveCategory({
        id: formData.id || undefined,
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description,
        image: formData.image,
        display_order: Number(formData.display_order) || 1,
        is_published: formData.is_published,
      });

      showToast(`Category "${saved.name}" saved!`);
      setModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleTogglePublish = async (cat: DatabaseCategory) => {
    const updated = !cat.is_published;
    await saveCategory({ ...cat, is_published: updated });
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, is_published: updated } : c))
    );
    showToast(`${cat.name} is now ${updated ? 'Published' : 'Hidden'}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirmId(null);
      showToast('Category deleted');
    } catch (err) {
      showToast('Failed to delete category');
    }
  };

  // Master Settings Operations
  const currentConfig: CategoryMasterConfig =
    masterConfigs[selectedConfigKey] || DEFAULT_CATEGORY_CONFIGS[selectedConfigKey] || DEFAULT_CATEGORY_CONFIGS.hampers;

  const updateCurrentConfig = (mutator: (cfg: CategoryMasterConfig) => CategoryMasterConfig) => {
    const updated = mutator({ ...currentConfig });
    setMasterConfigs((prev) => ({ ...prev, [selectedConfigKey]: updated }));
    saveCategoryConfig(updated);
  };

  const handleAddSubcategory = () => {
    const val = inputValues.subcategory.trim();
    if (!val) return;
    if (currentConfig.subcategories.includes(val)) {
      showToast('Option already exists');
      return;
    }
    updateCurrentConfig((cfg) => ({
      ...cfg,
      subcategories: [...cfg.subcategories, val],
    }));
    setInputValues((prev) => ({ ...prev, subcategory: '' }));
    showToast(`Added subcategory: ${val}`);
  };

  const handleRemoveSubcategory = (item: string) => {
    updateCurrentConfig((cfg) => ({
      ...cfg,
      subcategories: cfg.subcategories.filter((s) => s !== item),
    }));
  };

  const handleAddType = () => {
    const val = inputValues.type.trim();
    if (!val) return;
    if (currentConfig.types.includes(val)) {
      showToast('Type already exists');
      return;
    }
    updateCurrentConfig((cfg) => ({
      ...cfg,
      types: [...cfg.types, val],
    }));
    setInputValues((prev) => ({ ...prev, type: '' }));
    showToast(`Added type: ${val}`);
  };

  const handleRemoveType = (item: string) => {
    updateCurrentConfig((cfg) => ({
      ...cfg,
      types: cfg.types.filter((t) => t !== item),
    }));
  };

  const handleAddSize = () => {
    const val = inputValues.size.trim();
    if (!val) return;
    if (currentConfig.sizes.includes(val)) {
      showToast('Size already exists');
      return;
    }
    updateCurrentConfig((cfg) => ({
      ...cfg,
      sizes: [...cfg.sizes, val],
    }));
    setInputValues((prev) => ({ ...prev, size: '' }));
    showToast(`Added size / package: ${val}`);
  };

  const handleRemoveSize = (item: string) => {
    updateCurrentConfig((cfg) => ({
      ...cfg,
      sizes: cfg.sizes.filter((s) => s !== item),
    }));
  };

  const handleAddFlavour = () => {
    const val = inputValues.flavour.trim();
    if (!val) return;
    if (currentConfig.flavours.includes(val)) {
      showToast('Flavour already exists');
      return;
    }
    updateCurrentConfig((cfg) => ({
      ...cfg,
      flavours: [...cfg.flavours, val],
    }));
    setInputValues((prev) => ({ ...prev, flavour: '' }));
    showToast(`Added flavour: ${val}`);
  };

  const handleRemoveFlavour = (item: string) => {
    updateCurrentConfig((cfg) => ({
      ...cfg,
      flavours: cfg.flavours.filter((f) => f !== item),
    }));
  };

  const handleAddCustomization = () => {
    const val = inputValues.customization.trim();
    if (!val) return;
    if (currentConfig.customizations.includes(val)) {
      showToast('Option already exists');
      return;
    }
    updateCurrentConfig((cfg) => ({
      ...cfg,
      customizations: [...cfg.customizations, val],
    }));
    setInputValues((prev) => ({ ...prev, customization: '' }));
    showToast(`Added customization option: ${val}`);
  };

  const handleRemoveCustomization = (item: string) => {
    updateCurrentConfig((cfg) => ({
      ...cfg,
      customizations: cfg.customizations.filter((c) => c !== item),
    }));
  };

  const handleResetToDefaults = () => {
    if (confirm(`Reset ${currentConfig.name} options to factory bakery defaults?`)) {
      const reset = resetCategoryConfig(selectedConfigKey);
      setMasterConfigs((prev) => ({ ...prev, [selectedConfigKey]: reset }));
      showToast(`Reset ${currentConfig.name} settings to defaults`);
    }
  };

  const configCategories = [
    { key: 'hampers', label: 'Hampers', icon: Gift },
    { key: 'cakes', label: 'Cakes', icon: Cake },
    { key: 'bento-cakes', label: 'Mini & Bento', icon: Boxes },
    { key: 'desserts', label: 'Desserts', icon: Layers },
    { key: 'bouquets', label: 'Bouquets', icon: Flower2 },
    { key: 'cookies', label: 'Cookies & Chocolates', icon: Cookie },
  ];

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2A1810] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F3DFE5]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold block mb-1">
            Storefront Taxonomy &amp; Options Engine
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2A1810]">
            Category &amp; Option Management
          </h1>
          <p className="mt-1 text-xs text-[#2A1810]/65">
            Manage main categories and configure reusable master options (Hamper Types, Bento Styles, Packages, Flavours).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'categories' && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-[#F3DFE5] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-[#D83A6F] text-white shadow-xs'
              : 'bg-[#FFFDFB] text-[#2A1810]/70 hover:bg-[#FFF0F4] hover:text-[#D83A6F]'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Categories &amp; Navigation</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#2A1810]/60'}`}>
            {categories.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#D83A6F] text-white shadow-xs'
              : 'bg-[#FFFDFB] text-[#2A1810]/70 hover:bg-[#FFF0F4] hover:text-[#D83A6F]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Category Settings (Master Options)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#D83A6F]/10 text-[#D83A6F]">
            Reusable
          </span>
        </button>
      </div>

      {/* TAB 1: CATEGORIES & NAVIGATION */}
      {activeTab === 'categories' && (
        <>
          {loading ? (
            <div className="py-20 text-center text-xs text-[#2A1810]/60">
              <Sparkles className="w-6 h-6 text-[#D83A6F] animate-spin mx-auto mb-2" />
              Loading categories...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl border border-[#F3DFE5] overflow-hidden shadow-xs flex flex-col justify-between group hover:border-[#D83A6F]/40 transition-colors"
                >
                  {/* Category Image */}
                  <div className="relative h-44 bg-[#FFF5F7] overflow-hidden">
                    <ImageWithFallback
                      src={cat.image || ''}
                      alt={cat.name}
                      fallbackText={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-[#2A1810] shadow-xs">
                        Order #{cat.display_order}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-bold text-[#2A1810]">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] font-mono text-[#2A1810]/50">
                        /{cat.slug}
                      </span>
                    </div>

                    <p className="text-xs text-[#2A1810]/65 line-clamp-2 leading-relaxed">
                      {cat.description || 'No description provided.'}
                    </p>

                    {/* Quick Button to Jump to Master Options */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const clean = cat.slug.toLowerCase();
                          if (clean.includes('hamper')) setSelectedConfigKey('hampers');
                          else if (clean.includes('bento')) setSelectedConfigKey('bento-cakes');
                          else if (clean.includes('bouquet')) setSelectedConfigKey('bouquets');
                          else if (clean.includes('cookie') || clean.includes('chocolate')) setSelectedConfigKey('cookies');
                          else if (clean.includes('dessert') || clean.includes('cupcake')) setSelectedConfigKey('desserts');
                          else setSelectedConfigKey('cakes');
                          setActiveTab('settings');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D83A6F] hover:text-[#C42B5E] cursor-pointer"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Configure Master Options for {cat.name} &rarr;</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 bg-[#FFFDFB] border-t border-[#F3DFE5] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        cat.is_published
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{cat.is_published ? 'Published' : 'Hidden'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-2 text-[#2A1810]/70 hover:text-[#D83A6F] hover:bg-[#FFF0F4] rounded-xl transition-colors cursor-pointer"
                        title="Edit Category Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {deleteConfirmId === cat.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200">
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id)}
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
                          onClick={() => setDeleteConfirmId(cat.id)}
                          className="p-2 text-[#2A1810]/40 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: CATEGORY SETTINGS (MASTER OPTIONS ENGINE) */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Explanation Banner */}
          <div className="p-5 bg-gradient-to-r from-[#FFF5F7] to-[#FFFDFB] border border-[#F3DFE5] rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-serif text-lg font-bold text-[#2A1810] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#D83A6F]" />
                <span>Reusable Category Master Settings</span>
              </h2>
              <p className="text-xs text-[#2A1810]/70 max-w-2xl leading-relaxed">
                Define reusable options here once. When creating or editing a product in the admin panel, you won't need to type flavour names, sizes, or package types again—just check the boxes!
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#F3DFE5] hover:bg-rose-50 text-[#2A1810]/70 hover:text-rose-600 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset {currentConfig.name} to Factory Defaults</span>
            </button>
          </div>

          {/* Category Selector Buttons */}
          <div className="flex flex-wrap gap-2">
            {configCategories.map((c) => {
              const Icon = c.icon;
              const isSelected = selectedConfigKey === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedConfigKey(c.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#2A1810] text-white shadow-xs'
                      : 'bg-white border border-[#F3DFE5] text-[#2A1810]/70 hover:border-[#D83A6F]/40 hover:text-[#D83A6F]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D83A6F]' : 'text-[#2A1810]/50'}`} />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Master Options Grid for Selected Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Subcategories (Occasions / Tags) */}
            <div className="bg-white p-6 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#2A1810] flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#D83A6F]" />
                    <span>Subcategories ({currentConfig.name})</span>
                  </h3>
                  <p className="text-[11px] text-[#2A1810]/60 mt-0.5">
                    Selectable tags when assigning subcategories to a product.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#D83A6F] bg-[#FFF0F4] px-2.5 py-0.5 rounded-full">
                  {currentConfig.subcategories.length}
                </span>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-1.5 min-h-[4rem] p-3 bg-[#FFFDFB] rounded-2xl border border-[#F3DFE5]">
                {currentConfig.subcategories.map((sub) => (
                  <span
                    key={sub}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#F3DFE5] rounded-full text-xs font-medium text-[#2A1810] shadow-2xs group"
                  >
                    <span>{sub}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(sub)}
                      className="text-[#2A1810]/30 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Birthday, Anniversary, For Girlfriend..."
                  value={inputValues.subcategory}
                  onChange={(e) => setInputValues((p) => ({ ...p, subcategory: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubcategory();
                    }
                  }}
                  className="flex-1 px-4 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                />
                <button
                  type="button"
                  onClick={handleAddSubcategory}
                  className="px-4 py-2 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl transition-colors cursor-pointer shrink-0"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* 2. Category Types (e.g. Hamper Types, Cake Types, Bento Styles) */}
            <div className="bg-white p-6 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#2A1810] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#D83A6F]" />
                    <span>{currentConfig.typesTitle}</span>
                  </h3>
                  <p className="text-[11px] text-[#2A1810]/60 mt-0.5">
                    {currentConfig.typesDescription || 'Master styles or classifications for this category.'}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#D83A6F] bg-[#FFF0F4] px-2.5 py-0.5 rounded-full">
                  {currentConfig.types.length}
                </span>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-1.5 min-h-[4rem] p-3 bg-[#FFFDFB] rounded-2xl border border-[#F3DFE5]">
                {currentConfig.types.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#F3DFE5] rounded-full text-xs font-medium text-[#2A1810] shadow-2xs group"
                  >
                    <span>{type}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveType(type)}
                      className="text-[#2A1810]/30 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`e.g. ${currentConfig.id === 'hampers' ? 'Premium Hamper, Chocolate Hamper' : 'Vintage Lambeth, Classic'}`}
                  value={inputValues.type}
                  onChange={(e) => setInputValues((p) => ({ ...p, type: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddType();
                    }
                  }}
                  className="flex-1 px-4 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                />
                <button
                  type="button"
                  onClick={handleAddType}
                  className="px-4 py-2 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl transition-colors cursor-pointer shrink-0"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* 3. Package Sizes / Weights */}
            <div className="bg-white p-6 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#2A1810] flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-[#D83A6F]" />
                    <span>{currentConfig.sizesTitle}</span>
                  </h3>
                  <p className="text-[11px] text-[#2A1810]/60 mt-0.5">
                    {currentConfig.sizesDescription || 'Sizes or packages used for pricing tables and customer selection.'}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#D83A6F] bg-[#FFF0F4] px-2.5 py-0.5 rounded-full">
                  {currentConfig.sizes.length}
                </span>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-1.5 min-h-[4rem] p-3 bg-[#FFFDFB] rounded-2xl border border-[#F3DFE5]">
                {currentConfig.sizes.map((sz) => (
                  <span
                    key={sz}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#F3DFE5] rounded-full text-xs font-medium text-[#2A1810] shadow-2xs group"
                  >
                    <span>{sz}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(sz)}
                      className="text-[#2A1810]/30 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`e.g. ${currentConfig.id === 'hampers' ? 'Small, Medium, Large' : '0.5 Kg, 1 Kg, Box of 4'}`}
                  value={inputValues.size}
                  onChange={(e) => setInputValues((p) => ({ ...p, size: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSize();
                    }
                  }}
                  className="flex-1 px-4 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-4 py-2 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl transition-colors cursor-pointer shrink-0"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* 4. Master Flavours (if applicable) */}
            <div className={`bg-white p-6 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-4 ${!currentConfig.showFlavours ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#2A1810] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D83A6F]" />
                    <span>{currentConfig.flavoursTitle || 'Master Flavours'}</span>
                  </h3>
                  <p className="text-[11px] text-[#2A1810]/60 mt-0.5">
                    {currentConfig.showFlavours
                      ? 'Flavours available to select when editing products in this category.'
                      : 'Disabled for this category (e.g. Hampers do not use cake flavours).'}
                  </p>
                </div>
                {currentConfig.showFlavours && (
                  <span className="text-xs font-mono font-bold text-[#D83A6F] bg-[#FFF0F4] px-2.5 py-0.5 rounded-full">
                    {currentConfig.flavours.length}
                  </span>
                )}
              </div>

              {currentConfig.showFlavours ? (
                <>
                  {/* Chips */}
                  <div className="flex flex-wrap gap-1.5 min-h-[4rem] p-3 bg-[#FFFDFB] rounded-2xl border border-[#F3DFE5]">
                    {currentConfig.flavours.map((flv) => (
                      <span
                        key={flv}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#F3DFE5] rounded-full text-xs font-medium text-[#2A1810] shadow-2xs group"
                      >
                        <span>{flv}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFlavour(flv)}
                          className="text-[#2A1810]/30 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Belgian Chocolate Truffle, Fresh Strawberry Cream..."
                      value={inputValues.flavour}
                      onChange={(e) => setInputValues((p) => ({ ...p, flavour: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFlavour();
                        }
                      }}
                      className="flex-1 px-4 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                    />
                    <button
                      type="button"
                      onClick={handleAddFlavour}
                      className="px-4 py-2 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl transition-colors cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-xs text-gray-500 text-center">
                  Flavour options are deactivated for {currentConfig.name} by design.
                </div>
              )}
            </div>

            {/* 5. Customization Options (Message Card, Ribbon, Name, etc.) */}
            <div className="bg-white p-6 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#2A1810] flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#D83A6F]" />
                    <span>{currentConfig.customizationsTitle || 'Customization Options'}</span>
                  </h3>
                  <p className="text-[11px] text-[#2A1810]/60 mt-0.5">
                    Personalization options displayed as simple checkboxes in the product form (e.g. Message Card, Name, Ribbon, Colour Theme).
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#D83A6F] bg-[#FFF0F4] px-2.5 py-0.5 rounded-full">
                  {currentConfig.customizations.length}
                </span>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-2 min-h-[4rem] p-3 bg-[#FFFDFB] rounded-2xl border border-[#F3DFE5]">
                {currentConfig.customizations.map((cust) => (
                  <span
                    key={cust}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#F3DFE5] rounded-full text-xs font-medium text-[#2A1810] shadow-2xs group"
                  >
                    <Check className="w-3.5 h-3.5 text-[#D83A6F]" />
                    <span>{cust}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomization(cust)}
                      className="text-[#2A1810]/30 hover:text-rose-600 transition-colors cursor-pointer ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Input */}
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="e.g. Message Card, Name, Ribbon, Colour Theme..."
                  value={inputValues.customization}
                  onChange={(e) => setInputValues((p) => ({ ...p, customization: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomization();
                    }
                  }}
                  className="flex-1 px-4 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomization}
                  className="px-4 py-2 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl transition-colors cursor-pointer shrink-0"
                >
                  + Add
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Category Modal (for Categories & Navigation) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#F3DFE5] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#F3DFE5] flex items-center justify-between bg-[#FFFDFB]">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#2A1810]">
                  {editingCategory ? `Edit: ${editingCategory.name}` : 'New Category'}
                </h3>
                <p className="text-xs text-[#2A1810]/60">
                  Visible in storefront category navigation and menus.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full text-[#2A1810]/50 hover:text-[#2A1810]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Category Name *
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
                      slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    }));
                  }}
                  placeholder="e.g. Bento Cakes"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Slug (URL path)
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. bento-cakes"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Short tagline for category page..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Category Banner Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF5F7] border border-[#F3DFE5] overflow-hidden shrink-0">
                    <ImageWithFallback
                      src={formData.image}
                      alt="Category Preview"
                      fallbackText="Cat"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#F3DFE5] text-xs font-semibold text-[#2A1810] hover:bg-[#FFF5F7] transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#D83A6F]" />
                      <span>{uploadingImage ? 'Uploading...' : 'Replace Image'}</span>
                    </button>
                    <p className="text-[10px] text-[#2A1810]/50">
                      Recommended 800×600 JPG or WebP
                    </p>
                  </div>
                </div>
              </div>

              {/* Order & Publish */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.display_order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, display_order: Number(e.target.value) || 1 }))}
                    className="w-full px-4 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#2A1810] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
                      className="rounded border-[#F3DFE5] text-[#D83A6F] focus:ring-[#D83A6F]"
                    />
                    <span>Publish to Storefront</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F3DFE5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#2A1810]/70 hover:text-[#2A1810] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
                >
                  {formSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
