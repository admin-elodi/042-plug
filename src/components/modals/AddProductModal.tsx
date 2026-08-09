'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, PackagePlus, CheckCircle, ImagePlus, Film, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import {
  glassOverlay,
  glassCard,
  glassGlow,
  glassHeaderSticky,
  glassIconChip,
  glassIconChipLarge,
  glassCloseButton,
  glassInput,
  glassLabel,
  glassButtonPrimary,
  glassButtonSecondary,
  glassErrorBox,
  glassDashedUpload,
  glassMediaThumb
} from '@/styles/glassModal';

interface AddProductModalProps {
  shopId: string;
  businessName: string;
  onClose: () => void;
  onProductAdded: () => void;
}

interface MediaFile {
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
}

const MAX_FILES = 6;
const MAX_FILE_SIZE_MB = 25;

export const AddProductModal: React.FC<AddProductModalProps> = ({ shopId, businessName, onClose, onProductAdded }) => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          shop_id: shopId,
          title: productName,
          description: description || null,
          price: price ? Number(price) : null
        })
        .select()
        .single();

      if (productError) throw productError;

      for (let i = 0; i < mediaFiles.length; i++) {
        const { file, type } = mediaFiles[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `${product.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('product-media').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('product-media').getPublicUrl(filePath);

        const { error: mediaError } = await supabase.from('product_media').insert({
          product_id: product.id,
          media_type: type,
          file_url: publicUrlData.publicUrl,
          sort_order: i
        });
        if (mediaError) throw mediaError;
      }

      setSuccess(true);
      onProductAdded();
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong while saving. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className={glassOverlay}>
      <div className={`${glassCard} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
        <div className={glassGlow} />

        <div className={glassHeaderSticky}>
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className={glassIconChip}>
              <PackagePlus className="w-4 h-4 text-amber-400" />
            </div>
            <span>Add Product to {businessName}</span>
          </div>
          <button onClick={onClose} className={glassCloseButton}>
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="relative p-6">
          {errorMsg && (
            <div className={`mb-4 ${glassErrorBox}`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={glassLabel}>Product / Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., iPhone 13 Pro 128GB"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className={glassInput}
                />
              </div>
              <div>
                <label className={glassLabel}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the product or service..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${glassInput} resize-none`}
                />
              </div>
              <div>
                <label className={glassLabel}>Price (₦) — leave blank for services on request</label>
                <input
                  type="number"
                  placeholder="e.g., 450000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={glassInput}
                />
              </div>

              <div>
                <label className={glassLabel}>
                  Photos / Videos ({mediaFiles.length}/{MAX_FILES})
                </label>
                <label className={glassDashedUpload}>
                  <ImagePlus className="w-4 h-4" />
                  <span>Click to add images or videos</span>
                  <input type="file" accept="image/*,video/*" multiple onChange={handleFilesSelected} className="hidden" />
                </label>

                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {mediaFiles.map((m, idx) => (
                      <div key={idx} className={glassMediaThumb}>
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

              <button type="submit" disabled={submitting} className={glassButtonPrimary}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? 'Saving...' : 'Add Product'}</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className={glassIconChipLarge('emerald')}>
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Product Added!</h3>
              <p className="text-xs text-stone-400 mb-6">It's now live under {businessName}.</p>
              <button onClick={onClose} className={glassButtonSecondary}>
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddProductModal;