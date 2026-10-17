import Seo from '../components/Seo.jsx';
import { Stagger, StaggerItem } from '../components/motion.jsx';
import PageHero from '../components/PageHero.jsx';

const platforms = [
  { icon: 'H', title: 'Humanoids', text: 'Platforms for physical human–robot interaction, whole-body control, and embodied autonomy.' },
  { icon: 'M', title: 'Manipulators', text: 'Robot arms and end-effectors for manipulation, collaboration, and autonomous experimentation.' },
  { icon: 'A', title: 'Aerial & Mobile Robots', text: 'Quadrotors, ground robots, and multi-robot testbeds for coordination and planning.' },
  { icon: 'S', title: 'Sensing & Motion Capture', text: 'Perception, force sensing, tracking, and motion-capture infrastructure.' },
  { icon: 'C', title: 'Computing', text: 'Workstations, GPUs, simulation environments, and software infrastructure.' },
  { icon: 'L', title: 'Laboratory Space', text: 'Experimental areas for safe testing of embodied and human-interactive systems.' },
];

export default function Facilities() {
  return (
    <>
      <Seo
        title="Facilities & Robots"
        description="Facilities and robotic platforms of PARCE-LAB at Virginia Commonwealth University."
      />
      <PageHero eyebrow="Facilities & Robots" title="Experimental platforms for embodied autonomy.">
        <p>
          This page will document the lab’s robots, sensing systems, computing resources, and experimental facilities
          as PARCE-LAB is established at VCU.
        </p>
      </PageHero>
      <section className="section">
        <div className="container">
          <div className="notice">
            <h2>Facilities information is coming soon.</h2>
            <p>
              Platform specifications, photographs, access information, and current capabilities will be added once the
              laboratory setup is complete.
            </p>
          </div>
          <Stagger className="platform-grid section-gap">
            {platforms.map((p) => (
              <StaggerItem as="article" className="platform-card" lift key={p.title}>
                <div className="platform-icon">{p.icon}</div>
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
