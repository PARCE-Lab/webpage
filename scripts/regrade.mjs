// npm run regrade [assignment-id ...]
//
// For each student's latest submission (submissions/<id>/<email>.md):
//   1. checks the code fingerprint and the server signature (was the file edited?),
//   2. re-runs the published tests plus the hidden tests in grader-private/<id>/,
//   3. writes submissions/<id>/grades.csv with the verified score.
// The browser score in each file is what the student's computer reported; this score is the one to trust.
import { Worker } from 'node:worker_threads';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSecret, parseSubmission, verifySubmission } from '../server/submission-file.js';
import { createFolderStorage } from '../server/storage.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TIMEOUT_MS = 60_000; // per submission; the first one also downloads packages
const PUBLISHED_ONLY = new Set(['meta.json', 'instructions.md']);
const PRIVATE_ONLY = new Set(['solution.py']);

const storage = createFolderStorage(ROOT);
const secret = loadSecret(ROOT, { create: false });
if (!secret) console.warn('No .grader-secret found: signatures cannot be checked.\n');

function assignmentFiles(id) {
  const dir = path.join(ROOT, 'src', 'assignments', id);
  const files = {};
  for (const name of readdirSync(dir)) if (!PUBLISHED_ONLY.has(name)) files[name] = readFileSync(path.join(dir, name), 'utf8');
  for (const [name, text] of Object.entries(storage.getPrivateFiles(id))) if (!PRIVATE_ONLY.has(name)) files[name] = text;
  return files;
}

let worker;
const startWorker = () =>
  new Promise((resolve, reject) => {
    worker = new Worker(new URL('./regrade-worker.mjs', import.meta.url), {
      workerData: { runner: path.join(ROOT, 'src', 'grader', 'runner.py') },
    });
    worker.once('message', resolve);
    worker.once('error', reject);
  });

function runTests(files, tests) {
  return new Promise((resolve) => {
    const timer = setTimeout(async () => {
      await worker.terminate();
      await startWorker();
      resolve({ tests: [], errors: ['Timed out (infinite loop?)'] });
    }, TIMEOUT_MS);
    worker.once('message', (result) => {
      clearTimeout(timer);
      resolve(result);
    });
    worker.postMessage({ files, tests });
  });
}

// [earned, total] points of a run_tests result.
const score = (result) => [
  result.tests.reduce((n, t) => n + (t.outcome === 'passed' ? t.points : 0), 0),
  result.tests.reduce((n, t) => n + t.points, 0),
];

const csvCell =(value) => (/[",\n]/.test(String(value)) ? `"${String(value).replace(/"/g, '""')}"` : String(value));

const requested = process.argv.slice(2);
const ids = requested.length ? requested : storage.listSubmittedAssignments();
if (!ids.length) {
  console.log('No submissions yet.');
  process.exit(0);
}

await startWorker();
for (const id of ids) {
  if (!existsSync(path.join(ROOT, 'src', 'assignments', id))) {
    console.log(`${id}: no such assignment, skipped.\n`);
    continue;
  }
  const files = assignmentFiles(id);
  const tests = Object.keys(files).filter((name) => /^test_.*\.py$/.test(name));
  const rows = [];
  console.log(`== ${id} (${tests.join(', ')})`);

  // Code that fails to import runs no tests, so take the total from the reference solution.
  const solution = storage.getPrivateFiles(id)['solution.py'];
  let maxPoints = null;
  if (solution) {
    const reference = await runTests({ ...files, 'submission.py': solution }, tests);
    const [earned, total] = score(reference);
    maxPoints = total;
    if (reference.errors.length || earned < total) console.log(`  Warning: the reference solution scores ${earned}/${total}.`);
  }

  for (const { file, text } of storage.listSubmissions(id)) {
    let submission;
    try {
      submission = parseSubmission(text);
    } catch (error) {
      console.log(`  ${path.basename(file)}: ${error.message}`);
      continue;
    }
    const { meta, code } = submission;
    const check = verifySubmission(submission, secret ?? '');
    const intact = check.codeIntact && (secret ? check.signatureValid : null);
    const result = await runTests({ ...files, 'submission.py': code }, tests);
    const [earned, ran] = score(result);
    const total = maxPoints ?? (ran || '?');
    const claimed = meta.browser_score ? Number(meta.browser_score.split('/')[0]) : 0;
    const flags = [
      intact === false && 'FILE MODIFIED',
      meta.late && 'late',
      result.errors[0]?.startsWith('Timed out') ? 'timed out' : result.errors.length > 0 && 'tests could not run',
      claimed > earned && `browser claimed ${meta.browser_score}`,
    ].filter(Boolean);
    const verified = `${earned}/${total}`;
    console.log(`  ${meta.email.padEnd(28)} ${meta.vcu_id}  ${verified.padEnd(8)} ${flags.join(', ')}`);
    rows.push([meta.email, meta.vcu_id, meta.submitted_at, meta.late, intact ?? 'unchecked', meta.browser_score ?? '', earned, total, meta.code_sha256]);
  }
  const csv = [['email', 'vcu_id', 'submitted_at', 'late', 'file_intact', 'browser_score', 'verified_points', 'total_points', 'code_sha256'], ...rows]
    .map((row) => row.map(csvCell).join(','))
    .join('\n');
  const out = path.join(ROOT, 'submissions', id, 'grades.csv');
  writeFileSync(out, csv + '\n');
  console.log(`  → ${path.relative(ROOT, out)}\n`);
}
await worker.terminate();
