import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { FALLBACK_IMAGE, categoryLabel, formatPrice } from '../lib/catalog';
import { Tilt, ease } from './Motion';

export function Stars({ rating = 0, size }) {
  return (
    <span className="stars" style={size ? { fontSize: size } : undefined} aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(rating) ? 'star filled' : 'star'}>
          ★
        </span>
      ))}
    </span>
  );
}

export const onImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
};

function AddButton({ product, big }) {
  const { addToCart } = useStore();
  return (
    <motion.button
      className={big ? 'btn btn-primary btn-lg' : 'add-btn'}
      whileHover={{ scale: big ? 1.04 : 1.15, rotate: big ? 0 : 90 }}
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.stopPropagation();
        addToCart(product.id, e.currentTarget.getBoundingClientRect());
      }}
      aria-label={`Add ${product.name} to cart`}
    >
      {big ? `Add to cart · ${formatPrice(product.price)}` : '+'}
    </motion.button>
  );
}

export function ProductCard({ product, scope = 'grid', onOpen }) {
  return (
    <Tilt className="product-card" max={7}>
      <div className="card-media" onClick={() => onOpen?.(product)}>
        {product.badge && <span className="card-badge">{product.badge}</span>}
        <motion.img
          layoutId={`${scope}-img-${product.id}`}
          src={product.image}
          alt={product.name}
          onError={onImgError}
          loading="lazy"
        />
        <span className="card-zoom-hint">Quick view</span>
      </div>
      <div className="card-body">
        <span className="card-category">{categoryLabel(product.category)}</span>
        <h3 className="card-title" onClick={() => onOpen?.(product)}>
          {product.name}
        </h3>
        {product.vendorName && <div className="card-vendor">by {product.vendorName}</div>}
        <div className="card-rating">
          <Stars rating={product.rating} />
          <span>{product.rating}</span>
        </div>
        <div className="card-footer">
          <span className="card-price">{formatPrice(product.price)}</span>
          <AddButton product={product} />
        </div>
      </div>
    </Tilt>
  );
}

export function Modal({ open, onClose, children, className = '' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`modal ${className}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.6, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <button className="modal-close" onClick={onClose} aria-label="Close">
              ×
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Product grid where clicking a card zooms its image into a detail view. */
export function ProductGrid({ products, scope = 'grid', layout = false }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => e.key === 'Escape' && setActive(null);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active]);

  return (
    <>
      <motion.div className="product-grid" layout={layout}>
        <AnimatePresence mode="popLayout">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              layout={layout}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
              transition={{ duration: 0.6, ease, delay: (i % 4) * 0.08 }}
            >
              <ProductCard product={p} scope={scope} onOpen={setActive} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {active && (
            <motion.div
              className="modal-overlay"
              onClick={() => setActive(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div className="modal quick-view" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setActive(null)} aria-label="Close">
                  ×
                </button>
                <div className="qv-media">
                  <motion.img
                    layoutId={`${scope}-img-${active.id}`}
                    src={active.image}
                    alt={active.name}
                    onError={onImgError}
                    transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                  />
                </div>
                <motion.div
                  className="qv-body"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.5, ease } }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                >
                  <span className="card-category">{categoryLabel(active.category)}</span>
                  <h2>{active.name}</h2>
                  {active.vendorName && <div className="card-vendor">by {active.vendorName}</div>}
                  <div className="card-rating">
                    <Stars rating={active.rating} /> <span>{active.rating}</span>
                  </div>
                  <p>{active.description}</p>
                  <div className="qv-price">{formatPrice(active.price)}</div>
                  <AddButton product={active} big />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
