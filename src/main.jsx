import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { MotionConfig } from 'motion/react';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Routes live under the deploy sub-path (vite.config.js `base`), e.g. /webpage/research. */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      {/* Respect the OS "reduce motion" setting: transforms are skipped, fades remain. */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
);
