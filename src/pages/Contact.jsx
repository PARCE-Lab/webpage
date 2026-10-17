import { Link } from 'react-router';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import ExternalLink from '../components/ExternalLink.jsx';
import { DEPARTMENT_URL, EMAIL } from '../data/site.js';

export default function Contact() {
  return (
    <>
      <Seo title="Contact" description="Contact PARCE-LAB at Virginia Commonwealth University. Office E3236." />
      <PageHero eyebrow="Contact" title="Connect with PARCE-LAB.">
        <p>
          PARCE-LAB is part of the Department of Mechanical and Nuclear Engineering at Virginia Commonwealth University
          in Richmond, Virginia.
        </p>
      </PageHero>
      <section className="section section-soft">
        <div className="container contact-grid">
          <article className="contact-card">
            <h2>Email</h2>
            <p>Research and professional inquiries:</p>
            <p><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
            <p>Students interested in joining the lab should review the requested materials before contacting Prof. Cardona.</p>
            <Link className="btn btn-primary" to="/join">Join PARCE-LAB</Link>
          </article>
          <article className="contact-card">
            <h2>Office &amp; Affiliation</h2>
            <p><strong>Office E3236</strong></p>
            <p>
              <strong>Department of Mechanical and Nuclear Engineering</strong>
              <br />VCU College of Engineering
              <br />401 West Main Street
              <br />Richmond, VA 23284
            </p>
            <p><ExternalLink href={DEPARTMENT_URL}>Visit the department website ↗</ExternalLink></p>
          </article>
        </div>
      </section>
    </>
  );
}
