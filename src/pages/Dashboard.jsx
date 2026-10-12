import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, ORDER_STATUSES, formatPrice, statusInfo } from '../lib/catalog';
import { PageTransition } from '../components/Overlays';
import { Logo } from '../components/Layout';
import { Modal, Stars, onImgError } from '../components/Product';
import { CountUp, ease } from '../components/Motion';

function StatusSelect({ value, onChange }) {
  return (
    <select className="select sm" value={value} onChange={(e) => onChange(e.target.value)}>
      {ORDER_STATUSES.map((s) => (
        <option key={s.id} value={s.id}>
          {s.short}
        </option>
      ))}
    </select>
  );
}

const Badge = ({ status }) => {
  const s = statusInfo(status);
  return <span className={`badge badge-${s.badge}`}>{s.short}</span>;
};

function Table({ head, rows, empty }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((cells, i) => (
              <motion.tr key={cells.key ?? i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                {cells.cols.map((c, j) => (
                  <td key={j}>{c}</td>
                ))}
              </motion.tr>
            ))
          ) : (
            <tr>
              <td colSpan={head.length} className="table-empty">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ProductForm({ product, onSave, onClose }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'meals',
    price: product?.price ?? '',
    description: product?.description || '',
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const preview = file ? URL.createObjectURL(file) : product?.image;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, price: parseFloat(form.price), file });
      onClose();
    } finally {
      setSaving(false);
    }
  };
  const field = (key) => ({ value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) });

  return (
    <form onSubmit={submit} className="product-form">
      <h2>{product ? 'Edit product' : 'Add product'}</h2>
      <div className="form-group">
        <label htmlFor="p-name">Name *</label>
        <input id="p-name" className="input" required {...field('name')} />
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="p-cat">Category</label>
          <select id="p-cat" className="input" {...field('category')}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="p-price">Price (FCFA) *</label>
          <input id="p-price" type="number" min="0" step="50" className="input" required {...field('price')} />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="p-desc">Description</label>
        <textarea id="p-desc" rows={3} className="input" {...field('description')} />
      </div>
      <div className="form-group">
        <label htmlFor="p-img">Image</label>
        <div className="file-row">
          {preview && <motion.img key={preview} src={preview} alt="" initial={{ scale: 0.5 }} animate={{ scale: 1 }} onError={onImgError} />}
          <input id="p-img" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save product'}
        </button>
      </div>
    </form>
  );
}

/** Shared admin / vendor dashboard. `role` is "admin" or "vendor". */
export default function Dashboard({ role }) {
  const store = useStore();
  const { user, products, orders, vendors, online, saveProduct, deleteProduct, updateOrderStatus, setVendorStatus, logout, toast, defaultVendor } = store;
  const navigate = useNavigate();
  const [panel, setPanel] = useState('dashboard');
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allowed = user?.role === role;
  useEffect(() => {
    if (!allowed) navigate('/login', { replace: true });
  }, [allowed, navigate]);
  if (!allowed) return null;

  const isAdmin = role === 'admin';
  const vendorId = user.vendorId;
  const myProducts = isAdmin ? products : products.filter((p) => p.vendorId === vendorId);
  const myOrders = isAdmin ? orders : orders.filter((o) => o.vendorIds?.includes(vendorId));
  const myItems = (o) => (isAdmin ? o.items : o.items.filter((i) => i.vendorId === vendorId));
  const revenue = isAdmin ? orders.reduce((s, o) => s + o.total, 0) : myOrders.reduce((s, o) => s + myItems(o).reduce((a, i) => a + i.subtotal, 0), 0);
  const pending = myOrders.filter((o) => o.status !== 'delivered').length;
  const pendingVendors = vendors.filter((v) => v.status === 'pending').length;

  const changeStatus = (id, status) => {
    updateOrderStatus(id, status);
    toast(`Order status updated to: ${statusInfo(status).label}`);
  };

  const onSave = async (fields) => {
    try {
      const owner = isAdmin
        ? { vendorId: defaultVendor.id, vendorName: defaultVendor.name }
        : (() => {
            const loc = vendors.find((v) => v.id === vendorId)?.location || user.location;
            return { vendorId, vendorName: user.name + (loc ? ` — ${loc}` : '') };
          })();
      const id = editing && editing !== 'new' ? editing.id : undefined;
      await saveProduct({ id, ...fields, ...owner });
      toast(id ? 'Product updated!' : 'Product added! 🎉');
    } catch (err) {
      toast('Error: ' + (err.message || 'could not save product'), 'error');
      throw err;
    }
  };

  const onDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await deleteProduct(p.id);
      toast('Product deleted.', 'info');
    } catch {
      toast('Failed to delete product', 'error');
    }
  };

  const panels = [
    ['dashboard', '📊', 'Dashboard'],
    ['products', '🍕', isAdmin ? 'Products' : 'My Products'],
    ['orders', '📋', 'Orders'],
    ...(isAdmin
      ? [
          ['tracking', '🛵', 'Tracking'],
          ['vendors', '🏪', 'Vendors', pendingVendors],
        ]
      : []),
  ];

  const stats = [
    ['🍕', isAdmin ? 'Total products' : 'My products', myProducts.length, 'red'],
    ['📋', 'Total orders', myOrders.length, 'green'],
    ['💰', isAdmin ? 'Total revenue' : 'My revenue', revenue, 'orange', true],
    ['⏳', 'Pending orders', pending, 'blue'],
  ];

  const orderRow = (o, withSelect = true) => ({
    key: o.id,
    cols: [
      <strong className="mono primary">{o.trackingCode}</strong>,
      <>
        {o.customer.name}
        <br />
        <span className="muted small">{o.customer.email}</span>
      </>,
      o.deliveryMethod === 'delivery' ? '🏠 Delivery' : '🏪 Pickup',
      myItems(o)
        .map((i) => `${i.quantity}× ${i.name}`)
        .join(', '),
      <strong>{formatPrice(isAdmin ? o.total : myItems(o).reduce((a, i) => a + i.subtotal, 0))}</strong>,
      withSelect ? <StatusSelect value={o.status} onChange={(s) => changeStatus(o.id, s)} /> : <Badge status={o.status} />,
    ],
  });

  return (
    <PageTransition>
      <div className="dash">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <Logo />
          <span className="role-chip">{isAdmin ? '👑 Admin' : `🏪 ${user.name}`}</span>
          <nav>
            {panels.map(([id, icon, label, count]) => (
              <button
                key={id}
                className={`side-link ${panel === id ? 'active' : ''}`}
                onClick={() => {
                  setPanel(id);
                  setSidebarOpen(false);
                }}
              >
                {panel === id && <motion.span layoutId="side-bg" className="side-bg" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span className="side-text">
                  {icon} {label}
                </span>
                {count > 0 && <span className="side-count">{count}</span>}
              </button>
            ))}
          </nav>
          <div className="side-bottom">
            <Link to="/" className="side-link">
              <span className="side-text">🏠 View site</span>
            </Link>
            <button
              className="side-link"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <span className="side-text">🚪 Logout</span>
            </button>
          </div>
        </aside>

        <div className="dash-main">
          <div className="dash-top">
            <button className="btn btn-ghost sm dash-menu" onClick={() => setSidebarOpen((o) => !o)}>
              ☰
            </button>
            <span className={`mode-chip ${online ? 'on' : ''}`}>{online ? '● Live database' : '● Local mode (Supabase offline)'}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={panel}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.03, y: -10 }}
              transition={{ duration: 0.35, ease }}
            >
              {panel === 'dashboard' && (
                <>
                  <h1 className="heading">{isAdmin ? 'Dashboard' : `Welcome back, ${user.name}!`}</h1>
                  <div className="stat-cards">
                    {stats.map(([icon, label, value, color, money], i) => (
                      <motion.div
                        key={label}
                        className="stat-card"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
                        whileHover={{ y: -6 }}
                      >
                        <div>
                          <div className="stat-value">
                            <CountUp value={String(value)} duration={1.2} />
                            {money ? ' FCFA' : ''}
                          </div>
                          <div className="stat-label">{label}</div>
                        </div>
                        <span className={`stat-icon ${color}`}>{icon}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="card">
                    <h3>Recent orders</h3>
                    <Table
                      head={['Code', 'Customer', 'Items', 'Total', 'Status', 'Date']}
                      empty="No orders yet"
                      rows={myOrders
                        .slice(-5)
                        .reverse()
                        .map((o) => ({
                          key: o.id,
                          cols: [
                            <strong className="mono primary">{o.trackingCode}</strong>,
                            o.customer.name,
                            myItems(o)
                              .map((i) => i.name)
                              .join(', '),
                            <strong>{formatPrice(isAdmin ? o.total : myItems(o).reduce((a, i) => a + i.subtotal, 0))}</strong>,
                            isAdmin ? <Badge status={o.status} /> : <StatusSelect value={o.status} onChange={(s) => changeStatus(o.id, s)} />,
                            new Date(o.createdAt).toLocaleDateString(),
                          ],
                        }))}
                    />
                  </div>
                </>
              )}

              {panel === 'products' && (
                <>
                  <div className="panel-head">
                    <h1 className="heading">{isAdmin ? 'Products' : 'My products'}</h1>
                    <motion.button className="btn btn-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setEditing('new')}>
                      + Add product
                    </motion.button>
                  </div>
                  <div className="card">
                    <Table
                      head={['Product', 'Category', 'Price', 'Rating', 'Actions']}
                      empty="You haven't added any products yet."
                      rows={myProducts.map((p) => ({
                        key: p.id,
                        cols: [
                          <div className="product-cell">
                            <img src={p.image} alt="" onError={onImgError} />
                            <span>{p.name}</span>
                          </div>,
                          <span className="badge badge-info">{p.category}</span>,
                          <strong>{formatPrice(p.price)}</strong>,
                          <>
                            <Stars rating={p.rating} /> {p.rating}
                          </>,
                          <div className="actions">
                            <button className="btn-sm edit" onClick={() => setEditing(p)}>
                              Edit
                            </button>
                            <button className="btn-sm delete" onClick={() => onDelete(p)}>
                              Delete
                            </button>
                          </div>,
                        ],
                      }))}
                    />
                  </div>
                </>
              )}

              {panel === 'orders' && (
                <>
                  <h1 className="heading">Orders</h1>
                  <div className="card">
                    <Table
                      head={['Code', 'Customer', 'Method', 'Items', 'Total', 'Status']}
                      empty="No orders yet"
                      rows={[...myOrders].reverse().map((o) => orderRow(o))}
                    />
                  </div>
                </>
              )}

              {panel === 'tracking' && (
                <>
                  <h1 className="heading">Active deliveries</h1>
                  <div className="card">
                    <Table
                      head={['Code', 'Customer', 'Status', 'Update']}
                      empty="No active orders"
                      rows={[...orders]
                        .filter((o) => o.status !== 'delivered')
                        .reverse()
                        .map((o) => ({
                          key: o.id,
                          cols: [
                            <strong className="mono primary">{o.trackingCode}</strong>,
                            o.customer.name,
                            <Badge status={o.status} />,
                            <StatusSelect value={o.status} onChange={(s) => changeStatus(o.id, s)} />,
                          ],
                        }))}
                    />
                  </div>
                </>
              )}

              {panel === 'vendors' && (
                <>
                  <h1 className="heading">Vendor applications</h1>
                  <div className="card">
                    <Table
                      head={['Name', 'Email', 'Phone', 'Location', 'Status', 'Actions']}
                      empty="No vendor applications yet"
                      rows={vendors.map((v) => ({
                        key: v.id,
                        cols: [
                          <strong>{v.name}</strong>,
                          v.email,
                          v.phone || '—',
                          v.location || '—',
                          <span className={`badge badge-${v.status === 'approved' ? 'success' : v.status === 'rejected' ? 'danger' : 'warning'}`}>
                            {v.status[0].toUpperCase() + v.status.slice(1)}
                          </span>,
                          <div className="actions">
                            {v.status !== 'approved' && (
                              <button
                                className="btn-sm edit"
                                onClick={() => {
                                  setVendorStatus(v.id, 'approved');
                                  toast(`${v.name} has been approved! 🎉`);
                                }}
                              >
                                ✅ Approve
                              </button>
                            )}
                            {v.status === 'pending' && (
                              <button
                                className="btn-sm delete"
                                onClick={() => {
                                  if (!confirm('Reject this vendor?')) return;
                                  setVendorStatus(v.id, 'rejected');
                                  toast(`${v.name} has been rejected.`, 'info');
                                }}
                              >
                                ❌ Reject
                              </button>
                            )}
                            {v.status === 'approved' && <span className="muted small">Active</span>}
                          </div>,
                        ],
                      }))}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)}>
        {editing && <ProductForm product={editing === 'new' ? null : editing} onSave={onSave} onClose={() => setEditing(null)} />}
      </Modal>
    </PageTransition>
  );
}
