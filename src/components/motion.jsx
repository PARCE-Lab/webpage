import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

// Shared animation building blocks. <MotionConfig reducedMotion="user"> in main.jsx
// turns transform animations into plain fades for visitors who prefer reduced motion.

const ease = [0.22, 1, 0.36, 1];

// Fades/slides an element in the first time it scrolls into view.
// Usage: <Reveal as="article" className="card">…</Reveal>
export function Reveal({ as = 'div', delay = 0, ...props }) {
  const Tag = motion[as];
  return (
    <Tag
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.65, ease, delay }}
      {...props}
    />
  );
}

const staggerContainer = (gap) => ({ hidden: {}, show: { transition: { staggerChildren: gap } } });

// A container whose <StaggerItem> children animate in one after another.
export function Stagger({ as = 'div', gap = 0.12, amount = 0.15, ...props }) {
  const Tag = motion[as];
  return (
    <Tag
      variants={staggerContainer(gap)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      {...props}
    />
  );
}

const itemVariants = {
  rise: { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } },
  pop: { hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 22 } } },
};

// `lift` adds a springy hover lift (used on cards).
export function StaggerItem({ as = 'div', variant = 'rise', lift = false, ...props }) {
  const Tag = motion[as];
  return (
    <Tag
      variants={itemVariants[variant]}
      whileHover={lift ? { y: -6, transition: { type: 'spring', stiffness: 400, damping: 18 } } : undefined}
      {...props}
    />
  );
}

// Counts from its previous value to `value`; starts when first scrolled into view.
export function AnimatedNumber({ value, duration = 1.4 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration, ease: 'easeOut' });
    return () => controls.stop();
  }, [inView, value, reduce, duration, mv]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}
