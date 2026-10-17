import { Link } from 'react-router';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import { Reveal, Stagger, StaggerItem } from '../components/motion.jsx';
import ExternalLink from '../components/ExternalLink.jsx';
import { CV_URL, EMAIL, LINKEDIN_URL, SCHOLAR_URL } from '../data/site.js';

const iconProps = { viewBox: '0 0 24 24', 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 2 };

// Add students here. Omit `photo` to show the lab-mark placeholder.
const graduateStudents = [
  {
    name: 'David Paez',
    role: 'Ph.D. Student · Mechanical and Nuclear Engineering',
    bio: 'David is a Ph.D. student in the Department of Mechanical and Nuclear Engineering at Virginia Commonwealth University and a graduate researcher in PARCE-LAB.',
    note: 'A photograph, biography, research interests, and project information will be added later.',
  },
];

function StudentCard({ student }) {
  return (
    <StaggerItem as="article" className="student-card" lift>
      <div className={`student-photo${student.photo ? '' : ' placeholder'}`}>
        {student.photo ? (
          <img src={student.photo} alt={`Portrait of ${student.name}`} />
        ) : (
          <img src="/assets/images/parce-lab-mark.png" alt="" />
        )}
      </div>
      <div className="student-body">
        <div className="role">{student.role}</div>
        <h3>{student.name}</h3>
        <p>{student.bio}</p>
        {student.note && (
          <p className="muted">
            <strong>Profile in progress.</strong> {student.note}
          </p>
        )}
      </div>
    </StaggerItem>
  );
}

export default function People() {
  return (
    <>
      <Seo
        title="People"
        description="Meet the principal investigator, graduate students, and undergraduate researchers in PARCE-LAB at Virginia Commonwealth University."
      />
      <PageHero eyebrow="People" title="A team at the intersection of robotics, control, and formal methods.">
        <p>PARCE-LAB brings together researchers interested in trustworthy autonomy for embodied systems.</p>
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="group-heading">
            <div className="eyebrow">Principal Investigator</div>
          </div>
          <Reveal as="article" className="pi-card">
            <div className="pi-photo">
              <img src="/assets/images/gustavo-cardona.png" alt="Portrait of Gustavo A. Cardona" />
            </div>
            <div className="pi-body">
              <div className="role">Assistant Professor · VCU Mechanical and Nuclear Engineering</div>
              <h2>Gustavo A. Cardona</h2>
              <p>
                Gustavo A. Cardona is an Assistant Professor in the Department of Mechanical and Nuclear Engineering at
                Virginia Commonwealth University. He received his Ph.D. in Mechanical Engineering from Lehigh University
                in 2025, his M.S. in Industrial Automation in 2023, and his B.S. in Electrical Engineering in 2018 from
                the Universidad Nacional de Colombia.
              </p>
              <p>
                His research develops specification-driven autonomy by integrating temporal logic, optimization, machine
                learning, and physically aware control for multi-robot systems and robots that interact with people.
              </p>
              <div className="profile-links">
                <a href={`mailto:${EMAIL}`}>
                  <svg {...iconProps}><path d="M3 5h18v14H3z" /><path d="m3 6 9 7 9-7" /></svg>
                  <span>Email</span>
                </a>
                <ExternalLink href={SCHOLAR_URL}>
                  <svg {...iconProps}><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></svg>
                  <span>Google Scholar</span>
                </ExternalLink>
                <a href={CV_URL}>
                  <svg {...iconProps}><path d="M6 2h9l3 3v17H6z" /><path d="M9 11h6M9 15h6M9 7h3" /></svg>
                  <span>CV</span>
                </a>
                <ExternalLink href={LINKEDIN_URL}>
                  <svg {...iconProps}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M8 10v7M8 7v.2M12 17v-4a3 3 0 0 1 6 0v4M12 10v7" />
                  </svg>
                  <span>LinkedIn</span>
                </ExternalLink>
              </div>
            </div>
          </Reveal>

          <div className="group-heading section-gap">
            <div className="eyebrow">Graduate Students</div>
            <h2>Ph.D. and graduate researchers</h2>
          </div>
          <Stagger className="student-grid">
            {graduateStudents.map((s) => <StudentCard key={s.name} student={s} />)}
          </Stagger>

          <div className="group-heading section-gap">
            <div className="eyebrow">Undergraduate Students</div>
            <h2>Undergraduate researchers</h2>
          </div>
          <div className="empty-state">
            <p>
              Undergraduate researchers will be listed here as the lab grows. Current VCU students interested in research
              are encouraged to review the <Link to="/join">Join PARCE-LAB</Link> page.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
