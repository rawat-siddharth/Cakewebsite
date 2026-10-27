import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Layers,
  Heart,
  Flame,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  getHomepageBanners,
  saveHomepageBanners,
  getCustomerGallery,
  saveCustomerGallery,
  getTrendingCakeIds,
  saveTrendingCakeIds,
  uploadProductImage,
  DEFAULT_HOMEPAGE_BANNERS,
  DEFAULT_CUSTOMER_GALLERY,
  DEFAULT_TRENDING_CAKE_IDS
} from '../../lib/supabase';
import { HomepageBannerSlide, CustomerGalleryItem } from '../../types/supabase';
import { ImageWithFallback } from '../../components/ImageWithFallback';

type Tab = 'banners' | 'gallery' | 'trending';

export function AdminHomepage() {
  const [activeTab, setActiveTab] = useState<Tab>('banners');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States for each section
  const [banners, setBanners] = useState<HomepageBannerSlide[]>(DEFAULT_HOMEPAGE_BANNERS);
  const [gallery, setGallery] = useState<CustomerGalleryItem[]>(DEFAULT_CUSTOMER_GALLERY);
  const [trendingIds, setTrendingIds] = useState<string[]>(DEFAULT_TRENDING_CAKE_IDS);

  const { products, refreshStoreData } = useStore();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [b, g, t] = await Promise.all([
          getHomepageBanners(),
          getCustomerGallery(),
          getTrendingCakeIds(),
        ]);
        setBanners(b);
        setGallery(g);
        setTrendingIds(t);
      } catch (err) {
        console.error('Failed to load homepage admin data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // =========================================================================
  // 1. BANNERS HANDLERS
  // =========================================================================
  const handleBannerChange = (index: number, field: keyof HomepageBannerSlide, value: any) => {
    setBanners((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === banners.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setBanners((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated.map((item, idx) => ({ ...item, display_order: idx + 1 }));
    });
  };

  const handleAddBanner = () => {
    const newSlide: HomepageBannerSlide = {
      id: `banner-${Date.now()}`,
      heading: 'New Celebration Cake',
      description: 'Handcrafted fresh upon every order in Jaipur.',
      button_label: 'Order Now',
      button_link: '/cakes',
      promo_badge: 'Freshly Baked • 100% Eggless',
      image: '/src/assets/images/pastel_sprinkles_cake.jpg',
      bg_gradient: 'from-[#FDEEEF] via-[#FDF3F5] to-[#FCEBED]',
      display_order: banners.length + 1,
      is_active: true,
    };
    setBanners((prev) => [...prev, newSlide]);
  };

  const handleDeleteBanner = (index: number) => {
    if (banners.length <= 1) {
      alert('You must have at least one banner slide.');
      return;
    }
    setBanners((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleBannerImageUpload = async (index: number, file: File) => {
    try {
      const url = await uploadProductImage(file);
      handleBannerChange(index, 'image', url);
      showToast('Banner image uploaded!');
    } catch (e) {
      showToast('Failed to upload banner image');
    }
  };

  const handleSaveBanners = async () => {
    setSaving(true);
    try {
      await saveHomepageBanners(banners);
      await refreshStoreData();
      showToast('Promotional banners saved successfully!');
    } catch (e) {
      showToast('Failed to save banners');
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // 2. GALLERY HANDLERS
  // =========================================================================
  const handleGalleryChange = (index: number, field: keyof CustomerGalleryItem, value: any) => {
    setGallery((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleMoveGallery = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === gallery.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setGallery((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated.map((item, idx) => ({ ...item, display_order: idx + 1 }));
    });
  };

  const handleAddGalleryItem = () => {
    const newItem: CustomerGalleryItem = {
      id: `moment-${Date.now()}`,
      title: 'Customer Celebration Cake',
      caption: 'Handcrafted custom celebration cake',
      tag: 'Customer Photo',
      image: '/src/assets/images/pastel_sprinkles_cake.jpg',
      display_order: gallery.length + 1,
      is_active: true,
      is_placeholder: false,
    };
    setGallery((prev) => [...prev, newItem]);
  };

  const handleDeleteGallery = (index: number) => {
    setGallery((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleGalleryImageUpload = async (index: number, file: File) => {
    try {
      const url = await uploadProductImage(file);
      handleGalleryChange(index, 'image', url);
      showToast('Gallery image uploaded!');
    } catch (e) {
      showToast('Failed to upload image');
    }
  };

  const handleSaveGallery = async () => {
    setSaving(true);
    try {
      await saveCustomerGallery(gallery);
      await refreshStoreData();
      showToast('Customer gallery saved successfully!');
    } catch (e) {
      showToast('Failed to save gallery');
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // 3. TRENDING CAKES HANDLERS
  // =========================================================================
  const handleToggleTrending = (productId: string) => {
    setTrendingIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleMoveTrending = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === trendingIds.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setTrendingIds((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleSaveTrending = async () => {
    setSaving(true);
    try {
      await saveTrendingCakeIds(trendingIds);
      await refreshStoreData();
      showToast('Trending cakes saved successfully!');
    } catch (e) {
      showToast('Failed to save trending cakes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#2A1810]/60">
        <Sparkles className="w-6 h-6 text-[#D83A6F] animate-spin mx-auto mb-2" />
        Loading homepage content settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2A1810] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3DFE5] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FFF0F4] text-[#D83A6F]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-[#2A1810]">
              Homepage Content Manager
            </h1>
          </div>
          <p className="text-xs text-[#9E8A85] mt-1">
            Manage promotional banners, customer gallery moments, and trending cake selections live on your website.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#F3DFE5] rounded-full text-xs font-semibold text-[#D83A6F] hover:bg-[#FFF0F4] transition-colors self-start sm:self-auto"
        >
          <span>Preview Homepage</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#F3DFE5] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'banners'
              ? 'bg-[#D83A6F] text-white shadow-xs'
              : 'bg-white text-[#5C4033] border border-[#F3DFE5] hover:bg-[#FFF0F4]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Promotional Banners ({banners.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-[#D83A6F] text-white shadow-xs'
              : 'bg-white text-[#5C4033] border border-[#F3DFE5] hover:bg-[#FFF0F4]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Customer Cake Gallery ({gallery.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trending')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'trending'
              ? 'bg-[#D83A6F] text-white shadow-xs'
              : 'bg-white text-[#5C4033] border border-[#F3DFE5] hover:bg-[#FFF0F4]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Trending Cakes ({trendingIds.length})</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: PROMOTIONAL BANNERS
      ====================================================================== */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A1810]">
                Hero Banner Slides
              </h2>
              <p className="text-xs text-[#9E8A85]">
                Configure up to 5 rotating promotional slides with bakery messages, photos, and links.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddBanner}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#F3DFE5] text-[#2A1810] text-xs font-semibold rounded-xl hover:border-[#D83A6F] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D83A6F]" />
                <span>Add Slide</span>
              </button>

              <button
                type="button"
                onClick={handleSaveBanners}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#D83A6F] hover:bg-[#C22D5E] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Banners'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {banners.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className={`p-5 rounded-2xl bg-white border transition-all ${
                  slide.is_active ? 'border-[#F3DFE5] shadow-2xs' : 'border-[#F3DFE5]/60 bg-gray-50/50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-4 border-b border-[#F3DFE5] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFF0F4] text-[#D83A6F] text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#2A1810]">
                      {slide.heading || 'Untitled Slide'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleBannerChange(idx, 'is_active', !slide.is_active)}
                      className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                        slide.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                      title={slide.is_active ? 'Slide is active' : 'Slide is hidden'}
                    >
                      {slide.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveBanner(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-[#F3DFE5] bg-white text-[#5C4033] hover:text-[#D83A6F] disabled:opacity-30 cursor-pointer"
                      title="Move slide up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveBanner(idx, 'down')}
                      disabled={idx === banners.length - 1}
                      className="p-1.5 rounded-lg border border-[#F3DFE5] bg-white text-[#5C4033] hover:text-[#D83A6F] disabled:opacity-30 cursor-pointer"
                      title="Move slide down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(idx)}
                      className="p-1.5 rounded-lg border border-[#F3DFE5] bg-white text-rose-500 hover:bg-rose-50 cursor-pointer ml-1"
                      title="Delete slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Left inputs */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#2A1810] mb-1">
                          Heading
                        </label>
                        <input
                          type="text"
                          value={slide.heading}
                          onChange={(e) => handleBannerChange(idx, 'heading', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#F3DFE5] text-xs text-[#2A1810]"
                          placeholder="e.g. Freshly Baked With Love"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#2A1810] mb-1">
                          Promo Tag / Badge
                        </label>
                        <input
                          type="text"
                          value={slide.promo_badge || ''}
                          onChange={(e) => handleBannerChange(idx, 'promo_badge', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#F3DFE5] text-xs text-[#2A1810]"
                          placeholder="e.g. 100% Pure Eggless • Baked Daily"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#2A1810] mb-1">
                        Description / Message
                      </label>
                      <textarea
                        rows={2}
                        value={slide.description}
                        onChange={(e) => handleBannerChange(idx, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#F3DFE5] text-xs text-[#2A1810]"
                        placeholder="Explain fresh-baking, celebration notice, or flavors..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#2A1810] mb-1">
                          Button Label
                        </label>
                        <input
                          type="text"
                          value={slide.button_label || ''}
                          onChange={(e) => handleBannerChange(idx, 'button_label', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#F3DFE5] text-xs text-[#2A1810]"
                          placeholder="e.g. Order Fresh Cake"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#2A1810] mb-1">
                          Button Destination Route
                        </label>
                        <input
                          type="text"
                          value={slide.button_link || ''}
                          onChange={(e) => handleBannerChange(idx, 'button_link', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#F3DFE5] text-xs text-[#2A1810]"
                          placeholder="e.g. /cakes or /shop?category=bento-cakes"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right photo */}
                  <div className="md:col-span-4 flex flex-col items-center gap-2">
                    <label className="block text-[11px] font-bold text-[#2A1810] self-start">
                      Banner Cake Image
                    </label>
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border border-[#F3DFE5] bg-[#FFFBFB] relative group">
                      <ImageWithFallback
                        src={slide.image || '/src/assets/images/pastel_sprinkles_cake.jpg'}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#F3DFE5] rounded-xl text-xs font-semibold text-[#D83A6F] hover:bg-[#FFF0F4]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBannerImageUpload(idx, file);
                        }}
                      />
                    </label>

                    <input
                      type="text"
                      value={slide.image || ''}
                      onChange={(e) => handleBannerChange(idx, 'image', e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg border border-[#F3DFE5] text-[10px] text-[#2A1810]"
                      placeholder="Image URL or asset path"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: CUSTOMER CAKE GALLERY (“Made for Your Moments”)
      ====================================================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A1810]">
                Customer Cake Gallery (“Made for Your Moments”)
              </h2>
              <p className="text-xs text-[#9E8A85]">
                Upload customer celebration photos, add captions, and transparently label demo placeholders.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddGalleryItem}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#F3DFE5] text-[#2A1810] text-xs font-semibold rounded-xl hover:border-[#D83A6F] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D83A6F]" />
                <span>Add Photo</span>
              </button>

              <button
                type="button"
                onClick={handleSaveGallery}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#D83A6F] hover:bg-[#C22D5E] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Gallery'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gallery.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`p-4 rounded-2xl bg-white border flex flex-col justify-between gap-3 ${
                  item.is_active ? 'border-[#F3DFE5] shadow-2xs' : 'border-[#F3DFE5]/60 bg-gray-50/50 opacity-75'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-[#F3DFE5] bg-[#FFFBFB] relative">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#D83A6F]">#{idx + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleGalleryChange(idx, 'is_active', !item.is_active)}
                          className={`p-1 rounded-md border text-xs cursor-pointer ${
                            item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}
                          title="Toggle visibility"
                        >
                          {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveGallery(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded-md border text-[#5C4033] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveGallery(idx, 'down')}
                          disabled={idx === gallery.length - 1}
                          className="p-1 rounded-md border text-[#5C4033] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGallery(idx)}
                          className="p-1 rounded-md border text-rose-500 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleGalleryChange(idx, 'title', e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg border border-[#F3DFE5] text-xs font-bold text-[#2A1810]"
                      placeholder="e.g. Birthday Celebration Cake"
                    />

                    <input
                      type="text"
                      value={item.caption || ''}
                      onChange={(e) => handleGalleryChange(idx, 'caption', e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg border border-[#F3DFE5] text-xs text-[#5C4033]"
                      placeholder="Short moment caption..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F3DFE5] text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.is_placeholder || false}
                      onChange={(e) => handleGalleryChange(idx, 'is_placeholder', e.target.checked)}
                      className="rounded text-[#D83A6F] focus:ring-[#D83A6F]"
                    />
                    <span className="text-[11px] text-[#5C4033]">Mark as Demo Placeholder</span>
                  </label>

                  <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold text-[#D83A6F] hover:underline">
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleGalleryImageUpload(idx, file);
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: TRENDING CAKES SELECTION
      ====================================================================== */}
      {activeTab === 'trending' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A1810]">
                Trending Cakes Selection &amp; Ordering
              </h2>
              <p className="text-xs text-[#9E8A85]">
                Select which cakes appear in the “Trending Cakes” carousel and adjust their sequence.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveTrending}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#D83A6F] hover:bg-[#C22D5E] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Trending Cakes'}</span>
            </button>
          </div>

          {/* Currently Selected Sequence */}
          <div className="p-5 rounded-2xl bg-[#FFF9F6] border border-[#F3DFE5] space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#2A1810]">
              Currently Selected Trending Cakes (Sequence 1 to {trendingIds.length})
            </h3>
            
            {trendingIds.length === 0 ? (
              <p className="text-xs text-[#9E8A85] italic">
                No cakes selected yet. Choose cakes from the catalogue below.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {trendingIds.map((id, idx) => {
                  const prod = products.find((p) => p.id === id || p.slug === id);
                  return (
                    <div
                      key={id}
                      className="p-3 rounded-xl bg-white border border-[#F3DFE5] flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-5 h-5 rounded-full bg-[#FFF0F4] text-[#D83A6F] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <span className="text-xs font-bold text-[#2A1810] block truncate">
                            {prod?.name || id}
                          </span>
                          <span className="text-[10px] text-[#9E8A85]">
                            ₹{prod?.price || 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveTrending(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-[#5C4033] hover:text-[#D83A6F] disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTrending(idx, 'down')}
                          disabled={idx === trendingIds.length - 1}
                          className="p-1 rounded text-[#5C4033] hover:text-[#D83A6F] disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleTrending(id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer ml-1"
                          title="Remove from trending"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* All Catalogue Products */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#2A1810]">
              Bakery Product Catalogue ({products.length} Products)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {products.map((prod) => {
                const isSelected = trendingIds.includes(prod.id) || trendingIds.includes(prod.slug);
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleToggleTrending(prod.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#FFF0F4] border-[#D83A6F] shadow-2xs'
                        : 'bg-white border-[#F3DFE5] hover:border-[#D83A6F]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-[#F3DFE5]">
                        <ImageWithFallback
                          src={prod.images?.[0] || ''}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-[#2A1810] block truncate">
                          {prod.name}
                        </span>
                        <span className="text-[10px] text-[#9E8A85]">
                          From ₹{prod.price} • {prod.category}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-[#D83A6F] text-white' : 'bg-gray-100 text-[#5C4033]'
                    }`}>
                      {isSelected ? 'Included' : '+ Add'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
