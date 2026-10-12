import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { useStore } from '../context/StoreContext';
import { DELIVERY_FEE, HQ_POS, formatPrice } from '../lib/catalog';
import { PageTransition } from '../components/Overlays';
import { PageHeader } from '../components/Layout';
import { Modal, onImgError } from '../components/Product';
import { LeafletMap, emojiIcon, geocode } from '../components/LeafletMap';
import { Reveal, RevealGroup, RevealItem } from '../components/Motion';
import { AnimatedNumber } from './Cart';

function Confetti() {
  const bits = ['🎉', '🍔', '🍕', '✨', '🥤', '🍰', '⭐', '🍗'];
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: Math.cos(angle) * 220, y: Math.sin(angle) * 180, scale: [0, 1.4, 1], opacity: [1, 1, 0], rotate: 360 }}
            transition={{ duration: 1.6, ease: 'easeOut', delay: 0.15 }}
          >
            {bits[i % bits.length]}
          </motion.span>
        );
      })}
    </div>
  );
}

export default function Checkout() {
  const { user, cartLines, cartTotal, createOrder, toast } = useStore();
  const navigate = useNavigate();
  const [method, setMethod] = useState('delivery');
  const [form, setForm] = useState({ name: user?.name || '', phone: '', email: user?.email || '', address: '' });
  const [mapStatus, setMapStatus] = useState({ text: '📍 Type your address to see it on the map', tone: '' });
  const [placed, setPlaced] = useState(null);
  const mapRef = useRef({});

  const fee = method === 'delivery' ? DELIVERY_FEE : 0;
  const allowed = user?.role === 'user';

  useEffect(() => {
    if (!allowed && !placed) {
      toast('Only registered customers can purchase food. Please log in.', 'error');
      const t = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(t);
    }
  }, [allowed]); // eslint-disable-line react-hooks/exhaustive-deps

  const placeCustomer = (pos) => {
    const m = mapRef.current;
    if (!m.map) return;
    if (m.customer) m.customer.setLatLng(pos);
    else m.customer = L.marker(pos, { icon: emojiIcon('📍', 28, true) }).addTo(m.map);
    m.customer.bindPopup('<b>📦 Your delivery location</b>').openPopup();
    if (m.route) m.map.removeLayer(m.route);
    m.route = L.polyline([HQ_POS, pos], { color: '#E63946', weight: 3, dashArray: '8, 8', opacity: 0.8 }).addTo(m.map);
    m.map.flyToBounds(L.latLngBounds([HQ_POS, pos]), { padding: [40, 40], maxZoom: 15, duration: 1.2 });
  };

  // The map container changes size when the address section expands
  useEffect(() => {
    const t = setTimeout(() => mapRef.current.map?.invalidateSize(), 450);
    return () => clearTimeout(t);
  }, [method]);

  // Geocode the address as the customer types
  useEffect(() => {
    const q = form.address.trim();
    if (q.length < 4) {
      setMapStatus({ text: '📍 Type your address to see it on the map', tone: '' });
      return;
    }
    setMapStatus({ text: '🔍 Locating your address…', tone: '' });
    const t = setTimeout(async () => {
      try {
        const r = await geocode(q);
        if (!r) return setMapStatus({ text: "⚠️ Could not pinpoint address — we'll still deliver!", tone: 'warn' });
        placeCustomer(r.pos);
        setMapStatus({ text: `✅ Address found — ${r.name.split(',').slice(0, 2).join(',')}`, tone: 'ok' });
      } catch {
        setMapStatus({ text: '⚠️ Map service unavailable', tone: 'warn' });
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [form.address]);

  const submit = (e) => {
    e.preventDefault();
    const { name, phone, email, address } = form;
    if (!name.trim() || !phone.trim() || !email.trim()) return toast('Please fill in all required fields.', 'error');
    if (method === 'delivery' && !address.trim()) return toast('Please enter your delivery address.', 'error');
    const order = createOrder({ name: name.trim(), phone: phone.trim(), email: email.trim(), address: address.trim() }, method);
    setPlaced(order);
    toast('Order placed successfully! 🎉');
  };

  const field = (key) => ({ value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) });

  if (!placed && (cartLines.length === 0 || !allowed)) {
    return (
      <PageTransition>
        <PageHeader label="Checkout" title="Checkout" />
        <section className="section pt-0">
          <div className="container">
            <motion.div className="empty-state" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}>
              <span>{allowed ? '🛒' : '🔐'}</span>
              <h3>{allowed ? 'Nothing to check out' : 'Please sign in first'}</h3>
              <p>{allowed ? 'Your cart is empty. Add some delicious items first!' : 'Only registered customers can place orders. Redirecting you to sign in…'}</p>
              <Link to={allowed ? '/menu' : '/login'} className="btn btn-primary btn-lg">
                {allowed ? 'Browse menu' : 'Sign in'}
              </Link>
            </motion.div>
          </div>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageHeader label="Checkout" title="Almost there!" text="Tell us where to bring your food." />
      <section className="section pt-0">
        <div className="container checkout-layout">
          <Reveal as="form" variant="left" className="card checkout-form" onSubmit={submit}>
            <h3>Delivery method</h3>
            <div className="method-toggle">
              {[
                ['delivery', '🛵', 'Delivery', `${formatPrice(DELIVERY_FEE)} · 30-45 min`],
                ['pickup', '🏪', 'Pickup', 'Free · 15-20 min'],
              ].map(([id, icon, label, sub]) => (
                <motion.button
                  type="button"
                  key={id}
                  className={`method ${method === id ? 'selected' : ''}`}
                  onClick={() => setMethod(id)}
                  whileTap={{ scale: 0.95 }}
                >
                  {method === id && <motion.span layoutId="method-bg" className="method-bg" />}
                  <span className="method-icon">{icon}</span>
                  <strong>{label}</strong>
                  <small>{sub}</small>
                </motion.button>
              ))}
            </div>

            <h3>Your details</h3>
            <RevealGroup className="form-grid" stagger={0.06}>
              <RevealItem className="form-group">
                <label htmlFor="name">Full name *</label>
                <input id="name" className="input" placeholder="John Doe" {...field('name')} />
              </RevealItem>
              <RevealItem className="form-group">
                <label htmlFor="phone">Phone *</label>
                <input id="phone" className="input" placeholder="+237 6XX XXX XXX" {...field('phone')} />
              </RevealItem>
              <RevealItem className="form-group full">
                <label htmlFor="email">Email *</label>
                <input id="email" type="email" className="input" placeholder="john@example.com" {...field('email')} />
              </RevealItem>
            </RevealGroup>

            <motion.div
              initial={false}
              animate={{ height: method === 'delivery' ? 'auto' : 0, opacity: method === 'delivery' ? 1 : 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="form-group">
                <label htmlFor="address">Delivery address *</label>
                <input id="address" className="input" placeholder="e.g. Akwa, Douala" {...field('address')} />
              </div>
              <LeafletMap
                className="map map-checkout"
                onReady={(map) => {
                  mapRef.current.map = map;
                  L.marker(HQ_POS, { icon: emojiIcon('🍔', 28) })
                    .addTo(map)
                    .bindPopup('<b>🏪 FoodieExpress Kitchen</b><br>Your food is prepared here!')
                    .openPopup();
                }}
              />
              <p className={`map-status ${mapStatus.tone}`}>{mapStatus.text}</p>
            </motion.div>

            <motion.button type="submit" className="btn btn-primary btn-lg btn-block" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              Place order · {formatPrice(cartTotal + fee)}
            </motion.button>
          </Reveal>

          <Reveal variant="right" className="card summary-card sticky">
            <h3>Order summary</h3>
            <div className="summary-items">
              {cartLines.map(({ product, quantity }) => (
                <div className="summary-item" key={product.id}>
                  <img src={product.image} alt="" onError={onImgError} />
                  <div>
                    <strong>{product.name}</strong>
                    <span>Qty: {quantity}</span>
                  </div>
                  <span>{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <AnimatedNumber value={formatPrice(fee)} />
            </div>
            <div className="summary-total">
              <span>Total</span>
              <AnimatedNumber value={formatPrice(cartTotal + fee)} />
            </div>
          </Reveal>
        </div>
      </section>

      <Modal open={!!placed} onClose={() => navigate('/')} className="success-modal">
        <Confetti />
        <motion.div className="success-icon" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.2 }}>
          ✓
        </motion.div>
        <h2>Order placed!</h2>
        <p>Your food is being prepared. Save this tracking code:</p>
        <motion.div className="tracking-code" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }}>
          {placed?.trackingCode}
        </motion.div>
        <div className="modal-actions">
          <Link to={`/tracking?code=${placed?.trackingCode}`} className="btn btn-primary">
            Track order 📦
          </Link>
          <Link to="/" className="btn btn-ghost">
            Back home
          </Link>
        </div>
      </Modal>
    </PageTransition>
  );
}
