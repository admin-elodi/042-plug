'use client';

import React from 'react';
import { Shirt, Smartphone, Sparkles, UtensilsCrossed, Home, Car, PartyPopper, Footprints, Gem, Scissors, Gift, BedDouble, Plus, Eye } from 'lucide-react';
import CATEGORIES, { type CategoryItem } from '@/data/categories';

// Auto-discovers any background photo dropped into this folder, matched by
// filename to a category's `id` (e.g. fashion.jpg matches the "fashion"
// category). No import statement or code change needed per photo — just
// add a file named <category-id>.<jpg|jpeg|png|webp> to this folder.
const categoryImages = import.meta.glob('/src/assets/images/categories/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

const getCategoryImage = (id: string): string | undefined => {
  const match = Object.keys(categoryImages).find((path) => {
    const filename = path.split('/').pop() ?? '';
    return filename.replace(/\.(jpg|jpeg|png|webp)$/i, '') === id;
  });
  return match ? categoryImages[match] : undefined;
};

interface CategoryGridProps {
  onOpenCreate: (id: string, title: string) => void;
  onOpenView: (id: string, title: string) => void;
}

// One accent color, used consistently — no per-category rainbow.
const iconMap: Record<string, React.ReactNode> = {
  Shirt: <Shirt className="w-5 h-5 text-amber-300" />,
  Smartphone: <Smartphone className="w-5 h-5 text-amber-300" />,
  Sparkles: <Sparkles className="w-5 h-5 text-amber-300" />,
  UtensilsCrossed: <UtensilsCrossed className="w-5 h-5 text-amber-300" />,
  Home: <Home className="w-5 h-5 text-amber-300" />,
  Car: <Car className="w-5 h-5 text-amber-300" />,
  PartyPopper: <PartyPopper className="w-5 h-5 text-amber-300" />,
  Footprints: <Footprints className="w-5 h-5 text-amber-300" />,
  Gem: <Gem className="w-5 h-5 text-amber-300" />,
  Scissors: <Scissors className="w-5 h-5 text-amber-300" />,
  Gift: <Gift className="w-5 h-5 text-amber-300" />,
  BedDouble: <BedDouble className="w-5 h-5 text-amber-300" />
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onOpenCreate, onOpenView }) => {
  return (
    <div className="bg-stone-50">
      <div className="px-4 max-w-7xl mx-auto py-10">
        <div className="mb-8 pb-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Explore Business Categories</h2>
            <p className="text-xs text-stone-500 mt-1">Select a category to view plugs or register your business</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5">
          {CATEGORIES.map((cat: CategoryItem) => {
            const bgImage = getCategoryImage(cat.id);
            return (
              <div
                key={cat.id}
                className="group relative overflow-hidden rounded-xl border border-stone-800 hover:border-amber-500/40 p-4 xl:p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-black/60"
              >
                {/* Background photo (if one exists for this category) */}
                {bgImage && (
                  <>
                    <img
                      src={bgImage}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Dark wash so text stays legible over any photo */}
                    <div className="absolute inset-0 bg-stone-950/50 group-hover:bg-stone-950/75 transition-colors" />
                  </>
                )}
                {/* Flat fallback background when no photo has been added yet */}
                {!bgImage && <div className="absolute inset-0 bg-stone-900/60" />}

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 group-hover:border-amber-500/30 transition-colors">
                      {iconMap[cat.icon]}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-stone-950 text-amber-400 border border-amber-500/20">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-stone-100 group-hover:text-amber-400 transition-colors mb-1">{cat.title}</h3>
                  <p className="text-xs text-stone-300 mb-4 leading-relaxed">{cat.subtitle}</p>

                  {/* Popular Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {cat.popularItems.map((item, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-stone-950/80 text-[10px] text-stone-300 border border-stone-800/80 font-mono">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="relative grid grid-cols-2 gap-1.5 xl:gap-2 pt-3 border-t border-stone-800/60">
                  <button
                    type="button"
                    onClick={() => onOpenCreate(cat.id, cat.title)}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-2 rounded-lg bg-amber-200 hover:bg-amber-400 text-stone-950 text-[10px] sm:text-xs font-bold transition-all active:scale-[0.98] whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                    <span>Create Shop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenView(cat.id, cat.title)}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-2 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white text-[10px] sm:text-xs font-semibold transition-all active:scale-[0.98] whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>Browse Plugs</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;