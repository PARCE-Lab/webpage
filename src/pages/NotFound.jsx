import { Link, Navigate, useLocation } from 'react-router';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';

export default function NotFound() {
  const { pathname, hash } = useLocation();

  // Keep links to the old static site working: /research.html → /research, /index.html → /
  if (pathname.endsWith('.html')) {
    const page = pathname.slice(0, -'.html'.length).replace(/\/index$/, '/');
    return <Navigate to={`${page}${hash}`} replace />;
  }

  return (
    <>
      <Seo title="Page Not Found" description="The requested PARCE-LAB page could not be found." />
      <meta name="robots" content="noindex" />
      <PageHero eyebrow="404" title="Page not found.">
        <p>The page may have moved or may not exist yet.</p>
        <div className="button-row">
          <Link className="btn btn-primary" to="/">Return home</Link>
          <Link className="btn btn-secondary" to="/contact">Contact us</Link>
        </div>
      </PageHero>
    </>
  );
}
