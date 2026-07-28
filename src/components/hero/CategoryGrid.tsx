'use client';

import React from 'react';
import { Shirt, Smartphone, Sparkles, UtensilsCrossed, Plus, Eye } from 'lucide-react';
import CATEGORIES, { type CategoryItem } from '@/data/categories';

interface CategoryGridProps {
  onOpenCreate: (id: string, title: string) => void;
  onOpenView: (id: string, title: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Shirt: <Shirt className="w-6 h-6 text-amber-400" />,
  Smartphone: <Smartphone className="w-6 h-6 text-blue-400" />,
  Sparkles: <Sparkles className="w-6 h-6 text-pink-400" />,
  UtensilsCrossed: <UtensilsCrossed className="w-6 h-6 text-emerald-400" />
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onOpenCreate, onOpenView }) => {
  return (
    <div className="px-4 max-w-7xl mx-auto py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Explore Business Categories</h2>
        <p className="text-xs text-slate-400">Select a category to view vendors or register your business</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat: CategoryItem) => (
          <div
            key={cat.id}
            className={`p-5 rounded-2xl bg-gradient-to-br ${cat.bgGradient} border backdrop-blur-sm transition-all duration-300 flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50">
                  {iconMap[cat.icon]}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${cat.badgeColor}`}>
                  {cat.badge}
                </span>
              </div>

              <h3 className="font-bold text-base text-white mb-1">{cat.title}</h3>
              <p className="text-xs text-slate-400 mb-4">{cat.subtitle}</p>

              {/* Popular Tag Pills */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {cat.popularItems.map((item, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-900/50 text-[10px] text-slate-300 border border-slate-800">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/60">
              <button
                onClick={() => onOpenCreate(cat.id, cat.title)}
                className="flex items-center justify-center gap-1 px-1 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[9px] xs:text-[10px] sm:text-xs font-semibold transition-colors overflow-hidden"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Create Shop</span>
              </button>
              <button
                onClick={() => onOpenView(cat.id, cat.title)}
                className="flex items-center justify-center gap-1 px-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] xs:text-[10px] sm:text-xs font-semibold transition-colors overflow-hidden"
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