import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import NewsList from '../components/NewsList.jsx';

export default function News() {
  return (
    <>
      <Seo title="News" description="News and updates from PARCE-LAB at Virginia Commonwealth University." />
      <PageHero eyebrow="News" title="PARCE-LAB updates.">
        <p>Announcements, publications, awards, student milestones, and laboratory news.</p>
      </PageHero>
      <section className="section">
        <div className="container">
          <NewsList />
        </div>
      </section>
    </>
  );
}
