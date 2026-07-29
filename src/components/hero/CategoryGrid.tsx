import React from 'react';
import { Shirt, Smartphone, Sparkles, UtensilsCrossed, Home, Car, PartyPopper, Palette, Plus, Eye } from 'lucide-react';
import CATEGORIES, { type CategoryItem } from '@/data/categories';

interface CategoryGridProps {
  onOpenCreate: (id: string, title: string) => void;
  onOpenView: (id: string, title: string) => void;
}

// Warm, ember-toned icon set — no cold blues or purples. Every category
// lives somewhere on the coal-to-flame spectrum: amber, copper, rust, gold.
const iconMap: Record<string, React.ReactNode> = {
  Shirt: <Shirt className="w-6 h-6 text-amber-400" />,
  Smartphone: <Smartphone className="w-6 h-6 text-orange-300" />,
  Sparkles: <Sparkles className="w-6 h-6 text-rose-300" />,
  UtensilsCrossed: <UtensilsCrossed className="w-6 h-6 text-orange-400" />,
  Home: <Home className="w-6 h-6 text-yellow-400" />,
  Car: <Car className="w-6 h-6 text-orange-400" />,
  PartyPopper: <PartyPopper className="w-6 h-6 text-rose-400" />,
  Palette: <Palette className="w-6 h-6 text-yellow-400" />
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onOpenCreate, onOpenView }) => {
  return (
    <div className="px-4 max-w-7xl mx-auto py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-amber-50">Explore Business Categories</h2>
        <p className="text-xs text-stone-400">Select a category to view plugs or register your business</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat: CategoryItem) => (
          <div
            key={cat.id}
            className={`relative overflow-hidden p-5 rounded-[1.5rem] bg-gradient-to-br ${cat.bgGradient} border backdrop-blur-sm transition-all duration-300 flex flex-col justify-between shadow-lg shadow-black/40 hover:shadow-orange-900/30 hover:-translate-y-0.5`}
          >
            {/* Thatch-eave accent: a woven-look stripe along the top edge */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5 opacity-70"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(115deg, rgba(251,191,36,0.55) 0px, rgba(251,191,36,0.55) 3px, transparent 3px, transparent 7px)'
              }}
            />

            <div className="pt-1.5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-700/50">
                  {iconMap[cat.icon]}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${cat.badgeColor}`}>
                  {cat.badge}
                </span>
              </div>

              <h3 className="font-bold text-base text-amber-50 mb-1">{cat.title}</h3>
              <p className="text-xs text-stone-400 mb-4">{cat.subtitle}</p>

              {/* Popular Tag Pills */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {cat.popularItems.map((item, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-stone-950/50 text-[10px] text-stone-300 border border-stone-800">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-800/60">
              <button
                onClick={() => onOpenCreate(cat.id, cat.title)}
                className="flex items-center justify-center gap-1 px-1 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-[9px] xs:text-[10px] sm:text-xs font-bold transition-colors overflow-hidden shadow-sm shadow-orange-900/40"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Create Shop</span>
              </button>
              <button
                onClick={() => onOpenView(cat.id, cat.title)}
                className="flex items-center justify-center gap-1 px-1 py-2 rounded-lg bg-stone-950/70 hover:bg-stone-900 border border-amber-500/20 text-amber-100 text-[9px] xs:text-[10px] sm:text-xs font-semibold transition-colors overflow-hidden"
              >
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Browse Plugs</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid; 
