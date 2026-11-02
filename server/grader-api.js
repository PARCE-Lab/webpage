// Vite plugin: the grader's HTTP API, served by `npm run dev` and `npm run preview`.
// GitHub Pages can't run it, so on the public site the grader reports that submitting
// and authoring are unavailable (src/grader/api.js checks /health).
//
//   GET  <base>api/grader/health
//   POST <base>api/grader/submissions   { assignmentId, email, vcuId, code, results }
//   POST <base>api/grader/assignments   { id, files, privateFiles, overwrite }
//   POST <base>api/grader/private       { id } → { files }: hidden tests and solution, for editing
import { buildSubmission, loadSecret, normalizeCode } from './submission-file.js';
import { createFolderStorage, ID_PATTERN } from './storage.js';

const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const VCU_ID_PATTERN = /^V\d{8}$/;
const MAX_BODY = 2 * 1024 * 1024;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) reject(new HttpError(413, 'Request too large.'));
      else chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new HttpError(400, 'Invalid JSON.'));
      }
    });
    req.on('error', reject);
  });
}

function submit(storage, secret, body) {
  const assignment = storage.getAssignment(String(body.assignmentId ?? ''));
  if (!assignment) throw new HttpError(404, 'Unknown assignment.');
  const email = String(body.email ?? '').trim().toLowerCase();
  const vcuId = String(body.vcuId ?? '').trim().toUpperCase();
  if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, 'Enter a valid email address.');
  if (!VCU_ID_PATTERN.test(vcuId)) throw new HttpError(400, 'Enter your VCU ID: V followed by 8 digits.');
  if (typeof body.code !== 'string' || !body.code.trim()) throw new HttpError(400, 'There is no code to submit.');

  // The time comes from the server, never from the student's computer.
  const submittedAt = new Date().toISOString();
  const { markdown, meta } = buildSubmission({
    assignment,
    email,
    vcuId,
    code: normalizeCode(body.code),
    results: body.results,
    submittedAt,
    secret,
  });
  const saved = storage.saveSubmission(assignment.id, email, markdown);
  return { submittedAt, late: meta.late, receipt: meta.code_sha256, browserScore: meta.browser_score, file: saved.path };
}

function saveAssignment(storage, body) {
  const id = String(body.id ?? '');
  if (!ID_PATTERN.test(id)) throw new HttpError(400, 'The ID may use lowercase letters, digits, and dashes.');
  if (!body.files || typeof body.files !== 'object') throw new HttpError(400, 'No files to save.');
  const result = storage.saveAssignment(id, body.files, body.privateFiles ?? {}, { overwrite: Boolean(body.overwrite) });
  if (result.conflict) throw new HttpError(409, `An assignment with the ID "${id}" already exists.`);
  return result;
}

export default function graderApi() {
  let base = '/';
  let root = process.cwd();

  const middleware = () => {
    const storage = createFolderStorage(root);
    const secret = loadSecret(root);
    const routes = {
      'GET health': () => ({ ok: true, storage: 'folder' }),
      'POST submissions': (body) => submit(storage, secret, body),
      'POST assignments': (body) => saveAssignment(storage, body),
      'POST private': (body) => ({ files: storage.getPrivateFiles(String(body.id ?? '')) }),
    };
    return async (req, res, next) => {
      const prefix = `${base}api/grader/`;
      if (!req.url.startsWith(prefix)) return next();
      const handler = routes[`${req.method} ${req.url.slice(prefix.length).split('?')[0]}`];
      res.setHeader('Content-Type', 'application/json');
      try {
        if (!handler) throw new HttpError(404, 'Not found.');
        const body = req.method === 'POST' ? await readJson(req) : undefined;
        res.end(JSON.stringify(await handler(body)));
      } catch (error) {
        res.statusCode = error.status ?? 500;
        res.end(JSON.stringify({ error: error.status ? error.message : `Server error: ${error.message}` }));
      }
    };
  };

  return {
    name: 'grader-api',
    configResolved(config) {
      base = config.base;
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use(middleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware());
    },
  };
}
