import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { unsplash } from '../lib/catalog';
import { PageTransition } from '../components/Overlays';
import { ease } from '../components/Motion';

const TABS = [
  ['login', 'Sign in'],
  ['register', 'Register'],
  ['vendor', 'Vendor'],
];

function Field({ id, label, ...props }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="input" {...props} />
    </div>
  );
}

export default function Login() {
  const { login, register, registerVendor, toast } = useStore();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [tab, setTab] = useState(hash === '#vendor' ? 'vendor' : 'login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' });
  const blankVendor = { name: '', email: '', phone: '', location: '', password: '' };
  const [vendorForm, setVendorForm] = useState(blankVendor);

  useEffect(() => {
    if (hash === '#vendor') setTab('vendor');
  }, [hash]);

  const bind = (state, setState) => (key) => ({ value: state[key], onChange: (e) => setState((f) => ({ ...f, [key]: e.target.value })) });
  const lf = bind(loginForm, setLoginForm);
  const rf = bind(regForm, setRegForm);
  const vf = bind(vendorForm, setVendorForm);

  const onLogin = (e) => {
    e.preventDefault();
    const email = loginForm.email.trim();
    const password = loginForm.password.trim();
    if (!email || !password) return toast('Please fill in all fields.', 'error');
    const r = login(email, password);
    if (!r.ok) return toast(r.message, r.type);
    toast(`Welcome back, ${r.user.name}.`);
    setTimeout(() => navigate(r.user.role === 'admin' ? '/admin' : r.user.role === 'vendor' ? '/vendor' : '/'), 700);
  };

  const onRegister = (e) => {
    e.preventDefault();
    const name = regForm.name.trim();
    const email = regForm.email.trim();
    const password = regForm.password.trim();
    if (!name || !email || !password) return toast('Please fill in all fields.', 'error');
    if (password.length < 6) return toast('Password must be at least 6 characters.', 'error');
    const r = register({ name, email, password });
    if (!r.ok) return toast(r.message, 'error');
    toast('Account created. You can now sign in.');
    setLoginForm({ email, password: '' });
    setTab('login');
  };

  const onVendor = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(Object.entries(vendorForm).map(([k, v]) => [k, v.trim()]));
    if (Object.values(data).some((v) => !v)) return toast('Please fill in all fields.', 'error');
    if (data.password.length < 6) return toast('Password must be at least 6 characters.', 'error');
    const r = registerVendor(data);
    if (!r.ok) return toast(r.message, 'error');
    toast('Application sent. We will notify you once it is approved.');
    setVendorForm(blankVendor);
    setTimeout(() => setTab('login'), 1500);
  };

  const formAnim = {
    initial: { opacity: 0, scale: 0.9, x: 40 },
    animate: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.45, ease } },
    exit: { opacity: 0, scale: 0.9, x: -40, transition: { duration: 0.25 } },
  };

  return (
    <PageTransition>
      <section className="auth">
        <motion.div className="auth-visual" initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease }}>
          <img src={unsplash('1504674900247-0877df9cc836', 1200, 1400)} alt="" />
          <div className="auth-visual-text">
            <motion.h2 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8, ease }}>
              Good food is
              <br />
              <em>one tap away.</em>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
              Sign in to order, track deliveries and manage your restaurant.
            </motion.p>
          </div>
        </motion.div>

        <div className="auth-panel">
          <motion.div className="auth-card" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.7, ease }}>
            <div className="auth-tabs">
              {TABS.map(([id, label]) => (
                <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
                  {tab === id && <motion.span layoutId="auth-tab" className="auth-tab-bg" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === 'login' && (
                <motion.form key="login" {...formAnim} onSubmit={onLogin}>
                  <h2>Welcome back</h2>
                  <p className="muted">Sign in to continue your delicious journey.</p>
                  <Field id="l-email" label="Email" type="email" placeholder="you@example.com" {...lf('email')} />
                  <Field id="l-pass" label="Password" type="password" placeholder="••••••••" {...lf('password')} />
                  <motion.button type="submit" className="btn btn-primary btn-lg btn-block" whileTap={{ scale: 0.96 }}>
                    Sign in
                  </motion.button>
                  <p className="auth-switch">
                    New here? <button type="button" onClick={() => setTab('register')}>Create an account</button>
                  </p>
                </motion.form>
              )}
              {tab === 'register' && (
                <motion.form key="register" {...formAnim} onSubmit={onRegister}>
                  <h2>Create an account</h2>
                  <p className="muted">Join thousands of food lovers.</p>
                  <Field id="r-name" label="Full name" placeholder="John Doe" {...rf('name')} />
                  <Field id="r-email" label="Email" type="email" placeholder="you@example.com" {...rf('email')} />
                  <Field id="r-pass" label="Password" type="password" placeholder="At least 6 characters" {...rf('password')} />
                  <motion.button type="submit" className="btn btn-primary btn-lg btn-block" whileTap={{ scale: 0.96 }}>
                    Create account
                  </motion.button>
                </motion.form>
              )}
              {tab === 'vendor' && (
                <motion.form key="vendor" {...formAnim} onSubmit={onVendor}>
                  <h2>Become a vendor</h2>
                  <p className="muted">Apply to sell on FoodieExpress. An admin will review your application.</p>
                  <Field id="v-name" label="Restaurant name" placeholder="Mama's Kitchen" {...vf('name')} />
                  <div className="form-grid">
                    <Field id="v-email" label="Email" type="email" placeholder="you@restaurant.com" {...vf('email')} />
                    <Field id="v-phone" label="Phone" placeholder="+237 6XX XXX XXX" {...vf('phone')} />
                  </div>
                  <Field id="v-loc" label="Location" placeholder="Bonapriso, Douala" {...vf('location')} />
                  <Field id="v-pass" label="Password" type="password" placeholder="At least 6 characters" {...vf('password')} />
                  <motion.button type="submit" className="btn btn-gold btn-lg btn-block" whileTap={{ scale: 0.96 }}>
                    Submit application
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}
