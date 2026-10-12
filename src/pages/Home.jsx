import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, unsplash } from '../lib/catalog';
import { PageTransition } from '../components/Overlays';
import { SectionHeader } from '../components/Layout';
import { ProductGrid, Stars } from '../components/Product';
import { CountUp, Magnetic, Marquee, Reveal, RevealGroup, RevealItem, SplitWords, ease } from '../components/Motion';

const ORBIT = [
  { img: unsplash('1574071318508-1cdbab80d002', 200, 200), cls: 'o1' },
  { img: unsplash('1568901346375-23c9450c58cd', 200, 200), cls: 'o2' },
  { img: unsplash('1624353365286-3f8d62daad51', 200, 200), cls: 'o3' },
  { img: unsplash('1600271886742-f049cd451bba', 200, 200), cls: 'o4' },
];

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const plateScale = useTransform(scrollYProgress, [0, 1], [1, 1.45]);
  const plateRotate = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  // Wait for the intro splash on first load only.
  const d = useRef(performance.now() < 2500 ? 1.7 : 0.2).current;

  return (
    <section className="hero" ref={ref}>
      <div className="hero-bg">
        <motion.div className="blob b1" animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity }} />
        <motion.div className="blob b2" animate={{ scale: [1.1, 0.9, 1.1], y: [0, -40, 0] }} transition={{ duration: 10, repeat: Infinity }} />
      </div>
      <div className="container hero-grid">
        <motion.div className="hero-content" style={{ y: textY, opacity: fade }}>
          <motion.div
            className="hero-label"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: d + 0.2, type: 'spring', stiffness: 300, damping: 18 }}
          >
            <span className="pulse-dot" /> #1 Food Delivery in Douala
          </motion.div>
          <h1 className="hero-title">
            <SplitWords text="Delicious food," delay={d + 0.25} />
            <br />
            <span className="accent">
              <SplitWords text="delivered fast." delay={d + 0.45} />
            </span>
          </h1>
          <motion.p className="hero-desc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d + 0.7, duration: 0.8, ease }}>
            Craving something amazing? Freshly prepared meals, fast-food favourites, refreshing drinks and irresistible desserts — hot at your door in about 30 minutes.
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d + 0.85, duration: 0.8, ease }}>
            <Magnetic>
              <Link to="/menu" className="btn btn-primary btn-lg">
                Order Now 🍕
              </Link>
            </Magnetic>
            <Magnetic>
              <Link to="/tracking" className="btn btn-ghost btn-lg">
                Track Order 📦
              </Link>
            </Magnetic>
          </motion.div>
          <motion.div className="hero-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d + 1.0 }}>
            {[
              ['10K+', 'Happy customers'],
              ['500+', 'Menu items'],
              ['30min', 'Avg delivery'],
            ].map(([n, l]) => (
              <div key={l} className="hero-stat">
                <strong>
                  <CountUp value={n} />
                </strong>
                <span>{l}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="hero-visual">
          <motion.div
            className="plate-wrap"
            initial={{ scale: 0, rotate: -120, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ delay: d, duration: 1.4, ease }}
          >
            <motion.div style={{ scale: plateScale, rotate: plateRotate }} className="plate-scroll">
              <motion.img
                className="plate"
                src={unsplash('1512621776951-a57141f2eefd', 760, 760)}
                alt="A colourful fresh salad bowl"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
            <div className="plate-ring" />
            <motion.div className="orbit" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}>
              {ORBIT.map((o) => (
                <motion.img
                  key={o.cls}
                  src={o.img}
                  alt=""
                  className={`orbit-item ${o.cls}`}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  whileHover={{ scale: 1.4 }}
                />
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="float-card fc1"
            initial={{ opacity: 0, scale: 0, x: -40 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: [0, -14, 0] }}
            transition={{ delay: d + 0.9, duration: 0.6, y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: d + 1.3 } }}
          >
            <span className="fc-icon green">🚀</span>
            <div>
              <strong>Fast Delivery</strong>
              <span>Under 30 minutes</span>
            </div>
          </motion.div>
          <motion.div
            className="float-card fc2"
            initial={{ opacity: 0, scale: 0, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: [0, 14, 0] }}
            transition={{ delay: d + 1.1, duration: 0.6, y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: d + 1.5 } }}
          >
            <span className="fc-icon orange">⭐</span>
            <div>
              <strong>Top Rated</strong>
              <span>Loved across Douala</span>
            </div>
          </motion.div>
        </div>
      </div>
      <motion.div className="scroll-hint" style={{ opacity: fade }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d + 1.3 }}>
        <motion.span animate={{ y: [0, 10, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />
      </motion.div>
    </section>
  );
}

function Categories() {
  const { products } = useStore();
  return (
    <section className="section">
      <div className="container">
        <SectionHeader label="Categories" title="Browse by category" text="Find exactly what you're craving from our curated collection" />
        <RevealGroup className="category-grid" stagger={0.12}>
          {CATEGORIES.map((c) => (
            <RevealItem key={c.id} variant="zoomIn">
              <Link to={`/menu?cat=${c.id}`} className="category-card">
                <motion.img src={c.image} alt="" className="cat-bg" />
                <div className="cat-shade" />
                <span className="cat-icon">{c.icon}</span>
                <div className="cat-text">
                  <div className="cat-name">{c.name}</div>
                  <div className="cat-count">{products.filter((p) => p.category === c.id).length} items →</div>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function ZoomShowcase() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });
  const scale = useTransform(smooth, [0, 0.5], [0.55, 1]);
  const radius = useTransform(smooth, [0, 0.5], [200, 28]);
  const imgScale = useTransform(smooth, [0, 1], [1.5, 1]);
  const textScale = useTransform(smooth, [0.25, 0.5], [0.6, 1]);
  const textOpacity = useTransform(smooth, [0.25, 0.45], [0, 1]);

  return (
    <section className="zoom-showcase" ref={ref}>
      <motion.div className="zoom-frame" style={{ scale, borderRadius: radius }}>
        <motion.img src={unsplash('1555939594-58d7cb561ad1', 1600, 900)} alt="Grilled skewers and vegetables" style={{ scale: imgScale }} />
        <div className="zoom-shade" />
        <motion.div className="zoom-text" style={{ scale: textScale, opacity: textOpacity }}>
          <span className="section-label light">Fresh every day</span>
          <h2>
            Cooked fresh.
            <br />
            <em>Delivered hot.</em>
          </h2>
          <p>Every order is prepared the moment you place it, by chefs who care about every plate.</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Popular() {
  const { products, loading } = useStore();
  const popular = useMemo(() => [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8), [products]);
  return (
    <section className="section">
      <div className="container">
        <SectionHeader label="Top Picks" title="Most popular right now" text="Customer favourites that keep them coming back. Tap any dish for a closer look." />
        {loading ? <div className="loader-dots"><span /><span /><span /></div> : <ProductGrid products={popular} scope="home" />}
        <Reveal variant="zoomIn" className="center mt-xl">
          <Magnetic>
            <Link to="/menu" className="btn btn-dark btn-lg">
              View full menu →
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

function HowItWorks() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  const line = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const steps = [
    ['🍽️', 'Browse menu', 'Explore our selection of meals, fast food, drinks and desserts.'],
    ['🛒', 'Place order', 'Add items to your cart, choose delivery or pickup, and checkout.'],
    ['🛵', 'Track & enjoy', 'Get a tracking code, follow your rider live on the map, and enjoy!'],
  ];
  return (
    <section className="section how" ref={ref}>
      <div className="container">
        <SectionHeader label="How it works" title="Ordering made easy" text="Three simple steps between you and something delicious" />
        <div className="steps">
          <div className="steps-line">
            <motion.div className="steps-line-fill" style={{ scaleX: line }} />
          </div>
          {steps.map(([icon, title, text], i) => (
            <Reveal key={title} variant="pop" delay={i * 0.18} className="step">
              <motion.div className="step-icon" whileHover={{ scale: 1.2, rotate: 10 }}>
                {icon}
                <span className="step-num">{i + 1}</span>
              </motion.div>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { reviews } = useStore();
  const top = reviews.slice(0, 3);
  return (
    <section className="section testimonials">
      <div className="container">
        <SectionHeader label="Testimonials" title="What our customers say" text="Real reviews from real food lovers" />
        {top.length ? (
          <RevealGroup className="testimonial-grid" stagger={0.15}>
            {top.map((r) => (
              <RevealItem key={r.id} variant="flip" className="testimonial-card">
                <Stars rating={r.rating} />
                <p>“{r.comment}”</p>
                <div className="t-author">
                  <span className="avatar">{r.avatar || r.name[0]}</span>
                  <div>
                    <strong>{r.name}</strong>
                    {r.product && <span>Ordered: {r.product}</span>}
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <Reveal variant="zoomIn" className="empty-reviews">
            <span>⭐</span>
            <p>No reviews yet — be the first to tell us what you think.</p>
            <Link to="/reviews" className="btn btn-primary">
              Write a review
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="section">
      <div className="container cta-grid">
        <Reveal variant="zoomOut" className="cta-box red">
          <motion.span className="cta-emoji" animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
            🍕
          </motion.span>
          <h2>Hungry? Order now!</h2>
          <p>
            Free delivery on your first order. Use code <strong>WELCOME</strong>
          </p>
          <Magnetic>
            <Link to="/menu" className="btn btn-light btn-lg">
              Explore our menu 🍽️
            </Link>
          </Magnetic>
        </Reveal>
        <Reveal variant="zoomOut" delay={0.15} className="cta-box gold">
          <motion.span className="cta-emoji" animate={{ y: [0, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
            🏪
          </motion.span>
          <h2>Own a restaurant?</h2>
          <p>Join FoodieExpress as a vendor and reach thousands of hungry customers in your area.</p>
          <Magnetic>
            <Link to="/login#vendor" className="btn btn-light btn-lg">
              Apply as vendor →
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <PageTransition>
      <Hero />
      <div className="ticker">
        <Marquee items={['🍛 Suya platters', '🍔 Juicy burgers', '🍕 Wood-fired pizza', '🥤 Fresh juices', '🍰 Sweet treats', '🍗 Crispy chicken', '🛵 30-min delivery']} speed={35} />
      </div>
      <Categories />
      <ZoomShowcase />
      <Popular />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </PageTransition>
  );
}
