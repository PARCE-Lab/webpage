// Runs one submission's tests for regrade.mjs, in a thread it can kill if the code never ends.
// Same Pyodide version and runner.py as the browser grader (src/grader/python.worker.js).
import { parentPort, workerData } from 'node:worker_threads';
import { readFileSync } from 'node:fs';
import { loadPyodide } from 'pyodide';

const pyodide = await loadPyodide();
pyodide.setStdout({ batched: () => {} });
pyodide.setStderr({ batched: () => {} });
pyodide.setStdin({ error: true });
const namespace = pyodide.globals.get('dict')();
pyodide.runPython(readFileSync(workerData.runner, 'utf8'), { globals: namespace });
const runTests = namespace.get('run_tests');

parentPort.on('message', async ({ files, tests }) => {
  try {
    await pyodide.loadPackage('pytest', { messageCallback: () => {} });
    for (const [name, source] of Object.entries(files)) {
      if (name.endsWith('.py')) await pyodide.loadPackagesFromImports(source, { messageCallback: () => {} });
    }
    parentPort.postMessage(JSON.parse(runTests(JSON.stringify(files), JSON.stringify(tests))));
  } catch (error) {
    parentPort.postMessage({ tests: [], errors: [String(error)] });
  }
});
parentPort.postMessage('ready');
