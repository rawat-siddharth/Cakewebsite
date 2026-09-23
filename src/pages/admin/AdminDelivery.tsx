import React, { useEffect, useState } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  Calendar,
  IndianRupee,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { getDeliverySettings, saveDeliverySettings } from '../../lib/supabase';
import { DatabaseDeliverySettings } from '../../types/supabase';

export function AdminDelivery() {
  const [settings, setSettings] = useState<DatabaseDeliverySettings>({
    id: 'default',
    city: 'Jaipur',
    delivery_fee: 0,
    min_order_amount: 0,
    advance_hours: 24,
    available_slots: [
      'Morning (10:00 AM - 1:00 PM)',
      'Afternoon (1:00 PM - 5:00 PM)',
      'Evening (5:00 PM - 9:00 PM)',
    ],
    blocked_dates: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newSlotInput, setNewSlotInput] = useState('');
  const [newBlockedDateInput, setNewBlockedDateInput] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await getDeliverySettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load delivery settings', err);
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
      await saveDeliverySettings(settings);
      showToast('Delivery settings saved to database!');
    } catch (err) {
      showToast('Failed to save delivery settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSlot = () => {
    if (!newSlotInput.trim()) return;
    setSettings((prev) => ({
      ...prev,
      available_slots: [...prev.available_slots, newSlotInput.trim()],
    }));
    setNewSlotInput('');
  };

  const handleRemoveSlot = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      available_slots: prev.available_slots.filter((_, i) => i !== index),
    }));
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDateInput) return;
    if (settings.blocked_dates.includes(newBlockedDateInput)) return;
    setSettings((prev) => ({
      ...prev,
      blocked_dates: [...prev.blocked_dates, newBlockedDateInput],
    }));
    setNewBlockedDateInput('');
  };

  const handleRemoveBlockedDate = (date: string) => {
    setSettings((prev) => ({
      ...prev,
      blocked_dates: prev.blocked_dates.filter((d) => d !== date),
    }));
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#2A1810]/60">
        <Sparkles className="w-6 h-6 text-[#D83A6F] animate-spin mx-auto mb-2" />
        Loading delivery configuration...
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
          Logistics &amp; Scheduling
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#2A1810]">
          Delivery Settings
        </h1>
        <p className="mt-1 text-xs text-[#2A1810]/65">
          Configure delivery radius in Jaipur, slot timings, minimum orders, and blacked-out holidays.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Core Parameters Box */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-6">
          <h2 className="font-serif text-xl font-bold text-[#2A1810] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#D83A6F]" />
            <span>Delivery Fees &amp; Thresholds</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>Primary Delivery City</span>
              </label>
              <input
                type="text"
                required
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
              />
              <p className="mt-1 text-[11px] text-[#2A1810]/50">
                Default: Jaipur, Rajasthan
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>Standard Delivery Fee (₹)</span>
              </label>
              <input
                type="number"
                min="0"
                value={settings.delivery_fee}
                onChange={(e) => setSettings({ ...settings, delivery_fee: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
              />
              <p className="mt-1 text-[11px] text-[#2A1810]/50">
                Set to 0 for Complimentary Delivery
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>Minimum Order Amount (₹)</span>
              </label>
              <input
                type="number"
                min="0"
                value={settings.min_order_amount}
                onChange={(e) => setSettings({ ...settings, min_order_amount: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1810] mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D83A6F]" />
                <span>Minimum Advance Notice (Hours)</span>
              </label>
              <input
                type="number"
                min="1"
                value={settings.advance_hours}
                onChange={(e) => setSettings({ ...settings, advance_hours: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
              />
              <p className="mt-1 text-[11px] text-[#2A1810]/50">
                Standard: 24 hours for artisan baking
              </p>
            </div>
          </div>
        </div>

        {/* Time Slots Box */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2A1810] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D83A6F]" />
              <span>Available Delivery Time Slots</span>
            </h2>
            <p className="text-xs text-[#2A1810]/60 mt-0.5">
              Customers can pick their preferred window during checkout.
            </p>
          </div>

          <div className="space-y-2">
            {settings.available_slots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFDFB] border border-[#F3DFE5] text-xs"
              >
                <span className="font-medium text-[#2A1810]">{slot}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(index)}
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="e.g. Late Night Surprise (10:30 PM - 12:00 AM)"
              value={newSlotInput}
              onChange={(e) => setNewSlotInput(e.target.value)}
              className="flex-1 px-4 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
            />
            <button
              type="button"
              onClick={handleAddSlot}
              className="px-4 py-2 bg-[#FFF0F4] hover:bg-[#FCEEF2] text-[#D83A6F] border border-[#F3DFE5] rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Slot</span>
            </button>
          </div>
        </div>

        {/* Blocked Dates Box */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#F3DFE5] shadow-xs space-y-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2A1810] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#D83A6F]" />
              <span>Blocked Dates / Kitchen Closed</span>
            </h2>
            <p className="text-xs text-[#2A1810]/60 mt-0.5">
              Prevent orders on festival days or kitchen holidays.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.blocked_dates.length === 0 ? (
              <p className="text-xs text-[#2A1810]/50 italic">
                No dates are currently blocked. Orders accepted all days!
              </p>
            ) : (
              settings.blocked_dates.map((date) => (
                <span
                  key={date}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold"
                >
                  <span>{date}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlockedDate(date)}
                    className="hover:text-rose-950 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="date"
              value={newBlockedDateInput}
              onChange={(e) => setNewBlockedDateInput(e.target.value)}
              className="px-4 py-2 text-xs bg-[#FFFDFB] border border-[#F3DFE5] rounded-2xl text-[#2A1810] focus:outline-hidden focus:border-[#D83A6F]"
            />
            <button
              type="button"
              onClick={handleAddBlockedDate}
              className="px-4 py-2 bg-[#FFF0F4] hover:bg-[#FCEEF2] text-[#D83A6F] border border-[#F3DFE5] rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Block Date</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 bg-[#D83A6F] hover:bg-[#C42B5E] text-white text-xs font-semibold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Delivery Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
