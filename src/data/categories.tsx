export interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  count: string;
  popularItems: string[];
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'fashion',
    title: 'Fashion & Apparel',
    subtitle: 'Boutiques, Native Wear, Shoes & Tailors',
    icon: 'Shirt',
    badge: 'Popular',
    count: '42+ Vendors',
    popularItems: ['Senegalese Native', 'Sneakers', 'Designer Bags', 'Custom Tailoring']
  },
  {
    id: 'tech',
    title: 'Tech & Gadgets',
    subtitle: 'Phones, Laptops, Accessories & Repairs',
    icon: 'Smartphone',
    badge: 'High Demand',
    count: '28+ Vendors',
    popularItems: ['iPhone UK Used', 'MacBooks', 'Powerbanks', 'Screen Repair']
  },
  {
    id: 'beauty',
    title: 'Beauty & Skincare',
    subtitle: 'Makeup, Wigs, Cosmetics & Spa Services',
    icon: 'Sparkles',
    badge: 'Trending',
    count: '35+ Vendors',
    popularItems: ['Human Hair Wigs', 'Skincare Sets', 'Lash Techs', 'Nail Art']
  },
  {
    id: 'food',
    title: 'Food & Groceries',
    subtitle: 'Restaurants, Raw Foodstuff, Bakeries & Drinks',
    icon: 'UtensilsCrossed',
    badge: 'Daily Need',
    count: '50+ Vendors',
    popularItems: ['Abakpa Market Supplies', 'Pastries', 'Catering', 'Fast Food']
  },
  {
    id: 'real-estate',
    title: 'Real Estate & Rentals',
    subtitle: 'Self-contains, Land, Shortlets, Shops & Office Space',
    icon: 'Home',
    badge: 'High Value',
    count: '20+ Listings',
    popularItems: ['Land in Nike', 'Shortlets GRA', 'Shops Ogui Rd', 'Self-Contain']
  },
  {
    id: 'auto-logistics',
    title: 'Auto & Logistics',
    subtitle: 'Dispatch Riders, Car Sales, Spare Parts & Mechanics',
    icon: 'Car',
    badge: 'Fast Delivery',
    count: '30+ Services',
    popularItems: ['042 Dispatch', 'Auto Repairs', 'Spare Parts', 'Car Wash']
  },
  {
    id: 'events-nightlife',
    title: 'Events & Nightlife',
    subtitle: 'DJs, Event Planners, Ushers, Sound & Party Rentals',
    icon: 'PartyPopper',
    badge: 'Weekend Hot',
    count: '12+ Planners',
    popularItems: ['Hotel Launch', 'VIP Ushers', 'Party Rentals', 'Event DJs']
  },
  {
    id: 'media-branding',
    title: 'Media, Design & Tech',
    subtitle: 'Graphics, Printing, Social Media, Web Setup & Branding',
    icon: 'Palette',
    badge: 'Essential',
    count: '25+ Services',
    popularItems: ['Flyer Design', 'Ogui Rd Printing', 'Logo Branding', 'Social Media']
  }
];

export default CATEGORIES;