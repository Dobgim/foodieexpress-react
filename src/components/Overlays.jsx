import { createElement, useEffect, useState } from 'react';
import { CircleCheck, CircleX, Info, TriangleAlert, UtensilsCrossed, X } from 'lucide-react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { ease } from './Motion';

/** Wraps each page: zooms the old page out and the new page in, with a sweeping curtain. */
export function PageTransition({ children }) {
  return (
    <>
      <motion.main
        className="page"
        initial={{ opacity: 0, scale: 1.08, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease, delay: 0.25 } }}
        exit={{ opacity: 0, scale: 0.92, filter: 'blur(8px)', transition: { duration: 0.45, ease } }}
      >
        {children}
      </motion.main>
      <motion.div
        className="curtain"
        initial={{ scaleY: 1, originY: 0 }}
        animate={{ scaleY: 0, originY: 0, transition: { duration: 0.7, ease, delay: 0.1 } }}
        exit={{ scaleY: 1, originY: 1, transition: { duration: 0.45, ease } }}
      >
        <span className="curtain-logo">
          <UtensilsCrossed size={52} strokeWidth={1.6} />
        </span>
      </motion.div>
    </>
  );
}

/** First-load splash: logo zooms in, then the whole screen zooms out of the way. */
export function Preloader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1700);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="preloader"
          exit={{ opacity: 0, scale: 1.6, transition: { duration: 0.7, ease } }}
        >
          <motion.div
            className="preloader-logo"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.25, 1], rotate: 0 }}
            transition={{ duration: 1, ease }}
          >
            <UtensilsCrossed size={54} strokeWidth={1.8} />
          </motion.div>
          <motion.div
            className="preloader-name"
            initial={{ opacity: 0, letterSpacing: '0.6em' }}
            animate={{ opacity: 1, letterSpacing: '0.02em' }}
            transition={{ duration: 1, delay: 0.35, ease }}
          >
            Foodie<em>Express</em>
          </motion.div>
          <motion.div className="preloader-bar" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.4, ease }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  const icons = { success: CircleCheck, error: CircleX, warning: TriangleAlert, info: Info };
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            className={`toast toast-${t.type}`}
            initial={{ opacity: 0, x: 80, scale: 0.6 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            <span className="toast-icon">{createElement(icons[t.type] || Info, { size: 20 })}</span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Product thumbnails that fly from the clicked button into the cart icon. */
export function FlyLayer() {
  const { flights, landFlight } = useStore();
  return (
    <div className="fly-layer">
      {flights.map((f) => {
        const target = document.querySelector('[data-cart-icon]')?.getBoundingClientRect();
        const tx = target ? target.left + target.width / 2 : window.innerWidth - 60;
        const ty = target ? target.top + target.height / 2 : 30;
        const sx = f.rect.left + f.rect.width / 2;
        const sy = f.rect.top + f.rect.height / 2;
        return (
          <motion.img
            key={f.id}
            src={f.image}
            alt=""
            className="fly-img"
            initial={{ x: sx - 32, y: sy - 32, scale: 1, opacity: 1 }}
            animate={{
              x: [sx - 32, (sx + tx) / 2 - 32, tx - 32],
              y: [sy - 32, Math.min(sy, ty) - 140, ty - 32],
              scale: [1, 1.3, 0.2],
              opacity: [1, 1, 0.6],
            }}
            transition={{ duration: 0.85, ease: 'easeInOut' }}
            onAnimationComplete={() => landFlight(f.id)}
          />
        );
      })}
    </div>
  );
}
