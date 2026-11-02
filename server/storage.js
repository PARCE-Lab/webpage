// Where the grader keeps assignments and submissions. This version uses folders in the
// repository; a database version only needs the same four methods.
//   assignments:  src/assignments/<id>/        (published with the site)
//   private:      grader-private/<id>/         (git-ignored: hidden tests, reference solution)
//   submissions:  submissions/<id>/<email>.md  (git-ignored: student records)
//                 submissions/<id>/history/<email>--<time>.md  (earlier attempts)
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
const FILE_PATTERN = /^[A-Za-z0-9_.-]+\.(py|csv|txt|json|md)$/;

export function createFolderStorage(root) {
  const assignmentsDir = path.join(root, 'src', 'assignments');
  const submissionsDir = path.join(root, 'submissions');
  const privateDir = path.join(root, 'grader-private');

  const writeFiles = (dir, files) => {
    mkdirSync(dir, { recursive: true });
    for (const [name, text] of Object.entries(files)) writeFileSync(path.join(dir, name), text);
  };

  return {
    getAssignment(id) {
      const meta = path.join(assignmentsDir, id, 'meta.json');
      if (!ID_PATTERN.test(id) || !existsSync(meta)) return null;
      return { id, ...JSON.parse(readFileSync(meta, 'utf8')) };
    },

    // files and privateFiles: { name: text }. Files not listed are left in place.
    saveAssignment(id, files, privateFiles = {}, { overwrite = false } = {}) {
      const dir = path.join(assignmentsDir, id);
      if (existsSync(dir) && !overwrite) return { conflict: true };
      for (const name of [...Object.keys(files), ...Object.keys(privateFiles)]) {
        if (!FILE_PATTERN.test(name)) throw Object.assign(new Error(`File name not allowed: ${name}`), { status: 400 });
      }
      writeFiles(dir, files);
      writeFiles(path.join(privateDir, id), privateFiles);
      return { path: path.relative(root, dir).split(path.sep).join('/') };
    },

    // { name: text } of the assignment's private files; empty if there are none.
    getPrivateFiles(id) {
      const dir = path.join(privateDir, id);
      if (!ID_PATTERN.test(id) || !existsSync(dir)) return {};
      return Object.fromEntries(
        readdirSync(dir).filter((name) => FILE_PATTERN.test(name)).map((name) => [name, readFileSync(path.join(dir, name), 'utf8')]),
      );
    },

    // The newest attempt is <email>.md; older attempts move to history/.
    saveSubmission(assignmentId, email, markdown) {
      const dir = path.join(submissionsDir, assignmentId);
      const file = path.join(dir, `${email}.md`);
      if (existsSync(file)) {
        const history = path.join(dir, 'history');
        mkdirSync(history, { recursive: true });
        const previous = readFileSync(file, 'utf8').match(/^submitted_at: "(.*)"$/m)?.[1] ?? 'unknown';
        renameSync(file, path.join(history, `${email}--${previous.replace(/[:.]/g, '-')}.md`));
      }
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, markdown);
      return { path: path.relative(root, file).split(path.sep).join('/') };
    },

    // Latest submission per student, as [{ file, text }].
    listSubmissions(assignmentId) {
      const dir = path.join(submissionsDir, assignmentId);
      if (!existsSync(dir)) return [];
      return readdirSync(dir)
        .filter((name) => name.endsWith('.md'))
        .map((name) => ({ file: path.join(dir, name), text: readFileSync(path.join(dir, name), 'utf8') }));
    },

    listSubmittedAssignments() {
      if (!existsSync(submissionsDir)) return [];
      return readdirSync(submissionsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
    },
  };
}
