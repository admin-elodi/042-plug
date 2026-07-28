export interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  bgGradient: string;
  badge: string;
  badgeColor: string;
  count: string;
  popularItems: string[];
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'fashion',
    title: 'Fashion & Apparel',
    subtitle: 'Boutiques, Native Wear, Shoes & Tailors',
    icon: 'Shirt',
    bgGradient: 'from-amber-500/20 to-orange-600/20 hover:from-amber-500/30 hover:to-orange-600/30 border-amber-500/30',
    badge: 'Popular',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    count: '42+ Vendors',
    popularItems: ['Senegalese Native', 'Sneakers', 'Designer Bags', 'Custom Tailoring']
  },
  {
    id: 'tech',
    title: 'Tech & Gadgets',
    subtitle: 'Phones, Laptops, Accessories & Repairs',
    icon: 'Smartphone',
    bgGradient: 'from-blue-500/20 to-indigo-600/20 hover:from-blue-500/30 hover:to-indigo-600/30 border-blue-500/30',
    badge: 'High Demand',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    count: '28+ Vendors',
    popularItems: ['iPhone UK Used', 'MacBooks', 'Powerbanks', 'Screen Repair']
  },
  {
    id: 'beauty',
    title: 'Beauty & Skincare',
    subtitle: 'Makeup, Wigs, Cosmetics & Spa Services',
    icon: 'Sparkles',
    bgGradient: 'from-pink-500/20 to-rose-600/20 hover:from-pink-500/30 hover:to-rose-600/30 border-pink-500/30',
    badge: 'Trending',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    count: '35+ Vendors',
    popularItems: ['Human Hair Wigs', 'Skincare Sets', 'Lash Techs', 'Nail Art']
  },
  {
    id: 'food',
    title: 'Food & Groceries',
    subtitle: 'Restaurants, Raw Foodstuff, Bakeries & Drinks',
    icon: 'UtensilsCrossed',
    bgGradient: 'from-emerald-500/20 to-green-600/20 hover:from-emerald-500/30 hover:to-green-600/30 border-emerald-500/30',
    badge: 'Daily Need',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    count: '50+ Vendors',
    popularItems: ['Abakpa Market Supplies', 'Pastries', 'Catering', 'Fast Food']
  },
  // Add these 3 objects to your existing array in categories.tsx

  {
    id: 'real-estate',
    title: 'Real Estate & Rentals',
    subtitle: 'Self-contains, Land, Shortlets, Shops & Office Space',
    icon: 'Sparkles', // Re-using existing icon key or add a new one in iconMap
    bgGradient: 'from-purple-500/20 to-indigo-600/20 hover:from-purple-500/30 hover:to-indigo-600/30 border-purple-500/30',
    badge: 'High Value',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    count: '20+ Listings',
    popularItems: ['Land in Nike', 'Shortlets GRA', 'Shops Ogui Rd', 'Self-Contain']
  },
  {
    id: 'auto-logistics',
    title: 'Auto & Logistics',
    subtitle: 'Dispatch Riders, Car Sales, Spare Parts & Mechanics',
    icon: 'Smartphone',
    bgGradient: 'from-amber-500/20 to-orange-600/20 hover:from-amber-500/30 hover:to-orange-600/30 border-amber-500/30',
    badge: 'Fast Delivery',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    count: '30+ Services',
    popularItems: ['042 Dispatch', 'Auto Repairs', 'Spare Parts', 'Car Wash']
  },
  {
    id: 'events-nightlife',
    title: 'Events & Nightlife',
    subtitle: 'DJs, Event Planners, Ushers, Sound & Party Rentals',
    icon: 'UtensilsCrossed',
    bgGradient: 'from-pink-500/20 to-rose-600/20 hover:from-pink-500/30 hover:to-rose-600/30 border-pink-500/30',
    badge: 'Weekend Hot',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    count: '12+ Planners',
    popularItems: ['Hotel Launch', 'VIP Ushers', 'Party Rentals', 'Event DJs']
  },
  {
  id: 'media-branding',
  title: 'Media, Design & Tech',
  subtitle: 'Graphics, Printing, Social Media, Web Setup & Branding',
  icon: 'Sparkles', // Re-using existing icon key or add a new key in iconMap
  bgGradient: 'from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border-cyan-500/30',
  badge: 'Essential',
  badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  count: '25+ Services',
  popularItems: ['Flyer Design', 'Ogui Rd Printing', 'Logo Branding', 'Social Media']
}

];

export default CATEGORIES;