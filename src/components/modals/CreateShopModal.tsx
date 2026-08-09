'use client';

import React, { useEffect, useState } from 'react';
import { X, Store, PackagePlus, CheckCircle, ImagePlus, Film, Loader2, AlertCircle, Trash2, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/modals/AuthModal';
import PayRegistrationFeeButton from '@/components/PayRegistrationFeeButton';

interface CreateShopModalProps {
  category: { id: string; title: string };
  onClose: () => void;
}

interface MediaFile {
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
}

interface ExistingShop {
  id: string;
  business_name: string;
}

const MAX_FILES = 6;
const MAX_FILE_SIZE_MB = 25;

// Launch price — currently ₦1,000. Kept here for display text only; the
// actual charge amount lives in PayRegistrationFeeButton.tsx. Raise to
// ₦2,000 later by updating BOTH this value, the one in that component, AND
// EXPECTED_AMOUNT_KOBO in supabase/functions/verify-shop-payment/index.ts.
const REGISTRATION_FEE = 1000;

const emptyProductFields = {
  productName: '',
  description: '',
  price: '',
  priceType: 'fixed' as 'fixed' | 'starting_from' | 'negotiable',
  isNegotiable: false
};

// Shared glass treatment for text inputs/textareas/selects — frosted,
// translucent, brightens gently on focus. One class string, reused
// everywhere so every field in the modal feels identical.
const glassInput =
  'w-full px-3 py-2 bg-white/[0.07] backdrop-blur-sm border border-white/15 rounded-xl text-white text-sm ' +
  'placeholder:text-stone-400 focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.1] transition-colors';

const glassLabel = 'block text-xs text-stone-400 mb-1.5';

// The 3 real steps a fresh registration moves through — used only to
// orient someone, not decoration. "already-exists" and "checking" aren't
// part of the sequence, so the indicator simply doesn't render for those.
const STEP_SEQUENCE: Array<'business' | 'product' | 'payment-pending'> = ['business', 'product', 'payment-pending'];

const StepDots: React.FC<{ current: string }> = ({ current }) => {
  const index = STEP_SEQUENCE.indexOf(current as (typeof STEP_SEQUENCE)[number]);
  if (index === -1) return null;
  return (
    <div className="flex items-center gap-1.5 px-6 pb-4">
      <style>{`
        @keyframes dotGlowPulse {
          0%, 100% {
            box-shadow: 0 0 4px 0 rgba(251, 191, 36, 0.5);
            opacity: 1;
          }
          50% {
            box-shadow: 0 0 10px 2px rgba(251, 191, 36, 0.85);
            opacity: 0.85;
          }
        }
        .dot-alive {
          animation: dotGlowPulse 1.8s ease-in-out infinite;
        }
      `}</style>
      {STEP_SEQUENCE.map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === index
              ? 'w-7 bg-amber-400 dot-alive'
              : i < index
              ? 'w-1.5 bg-amber-400/60'
              : 'w-1.5 bg-white/15'
          }`}
        />
      ))}
    </div>
  );
};

export const CreateShopModal: React.FC<CreateShopModalProps> = ({ category, onClose }) => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 'checking' -> looking up whether this user already has a shop in this category
  // 'business' -> business info form (only path for creating a brand-new shop)
  // 'product'  -> product form (only reached right after creating a brand-new shop)
  // 'payment-pending' -> shop + product saved; show registration fee payment details
  // 'already-exists' -> user already has a shop here; direct them to "My Shops" instead
  const [step, setStep] = useState<'checking' | 'business' | 'product' | 'payment-pending' | 'success' | 'already-exists'>(
    'checking'
  );
  const [existingShop, setExistingShop] = useState<ExistingShop | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [businessData, setBusinessData] = useState({
    businessName: '',
    phone: '',
    address: '',
    bankName: '',
    accountNumber: '',
    accountName: ''
  });
  const [productData, setProductData] = useState(emptyProductFields);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  // On open, check whether this user already has a shop in this category.
  useEffect(() => {
    if (!user) {
      return; // the sign-in gate in the JSX below handles this case directly
    }

    let cancelled = false;

    const checkExistingShop = async () => {
      // A hard ceiling on how long we'll wait — if the request stalls for
      // any reason (a stuck session-refresh lock, a dropped connection,
      // anything) the person sees a real error and a way forward, instead
      // of a spinner that never resolves.
      const queryPromise = supabase
        .from('shops')
        .select('id, business_name')
        .eq('owner_id', user.id)
        .eq('category_id', category.id)
        .maybeSingle();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 10000)
      );

      let data, error;
      try {
        ({ data, error } = await Promise.race([queryPromise, timeoutPromise]));
      } catch {
        if (cancelled) return;
        setCheckError('This is taking longer than expected. Please close this and try again.');
        setStep('business');
        return;
      }

      if (cancelled) return;

      if (error) {
        setCheckError('Could not check for an existing shop. Please try again.');
        setStep('business');
        return;
      }
      if (data) {
        setExistingShop(data);
        setStep('already-exists');
      } else {
        setExistingShop(null);
        setStep('business');
      }
    };

    checkExistingShop();

    return () => {
      cancelled = true;
    };
  }, [user?.id, category.id]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setErrorMsg(null);

    if (mediaFiles.length + files.length > MAX_FILES) {
      setErrorMsg(`You can upload up to ${MAX_FILES} files total.`);
      return;
    }

    const accepted: MediaFile[] = [];
    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        setErrorMsg('Only image and video files are allowed.');
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setErrorMsg(`"${file.name}" is over ${MAX_FILE_SIZE_MB}MB. Please choose a smaller file.`);
        continue;
      }
      accepted.push({
        file,
        previewUrl: URL.createObjectURL(file),
        type: isImage ? 'image' : 'video'
      });
    }

    setMediaFiles((prev) => [...prev, ...accepted]);
    e.target.value = '';
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  const goToProductStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('product');
  };

  const uploadMediaForProduct = async (productId: string) => {
    for (let i = 0; i < mediaFiles.length; i++) {
      const { file, type } = mediaFiles[i];
      const fileExt = file.name.split('.').pop();
      const filePath = `${productId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('product-media').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('product-media').getPublicUrl(filePath);

      const { error: mediaError } = await supabase.from('product_media').insert({
        product_id: productId,
        media_type: type,
        file_url: publicUrlData.publicUrl,
        sort_order: i
      });
      if (mediaError) throw mediaError;
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (!user) throw new Error('You must be signed in to continue.');

      let shopId = existingShop?.id;

      // Only create the shop the first time — every later visit reuses it.
      if (!shopId) {
        const { data: shop, error: shopError } = await supabase
          .from('shops')
          .insert({
            business_name: businessData.businessName,
            phone: businessData.phone,
            address: businessData.address || null,
            bank_name: businessData.bankName,
            account_number: businessData.accountNumber,
            account_name: businessData.accountName,
            category_id: category.id,
            category_title: category.title,
            owner_id: user.id
          })
          .select()
          .single();

        if (shopError) throw shopError;
        shopId = shop.id;
        setExistingShop({ id: shop.id, business_name: shop.business_name });
      }

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          shop_id: shopId,
          title: productData.productName,
          description: productData.description || null,
          price: productData.price ? Number(productData.price) : null,
          price_type: productData.priceType,
          is_negotiable: productData.isNegotiable
        })
        .select()
        .single();

      if (productError) throw productError;

      await uploadMediaForProduct(product.id);

      setStep('payment-pending');
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong while saving. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-md p-4">
      <div className="relative bg-stone-800/60 backdrop-blur-2xl border border-amber-500/15 rounded-[28px] w-full max-w-lg overflow-hidden shadow-2xl shadow-black/40 max-h-[90vh] overflow-y-auto">
        {/* subtle ambient glow, purely decorative, sits behind everything */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/15 sticky top-0 bg-stone-800/70 backdrop-blur-2xl z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 flex-shrink-0">
              <Store className="w-4 h-4 text-amber-400" />
            </div>
            {existingShop ? (
              <span className="text-white font-bold text-base">{existingShop.business_name}</span>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5 leading-tight">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-400/90 font-bold">
                  Register Shop<span className="hidden sm:inline">:</span>
                </span>
                <span className="text-white font-bold text-base">{category.title}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <StepDots current={step} />

        <div className="relative px-6 pb-6">
          {!user && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                <LogIn className="w-7 h-7 text-stone-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Sign in to register your shop</h3>
              <p className="text-xs text-stone-400 mb-5">
                Create a free account so you can manage and edit your shop later.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-semibold transition-colors"
              >
                Sign In / Sign Up
              </button>
              {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
            </div>
          )}

          {user && step === 'checking' && (
            <div className="text-center py-10">
              <Loader2 className="w-8 h-8 text-amber-400 mx-auto mb-3 animate-spin" />
              <p className="text-xs text-stone-400">Checking your shop details...</p>
            </div>
          )}

          {user && step !== 'checking' && checkError && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{checkError}</span>
            </div>
          )}

          {user && errorMsg && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {user && step === 'already-exists' && existingShop && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                <Store className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">You already have a shop here</h3>
              <p className="text-xs text-stone-400 mb-6">
                <span className="text-white font-medium">{existingShop.business_name}</span> is already registered in{' '}
                {category.title}. Add more products to it from <span className="text-amber-400">My Shops</span> in
                the header instead.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 text-white text-sm font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          )}

          {user && step === 'business' && (
            <form onSubmit={goToProductStep} className="space-y-4">
              <p className="text-xs text-stone-400 -mt-1">
                You'll only need to enter this once — after today, adding products for this shop skips straight past this step.
              </p>
              <div>
                <label className={glassLabel}>Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Prime Tech World"
                  value={businessData.businessName}
                  onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                  className={glassInput}
                />
              </div>
              <div>
                <label className={glassLabel}>WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g., 08012345678"
                  value={businessData.phone}
                  onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                  className={glassInput}
                />
              </div>
              <div>
                <label className={glassLabel}>Address (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Ogui Road, Enugu"
                  value={businessData.address}
                  onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                  className={glassInput}
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-amber-400 font-semibold mb-1">Payment Details</p>
                <p className="text-[11px] text-stone-500 mb-3">
                  This gets included automatically when a buyer messages you on WhatsApp to order, so you don't have to type it out every time.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className={glassLabel}>Bank Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., GTBank"
                      value={businessData.bankName}
                      onChange={(e) => setBusinessData({ ...businessData, bankName: e.target.value })}
                      className={glassInput}
                    />
                  </div>
                  <div>
                    <label className={glassLabel}>Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 0123456789"
                      value={businessData.accountNumber}
                      onChange={(e) => setBusinessData({ ...businessData, accountNumber: e.target.value })}
                      className={glassInput}
                    />
                  </div>
                  <div>
                    <label className={glassLabel}>Account Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Ikenna Kingsley Nwachukwu"
                      value={businessData.accountName}
                      onChange={(e) => setBusinessData({ ...businessData, accountName: e.target.value })}
                      className={glassInput}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
              >
                Continue to Add Product
              </button>
            </form>
          )}

          {user && step === 'product' && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-amber-400 mb-1">
                <PackagePlus className="w-4 h-4" />
                <span>{existingShop ? `Add a Product to ${existingShop.business_name}` : 'Add Your First Product or Service'}</span>
              </div>
              <div>
                <label className={glassLabel}>Product / Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., iPhone 13 Pro 128GB"
                  value={productData.productName}
                  onChange={(e) => setProductData({ ...productData, productName: e.target.value })}
                  className={glassInput}
                />
              </div>
              <div>
                <label className={glassLabel}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the product or service..."
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                  className={`${glassInput} resize-none`}
                />
              </div>
              <div>
                <label className={glassLabel}>Pricing</label>
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  {(
                    [
                      { value: 'fixed', label: 'Fixed Price' },
                      { value: 'starting_from', label: 'Starting From' }
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProductData({ ...productData, priceType: opt.value })}
                      className={`py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                        productData.priceType === opt.value
                          ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-stone-950 shadow-md'
                          : 'bg-white/[0.07] backdrop-blur-sm border border-white/15 text-stone-300 hover:bg-white/[0.1]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  required
                  placeholder={productData.priceType === 'starting_from' ? 'e.g., 20000' : 'e.g., 450000'}
                  value={productData.price}
                  onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                  className={glassInput}
                />
                <label className="flex items-center gap-2 mt-2.5 text-xs text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productData.isNegotiable}
                    onChange={(e) => setProductData({ ...productData, isNegotiable: e.target.checked })}
                    className="w-3.5 h-3.5 rounded accent-amber-400"
                  />
                  <span>Also open to negotiation</span>
                </label>
                {productData.isNegotiable && (
                  <p className="text-[11px] text-stone-500 mt-1.5">
                    Buyers will see your price with "(Negotiable)" next to it — a real starting point, not a blank invitation.
                  </p>
                )}
              </div>

              <div>
                <label className={glassLabel}>
                  Photos / Videos ({mediaFiles.length}/{MAX_FILES})
                </label>
                <label className="flex items-center justify-center gap-2 w-full px-3 py-4 bg-white/[0.06] backdrop-blur-sm border border-dashed border-white/20 rounded-xl text-stone-400 text-xs cursor-pointer hover:border-amber-400/40 hover:text-amber-400 transition-colors">
                  <ImagePlus className="w-4 h-4" />
                  <span>Click to add images or videos</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFilesSelected}
                    className="hidden"
                  />
                </label>

                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {mediaFiles.map((m, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-white/[0.06] border border-white/15">
                        {m.type === 'image' ? (
                          <img src={m.previewUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-6 h-6 text-stone-500" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMediaFile(idx)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-black/70 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-stone-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? 'Saving...' : existingShop ? 'Add Product' : 'Complete Shop Setup'}</span>
              </button>
            </form>
          )}

          {user && step === 'payment-pending' && existingShop && (
            <div className="py-2">
              <div className="text-center mb-5">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Shop & Product Saved!</h3>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  One last step: pay the one-time ₦{REGISTRATION_FEE.toLocaleString()} registration fee to go live.
                  Your shop won't appear in Browse until payment is confirmed — this happens automatically,
                  usually within seconds.
                </p>
              </div>

              <PayRegistrationFeeButton
                shopId={existingShop.id}
                businessName={existingShop.business_name}
                userEmail={user.email ?? ''}
                onSuccess={() => setStep('success')}
              />

              <button
                onClick={onClose}
                className="w-full py-2 mt-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 text-white text-sm font-medium transition-colors"
              >
                Pay Later
              </button>
            </div>
          )}

          {user && step === 'success' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">You're Live!</h3>
              <p className="text-xs text-stone-400 mb-6">
                Payment confirmed — {existingShop?.business_name ?? 'your shop'} is now visible to buyers browsing
                {' '}{category.title}.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 text-white text-sm font-medium transition-colors"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateShopModal;