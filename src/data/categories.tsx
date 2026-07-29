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
    bgGradient: 'from-orange-600/20 to-amber-800/20 hover:from-orange-600/30 hover:to-amber-800/30 border-orange-600/30',
    badge: 'High Demand',
    badgeColor: 'bg-orange-600/20 text-orange-300 border-orange-600/30',
    count: '28+ Vendors',
    popularItems: ['iPhone UK Used', 'MacBooks', 'Powerbanks', 'Screen Repair']
  },
  {
    id: 'beauty',
    title: 'Beauty & Skincare',
    subtitle: 'Makeup, Wigs, Cosmetics & Spa Services',
    icon: 'Sparkles',
    bgGradient: 'from-rose-600/20 to-orange-700/20 hover:from-rose-600/30 hover:to-orange-700/30 border-rose-500/30',
    badge: 'Trending',
    badgeColor: 'bg-rose-600/20 text-rose-300 border-rose-500/30',
    count: '35+ Vendors',
    popularItems: ['Human Hair Wigs', 'Skincare Sets', 'Lash Techs', 'Nail Art']
  },
  {
    id: 'food',
    title: 'Food & Groceries',
    subtitle: 'Restaurants, Raw Foodstuff, Bakeries & Drinks',
    icon: 'UtensilsCrossed',
    bgGradient: 'from-orange-600/20 to-red-700/20 hover:from-orange-600/30 hover:to-red-700/30 border-orange-500/30',
    badge: 'Daily Need',
    badgeColor: 'bg-orange-600/20 text-orange-300 border-orange-500/30',
    count: '50+ Vendors',
    popularItems: ['Abakpa Market Supplies', 'Pastries', 'Catering', 'Fast Food']
  },
  {
    id: 'real-estate',
    title: 'Real Estate & Rentals',
    subtitle: 'Self-contains, Land, Shortlets, Shops & Office Space',
    icon: 'Home',
    bgGradient: 'from-yellow-700/20 to-amber-900/20 hover:from-yellow-700/30 hover:to-amber-900/30 border-yellow-600/30',
    badge: 'High Value',
    badgeColor: 'bg-yellow-700/20 text-yellow-300 border-yellow-600/30',
    count: '20+ Listings',
    popularItems: ['Land in Nike', 'Shortlets GRA', 'Shops Ogui Rd', 'Self-Contain']
  },
  {
    id: 'auto-logistics',
    title: 'Auto & Logistics',
    subtitle: 'Dispatch Riders, Car Sales, Spare Parts & Mechanics',
    icon: 'Car',
    bgGradient: 'from-orange-700/20 to-red-800/20 hover:from-orange-700/30 hover:to-red-800/30 border-orange-600/30',
    badge: 'Fast Delivery',
    badgeColor: 'bg-orange-700/20 text-orange-300 border-orange-600/30',
    count: '30+ Services',
    popularItems: ['042 Dispatch', 'Auto Repairs', 'Spare Parts', 'Car Wash']
  },
  {
    id: 'events-nightlife',
    title: 'Events & Nightlife',
    subtitle: 'DJs, Event Planners, Ushers, Sound & Party Rentals',
    icon: 'PartyPopper',
    bgGradient: 'from-red-600/20 to-rose-800/20 hover:from-red-600/30 hover:to-rose-800/30 border-red-500/30',
    badge: 'Weekend Hot',
    badgeColor: 'bg-red-600/20 text-red-300 border-red-500/30',
    count: '12+ Planners',
    popularItems: ['Hotel Launch', 'VIP Ushers', 'Party Rentals', 'Event DJs']
  },
  {
    id: 'media-branding',
    title: 'Media, Design & Tech',
    subtitle: 'Graphics, Printing, Social Media, Web Setup & Branding',
    icon: 'Palette',
    bgGradient: 'from-yellow-500/20 to-amber-600/20 hover:from-yellow-500/30 hover:to-amber-600/30 border-yellow-500/30',
    badge: 'Essential',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    count: '25+ Services',
    popularItems: ['Flyer Design', 'Ogui Rd Printing', 'Logo Branding', 'Social Media']
  }
];

export default CATEGORIES;