import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DELIVERY_FEE, formatPrice } from '../lib/catalog';
import { PageTransition } from '../components/Overlays';
import { PageHeader } from '../components/Layout';
import { onImgError } from '../components/Product';
import { Reveal } from '../components/Motion';

export function AnimatedNumber({ value }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: -18, opacity: 0, scale: 0.6 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 18, opacity: 0, scale: 0.6 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{ display: 'inline-block' }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export default function Cart() {
  const { cartLines, cartCount, cartTotal, setQuantity, removeFromCart, clearCart, toast } = useStore();
  const fee = cartTotal > 0 ? DELIVERY_FEE : 0;

  return (
    <PageTransition>
      <PageHeader label="Your Cart" title="Shopping cart" text="Review your items before checkout." />
      <section className="section pt-0">
        <div className="container">
          <AnimatePresence mode="wait">
            {cartLines.length === 0 ? (
              <motion.div key="empty" className="empty-state" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                <motion.span animate={{ y: [0, -12, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <ShoppingBag size={56} strokeWidth={1.4} />
                </motion.span>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything yet.</p>
                <Link to="/menu" className="btn btn-primary btn-lg">
                  Browse the menu
                </Link>
              </motion.div>
            ) : (
              <motion.div key="full" className="cart-layout" exit={{ opacity: 0, scale: 0.9 }}>
                <div className="cart-items">
                  <AnimatePresence>
                    {cartLines.map(({ product, quantity }, i) => (
                      <motion.div
                        key={product.id}
                        layout
                        className="cart-item"
                        initial={{ opacity: 0, x: -60, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1, transition: { delay: i * 0.06 } }}
                        exit={{ opacity: 0, x: 120, scale: 0.6, transition: { duration: 0.35 } }}
                      >
                        <img src={product.image} alt={product.name} onError={onImgError} />
                        <div className="ci-details">
                          <h4>{product.name}</h4>
                          <span className="ci-price">{formatPrice(product.price)}</span>
                          <div className="qty">
                            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setQuantity(product.id, quantity - 1)} aria-label="Decrease">
                              −
                            </motion.button>
                            <span>
                              <AnimatedNumber value={quantity} />
                            </span>
                            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setQuantity(product.id, quantity + 1)} aria-label="Increase">
                              +
                            </motion.button>
                          </div>
                        </div>
                        <div className="ci-total">
                          <strong>
                            <AnimatedNumber value={formatPrice(product.price * quantity)} />
                          </strong>
                          <motion.button
                            className="remove-btn"
                            whileHover={{ scale: 1.2, rotate: -10 }}
                            onClick={() => {
                              removeFromCart(product.id);
                              toast('Item removed from cart', 'info');
                            }}
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <Reveal variant="zoomIn" className="summary-card">
                  <h3>Order summary</h3>
                  <div className="summary-row">
                    <span>Subtotal ({cartCount} items)</span>
                    <AnimatedNumber value={formatPrice(cartTotal)} />
                  </div>
                  <div className="summary-row">
                    <span>Delivery fee</span>
                    <span>{formatPrice(fee)}</span>
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <AnimatedNumber value={formatPrice(cartTotal + fee)} />
                  </div>
                  <Link to="/checkout" className="btn btn-primary btn-lg btn-block">
                    Proceed to checkout <ArrowRight size={18} />
                  </Link>
                  <button
                    className="link-btn"
                    onClick={() => {
                      clearCart();
                      toast('Cart cleared', 'info');
                    }}
                  >
                    Clear cart
                  </button>
                </Reveal>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageTransition>
  );
}
