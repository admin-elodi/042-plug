'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '@/components/hero/HeroBanner';
import CategoryGrid from '@/components/hero/CategoryGrid';
import CreateShopModal from '@/components/modals/CreateShopModal';
import BoomDayBanner from '@/components/BoomDayBanner';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<'create' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState({ id: '', title: '' });

  return (
    <div className="bg-stone-950 text-white relative overflow-hidden flex flex-col justify-between min-h-screen">
      <div>
        {/* Banner Section */}
        <HeroBanner onOpenCreateShop={() => document.getElementById('storefronts')?.scrollIntoView({ behavior: 'smooth' })} />

        {/* Boom Day — only renders when one is actually active */}
        <BoomDayBanner />

        {/* Categories Section */}
        <div id="storefronts">
          <CategoryGrid
            onOpenCreate={(id, title) => {
              setSelectedCategory({ id, title });
              setActiveModal('create');
            }}
            onOpenView={(id) => {
              navigate(`/browse/${id}`);
            }}
          />
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'create' && (
        <CreateShopModal category={selectedCategory} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};

export default Hero;