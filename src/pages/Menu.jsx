import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, UtensilsCrossed, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, categoryLabel } from '../lib/catalog';
import { PageTransition } from '../components/Overlays';
import { PageHeader } from '../components/Layout';
import { ProductGrid } from '../components/Product';
import { Reveal } from '../components/Motion';

const FILTERS = [{ id: 'all', name: 'All' }, ...CATEGORIES];

export default function Menu() {
  const { products, loading } = useStore();
  const [params, setParams] = useSearchParams();
  const category = params.get('cat') || 'all';
  const [search, setSearch] = useState('');
  const [vendor, setVendor] = useState('all');

  const vendors = useMemo(() => {
    const m = new Map();
    products.forEach((p) => p.vendorId && p.vendorName && m.set(p.vendorId, p.vendorName));
    return [...m];
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (vendor === 'all' || p.vendorId === vendor) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.vendorName || '').toLowerCase().includes(q)),
    );
  }, [products, category, vendor, search]);

  const setCategory = (c) => setParams(c === 'all' ? {} : { cat: c }, { replace: true });
  const reset = () => {
    setCategory('all');
    setSearch('');
    setVendor('all');
  };

  return (
    <PageTransition>
      <PageHeader label="Our Menu" title="Explore our delicious menu" text="From hearty meals to sweet treats, there's something for every craving." />
      <section className="section pt-0">
        <div className="container">
          <Reveal variant="zoomIn" className="menu-toolbar">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dishes, drinks, vendors…" />
              <AnimatePresence>
                {search && (
                  <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} onClick={() => setSearch('')} aria-label="Clear search">
                    <X size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="select">
              <option value="all">All vendors</option>
              {vendors.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </Reveal>

          <Reveal variant="up" delay={0.1} className="filter-pills">
            {FILTERS.map((f) => (
              <button key={f.id} className={`pill ${category === f.id ? 'active' : ''}`} onClick={() => setCategory(f.id)}>
                {category === f.id && <motion.span layoutId="pill-bg" className="pill-bg" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                <span className="pill-text">
                  {f.name}
                </span>
              </button>
            ))}
          </Reveal>

          <motion.p className="results-info" key={`${category}-${filtered.length}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            Showing <strong>{filtered.length}</strong> items in <strong>{category === 'all' ? 'All Categories' : categoryLabel(category)}</strong>
          </motion.p>

          {loading ? (
            <div className="loader-dots"><span /><span /><span /></div>
          ) : filtered.length ? (
            <ProductGrid products={filtered} scope="menu" layout />
          ) : (
            <motion.div className="empty-state" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <UtensilsCrossed size={56} strokeWidth={1.4} />
              </motion.span>
              <h3>No items found</h3>
              <p>Try a different search or category.</p>
              <button className="btn btn-primary" onClick={reset}>
                Reset filters
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
