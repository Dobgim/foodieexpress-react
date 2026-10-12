import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Clock, Crown, Mail, MapPin, MessageCircle, Phone, Send, ShoppingBag, Store, User, UtensilsCrossed, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Reveal, RevealGroup, RevealItem, ease } from './Motion';

const LINKS = [
  ['/', 'Home'],
  ['/menu', 'Menu'],
  ['/reviews', 'Reviews'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
  ['/tracking', 'Track Order'],
];

export function Logo() {
  return (
    <Link to="/" className="logo">
      <motion.span className="logo-icon" whileHover={{ rotate: [0, -15, 15, 0], scale: 1.15 }} transition={{ duration: 0.5 }}>
        <UtensilsCrossed size={20} strokeWidth={2.2} />
      </motion.span>
      <span>
        Foodie<em>Express</em>
      </span>
    </Link>
  );
}

export function Navbar() {
  const { cartCount, cartPulse, user, logout, toast } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > prev && y > 300 && !open);
  });

  useEffect(() => setOpen(false), [pathname]);

  const account =
    user?.role === 'admin'
      ? { to: '/admin', label: 'Admin', Icon: Crown }
      : user?.role === 'vendor'
        ? { to: '/vendor', label: 'Vendor', Icon: Store }
        : user
          ? { to: '#', label: user.name.split(' ')[0], Icon: User }
          : { to: '/login', label: 'Sign in', Icon: User };
  const AccountIcon = account.Icon;

  const onAccount = (e) => {
    if (user?.role === 'user') {
      e.preventDefault();
      if (confirm('Logout of your account?')) {
        logout();
        toast('You have been logged out.');
      }
    }
  };

  return (
    <motion.header
      className={`navbar ${scrolled || pathname === '/login' ? 'scrolled' : ''}`}
      animate={{ y: hidden ? '-110%' : '0%' }}
      transition={{ duration: 0.35, ease }}
    >
      <div className="container nav-inner">
        <Logo />
        <nav className="nav-links">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className="nav-link">
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <Link to="/cart" className="nav-cart" data-cart-icon aria-label="Cart">
            <motion.span key={cartPulse} animate={{ scale: [1, 1.45, 0.9, 1], rotate: [0, -14, 10, 0] }} transition={{ duration: 0.5 }}>
              <ShoppingBag size={20} strokeWidth={1.8} />
            </motion.span>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  className="cart-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <Link to={account.to} onClick={onAccount} className="nav-account">
            <AccountIcon size={16} strokeWidth={2} />
            {account.label}
          </Link>
          <button className={`nav-toggle ${open ? 'active' : ''}`} onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ clipPath: 'circle(0% at 92% 4%)' }}
            animate={{ clipPath: 'circle(150% at 92% 4%)' }}
            exit={{ clipPath: 'circle(0% at 92% 4%)' }}
            transition={{ duration: 0.6, ease }}
          >
            <RevealGroup stagger={0.07} delay={0.15} amount={0}>
              {LINKS.map(([to, label]) => (
                <RevealItem key={to} variant="zoomIn">
                  <NavLink to={to} end={to === '/'} className="mobile-link">
                    {label}
                  </NavLink>
                </RevealItem>
              ))}
              <RevealItem variant="zoomIn">
                <Link to={account.to} onClick={onAccount} className="mobile-link small">
                  <AccountIcon size={18} /> {account.label}
                </Link>
              </RevealItem>
            </RevealGroup>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

const socials = {
  Facebook: 'M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z',
  Instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  X: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  TikTok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v8.1c0 2.21-.6 4.41-1.95 6.1-1.35 1.68-3.4 2.76-5.59 2.94-2.22.18-4.52-.36-6.3-1.66-1.78-1.28-2.92-3.18-3.32-5.32-.42-2.14-.02-4.4.19-6.52.2-2.1 1.34-3.95 3-5.26 1.66-1.31 3.8-1.89 5.86-1.66.01 1.34.01 2.68.01 4.02-1.02-.13-2.1-.03-3.03.41-.93.44-1.64 1.23-2 2.15-.36.93-.41 1.99-.18 2.94.23.97.77 1.83 1.51 2.45.74.62 1.73.96 2.68.96.96 0 1.93-.33 2.68-.94.75-.6 1.31-1.47 1.52-2.43.21-.97.14-2.02-.12-2.96-.06-.17-.11-.34-.18-.51-.01-5.04-.01-10.08-.01-15.12z',
};

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="container">
        <Reveal variant="zoomOut" className="footer-big">
          Hungry<em>?</em>
        </Reveal>
        <RevealGroup className="footer-grid" stagger={0.12}>
          <RevealItem className="footer-brand">
            <Logo />
            <p>Delivering delicious meals right to your doorstep. Fresh ingredients, amazing flavors, and lightning-fast delivery.</p>
            <div className="footer-socials">
              {Object.entries(socials).map(([name, d]) => (
                <motion.a key={name} href="#" title={name} whileHover={{ y: -5, scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d={d} />
                  </svg>
                </motion.a>
              ))}
            </div>
          </RevealItem>
          <RevealItem className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/menu">Our Menu</Link>
            <Link to="/about">About Us</Link>
            <Link to="/reviews">Reviews</Link>
            <Link to="/contact">Contact</Link>
          </RevealItem>
          <RevealItem className="footer-col">
            <h4>Support</h4>
            <Link to="/tracking">Track Order</Link>
            <Link to="/cart">My Cart</Link>
            <Link to="/login">My Account</Link>
            <Link to="/login#vendor">Become a Vendor</Link>
          </RevealItem>
          <RevealItem className="footer-col">
            <h4>Contact</h4>
            <span className="footer-contact">
              <MapPin size={16} /> 123 Food Street, Flavor City
            </span>
            <span className="footer-contact">
              <Phone size={16} /> +1 (555) 123-4567
            </span>
            <span className="footer-contact">
              <Mail size={16} /> hello@foodieexpress.com
            </span>
            <span className="footer-contact">
              <Clock size={16} /> Open daily, 8 AM – 11 PM
            </span>
          </RevealItem>
        </RevealGroup>
        <div className="footer-bottom">
          <p>© 2026 FoodieExpress. All rights reserved.</p>
          <p>Fresh food, delivered across Douala.</p>
        </div>
      </div>
    </footer>
  );
}

export function PageHeader({ label, title, text, children }) {
  return (
    <section className="page-header">
      <div className="ph-blob a" />
      <div className="ph-blob b" />
      <div className="container">
        <Reveal variant="zoomIn" className="section-label">
          {label}
        </Reveal>
        <Reveal as="h1" variant="blur" delay={0.1} className="display">
          {title}
        </Reveal>
        {text && (
          <Reveal as="p" delay={0.2}>
            {text}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

export function SectionHeader({ label, title, text }) {
  return (
    <div className="section-header">
      <Reveal variant="zoomIn" className="section-label">
        {label}
      </Reveal>
      <Reveal as="h2" variant="up" delay={0.08} className="heading">
        {title}
      </Reveal>
      {text && (
        <Reveal as="p" delay={0.16}>
          {text}
        </Reveal>
      )}
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi, welcome to FoodieExpress. How can we help you today?' },
  ]);
  const bodyRef = useRef(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    setInput('');
    const lower = text.toLowerCase();
    const reply =
      lower.includes('order') || lower.includes('track')
        ? "If you're asking about an order, please make sure you have your tracking code ready and visit our Track Order page!"
        : lower.includes('delivery')
          ? 'Delivery usually takes 30-45 minutes. You can track your rider directly on the Tracking page!'
          : lower.includes('vendor')
            ? 'Want to open a storefront? Head to Sign in and choose the Vendor tab to apply!'
            : 'Thanks for reaching out! One of our support agents will be right with you.';
    setTimeout(() => setMessages((m) => [...m, { from: 'bot', text: reply }]), 1000);
  };

  return (
    <div className="chat-widget">
      <AnimatePresence>
        {open && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, scale: 0.3, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="chat-header">
              <div>
                <strong>FoodieExpress Support</strong>
                <span>
                  <i className="live-dot" /> Online
                </span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat">
                <X size={18} />
              </button>
            </div>
            <div className="chat-body" ref={bodyRef}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  className={`chat-message ${m.from}`}
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {m.text}
                </motion.div>
              ))}
            </div>
            <div className="chat-footer">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a message..." />
              <button onClick={send} aria-label="Send">
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        className="chat-toggle"
        onClick={() => setOpen((o) => !o)}
        animate={{ scale: open ? 0.85 : 1, rotate: open ? 90 : 0 }}
        whileHover={{ scale: 1.1 }}
        aria-label="Chat with support"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
      <motion.a
        href="https://wa.me/237670874649?text=Hello%20FoodieExpress!"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn"
        title="Chat with us on WhatsApp"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring' }}
        whileHover={{ scale: 1.12, rotate: 8 }}
      >
        <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </motion.a>
    </div>
  );
}
