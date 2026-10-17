import { Link } from 'react-router';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import { Reveal, Stagger, StaggerItem } from '../components/motion.jsx';
import ExternalLink from '../components/ExternalLink.jsx';
import { CV_URL, EMAIL, LINKEDIN_URL, SCHOLAR_URL } from '../data/site.js';

const iconProps = { viewBox: '0 0 24 24', 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 2 };

const PROFILE_LINKS = [
  {
    key: 'email',
    label: 'Email',
    href: (v) => `mailto:${v}`,
    icon: <svg {...iconProps}><path d="M3 5h18v14H3z" /><path d="m3 6 9 7 9-7" /></svg>,
  },
  {
    key: 'scholar',
    label: 'Google Scholar',
    external: true,
    icon: <svg {...iconProps}><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></svg>,
  },
  {
    key: 'cv',
    label: 'CV',
    icon: <svg {...iconProps}><path d="M6 2h9l3 3v17H6z" /><path d="M9 11h6M9 15h6M9 7h3" /></svg>,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    external: true,
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 10v7M8 7v.2M12 17v-4a3 3 0 0 1 6 0v4M12 10v7" />
      </svg>
    ),
  },
];

// Email, Google Scholar, CV, and LinkedIn buttons. Links a person doesn't have yet
// render as greyed-out, non-clickable buttons so every profile has the same layout.
function ProfileLinks({ person }) {
  return (
    <div className="profile-links">
      {PROFILE_LINKS.map(({ key, label, href, external, icon }) => {
        const value = person[key];
        if (!value) {
          return (
            <span key={key} className="is-disabled" aria-disabled="true" title={`${label} not available yet`}>
              {icon}
              <span>{label}</span>
            </span>
          );
        }
        const Tag = external ? ExternalLink : 'a';
        return (
          <Tag key={key} href={href ? href(value) : value}>
            {icon}
            <span>{label}</span>
          </Tag>
        );
      })}
    </div>
  );
}

// Add students here. Each person's files live in public/assets/people/<first-last>/;
// set `photo: '/assets/people/<first-last>/photo.jpg'` once a portrait is added there.
// Omit `photo` to show the humanoid-robot placeholder (public/assets/people/placeholder.svg).
// Profile buttons: set `email`, `scholar` (URL), `cv` ('/assets/people/<first-last>/cv.pdf'),
// and `linkedin` (URL); any left out show as greyed-out buttons.
const graduateStudents = [
  {
    name: 'David Paez',
    role: 'Ph.D. Student · Mechanical and Nuclear Engineering',
    bio: 'David is a Ph.D. student in the Department of Mechanical and Nuclear Engineering at Virginia Commonwealth University and a graduate researcher in PARCE-LAB.',
    note: 'A photograph, biography, research interests, and project information will be added later.',
  },
];

const undergraduateStudents = [
  {
    name: 'Kenneth White',
    role: 'Undergraduate Researcher',
    bio: 'Kenneth is an undergraduate researcher in PARCE-LAB at Virginia Commonwealth University.',
    note: 'A photograph, biography, research interests, and project information will be added later.',
  },
  {
    name: 'Timothy Wondree',
    role: 'Undergraduate Researcher',
    bio: 'Timothy is an undergraduate researcher in PARCE-LAB at Virginia Commonwealth University.',
    note: 'A photograph, biography, research interests, and project information will be added later.',
  },
];

function StudentCard({ student }) {
  return (
    <StaggerItem as="article" className="student-card" lift>
      <div className="student-photo">
        {student.photo ? (
          <img src={student.photo} alt={`Portrait of ${student.name}`} />
        ) : (
          <img src="/assets/people/placeholder.svg" alt="" />
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
        <ProfileLinks person={student} />
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
              <img src="/assets/people/gustavo-cardona/photo.png" alt="Portrait of Gustavo A. Cardona" />
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
              <ProfileLinks person={{ email: EMAIL, scholar: SCHOLAR_URL, cv: CV_URL, linkedin: LINKEDIN_URL }} />
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
          {undergraduateStudents.length > 0 ? (
            <Stagger className="student-grid">
              {undergraduateStudents.map((s) => <StudentCard key={s.name} student={s} />)}
            </Stagger>
          ) : (
            <div className="empty-state">
              <p>
                Undergraduate researchers will be listed here as the lab grows. Current VCU students interested in research
                are encouraged to review the <Link to="/join">Join PARCE-LAB</Link> page.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
