import React, { useEffect, useState, useRef } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { getCategories, saveCategory, deleteCategory, uploadProductImage } from '../../lib/supabase';
import { DatabaseCategory } from '../../types/supabase';
import { ImageWithFallback } from '../../components/ImageWithFallback';

export function AdminCategories() {
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
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

  useEffect(() => {
    loadCategories();
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
            Taxonomy &amp; Collections
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2A1810]">
            Category Management
          </h1>
          <p className="mt-1 text-xs text-[#2A1810]/65">
            Manage navigation tabs, Shop by Category sections, and collection banners.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
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
                    title="Edit Category"
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

      {/* Category Modal */}
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
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. bento-cakes"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
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
                  placeholder="Brief description for category card..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Display Order Position
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.display_order}
                  onChange={(e) => setFormData((prev) => ({ ...prev, display_order: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Category Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#FFF5F7] border border-[#F3DFE5] shrink-0">
                    <img
                      src={formData.image}
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-3.5 py-2 bg-[#FFF0F4] hover:bg-[#FDE8EE] text-[#D83A6F] border border-[#F3DFE5] rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Replace Image'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Publish Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2A1810] pt-1">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
                  className="rounded text-[#D83A6F] focus:ring-[#D83A6F]"
                />
                <span>Published on storefront</span>
              </label>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F3DFE5]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#2A1810]/70 hover:bg-[#FFF0F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
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
