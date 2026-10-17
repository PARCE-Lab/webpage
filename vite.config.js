import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this repo (PARCE-Lab/webpage) at https://parce-lab.github.io/webpage/.
  base: '/webpage/',
});
