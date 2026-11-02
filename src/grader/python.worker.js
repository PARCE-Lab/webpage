// Runs Python (Pyodide) off the main thread, so long or endless student code
// never freezes the page; usePython() stops it by terminating this worker.
import runnerSource from './runner.py?raw';

// Pin the version: a new Pyodide release can change package versions under students mid-semester.
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/';

const post = (type, data = {}) => self.postMessage({ type, ...data });

let runner;

async function start() {
  post('status', { text: 'Starting Python…' });
  const { loadPyodide } = await import(/* @vite-ignore */ `${PYODIDE_URL}pyodide.mjs`);
  const pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
  pyodide.setStdout({ batched: (text) => post('output', { stream: 'stdout', text: text + '\n' }) });
  pyodide.setStderr({ batched: (text) => post('output', { stream: 'stderr', text: text + '\n' }) });
  pyodide.setStdin({ error: true });
  const namespace = pyodide.globals.get('dict')();
  pyodide.runPython(runnerSource, { globals: namespace });
  runner = { pyodide, runScript: namespace.get('run_script'), runTests: namespace.get('run_tests') };
  post('ready');
}

// Load only the packages the files import (numpy, pandas, …), so plain Python starts instantly.
async function loadImports(sources, extra = []) {
  const message = (text) => post('status', { text });
  if (extra.length) await runner.pyodide.loadPackage(extra, { messageCallback: message });
  for (const source of sources) {
    await runner.pyodide.loadPackagesFromImports(source, { messageCallback: message });
  }
}

const ready = start();
ready.catch((error) => post('failed', { text: String(error) }));

self.onmessage = async ({ data }) => {
  const { kind, files, entry, tests } = data;
  try {
    await ready;
    const pyFiles = Object.entries(files).filter(([name]) => name.endsWith('.py')).map(([, source]) => source);
    await loadImports(pyFiles, kind === 'test' ? ['pytest'] : []);
    post('status', { text: kind === 'test' ? 'Running tests…' : 'Running…' });
    const json = kind === 'test'
      ? runner.runTests(JSON.stringify(files), JSON.stringify(tests))
      : runner.runScript(JSON.stringify(files), entry);
    post('done', { result: JSON.parse(json) });
  } catch (error) {
    post('output', { stream: 'stderr', text: String(error) + '\n' });
    post('done', { result: { ok: false, figures: [], crashed: true } });
  }
};
