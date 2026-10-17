// GitHub Pages has no SPA rewrites: serving index.html as 404.html lets
// deep links like /research load the app, which then routes client-side.
import { copyFileSync } from 'node:fs';

copyFileSync('dist/index.html', 'dist/404.html');
