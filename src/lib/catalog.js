// Built-in starter menu. Used when the Supabase products table is empty or unreachable.
const img = (id, w = 600, h = 450) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

export const unsplash = img;

export const FALLBACK_IMAGE = img('1546069901-ba9599a7e63c');

export const DEFAULT_VENDOR = {
  id: 'vendor_001',
  name: 'FoodieExpress Kitchen',
  email: 'admin@foodieexpress.com',
};

const k = { vendorId: DEFAULT_VENDOR.id, vendorName: DEFAULT_VENDOR.name };

export const CATALOG = [
  // Meals
  { id: 1, name: 'Suya Mixed Grill Platter', category: 'meals', price: 6500, rating: 4.9, reviews: 0, badge: 'Chef’s pick', description: 'Spiced beef suya, chicken skewers, grilled plantain and pepper sauce for sharing.', image: img('1555939594-58d7cb561ad1'), ...k },
  { id: 2, name: 'Spicy Prawn Spaghetti', category: 'meals', price: 5500, rating: 4.8, reviews: 0, description: 'Spaghetti tossed with garlic prawns, cherry tomatoes and a kick of chilli.', image: img('1563379926898-05f4575a45d8'), ...k },
  { id: 3, name: 'Chicken Curry & Rice', category: 'meals', price: 4500, rating: 4.7, reviews: 0, description: 'Slow-cooked creamy chicken curry served over fluffy white rice.', image: img('1588166524941-3bf61a9c41db'), ...k },
  { id: 4, name: 'Grilled Beef & Greens', category: 'meals', price: 5000, rating: 4.6, reviews: 0, description: 'Tender sliced beef on fresh greens with a cashew and chilli dressing.', image: img('1504674900247-0877df9cc836'), ...k },
  { id: 5, name: 'Prawn Pepper Stew & Rice', category: 'meals', price: 5500, rating: 4.8, reviews: 0, badge: 'New', description: 'Rich pepper stew loaded with prawns, served with steamed rice.', image: img('1559847844-5315695dadae'), ...k },

  // Fast food
  { id: 6, name: 'Classic Cheeseburger', category: 'fast-food', price: 2500, rating: 4.8, reviews: 0, badge: 'Bestseller', description: 'Juicy beef patty, melted cheddar, lettuce, tomato and our secret sauce.', image: img('1568901346375-23c9450c58cd'), ...k },
  { id: 7, name: 'Crispy Fried Chicken', category: 'fast-food', price: 3500, rating: 4.9, reviews: 0, description: 'Golden, crunchy fried chicken with a smoky dipping sauce.', image: img('1626645738196-c2a7c87a8f58'), ...k },
  { id: 8, name: 'Margherita Pizza', category: 'fast-food', price: 4000, rating: 4.7, reviews: 0, description: 'Wood-fired base, San Marzano tomato, mozzarella and fresh basil.', image: img('1574071318508-1cdbab80d002'), ...k },
  { id: 9, name: 'Pulled Chicken Burger', category: 'fast-food', price: 3000, rating: 4.6, reviews: 0, description: 'Shredded chicken in creamy slaw on a toasted brioche bun.', image: img('1606755962773-d324e0a13086'), ...k },
  { id: 10, name: 'Crispy Veggie Samosas', category: 'fast-food', price: 1500, rating: 4.5, reviews: 0, description: 'Four golden samosas stuffed with spiced potato and peas.', image: img('1601050690597-df0568f70950'), ...k },

  // Drinks
  { id: 11, name: 'Fresh Orange Juice', category: 'drinks', price: 1200, rating: 4.7, reviews: 0, description: 'Freshly squeezed oranges, nothing added. Served ice cold.', image: img('1600271886742-f049cd451bba'), ...k },
  { id: 12, name: 'Strawberry Lime Cooler', category: 'drinks', price: 1500, rating: 4.8, reviews: 0, badge: 'Refreshing', description: 'Muddled strawberries, lime and sparkling water over crushed ice.', image: img('1497534446932-c925b458314e'), ...k },
  { id: 13, name: 'Milkshake Trio', category: 'drinks', price: 2500, rating: 4.6, reviews: 0, description: 'Banana, strawberry and caramel shakes, perfect for sharing.', image: img('1505252585461-04db1eb84625'), ...k },
  { id: 14, name: 'Tropical Mocktail', category: 'drinks', price: 1800, rating: 4.5, reviews: 0, description: 'Mango, passion fruit and a squeeze of lime, shaken and chilled.', image: img('1544145945-f90425340c7e'), ...k },
  { id: 15, name: 'Spiced Ginger Iced Tea', category: 'drinks', price: 1300, rating: 4.6, reviews: 0, description: 'Brewed black tea with fresh ginger, honey and a hint of cinnamon.', image: img('1514362545857-3bc16c4c7d1b'), ...k },

  // Desserts
  { id: 16, name: 'Brownie & Ice Cream', category: 'desserts', price: 2500, rating: 4.9, reviews: 0, badge: 'Sweet deal', description: 'Warm fudge brownie, vanilla ice cream and hot chocolate drizzle.', image: img('1624353365286-3f8d62daad51'), ...k },
  { id: 17, name: 'Rainbow Doughnuts', category: 'desserts', price: 1800, rating: 4.7, reviews: 0, description: 'A stack of chocolate-glazed doughnuts covered in sprinkles.', image: img('1551024601-bec78aea704b'), ...k },
  { id: 18, name: 'Raspberry Sponge Cake', category: 'desserts', price: 2200, rating: 4.8, reviews: 0, description: 'Light vanilla sponge layered with raspberry cream.', image: img('1565958011703-44f9829ba187'), ...k },
  { id: 19, name: 'Choc-Chip Cookies', category: 'desserts', price: 1200, rating: 4.6, reviews: 0, description: 'Six chewy cookies loaded with dark chocolate chunks.', image: img('1558961363-fa8fdf82db35'), ...k },
  { id: 20, name: 'Cookies & Cream Sundae', category: 'desserts', price: 2000, rating: 4.7, reviews: 0, description: 'Layers of chocolate mousse, cream and crushed cookies.', image: img('1563805042-7684c019e1cb'), ...k },
];

export const CATEGORIES = [
  { id: 'meals', name: 'Meals', image: img('1588166524941-3bf61a9c41db', 500, 500) },
  { id: 'fast-food', name: 'Fast Food', image: img('1568901346375-23c9450c58cd', 500, 500) },
  { id: 'drinks', name: 'Drinks', image: img('1497534446932-c925b458314e', 500, 500) },
  { id: 'desserts', name: 'Desserts', image: img('1624353365286-3f8d62daad51', 500, 500) },
];

export const ORDER_STATUSES = [
  { id: 'received', label: 'Order Received', short: 'Received', badge: 'warning' },
  { id: 'preparing', label: 'Preparing Food', short: 'Preparing', badge: 'info' },
  { id: 'out-for-delivery', label: 'Out for Delivery', short: 'Out for Delivery', badge: 'primary' },
  { id: 'delivered', label: 'Delivered', short: 'Delivered', badge: 'success' },
];

export const statusInfo = (id) => ORDER_STATUSES.find((s) => s.id === id) || { id, label: id, short: id, badge: 'info' };

export const DELIVERY_FEE = 500;

// Restaurant HQ (Douala, Cameroon)
export const HQ_POS = [4.0511, 9.7085];

export const formatPrice = (amount) =>
  typeof amount === 'number' ? `${amount.toLocaleString()} FCFA` : amount;

export const categoryLabel = (c) =>
  c ? c.replace('-', ' ').replace(/\b\w/g, (m) => m.toUpperCase()) : '';
