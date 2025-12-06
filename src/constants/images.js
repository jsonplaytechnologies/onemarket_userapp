// Stock images from Unsplash for different service categories and placeholders
// Using Unsplash Source API for reliable, high-quality images

export const STOCK_IMAGES = {
  // Service category images
  services: {
    cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
    plumbing: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80',
    electrical: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80',
    beauty: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
    moving: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400&q=80',
    gardening: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
    repair: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80',
    painting: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80',
    default: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80',
  },

  // Business category images
  businesses: {
    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
    retail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80',
    salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
    gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
    cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
    spa: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80',
    pharmacy: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80',
    supermarket: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80',
    default: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80',
  },

  // Professional avatars (diverse people)
  professionals: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
  ],

  // Hero/Banner images
  hero: {
    services: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
    businesses: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    welcome: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
  },

  // Placeholder images
  placeholders: {
    business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80',
    service: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80',
    person: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
  },
};

// Helper function to get service image based on category name
export const getServiceImage = (categoryName) => {
  if (!categoryName) return STOCK_IMAGES.services.default;

  const name = categoryName.toLowerCase();

  if (name.includes('clean')) return STOCK_IMAGES.services.cleaning;
  if (name.includes('plumb')) return STOCK_IMAGES.services.plumbing;
  if (name.includes('electric')) return STOCK_IMAGES.services.electrical;
  if (name.includes('beauty') || name.includes('hair') || name.includes('salon')) return STOCK_IMAGES.services.beauty;
  if (name.includes('mov') || name.includes('transport')) return STOCK_IMAGES.services.moving;
  if (name.includes('garden') || name.includes('landscape')) return STOCK_IMAGES.services.gardening;
  if (name.includes('repair') || name.includes('fix') || name.includes('home')) return STOCK_IMAGES.services.repair;
  if (name.includes('paint')) return STOCK_IMAGES.services.painting;

  return STOCK_IMAGES.services.default;
};

// Helper function to get business image based on category name
export const getBusinessImage = (categoryName) => {
  if (!categoryName) return STOCK_IMAGES.businesses.default;

  const name = categoryName.toLowerCase();

  if (name.includes('restaurant') || name.includes('food')) return STOCK_IMAGES.businesses.restaurant;
  if (name.includes('retail') || name.includes('shop')) return STOCK_IMAGES.businesses.retail;
  if (name.includes('salon') || name.includes('beauty')) return STOCK_IMAGES.businesses.salon;
  if (name.includes('gym') || name.includes('fitness')) return STOCK_IMAGES.businesses.gym;
  if (name.includes('cafe') || name.includes('coffee')) return STOCK_IMAGES.businesses.cafe;
  if (name.includes('spa') || name.includes('wellness')) return STOCK_IMAGES.businesses.spa;
  if (name.includes('pharma') || name.includes('health')) return STOCK_IMAGES.businesses.pharmacy;
  if (name.includes('super') || name.includes('market') || name.includes('grocery')) return STOCK_IMAGES.businesses.supermarket;

  return STOCK_IMAGES.businesses.default;
};

// Get random professional avatar
export const getRandomProAvatar = (index = 0) => {
  return STOCK_IMAGES.professionals[index % STOCK_IMAGES.professionals.length];
};
