import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import { Reveal, Stagger, StaggerItem } from '../components/motion.jsx';
import { Zoomable } from '../components/Lightbox.jsx';
import { thrusts } from '../data/research.js';

const platforms = [
  { title: 'Humanoid collaboration', text: 'Physical co-manipulation, intent-aware shared control, and safe role adaptation.' },
  { title: 'Multi-robot coordination', text: 'Heterogeneous teams, swarms, modular robots, and resource-aware missions.' },
  { title: 'Aerial manipulation', text: 'Cooperative transportation and non-prehensile manipulation with cable-coupled quadrotors.' },
];

// Figure that drifts slightly slower than the page while scrolling past it.
function ParallaxFigure({ thrust }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [36, -36]);

  return (
    <motion.figure ref={ref} className={thrust.portrait ? 'portrait-figure' : undefined} style={{ y: reduce ? 0 : y }}>
      <Zoomable src={thrust.image} alt={thrust.alt} caption={thrust.caption} />
      <figcaption>{thrust.caption}</figcaption>
    </motion.figure>
  );
}

export default function Research() {
  return (
    <>
      <Seo
        title="Research"
        description="Research at PARCE-LAB spans formal methods, scalable planning, multi-robot systems, physical human-robot interaction, and physically coupled robotic systems."
      />
      <PageHero eyebrow="Research" title="Trustworthy autonomy from specification to contact.">
        <p>
          Our research connects high-level goals and formal guarantees to scalable planning, multi-robot coordination,
          and physically grounded control.
        </p>
      </PageHero>

      <section className="section">
        <div className="container research-list">
          {thrusts.map((t, i) => (
            <Reveal as="article" key={t.id} id={t.id} className={`research-feature${i % 2 ? ' reverse' : ''}`}>
              <ParallaxFigure thrust={t} />
              <div>
                <div className="thrust-id">{String(i + 1).padStart(2, '0')}</div>
                <h2>{t.title}</h2>
                <p>{t.text}</p>
                <Stagger className="tags" gap={0.07} amount={0.6}>
                  {t.tags.map((tag) => (
                    <StaggerItem as="span" variant="pop" className="tag" key={tag}>{tag}</StaggerItem>
                  ))}
                </Stagger>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Research platforms</div>
              <h2>Theory informed by real systems.</h2>
            </div>
            <p>Our work is designed for validation on humanoids, manipulators, aerial robots, ground robots, and multi-robot teams.</p>
          </Reveal>
          <Stagger className="grid-3">
            {platforms.map((p) => (
              <StaggerItem as="article" className="card" lift key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
