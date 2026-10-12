import { createElement, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import L from 'leaflet';
import { Bike, Check, ChefHat, ClipboardList, PackageCheck, Search, Timer } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { HQ_POS, ORDER_STATUSES, formatPrice, statusInfo } from '../lib/catalog';
import { PageTransition } from '../components/Overlays';
import { PageHeader } from '../components/Layout';
import { LeafletMap, geocode, mapIcon } from '../components/LeafletMap';
import { Reveal, ease } from '../components/Motion';

const STATUS_ICONS = { received: ClipboardList, preparing: ChefHat, 'out-for-delivery': Bike, delivered: PackageCheck };

function TrackingMap({ order }) {
  const [label, setLabel] = useState('');

  return (
    <div className="card">
      <h3>Live map</h3>
      <LeafletMap
        key={order.id + order.status}
        className="map map-tracking"
        onReady={(map) => {
          let timer;
          let cancelled = false;
          if (order.deliveryMethod === 'pickup') {
            setLabel('Pickup at FoodieExpress Headquarters');
            L.marker(HQ_POS, { icon: mapIcon('store') }).addTo(map).bindPopup('<b>FoodieExpress HQ</b><br>Ready for pickup.').openPopup();
            map.setView(HQ_POS, 15);
            return;
          }
          setLabel('Locating destination…');
          geocode(order.customer.address)
            .catch(() => null)
            .then((r) => {
              if (cancelled) return;
              const dest = r?.pos || [4.055, 9.71];
              L.marker(dest, { icon: mapIcon('home') }).addTo(map).bindPopup(`<b>Destination</b><br>${order.customer.address}`);
              L.polyline([HQ_POS, dest], { color: '#E63946', weight: 4, dashArray: '8, 8', opacity: 0.6 }).addTo(map);
              map.fitBounds(L.latLngBounds([HQ_POS, dest]), { padding: [40, 40] });

              if (order.status === 'received' || order.status === 'preparing') {
                setLabel(`Food is being prepared… Destination: ${order.customer.address}`);
                L.marker(HQ_POS, { icon: mapIcon('store') }).addTo(map).bindPopup('<b>Preparing food at HQ</b>').openPopup();
              } else if (order.status === 'out-for-delivery') {
                setLabel(`Rider is on the way to: ${order.customer.address}`);
                const rider = L.marker(HQ_POS, { icon: mapIcon('rider', 40) }).addTo(map).bindPopup('<b>Rider is moving!</b>').openPopup();
                let t = 0;
                timer = setInterval(() => {
                  t = t >= 1 ? 0 : t + 0.005;
                  rider.setLatLng([HQ_POS[0] + (dest[0] - HQ_POS[0]) * t, HQ_POS[1] + (dest[1] - HQ_POS[1]) * t]);
                }, 100);
              } else {
                setLabel(`Delivered safely to: ${order.customer.address}`);
                L.marker(dest, { icon: mapIcon('done') }).addTo(map).bindPopup('<b>Delivered!</b>').openPopup();
              }
            });
          return () => {
            cancelled = true;
            clearInterval(timer);
          };
        }}
      />
      <p className="map-status">{label}</p>
    </div>
  );
}

function Result({ order }) {
  const idx = ORDER_STATUSES.findIndex((s) => s.id === order.status);
  const info = statusInfo(order.status);
  return (
    <motion.div
      className="tracking-result"
      initial={{ opacity: 0, scale: 0.85, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6, ease }}
    >
      <div className="card">
        <div className="tr-head">
          <div>
            <span className="muted">Tracking code</span>
            <h2 className="mono">{order.trackingCode}</h2>
            <span className="muted">Ordered: {new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <motion.span className={`badge badge-${info.badge}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring' }}>
            {info.label}
          </motion.span>
        </div>

        <div className="timeline">
          <div className="timeline-track">
            <motion.div
              className="timeline-fill"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: idx / (ORDER_STATUSES.length - 1) }}
              transition={{ duration: 1.2, delay: 0.4, ease }}
            />
          </div>
          {ORDER_STATUSES.map((s, i) => (
            <motion.div
              key={s.id}
              className={`tl-step ${i < idx ? 'done' : ''} ${i === idx ? 'active' : ''}`}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.25, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <span className="tl-dot">{i < idx ? <Check size={20} strokeWidth={2.5} /> : createElement(STATUS_ICONS[s.id], { size: 20 })}</span>
              <span className="tl-label">{s.label}</span>
            </motion.div>
          ))}
        </div>
        <p className="est">
          <Timer size={16} /> Estimated: {order.estimatedTime}
        </p>

        <div className="tr-details">
          <div>
            <h4>Customer</h4>
            <p>{order.customer.name}</p>
            <span className="muted">{order.customer.phone}</span>
          </div>
          <div>
            <h4>Delivery method</h4>
            <p>{order.deliveryMethod === 'delivery' ? 'Home delivery' : 'Pickup'}</p>
            <span className="muted">{order.customer.address || 'Pickup in store'}</span>
          </div>
        </div>

        <div className="tr-items">
          <h4>Items</h4>
          {order.items.map((it) => (
            <div key={it.id} className="summary-row">
              <span>
                {it.quantity}× {it.name}
              </span>
              <span>{formatPrice(it.subtotal)}</span>
            </div>
          ))}
          <div className="summary-total">
            <span>Total paid</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
      <TrackingMap order={order} />
    </motion.div>
  );
}

export default function Tracking() {
  const { findOrder, orders, toast } = useStore();
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(params.get('code') || '');
  const [query, setQuery] = useState(params.get('code') || '');
  const inputRef = useRef(null);

  // Re-read the order on every render so status changes made by admin show up.
  const order = query ? findOrder(query) : null;

  useEffect(() => {
    if (!params.get('code')) inputRef.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const track = () => {
    const c = code.trim().toUpperCase();
    if (!c) return toast('Please enter a tracking code.', 'warning');
    setQuery(c);
    setParams({ code: c }, { replace: true });
  };

  return (
    <PageTransition>
      <PageHeader label="Order Tracking" title="Where's my food?" text="Enter your tracking code to follow your order in real time.">
        <Reveal variant="zoomIn" delay={0.3} className="track-box">
          <input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && track()}
            placeholder="e.g. FE-AB12CD34"
            className="mono"
          />
          <motion.button className="btn btn-primary" onClick={track} whileTap={{ scale: 0.93 }}>
            Track
          </motion.button>
        </Reveal>
      </PageHeader>
      <section className="section pt-0">
        <div className="container">
          <AnimatePresence mode="wait">
            {order ? (
              <Result key={order.trackingCode} order={order} />
            ) : query ? (
              <motion.div key="nf" className="empty-state" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                <motion.span animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Search size={56} strokeWidth={1.4} />
                </motion.span>
                <h3>Order not found</h3>
                <p>We couldn't find an order with that code. Please check and try again.</p>
              </motion.div>
            ) : orders.length ? (
              <motion.div key="recent" className="recent-codes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="muted">Your recent orders:</span>
                {orders.slice(-4).reverse().map((o) => (
                  <motion.button
                    key={o.id}
                    className="chip mono"
                    whileHover={{ scale: 1.08 }}
                    onClick={() => {
                      setCode(o.trackingCode);
                      setQuery(o.trackingCode);
                      setParams({ code: o.trackingCode }, { replace: true });
                    }}
                  >
                    {o.trackingCode}
                  </motion.button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </PageTransition>
  );
}
