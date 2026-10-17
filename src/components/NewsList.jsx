import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { news } from '../data/news.js';
import { Reveal } from './motion.jsx';

// Vertical timeline whose gold line draws itself as the list scrolls through the viewport.
export default function NewsList({ limit, short = false }) {
  const items = limit ? news.slice(0, limit) : news;
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <div className="news-list" ref={ref}>
      <div className="timeline-track" aria-hidden="true">
        <motion.div className="timeline-fill" style={{ scaleY: reduce ? 1 : scaleY }} />
      </div>
      {items.map((item, i) => (
        <Reveal key={item.title} className="news-item" delay={i * 0.08}>
          <span className="timeline-dot" aria-hidden="true" />
          <time>{item.date}</time>
          <h3>{short ? item.summary ?? item.title : item.title}</h3>
          <span className="news-index">{String(i + 1).padStart(2, '0')}</span>
        </Reveal>
      ))}
    </div>
  );
}
