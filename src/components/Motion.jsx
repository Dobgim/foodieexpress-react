import { Fragment, useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const ease = [0.22, 1, 0.36, 1];

export const variants = {
  up: { hidden: { opacity: 0, y: 48 }, show: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -40 }, show: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -70 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 70 }, show: { opacity: 1, x: 0 } },
  zoomIn: { hidden: { opacity: 0, scale: 0.7 }, show: { opacity: 1, scale: 1 } },
  zoomOut: { hidden: { opacity: 0, scale: 1.25 }, show: { opacity: 1, scale: 1 } },
  pop: { hidden: { opacity: 0, scale: 0.4, rotate: -12 }, show: { opacity: 1, scale: 1, rotate: 0 } },
  blur: { hidden: { opacity: 0, filter: 'blur(14px)', scale: 1.05 }, show: { opacity: 1, filter: 'blur(0px)', scale: 1 } },
  flip: { hidden: { opacity: 0, rotateX: 70, y: 40 }, show: { opacity: 1, rotateX: 0, y: 0 } },
};

/** Animates its children into view on scroll. */
export function Reveal({ as = 'div', variant = 'up', delay = 0, duration = 0.9, amount = 0.25, children, ...rest }) {
  const M = motion[as];
  return (
    <M
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={variants[variant]}
      transition={{ duration, delay, ease }}
      {...rest}
    >
      {children}
    </M>
  );
}

/** Parent that staggers <RevealItem> children. */
export function RevealGroup({ as = 'div', stagger = 0.1, delay = 0, amount = 0.15, children, ...rest }) {
  const M = motion[as];
  return (
    <M
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </M>
  );
}

export function RevealItem({ as = 'div', variant = 'up', duration = 0.8, children, ...rest }) {
  const M = motion[as];
  return (
    <M variants={variants[variant]} transition={{ duration, ease }} {...rest}>
      {children}
    </M>
  );
}

/** Splits a line into words that rise up one after another. */
export function SplitWords({ text, className, delay = 0, stagger = 0.06 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i, all) => (
        <Fragment key={i}>
          <span className="word-mask" aria-hidden="true">
            <motion.span
              className="word"
              initial={{ y: '110%', rotate: 6 }}
              animate={{ y: '0%', rotate: 0 }}
              transition={{ duration: 0.9, ease, delay: delay + i * stagger }}
            >
              {w}
            </motion.span>
          </span>
          {i < all.length - 1 && ' '}
        </Fragment>
      ))}
    </span>
  );
}

/** Counts up to a number when scrolled into view. Accepts strings like "10K+" or "4.9". */
export function CountUp({ value, duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const match = String(value).match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : value;
  const decimals = match && match[1].includes('.') ? match[1].split('.')[1].length : 0;
  const fmt = (v) => (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString());
  const [display, setDisplay] = useState(match ? fmt(0) : value);
  const from = useRef(0);

  useEffect(() => {
    if (!inView || !match) return;
    const controls = animate(from.current, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        from.current = v;
        setDisplay(fmt(v));
      },
    });
    return () => controls.stop();
  }, [inView, target]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span ref={ref}>
      {display}
      {match ? suffix : ''}
    </span>
  );
}

/** 3D tilt that follows the pointer. */
export function Tilt({ children, max = 10, className, ...rest }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rx = useSpring(useTransform(y, [0, 1], [max, -max]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(x, [0, 1], [-max, max]), { stiffness: 200, damping: 18 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Button/link wrapper that drifts toward the cursor. */
export function Magnetic({ children, strength = 0.35 }) {
  const x = useSpring(0, { stiffness: 250, damping: 15 });
  const y = useSpring(0, { stiffness: 250, damping: 15 });
  return (
    <motion.span
      className="magnetic"
      style={{ x, y }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/** Infinite horizontal ticker. */
export function Marquee({ items, speed = 30, reverse = false }) {
  const row = [...items, ...items];
  return (
    <div className="marquee">
      <motion.div
        className="marquee-track"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        {row.map((item, i) => (
          <span className="marquee-item" key={i}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
