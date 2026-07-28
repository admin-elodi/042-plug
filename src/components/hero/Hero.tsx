'use client';

import React, { useState } from 'react';
import HeroBanner from '@/components/hero/HeroBanner';
import CategoryGrid from '@/components/hero/CategoryGrid';
import CreateShopModal from '@/components/modals/CreateShopModal';
import ViewShopsModal from '@/components/modals/ViewShopsModal';

export const Hero: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'create' | 'view' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState({ id: 'general', title: 'General' });

  return (
    <div className="bg-slate-950 text-white relative overflow-hidden flex flex-col justify-between min-h-screen">
      <div>
        {/* Banner Section */}
        <HeroBanner onOpenCreateShop={() => setActiveModal('create')} />

        {/* Categories Section */}
        <CategoryGrid
          onOpenCreate={(id, title) => {
            setSelectedCategory({ id, title });
            setActiveModal('create');
          }}
          onOpenView={(id, title) => {
            setSelectedCategory({ id, title });
            setActiveModal('view');
          }}
        />
      </div>

      {/* Modals */}
      {activeModal === 'create' && (
        <CreateShopModal category={selectedCategory} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'view' && (
        <ViewShopsModal category={selectedCategory} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};

export default Hero;