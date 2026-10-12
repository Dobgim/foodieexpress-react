import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { ChatWidget, Footer, Navbar } from './components/Layout';
import { FlyLayer, Preloader, ScrollProgress, Toasts } from './components/Overlays';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Tracking from './pages/Tracking';
import Reviews from './pages/Reviews';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

export default function App() {
  const location = useLocation();
  const isDashboard = /^\/(admin|vendor)/.test(location.pathname);

  return (
    <MotionConfig reducedMotion="user">
      <Preloader />
      <ScrollProgress />
      {!isDashboard && <Navbar />}
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Dashboard role="admin" />} />
          <Route path="/vendor" element={<Dashboard role="vendor" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {!isDashboard && <Footer />}
      {!isDashboard && <ChatWidget />}
      <FlyLayer />
      <Toasts />
    </MotionConfig>
  );
}
