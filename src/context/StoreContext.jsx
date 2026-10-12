import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CATALOG, DEFAULT_VENDOR, DELIVERY_FEE, statusInfo } from '../lib/catalog';

const StoreContext = createContext(null);

// ===== localStorage helpers (same keys as the original site) =====
const read = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked */
  }
};

function usePersisted(key, initial) {
  const [value, setValue] = useState(() => read(key, initial));
  useEffect(() => write(key, value), [key, value]);
  return [value, setValue];
}

const LOCAL_PRODUCTS_KEY = 'foodie_local_products';

const normalize = (p) => ({
  ...p,
  vendorId: p.vendorId ?? p.vendor_id,
  vendorName: p.vendorName ?? p.vendor_name,
  rating: p.rating ?? 4.5,
  reviews: p.reviews ?? 0,
});

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}

const genTrackingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'FE-';
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false); // true = products come from Supabase

  const [cart, setCart] = usePersisted('foodie_cart', []);
  const [orders, setOrders] = usePersisted('foodie_orders', []);
  const [reviews, setReviews] = usePersisted('foodie_reviews', []);
  const [users, setUsers] = usePersisted('foodie_users', []);
  const [vendors, setVendors] = usePersisted('foodie_vendors', []);
  const [user, setUser] = usePersisted('foodie_current_user', null);

  const [toasts, setToasts] = useState([]);
  const [flights, setFlights] = useState([]);
  const [cartPulse, setCartPulse] = useState(0);

  // ===== Toasts =====
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  // ===== Products =====
  const loadProducts = useCallback(async () => {
    try {
      const { data, error } = await withTimeout(
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        3500,
      );
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('empty');
      setProducts(data.map(normalize));
      setOnline(true);
    } catch {
      // Supabase unreachable or empty: use the locally stored menu, seeded with the starter catalog.
      setProducts(read(LOCAL_PRODUCTS_KEY, CATALOG).map(normalize));
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const saveLocalProducts = (list) => {
    setProducts(list);
    write(LOCAL_PRODUCTS_KEY, list);
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    if (online) {
      const ext = file.name.split('.').pop();
      const path = `product_images/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('images').upload(path, file);
      if (error) throw error;
      return supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
    }
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  };

  const saveProduct = async ({ id, file, ...fields }) => {
    const image = await uploadImage(file);
    const data = { ...fields };
    if (image) data.image = image;

    if (online) {
      const row = { ...data, vendor_id: data.vendorId, vendor_name: data.vendorName };
      delete row.vendorId;
      delete row.vendorName;
      const q = id ? supabase.from('products').update(row).eq('id', id) : supabase.from('products').insert([row]);
      const { error } = await q;
      if (error) throw error;
      await loadProducts();
    } else if (id) {
      saveLocalProducts(products.map((p) => (p.id === id ? normalize({ ...p, ...data }) : p)));
    } else {
      saveLocalProducts([normalize({ id: Date.now(), rating: 4.5, reviews: 0, image: CATALOG[0].image, ...data }), ...products]);
    }
  };

  const deleteProduct = async (id) => {
    if (online) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((list) => list.filter((p) => p.id !== id));
    } else {
      saveLocalProducts(products.filter((p) => p.id !== id));
    }
  };

  const getProduct = useCallback((id) => products.find((p) => String(p.id) === String(id)), [products]);

  // ===== Cart =====
  const addToCart = (productId, origin) => {
    setCart((c) => {
      const existing = c.find((i) => i.productId === productId);
      return existing
        ? c.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i))
        : [...c, { productId, quantity: 1 }];
    });
    if (origin) {
      const p = getProduct(productId);
      setFlights((f) => [...f, { id: Date.now() + Math.random(), rect: origin, image: p?.image }]);
    } else {
      setCartPulse((n) => n + 1);
    }
    toast('Added to cart! 🛒');
  };
  const landFlight = (id) => {
    setFlights((f) => f.filter((x) => x.id !== id));
    setCartPulse((n) => n + 1);
  };
  const setQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart((c) => c.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  };
  const removeFromCart = (productId) => setCart((c) => c.filter((i) => i.productId !== productId));
  const clearCart = () => setCart([]);

  const cartLines = useMemo(
    () =>
      cart
        .map((i) => ({ ...i, product: products.find((p) => p.id === i.productId) }))
        .filter((l) => l.product),
    [cart, products],
  );
  const cartCount = cartLines.reduce((n, l) => n + l.quantity, 0);
  const cartTotal = cartLines.reduce((n, l) => n + l.product.price * l.quantity, 0);

  // ===== Orders =====
  const createOrder = (customer, deliveryMethod) => {
    const items = cartLines.map((l) => ({ ...l.product, quantity: l.quantity, subtotal: l.product.price * l.quantity }));
    const fee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0;
    const order = {
      id: Date.now(),
      trackingCode: genTrackingCode(),
      items,
      vendorIds: [...new Set(items.map((i) => i.vendorId).filter(Boolean))],
      customer,
      deliveryMethod,
      status: 'received',
      statusHistory: [{ status: 'received', time: new Date().toISOString(), label: 'Order Received' }],
      total: cartTotal + fee,
      deliveryFee: fee,
      estimatedTime: deliveryMethod === 'delivery' ? '30-45 mins' : '15-20 mins',
      createdAt: new Date().toISOString(),
    };
    setOrders((o) => [...o, order]);
    clearCart();
    return order;
  };
  const findOrder = (code) => orders.find((o) => o.trackingCode.toUpperCase() === code.trim().toUpperCase());
  const updateOrderStatus = (orderId, status) => {
    setOrders((list) =>
      list.map((o) =>
        o.id === orderId
          ? { ...o, status, statusHistory: [...o.statusHistory, { status, time: new Date().toISOString(), label: statusInfo(status).label }] }
          : o,
      ),
    );
  };

  // ===== Reviews =====
  const addReview = (review) =>
    setReviews((r) => [{ ...review, id: Date.now(), date: new Date().toISOString().split('T')[0] }, ...r]);

  // ===== Auth =====
  const login = (email, password) => {
    if (email === 'admin@foodieexpress.com' && password === 'admin123') {
      const u = { name: 'Admin', email, role: 'admin' };
      setUser(u);
      return { ok: true, user: u };
    }
    const vendor = vendors.find((v) => v.email === email && v.password === password);
    if (vendor) {
      if (vendor.status !== 'approved') return { ok: false, type: 'warning', message: 'Your vendor account is pending approval.' };
      const u = { name: vendor.name, email: vendor.email, role: 'vendor', vendorId: vendor.id, location: vendor.location };
      setUser(u);
      return { ok: true, user: u };
    }
    const found = users.find((x) => x.email === email && x.password === password);
    if (found) {
      const u = { name: found.name, email: found.email, role: 'user' };
      setUser(u);
      return { ok: true, user: u };
    }
    return { ok: false, type: 'error', message: 'Invalid email or password.' };
  };
  const register = ({ name, email, password }) => {
    if (users.some((u) => u.email === email)) return { ok: false, message: 'An account with this email already exists.' };
    setUsers((u) => [...u, { name, email, password }]);
    return { ok: true };
  };
  const registerVendor = (data) => {
    if (data.email === 'admin@foodieexpress.com') return { ok: false, message: 'Email unavailable.' };
    if (vendors.some((v) => v.email === data.email)) return { ok: false, message: 'A vendor with this email already exists.' };
    setVendors((v) => [...v, { ...data, id: 'vendor_' + Date.now(), status: 'pending', createdAt: new Date().toISOString() }]);
    return { ok: true };
  };
  const setVendorStatus = (vendorId, status) =>
    setVendors((list) => list.map((v) => (v.id === vendorId ? { ...v, status } : v)));
  const logout = () => setUser(null);

  const value = {
    products, loading, online, getProduct, saveProduct, deleteProduct, defaultVendor: DEFAULT_VENDOR,
    cart, cartLines, cartCount, cartTotal, addToCart, setQuantity, removeFromCart, clearCart,
    flights, landFlight, cartPulse,
    orders, createOrder, findOrder, updateOrderStatus,
    reviews, addReview,
    user, vendors, login, register, registerVendor, setVendorStatus, logout,
    toasts, toast, dismissToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(StoreContext);
