// The Markdown file saved for each submission, and the checks that make it tamper-evident.
// Written by grader-api.js and read back by scripts/regrade.mjs.
//
// - code_sha256 fingerprints the student's code. The student gets it as a receipt, so
//   neither side can later claim different code was submitted.
// - signature is an HMAC over the key fields with a secret only the server knows
//   (.grader-secret). Editing the file afterwards (code, student, time, or score) breaks it.
// The browser score is only what the student's browser reported; scripts/regrade.mjs
// re-runs the tests to get the verified score.
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SECRET_FILE = '.grader-secret';

// The server creates the key on first use; the regrade script passes create: false,
// because a new key could never verify the files signed with the old one.
export function loadSecret(root, { create = true } = {}) {
  if (process.env.GRADER_SECRET) return process.env.GRADER_SECRET;
  const file = path.join(root, SECRET_FILE);
  if (!existsSync(file)) {
    if (!create) return null;
    writeFileSync(file, randomBytes(32).toString('hex') + '\n');
  }
  return readFileSync(file, 'utf8').trim();
}

// Trailing whitespace is dropped and one newline kept, so the code reads back byte-for-byte.
export const normalizeCode = (code) => code.replace(/\r\n/g, '\n').replace(/\s+$/, '') + '\n';

export const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

const SIGNED_FIELDS = ['assignment', 'email', 'vcu_id', 'submitted_at', 'late', 'code_sha256', 'browser_score'];

export function sign(meta, secret) {
  const payload = JSON.stringify(SIGNED_FIELDS.map((key) => meta[key]));
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

const scoreOf = (tests) => {
  const total = tests.reduce((n, t) => n + t.points, 0);
  const earned = tests.reduce((n, t) => n + (t.outcome === 'passed' ? t.points : 0), 0);
  return `${earned}/${total}`;
};

// A fence longer than any backtick run in the code, so the code can't close it early.
const fenceFor = (text) => '`'.repeat(Math.max(3, ...(text.match(/`+/g) ?? []).map((run) => run.length + 1)));
const oneLine = (text) => String(text).replace(/\s+/g, ' ').trim();
const cell = (text) => oneLine(text).replace(/\|/g, '\\|');

export function buildSubmission({ assignment, email, vcuId, code, results, submittedAt, secret }) {
  const tests = results?.tests ?? [];
  const meta = {
    assignment: assignment.id,
    title: assignment.title,
    type: assignment.type ?? 'homework',
    email,
    vcu_id: vcuId,
    submitted_at: submittedAt,
    due: assignment.due ?? null,
    late: Boolean(assignment.due && new Date(submittedAt) > new Date(assignment.due)),
    code_sha256: sha256(code),
    browser_score: tests.length ? scoreOf(tests) : null,
  };
  meta.signature = sign(meta, secret);

  const fence = fenceFor(code);
  const lines = [
    '---',
    ...Object.entries(meta).map(([key, value]) => `${key}: ${JSON.stringify(value)}`),
    '---',
    '',
    `# ${oneLine(assignment.title)}: submission`,
    '',
    '| | |',
    '|---|---|',
    `| Student | ${cell(email)} (${cell(vcuId)}) |`,
    `| Submitted | ${submittedAt} (server time) |`,
    `| Due | ${meta.due ?? 'No due date'} |`,
    `| Status | ${meta.late ? '**Late**' : 'On time'} |`,
    `| Browser-reported score | ${meta.browser_score ?? 'No tests'} (unverified; run \`npm run regrade\`) |`,
    `| Code SHA-256 | \`${meta.code_sha256}\` |`,
    '',
    '## Code',
    '',
    `${fence}python`,
    code + fence,
    '',
    "## Tests run in the student's browser",
    '',
  ];
  if (!tests.length && !results?.errors?.length) lines.push('No tests were run.', '');
  if (tests.length) {
    lines.push('| Result | Test | Points |', '|---|---|---|');
    for (const t of tests) {
      const mark = t.outcome === 'passed' ? '✓ passed' : `✗ ${t.outcome}`;
      lines.push(`| ${mark} | ${cell(t.name)} | ${t.outcome === 'passed' ? t.points : 0}/${t.points} |`);
    }
    lines.push('');
  }
  const details = [...(results?.errors ?? []).map((e) => ['Tests could not run', e]), ...tests.filter((t) => t.message).map((t) => [t.name, t.message])];
  for (const [name, message] of details) {
    const f = fenceFor(message);
    lines.push(`### ${oneLine(name)}`, '', f, message.replace(/\s+$/, ''), f, '');
  }
  return { markdown: lines.join('\n'), meta };
}

export function parseSubmission(markdown) {
  const text = markdown.replace(/\r\n/g, '\n');
  const head = text.match(/^---\n([\s\S]*?)\n---\n/);
  const code = text.match(/^## Code\n\n(`{3,})python\n([\s\S]*?)^\1$/m);
  if (!head || !code) throw new Error('not a grader submission file');
  const meta = Object.fromEntries(
    head[1].split('\n').map((line) => {
      const at = line.indexOf(': ');
      return [line.slice(0, at), JSON.parse(line.slice(at + 2))];
    }),
  );
  return { meta, code: code[2] };
}

// Both checks must pass for the file to be trusted.
export function verifySubmission({ meta, code }, secret) {
  return { codeIntact: sha256(code) === meta.code_sha256, signatureValid: sign(meta, secret) === meta.signature };
}
