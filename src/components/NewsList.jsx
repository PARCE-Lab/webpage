import { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { news } from '../data/news.js';
import { Reveal } from './motion.jsx';
import ExternalLink from './ExternalLink.jsx';
import { Zoomable } from './Lightbox.jsx';

function NewsLink({ to, children }) {
  return /^https?:\/\//.test(to) ? <ExternalLink href={to}>{children}</ExternalLink> : <Link to={to}>{children}</Link>;
}

// Full entry for the News page: date and category, write-up, related links, optional figure.
function NewsArticle({ item }) {
  return (
    <div className={`news-article${item.image ? ' has-figure' : ''}`}>
      <div className="news-meta">
        <time>{item.date}</time>
        {item.category && <span className="news-category">{item.category}</span>}
      </div>
      <div className="news-content">
        <h3>{item.title}</h3>
        {item.body?.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
        {item.links?.length > 0 && (
          <div className="news-links">
            {item.links.map((l) => (
              <NewsLink key={l.label} to={l.to}>{l.label} <span aria-hidden="true">→</span></NewsLink>
            ))}
          </div>
        )}
      </div>
      {item.image && (
        <figure className="news-figure">
          <Zoomable src={item.image} alt={item.imageAlt ?? ''} caption={item.title} />
        </figure>
      )}
    </div>
  );
}

// Vertical timeline whose gold line draws itself as the list scrolls through the viewport.
// `short` uses the home-page summaries; `detailed` shows the full News-page entries.
export default function NewsList({ limit, short = false, detailed = false }) {
  const items = limit ? news.slice(0, limit) : news;
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <div className={`news-list${detailed ? ' detailed' : ''}`} ref={ref}>
      <div className="timeline-track" aria-hidden="true">
        <motion.div className="timeline-fill" style={{ scaleY: reduce ? 1 : scaleY }} />
      </div>
      {items.map((item, i) => (
        <Reveal key={item.title} as={detailed ? 'article' : 'div'} className="news-item" delay={i * 0.08}>
          <span className="timeline-dot" aria-hidden="true" />
          {detailed ? (
            <NewsArticle item={item} />
          ) : (
            <>
              <time>{item.date}</time>
              <h3>{short ? item.summary ?? item.title : item.title}</h3>
              <span className="news-index">{String(i + 1).padStart(2, '0')}</span>
            </>
          )}
        </Reveal>
      ))}
    </div>
  );
}
