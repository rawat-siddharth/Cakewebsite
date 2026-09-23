import React, { useEffect, useState, useRef } from 'react';
import {
  Settings,
  Store,
  Phone,
  Instagram,
  MapPin,
  Megaphone,
  Sparkles,
  Save,
  Upload,
  CheckCircle2,
  Database,
  Key,
  Globe
} from 'lucide-react';
import {
  getWebsiteSettings,
  saveWebsiteSettings,
  uploadProductImage,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  updateSupabaseCredentials,
  isSupabaseConfigured
} from '../../lib/supabase';
import { DatabaseWebsiteSettings } from '../../types/supabase';
import { useStore } from '../../context/StoreContext';

export function AdminSettings() {
  const [settings, setSettings] = useState<DatabaseWebsiteSettings>({
    id: 'default',
    brand_name: 'Cake N Crave',
    whatsapp_number: '7976541365',
    instagram_handle: 'cakencrave_jaipur',
    business_location: 'Jaipur, Rajasthan, India',
    announcement_text: '100% Pure Eggless Pâtisserie · Baked Fresh Daily in Jaipur · WhatsApp: 7976541365',
    hero_heading: 'Pure Eggless, Crafted for Wonder.',
    hero_description: 'Jaipur’s boutique patisserie specializing in 100% eggless vintage tiered cakes, delicate bento treats, and luxury chocolate bouquets.',
    hero_image: '/src/assets/images/luxury_patisserie_hero_1790175262764.jpg',
  });

  const [supabaseUrlInput, setSupabaseUrlInput] = useState(SUPABASE_URL || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(SUPABASE_ANON_KEY || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refreshStoreData } = useStore();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await getWebsiteSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load website settings', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Save credentials if modified
      if (supabaseUrlInput !== SUPABASE_URL || supabaseKeyInput !== SUPABASE_ANON_KEY) {
        updateSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
      }

      await saveWebsiteSettings(settings);
      await refreshStoreData();
      showToast('Website settings saved & updated live!');
    } catch (err) {
      showToast('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      const url = await uploadProductImage(file);
      setSettings((prev) => ({ ...prev, hero_image: url }));
      showToast('Hero banner image updated!');
    } catch (err) {
      showToast('Failed to upload hero image');
    } finally {
      setUploadingHero(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isConfigured = isSupabaseConfigured();

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#2A1810]/60">
        <Sparkles className="w-6 h-6 text-[#D83A6F] animate-spin mx-auto mb-2" />
        Loading website configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2A1810] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-5 border-b border-[#F3DFE5]">
        <span className="text-xs uppercase tracking-widest text-[#D83A6F] font-bold block mb-1">
          Store Identity &amp; Content
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#2A1810]">
          Website Settings
        </h1>
        <p className="mt-1 text-xs text-[#2A1810]/65">
          Customize brand name, WhatsApp order hotline, Instagram link, and homepage hero banner.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Brand & Contact Section */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-5">
          <h2 className="font-serif text-xl font-bold text-[#2A1810] flex items-center gap-2">
            <Store className="w-5 h-5 text-[#D83A6F]" />
            <span>Brand Information &amp; Hotlines</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                Brand Name
              </label>
              <input
                type="text"
                required
                value={settings.brand_name}
                onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>WhatsApp Order Number (10 digits)</span>
              </label>
              <input
                type="text"
                required
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="7976541365"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
              />
              <p className="mt-1 text-[11px] text-[#2A1810]/50">
                Orders from the shopping bag are sent directly to this number.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>Instagram Handle (without @)</span>
              </label>
              <input
                type="text"
                value={settings.instagram_handle}
                onChange={(e) => setSettings({ ...settings, instagram_handle: e.target.value.replace('@', '') })}
                placeholder="cakencrave_jaipur"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>Business Location</span>
              </label>
              <input
                type="text"
                value={settings.business_location}
                onChange={(e) => setSettings({ ...settings, business_location: e.target.value })}
                placeholder="Jaipur, Rajasthan, India"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-[#D83A6F]" />
              <span>Announcement Ribbon Text</span>
            </label>
            <input
              type="text"
              value={settings.announcement_text}
              onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
            />
          </div>
        </div>

        {/* Homepage Hero Showcase */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-5">
          <h2 className="font-serif text-xl font-bold text-[#2A1810] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D83A6F]" />
            <span>Homepage Hero Section</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#2A1810] mb-1">
              Hero Heading
            </label>
            <input
              type="text"
              value={settings.hero_heading}
              onChange={(e) => setSettings({ ...settings, hero_heading: e.target.value })}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A1810] mb-1">
              Hero Tagline / Description
            </label>
            <textarea
              rows={3}
              value={settings.hero_description}
              onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A1810] mb-2">
              Hero Featured Visual / Banner
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-32 h-20 rounded-2xl overflow-hidden bg-[#FFF5F7] border border-[#F3DFE5] shrink-0">
                <img
                  src={settings.hero_image || '/src/assets/images/luxury_patisserie_hero_1790175262764.jpg'}
                  alt="Hero Banner"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingHero}
                  className="px-4 py-2 bg-[#FFF0F4] hover:bg-[#FCEEF2] text-[#D83A6F] border border-[#F3DFE5] rounded-2xl text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingHero ? 'Uploading...' : 'Replace Hero Visual'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageUpload}
                  className="hidden"
                />
                <p className="mt-1 text-[11px] text-[#2A1810]/50">
                  Recommended: High-resolution horizontal boutique cake photo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase Connection Setup Box */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#2A1810] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#D83A6F]" />
              <span>Supabase Cloud Integration</span>
            </h2>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isConfigured ? 'Connected' : 'Local Fallback'}
            </span>
          </div>

          <p className="text-xs text-[#2A1810]/65 leading-relaxed">
            Enter your project details to connect directly to your Supabase PostgreSQL instance. You can find these in your Supabase Dashboard under <strong>Project Settings &rarr; API</strong>.
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>Project URL (e.g. https://xyzcompany.supabase.co)</span>
              </label>
              <input
                type="text"
                value={supabaseUrlInput}
                onChange={(e) => setSupabaseUrlInput(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-4 py-2.5 text-xs font-mono bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>Public Anon Key (Safe for frontend)</span>
              </label>
              <input
                type="password"
                value={supabaseKeyInput}
                onChange={(e) => setSupabaseKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2.5 text-xs font-mono bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
              />
              <p className="mt-1 text-[11px] text-emerald-700 font-medium">
                &#x2713; Only the public anon key is stored. Service role keys are never requested or exposed.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Website Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
