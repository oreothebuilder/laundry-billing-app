export const DEFAULT_SERVICES = [
  {
    id: 'regular',
    name: 'Regular Wash',
    badge: 'Daily Wear',
    description: 'Everyday machine wash, fabric soften & standard steam press',
    ratePerKg: 60,
    pricingType: 'weight',
    rateDescription: '₹60 / kg',
    turnaround: '24-48 Hours',
    color: 'blue'
  },
  {
    id: 'premium',
    name: 'Premium Care',
    badge: 'Delicate & Linens',
    description: 'Individual gentle wash, antiseptic rinse, stain treatment & crisp finish',
    ratePerKg: 80,
    pricingType: 'weight',
    rateDescription: '₹80 / kg',
    turnaround: '24 Hours',
    color: 'amber'
  },
  {
    id: 'dry_cleaning',
    name: 'Dry Cleaning',
    badge: 'Suits & Silks',
    description: 'Hydrocarbon solvent wash for fine fabrics, suits, blazers, silks & woolens',
    ratePerKg: 0,
    pricingType: 'piece',
    rateDescription: 'Individual piece rates',
    turnaround: '48-72 Hours',
    color: 'purple'
  },
  {
    id: 'others',
    name: 'Others',
    badge: 'Custom & Shoes',
    description: 'Steam press only, footwear cleaning, draperies, curtains & rugs',
    ratePerKg: 0,
    pricingType: 'piece',
    rateDescription: 'Individual item rates',
    turnaround: '24-48 Hours',
    color: 'emerald'
  }
];

/**
 * Clothes catalog for each service category.
 * Each category has its own distinct clothes and independent rates.
 */
export const DEFAULT_WASH_ITEMS = [
  { id: 'wash-tshirt', name: 'T-Shirt', price: 25 },
  { id: 'wash-lowers', name: 'Lowers / Jeans', price: 35 },
  { id: 'wash-socks', name: 'Socks (Pair)', price: 15 },
  { id: 'wash-bedsheet', name: 'Bedsheet (Single/Double)', price: 80 },
  { id: 'wash-pillow-cover', name: 'Pillow Cover', price: 25 },
  { id: 'wash-jacket', name: 'Jacket', price: 100 },
  { id: 'wash-hoodie', name: 'Hoodie / Sweatshirt', price: 60 },
  { id: 'wash-shirt', name: 'Daily Shirt', price: 30 },
  { id: 'wash-shorts', name: 'Shorts', price: 20 },
  { id: 'wash-towel', name: 'Bath Towel', price: 30 },
  { id: 'wash-undergarments', name: 'Undergarments', price: 15 },
  { id: 'wash-kurta', name: 'Kurta / Ethnic Wear', price: 70 }
];

/**
 * Clothes catalog for each service category.
 * Regular wash and Premium care share the exact same clothes catalog.
 * Dry cleaning and Others have their own distinct items with individual piece rates.
 */
export const DEFAULT_CATEGORY_ITEMS = {
  regular: [...DEFAULT_WASH_ITEMS],
  premium: [...DEFAULT_WASH_ITEMS],

  dry_cleaning: [
    { id: 'dc-blazer', name: 'Blazer / Sports Coat', price: 220, serviceCategory: 'dry_cleaning' },
    { id: 'dc-suit-2pc', name: 'Suit / Blazer (2-Pc)', price: 350, serviceCategory: 'dry_cleaning' },
    { id: 'dc-suit-3pc', name: 'Suit (3-Piece Complete)', price: 450, serviceCategory: 'dry_cleaning' },
    { id: 'dc-sherwani', name: 'Sherwani / Indo-Western', price: 500, serviceCategory: 'dry_cleaning' },
    { id: 'dc-silk-saree', name: 'Heavy Silk / Zari Saree', price: 260, serviceCategory: 'dry_cleaning' },
    { id: 'dc-lehenga', name: 'Bridal / Heavy Lehenga', price: 650, serviceCategory: 'dry_cleaning' },
    { id: 'dc-blanket-double', name: 'Heavy Quilt / Blanket (Double)', price: 350, serviceCategory: 'dry_cleaning' },
    { id: 'dc-blanket-single', name: 'Fleece Blanket (Single)', price: 220, serviceCategory: 'dry_cleaning' },
    { id: 'dc-leather-jacket', name: 'Leather / Suede Jacket', price: 400, serviceCategory: 'dry_cleaning' },
    { id: 'dc-sweater', name: 'Cashmere / Woolen Sweater', price: 180, serviceCategory: 'dry_cleaning' },
    { id: 'dc-overcoat', name: 'Long Overcoat / Trenchcoat', price: 350, serviceCategory: 'dry_cleaning' }
  ],

  others: [
    { id: 'oth-shoe-clean', name: 'Sneakers / Sports Shoe Cleaning', price: 160, serviceCategory: 'others' },
    { id: 'oth-steam-press-shirt', name: 'Steam Press Only - Shirt', price: 20, serviceCategory: 'others' },
    { id: 'oth-steam-press-pant', name: 'Steam Press Only - Trouser', price: 20, serviceCategory: 'others' },
    { id: 'oth-curtains', name: 'Curtain Panel (Wash & Press)', price: 180, serviceCategory: 'others' },
    { id: 'oth-carpet', name: 'Rug / Carpet Wash (Per Sq Ft)', price: 40, serviceCategory: 'others' },
    { id: 'oth-helmet', name: 'Riding Helmet Sanitization', price: 120, serviceCategory: 'others' },
    { id: 'oth-bag', name: 'Backpack / Travel Bag Wash', price: 150, serviceCategory: 'others' },
    { id: 'oth-sofa-cover', name: 'Sofa Cushion / Slip Cover', price: 80, serviceCategory: 'others' }
  ]
};

export const DEFAULT_SHOP_SETTINGS = {
  shopName: 'BTech Drycleaners',
  shopTagline: 'Drycleaning and Laundry Specialist',
  phone: '',
  ownerWhatsAppPhone: '',
  shopUpiId: '',
  hostedAppUrl: 'https://btech-laundry.web.app',
  autoSendWhatsAppBill: false,
  gatewayUrl: '',
  address: '',
  city: '',
  currency: '₹',
  gstNumber: '',
  pricingMode: 'per_kg',
  regularKgRate: 60,
  premiumKgRate: 80,
  othersKgRate: 90,
  taxPercent: 0,
  defaultDeliveryDays: 2,
  terms: 'Please collect clothes within 30 days. We take utmost care of delicate fabrics.'
};
