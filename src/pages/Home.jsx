import { Link } from 'react-router';
import { motion } from 'motion/react';
import Seo from '../components/Seo.jsx';
import NewsList from '../components/NewsList.jsx';
import { AnimatedNumber, Reveal, Stagger, StaggerItem } from '../components/motion.jsx';
import { CV_URL, LAB_NAME } from '../data/site.js';
import { publications } from '../data/publications.js';
import { thrusts } from '../data/research.js';

const foundations = [
  {
    title: 'Formal specification and synthesis',
    text: 'Temporal logic makes complex tasks, safety rules, timing constraints, and human preferences precise and machine-checkable.',
    anchor: 'formal',
  },
  {
    title: 'Scalable decision-making',
    text: 'Optimization methods help heterogeneous teams coordinate, manage uncertainty, and make principled trade-offs when goals conflict.',
    anchor: 'planning',
  },
  {
    title: 'Physically grounded interaction',
    text: 'Advanced control connects high-level plans to contact-rich behavior in humanoids, aerial robots, and multi-robot teams.',
    anchor: 'interaction',
  },
];

// Computed from the data files, so the numbers stay correct as content is added.
const countType = (type) => publications.filter((p) => p.type === type).length;
const stats = [
  { value: publications.length, label: 'Publications' },
  { value: countType('journal'), label: 'Journal articles' },
  { value: countType('conference'), label: 'Conference papers' },
  { value: thrusts.length, label: 'Research thrusts' },
];

const ease = [0.22, 1, 0.36, 1];
const heroContainer = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const heroItem = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };

export default function Home() {
  return (
    <>
      <Seo
        title="Home"
        description="PARCE-LAB develops planning, autonomy, and reliable control methods for trustworthy embodied systems at Virginia Commonwealth University."
      />

      <section className="hero">
        <div className="container hero-grid">
          <motion.div className="hero-copy" variants={heroContainer} initial="hidden" animate="show">
            <motion.img variants={heroItem} className="hero-logo" src="/assets/images/parce-lab-logo.png" alt={`PARCE-LAB — ${LAB_NAME}`} />
            <motion.div variants={heroItem} className="eyebrow">Embodied autonomy at VCU</motion.div>
            <motion.h1 variants={heroItem}>
              Robots that plan, <span>adapt, and earn trust.</span>
            </motion.h1>
            <motion.p variants={heroItem} className="lede">
              PARCE-LAB develops specification-driven methods that connect human goals to safe, reliable, and
              physically grounded robot behavior.
            </motion.p>
            <motion.div variants={heroItem} className="button-row">
              <Link className="btn btn-primary" to="/research">Explore our research →</Link>
              <Link className="btn btn-secondary" to="/publications">Read our work</Link>
            </motion.div>
          </motion.div>

          <figure className="collaboration-visual">
            <motion.div
              className="photo-frame"
              initial={{ opacity: 0, rotate: -6, scale: 0.92 }}
              animate={{ opacity: 1, rotate: 1.5, scale: 1 }}
              transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.35 }}
            >
              <img
                src="/assets/images/figures/human-humanoid-collaboration.jpg"
                alt="A human and a humanoid robot collaborating in a physical manipulation task"
              />
            </motion.div>
            <motion.figcaption
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.75 }}
            >
              <strong>Physical human–humanoid collaboration</strong>
              <span>Connecting task-level reasoning, shared autonomy, and safe interaction control.</span>
            </motion.figcaption>
            {/* Entrance via Motion; the gentle float is a CSS animation on `translate`, so they don't conflict. */}
            <motion.div className="signal one" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', delay: 0.95 }}>
              Shared autonomy
            </motion.div>
            <motion.div className="signal two" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', delay: 1.1 }}>
              Safe physical interaction
            </motion.div>
          </figure>
        </div>
      </section>

      <section className="section-stats">
        <Stagger className="container stats" gap={0.1} amount={0.4}>
          {stats.map((s) => (
            <StaggerItem className="stat" key={s.label}>
              <div className="stat-value"><AnimatedNumber value={s.value} /></div>
              <div className="stat-label">{s.label}</div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Research foundations</div>
              <h2>From abstract intent to embodied action.</h2>
            </div>
            <p>
              We bring formal methods, optimization, learning, and control into one research program for trustworthy
              autonomous systems.
            </p>
          </Reveal>
          <Stagger className="grid-3">
            {foundations.map((f, i) => (
              <StaggerItem as="article" className="card" lift key={f.anchor}>
                <div className="card-number">{String(i + 1).padStart(2, '0')}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                <Link className="card-link" to={`/research#${f.anchor}`}>See the research →</Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section section-dark">
        <Reveal className="container quote-panel">
          <div className="logo-panel">
            <img src="/assets/images/parce-lab-logo-white.jpg" alt="PARCE-LAB" />
          </div>
          <div>
            <blockquote>
              Trustworthy robots must understand goals, manage trade-offs, and{' '}
              <span>act safely in the physical world.</span>
            </blockquote>
            <p>
              Our work tightly couples high-level formal specifications with scalable decision-making and physically
              aware control.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="section section-soft">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">People</div>
              <h2>Building PARCE-LAB at Virginia Commonwealth University.</h2>
            </div>
            <p>A growing team working across robotics, control, optimization, and human–robot interaction.</p>
          </Reveal>
          <Reveal className="person-preview">
            <img src="/assets/people/gustavo-cardona/photo.png" alt="Portrait of Gustavo A. Cardona" />
            <div>
              <div className="role">Principal Investigator</div>
              <h3>Gustavo A. Cardona</h3>
              <p>
                Assistant Professor in the Department of Mechanical and Nuclear Engineering at VCU. His research
                develops specification-driven autonomy for robots that coordinate with one another and interact safely
                with people.
              </p>
              <div className="button-row">
                <Link className="btn btn-primary" to="/people">Meet the lab →</Link>
                <a className="btn btn-secondary" href={CV_URL}>Download CV</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Updates</div>
              <h2>Lab news</h2>
            </div>
            <Link className="btn btn-secondary" to="/news">All news</Link>
          </Reveal>
          <NewsList limit={3} short />
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">Join the lab</div>
              <h2>Interested in embodied autonomy?</h2>
            </div>
            <p>
              Current VCU students are encouraged to introduce themselves. There is no advertised Ph.D. opening at this
              time, but prospective students may share their background and research interests.
            </p>
          </Reveal>
          <Link className="btn btn-gold" to="/join">Join PARCE-LAB →</Link>
        </div>
      </section>
    </>
  );
}
