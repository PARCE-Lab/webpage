import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import graderApi from './server/grader-api.js';

export default defineConfig({
  // graderApi: submissions and assignment authoring for the Python grader (dev and preview servers only).
  plugins: [react(), graderApi()],
  // GitHub Pages serves this repo (PARCE-Lab/webpage) at https://parce-lab.github.io/webpage/.
  base: '/webpage/',
  // The Python grader's worker is a module worker that loads Pyodide with import().
  worker: { format: 'es' },
});
