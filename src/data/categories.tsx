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
    id: 'material',
    title: 'Fashion & Apparel',
    subtitle: 'Boutiques, Native Wear & Tailors',
    icon: 'Shirt',
    badge: 'Popular',
    count: '42+ Sellers',
    popularItems: ['Senegalese Native', 'Unisex Wears', 'Jackets', 'Custom Tailoring']
  },
  {
    id: 'shoes',
    title: 'Shoes & Footwear',
    subtitle: 'Sneakers, Slippers, Corporate Shoes & Shoemakers',
    icon: 'Footprints',
    badge: 'High Demand',
    count: '20+ Sellers',
    popularItems: ['Sneakers', 'Slippers', 'Made-to-Order', 'Shoe Repair']
  },
  {
    id: 'bags-accessories',
    title: 'Bags & Accessories',
    subtitle: 'Handbags, Jewelry, Belts, Sunglasses & Wristwatches',
    icon: 'Gem',
    badge: 'Trending',
    count: '18+ Sellers',
    popularItems: ['Handbags', 'Jewelry Sets', 'Sunglasses', 'Wristwatches']
  },
  {
    id: 'braid',
    title: 'Hair, Wigs & Extensions',
    subtitle: 'Wig Installation, Braiding, Bridal Hair & Ventilation',
    icon: 'Scissors',
    badge: 'Weekend Hot',
    count: '25+ Stylists',
    popularItems: ['Wig Installation', 'Braiding', 'Bridal Hair', 'Luxury Hair']
  },
  {
    id: 'beauty',
    title: 'Beauty & Skincare',
    subtitle: 'Makeup, Nails, Skincare & Body Enhancers',
    icon: 'Sparkles',
    badge: 'Trending',
    count: '35+ Sellers',
    popularItems: ['Press-On Nails', 'Skincare Sets', 'Hip & Nyash Padding', 'Hair Oil']
  },
  {
    id: 'gadgets',
    title: 'Tech & Gadgets',
    subtitle: 'Phones, Laptops, Accessories & Repairs',
    icon: 'Smartphone',
    badge: 'High Demand',
    count: '28+ Sellers',
    popularItems: ['iPhone UK Used', 'MacBooks', 'Powerbanks', 'Screen Repair']
  },
  {
    id: 'tomato',
    title: 'Food & Groceries',
    subtitle: 'Restaurants, Raw Foodstuff, Bakeries & Drinks',
    icon: 'UtensilsCrossed',
    badge: 'Daily Need',
    count: '50+ Sellers',
    popularItems: ['Abakpa Market Supplies', 'Pastries', 'Catering', 'Fast Food']
  },
  {
    id: 'gifts',
    title: 'Gifts & Occasion Items',
    subtitle: 'Hampers, Surprise Packages, Gift Boxes & Wrapping',
    icon: 'Gift',
    badge: 'Essential',
    count: '15+ Sellers',
    popularItems: ['Surprise Packages', 'Gift Hampers', 'Balloon Décor', 'Custom Wrapping']
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
    id: 'hotels',
    title: 'Hotels & Shortlets',
    subtitle: 'Hotel Bookings, Shortlet Apartments & Event Halls',
    icon: 'BedDouble',
    badge: 'New',
    count: '10+ Listings',
    popularItems: ['Hotel Rooms', 'Shortlet Apartments', 'Event Halls', 'Weekend Getaways']
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
    id: 'couple',
    title: 'Events & Nightlife',
    subtitle: 'DJs, Event Planners, Ushers, Sound & Party Rentals',
    icon: 'PartyPopper',
    badge: 'Weekend Hot',
    count: '12+ Planners',
    popularItems: ['Hotel Launch', 'VIP Ushers', 'Party Rentals', 'Event DJs']
  }
];

export default CATEGORIES;