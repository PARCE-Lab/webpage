import Seo from '../components/Seo.jsx';
import { Stagger, StaggerItem } from '../components/motion.jsx';
import PageHero from '../components/PageHero.jsx';
import { EMAIL } from '../data/site.js';

const mailto = (subject) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;

const interests = [
  {
    title: 'Formal methods and optimization',
    text: 'Temporal logic, mixed-integer programming, planning under uncertainty, verification, and partial satisfaction.',
  },
  {
    title: 'Robotics and control',
    text: 'Motion planning, model predictive control, physical interaction, humanoids, and experimental systems.',
  },
  {
    title: 'Learning for embodied systems',
    text: 'Human intent inference, multimodal learning, computational human models, and safe adaptation.',
  },
];

export default function Join() {
  return (
    <>
      <Seo
        title="Join PARCE-LAB"
        description="Information for current VCU students and prospective Ph.D. students interested in PARCE-LAB."
      />
      <PageHero eyebrow="Join PARCE-LAB" title="Work with us on trustworthy embodied autonomy.">
        <p>
          PARCE-LAB welcomes inquiries from motivated students whose interests align with formal methods, robotics,
          control, optimization, and human–robot interaction.
        </p>
      </PageHero>

      <section className="section">
        <div className="container">
          <Stagger className="join-grid" amount={0.05}>
            <StaggerItem as="article" className="join-card highlight">
              <div className="role">Current VCU Students</div>
              <h2>Undergraduate and graduate research</h2>
              <p>Current VCU students are encouraged to contact Prof. Cardona about opportunities to participate in PARCE-LAB research.</p>
              <h3>Please include:</h3>
              <ul>
                <li>Your CV or résumé.</li>
                <li>Your degree program, current year, and expected graduation date.</li>
                <li>A brief description of your background, research interests, and relevant technical experience.</li>
                <li>A concise explanation of why you are interested in joining PARCE-LAB.</li>
                <li>Your expected availability and preferred starting semester.</li>
              </ul>
              <a className="btn btn-primary" href={mailto('VCU Student Interest in PARCE-LAB')}>Email Prof. Cardona</a>
            </StaggerItem>
            <StaggerItem as="article" className="join-card">
              <div className="role">Prospective Ph.D. Students</div>
              <h2>No advertised Ph.D. opening at this time</h2>
              <p>
                There is currently no advertised Ph.D. opening. Prospective students whose interests strongly align with
                the lab are nevertheless welcome to introduce themselves by email.
              </p>
              <h3>Please include:</h3>
              <ul>
                <li>Your CV.</li>
                <li>A brief description of your academic and research background.</li>
                <li>Your intended starting term.</li>
                <li>A concise explanation of why your interests align with PARCE-LAB.</li>
                <li>One or two representative publications, manuscripts, thesis documents, code repositories, or project samples, when available.</li>
                <li>Your unofficial transcript may be included when it helps explain your preparation, but it is not required for an initial inquiry.</li>
              </ul>
              <p className="muted">A thoughtful, concise email is more helpful than a generic message sent to many laboratories.</p>
              <a className="btn btn-secondary" href={mailto('Prospective PhD Interest in PARCE-LAB')}>Send an inquiry</a>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Research fit</div>
              <h2>Areas of interest</h2>
            </div>
            <p>Projects may span theory, algorithms, simulation, and hardware experiments.</p>
          </div>
          <Stagger className="grid-3">
            {interests.map((i) => (
              <StaggerItem as="article" className="card" lift key={i.title}>
                <h3>{i.title}</h3>
                <p>{i.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
