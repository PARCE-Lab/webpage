import Seo from '../components/Seo.jsx';
import { Stagger, StaggerItem } from '../components/motion.jsx';
import PageHero from '../components/PageHero.jsx';

const areas = [
  { title: 'Courses', text: 'Current and upcoming courses in robotics, control, autonomy, and related areas.' },
  { title: 'Student Projects', text: 'Selected class projects, demonstrations, and opportunities to connect coursework with research.' },
  { title: 'Resources', text: 'Notes, software, examples, and other materials for students.' },
];

export default function Teaching() {
  return (
    <>
      <Seo title="Teaching" description="Teaching, courses, student projects, and educational resources from PARCE-LAB." />
      <PageHero eyebrow="Teaching" title="Courses and educational resources.">
        <p>
          Teaching information, course materials, student projects, and educational resources will be added as courses
          are offered at VCU.
        </p>
      </PageHero>
      <section className="section">
        <div className="container">
          <div className="notice">
            <h2>Teaching content is coming soon.</h2>
            <p>
              Future updates will include course descriptions, syllabi, office-hour information, project highlights, and
              selected learning resources.
            </p>
          </div>
          <Stagger className="grid-3 section-gap">
            {areas.map((a) => (
              <StaggerItem as="article" className="card" lift key={a.title}>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
