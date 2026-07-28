'use client';

import React, { useEffect, useState } from 'react';
import { X, Store, PackagePlus, CheckCircle, ImagePlus, Film, Loader2, AlertCircle, Trash2, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/modals/AuthModal';

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

const emptyProductFields = {
  productName: '',
  description: '',
  price: ''
};

export const CreateShopModal: React.FC<CreateShopModalProps> = ({ category, onClose }) => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 'checking' -> looking up whether this user already has a shop in this category
  // 'business' -> business info form (only path for creating a brand-new shop)
  // 'product'  -> product form (only reached right after creating a brand-new shop)
  // 'success'  -> confirmation screen
  // 'already-exists' -> user already has a shop here; direct them to "My Shops" instead
  const [step, setStep] = useState<'checking' | 'business' | 'product' | 'success' | 'already-exists'>('checking');
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
      setStep('checking');
      setCheckError(null);

      const { data, error } = await supabase
        .from('shops')
        .select('id, business_name')
        .eq('owner_id', user.id)
        .eq('category_id', category.id)
        .maybeSingle();

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
  }, [user, category.id]);

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
          price: productData.price ? Number(productData.price) : null
        })
        .select()
        .single();

      if (productError) throw productError;

      await uploadMediaForProduct(product.id);

      setStep('success');
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong while saving. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const addAnotherProduct = () => {
    setProductData(emptyProductFields);
    setMediaFiles([]);
    setErrorMsg(null);
    setStep('product');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Store className="w-5 h-5 text-emerald-400" />
            <span>{existingShop ? existingShop.business_name : `Register Shop: ${category.title}`}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!user && (
            <div className="text-center py-8">
              <LogIn className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Sign in to register your shop</h3>
              <p className="text-xs text-slate-400 mb-5">
                Create a free account so you can manage and edit your shop later.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold"
              >
                Sign In / Sign Up
              </button>
              {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
            </div>
          )}

          {user && step === 'checking' && (
            <div className="text-center py-10">
              <Loader2 className="w-8 h-8 text-emerald-400 mx-auto mb-3 animate-spin" />
              <p className="text-xs text-slate-400">Checking your shop details...</p>
            </div>
          )}

          {user && step !== 'checking' && checkError && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{checkError}</span>
            </div>
          )}

          {user && errorMsg && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {user && step === 'already-exists' && existingShop && (
            <div className="text-center py-8">
              <Store className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">You already have a shop here</h3>
              <p className="text-xs text-slate-400 mb-6">
                <span className="text-white font-medium">{existingShop.business_name}</span> is already registered in{' '}
                {category.title}. Add more products to it from <span className="text-emerald-400">My Shops</span> in
                the header instead.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium"
              >
                Got it
              </button>
            </div>
          )}

          {user && step === 'business' && (
            <form onSubmit={goToProductStep} className="space-y-4">
              <p className="text-xs text-slate-400 mb-1">
                You'll only need to enter this once — after today, adding products for this shop skips straight past this step.
              </p>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Prime Tech World"
                  value={businessData.businessName}
                  onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g., 08012345678"
                  value={businessData.phone}
                  onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Address (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Ogui Road, Enugu"
                  value={businessData.address}
                  onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-xs text-emerald-400 font-semibold mb-3">Payment Details</p>
                <p className="text-[11px] text-slate-500 mb-3">
                  This gets included automatically when a buyer messages you on WhatsApp to order, so you don't have to type it out every time.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Bank Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., GTBank"
                      value={businessData.bankName}
                      onChange={(e) => setBusinessData({ ...businessData, bankName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 0123456789"
                      value={businessData.accountNumber}
                      onChange={(e) => setBusinessData({ ...businessData, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Account Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Ikenna Kingsley Nwachukwu"
                      value={businessData.accountName}
                      onChange={(e) => setBusinessData({ ...businessData, accountName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
              >
                Continue to Add Product
              </button>
            </form>
          )}

          {user && step === 'product' && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-emerald-400 mb-2">
                <PackagePlus className="w-4 h-4" />
                <span>{existingShop ? `Add a Product to ${existingShop.business_name}` : 'Add Your First Product or Service'}</span>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Product / Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., iPhone 13 Pro 128GB"
                  value={productData.productName}
                  onChange={(e) => setProductData({ ...productData, productName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the product or service..."
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Price (₦) — leave blank for services on request</label>
                <input
                  type="number"
                  placeholder="e.g., 450000"
                  value={productData.price}
                  onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Photos / Videos ({mediaFiles.length}/{MAX_FILES})
                </label>
                <label className="flex items-center justify-center gap-2 w-full px-3 py-4 bg-slate-950 border border-dashed border-slate-700 rounded-lg text-slate-400 text-xs cursor-pointer hover:border-emerald-500 hover:text-emerald-400 transition-colors">
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
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                        {m.type === 'image' ? (
                          <img src={m.previewUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-6 h-6 text-slate-500" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMediaFile(idx)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? 'Saving...' : existingShop ? 'Add Product' : 'Complete Shop Setup'}</span>
              </button>
            </form>
          )}

          {user && step === 'success' && (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Product Added!</h3>
              <p className="text-xs text-slate-400 mb-6">
                It's now live under {existingShop?.business_name ?? 'your shop'}.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={addAnotherProduct}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold"
                >
                  Add Another Product
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateShopModal;