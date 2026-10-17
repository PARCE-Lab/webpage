import { Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Research from './pages/Research.jsx';
import People from './pages/People.jsx';
import Publications from './pages/Publications.jsx';
import Facilities from './pages/Facilities.jsx';
import Teaching from './pages/Teaching.jsx';
import Join from './pages/Join.jsx';
import Contact from './pages/Contact.jsx';
import News from './pages/News.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="research" element={<Research />} />
        <Route path="people" element={<People />} />
        <Route path="publications" element={<Publications />} />
        <Route path="facilities" element={<Facilities />} />
        <Route path="teaching" element={<Teaching />} />
        <Route path="join" element={<Join />} />
        <Route path="contact" element={<Contact />} />
        <Route path="news" element={<News />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
