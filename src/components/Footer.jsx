import { Link } from 'react-router';
import { DEPARTMENT_URL, EMAIL, FOOTER_EXPLORE, LAB_NAME, LINKEDIN_URL, SCHOLAR_URL } from '../data/site.js';
import ExternalLink from './ExternalLink.jsx';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo-wrap">
              <img className="footer-logo" src="/assets/images/parce-lab-logo-white.webp" alt={`PARCE-LAB — ${LAB_NAME}`} />
            </div>
            <p>{LAB_NAME} at Virginia Commonwealth University.</p>
          </div>
          <div>
            <h3>Explore</h3>
            {FOOTER_EXPLORE.map(({ to, label }) => (
              <Link key={to} to={to}>{label}</Link>
            ))}
          </div>
          <div>
            <h3>Connect</h3>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <ExternalLink href={SCHOLAR_URL}>Google Scholar</ExternalLink>
            <ExternalLink href={LINKEDIN_URL}>LinkedIn</ExternalLink>
            <ExternalLink href={DEPARTMENT_URL}>VCU MNE</ExternalLink>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} PARCE-LAB. All rights reserved.</span>
          <span>Virginia Commonwealth University · Richmond, Virginia</span>
        </div>
      </div>
    </footer>
  );
}
