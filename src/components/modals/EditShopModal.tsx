'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Store, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import {
  glassOverlay,
  glassCard,
  glassGlow,
  glassHeader,
  glassIconChip,
  glassIconChipLarge,
  glassCloseButton,
  glassInput,
  glassLabel,
  glassButtonPrimary,
  glassButtonSecondary,
  glassErrorBox
} from '@/styles/glassModal';

interface EditShopModalProps {
  shop: {
    id: string;
    business_name: string;
    phone: string;
    address: string | null;
    bank_name: string | null;
    account_number: string | null;
    account_name: string | null;
  };
  onClose: () => void;
  onSaved: (updated: {
    business_name: string;
    phone: string;
    address: string | null;
    bank_name: string | null;
    account_number: string | null;
    account_name: string | null;
  }) => void;
}

export const EditShopModal: React.FC<EditShopModalProps> = ({ shop, onClose, onSaved }) => {
  const [form, setForm] = useState({
    businessName: shop.business_name,
    phone: shop.phone,
    address: shop.address ?? '',
    bankName: shop.bank_name ?? '',
    accountNumber: shop.account_number ?? '',
    accountName: shop.account_name ?? ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const updated = {
        business_name: form.businessName,
        phone: form.phone,
        address: form.address || null,
        bank_name: form.bankName || null,
        account_number: form.accountNumber || null,
        account_name: form.accountName || null
      };

      const { error } = await supabase.from('shops').update(updated).eq('id', shop.id);
      if (error) throw error;

      setSuccess(true);
      onSaved(updated);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Could not save your changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className={glassOverlay}>
      <div className={`${glassCard} w-full max-w-md max-h-[90vh] overflow-y-auto`}>
        <div className={glassGlow} />

        <div className={glassHeader}>
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className={glassIconChip}>
              <Store className="w-4 h-4 text-amber-400" />
            </div>
            <span>Edit Shop Details</span>
          </div>
          <button onClick={onClose} className={glassCloseButton}>
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="relative p-6">
          {success ? (
            <div className="text-center py-6">
              <div className={glassIconChipLarge('emerald')}>
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Details Updated!</h3>
              <p className="text-xs text-stone-400 mb-6">Your shop's information is now up to date.</p>
              <button onClick={onClose} className={glassButtonSecondary}>
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className={glassErrorBox}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className={glassLabel}>Business Name</label>
                <input
                  type="text"
                  required
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className={glassInput}
                />
              </div>
              <div>
                <label className={glassLabel}>WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={glassInput}
                />
              </div>
              <div>
                <label className={glassLabel}>Address (optional)</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={glassInput}
                />
              </div>

              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-amber-400 font-semibold mb-3">Payment Details</p>
                <div className="space-y-3">
                  <div>
                    <label className={glassLabel}>Bank Name</label>
                    <input
                      type="text"
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      className={glassInput}
                    />
                  </div>
                  <div>
                    <label className={glassLabel}>Account Number</label>
                    <input
                      type="text"
                      value={form.accountNumber}
                      onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                      className={glassInput}
                    />
                  </div>
                  <div>
                    <label className={glassLabel}>Account Name</label>
                    <input
                      type="text"
                      value={form.accountName}
                      onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                      className={glassInput}
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-stone-500">
                Note: your category can't be changed here — message us on WhatsApp if you registered under the wrong one.
              </p>

              <button type="submit" disabled={submitting} className={glassButtonPrimary}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditShopModal;
