import { useState } from 'react';
import { asset } from '../utils/asset.js';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import ExternalLink from '../components/ExternalLink.jsx';
import { AnimatedNumber } from '../components/motion.jsx';
import { Zoomable } from '../components/Lightbox.jsx';
import { publications } from '../data/publications.js';
import { CV_URL, SCHOLAR_URL } from '../data/site.js';

// `value` must match the `type` field of entries in data/publications.js.
const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'journal', label: 'Journals' },
  { value: 'conference', label: 'Conferences' },
  { value: 'software', label: 'Software' },
];

const ease = [0.22, 1, 0.36, 1];
// Items and year groups slide to their new positions (layout="position") when the
// filtered list changes; removed ones fade out while the rest close the gap.
const listItem = {
  layout: 'position',
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.18 } },
  transition: { duration: 0.35, ease },
};

// Groups the (already newest-first) list by year, preserving order.
function groupByYear(list) {
  const groups = [];
  for (const p of list) {
    const last = groups[groups.length - 1];
    if (last?.year === p.year) last.items.push(p);
    else groups.push({ year: p.year, items: [p] });
  }
  return groups;
}

function FilterButtons({ value, onChange }) {
  return (
    <div className="filter-buttons" role="group" aria-label="Filter publications">
      {FILTERS.map((f) => (
        <button key={f.value} className={value === f.value ? 'active' : undefined} aria-pressed={value === f.value} onClick={() => onChange(f.value)}>
          {value === f.value && (
            <motion.span layoutId="filter-pill" className="filter-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
          )}
          <span className="filter-label">{f.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function Publications() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const q = query.toLowerCase().trim();
  const filtered = publications.filter(
    (p) =>
      (filter === 'all' || p.type === filter) &&
      `${p.title} ${p.authors} ${p.venue} ${p.year}`.toLowerCase().includes(q),
  );
  const groups = groupByYear(filtered);

  return (
    <>
      <Seo
        title="Publications"
        description="Publications from PARCE-LAB in formal methods, multi-robot planning, control, and physical human-robot interaction."
      />
      <PageHero eyebrow="Publications" title="Research in planning, control, and embodied autonomy.">
        <p>
          Selected publications include representative figures from our work. For the most current citation record,
          visit Google Scholar.
        </p>
        <div className="button-row">
          <ExternalLink className="btn btn-primary" href={SCHOLAR_URL}>Google Scholar ↗</ExternalLink>
          <a className="btn btn-secondary" href={asset(CV_URL)}>Full CV</a>
        </div>
      </PageHero>

      <section className="section section-soft">
        <div className="container">
          <div className="pub-tools">
            <input
              type="search"
              placeholder="Search title, author, venue, or year"
              aria-label="Search publications"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <FilterButtons value={filter} onChange={setFilter} />
          </div>
          <p className="pub-count" aria-live="polite">
            <AnimatedNumber value={filtered.length} duration={0.5} /> item{filtered.length === 1 ? '' : 's'}
          </p>

          <LayoutGroup>
            <div className="publications">
              <AnimatePresence mode="popLayout" initial={false}>
                {groups.map((g) => (
                  <motion.section key={g.year} className="pub-group" aria-label={`${g.year} publications`} {...listItem}>
                    <h2 className="pub-group-year">{g.year}</h2>
                    <div className="pub-group-items">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {g.items.map((p) => (
                          <motion.article key={p.title} className={`pub${p.image ? ' pub-visual' : ''}`} {...listItem}>
                            {p.image && (
                              <figure className="pub-figure">
                                <Zoomable src={p.image} alt={p.imageAlt || p.title} caption={p.title} loading="lazy" />
                              </figure>
                            )}
                            <div className="pub-copy">
                              <h3>{p.title}</h3>
                              <p>{p.authors}</p>
                              <p><em>{p.venue}</em></p>
                              <div className="pub-meta">
                                <span>{p.type}</span>
                                {p.link && <ExternalLink href={p.link}>Paper ↗</ExternalLink>}
                              </div>
                            </div>
                          </motion.article>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.section>
                ))}
              </AnimatePresence>
              <AnimatePresence>
                {filtered.length === 0 && (
                  <motion.p className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    No publications match your search.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        </div>
      </section>
    </>
  );
}
