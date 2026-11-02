// Every folder in src/assignments/ is one assignment (see MANUAL.md, "Python grader assignments"),
// created by hand or with the authoring page (pages/GraderAuthor.jsx):
//   meta.json        { "title", "type", "course", "summary", "due"?, "order"? }
//                    type is a key of ASSIGNMENT_TYPES; due is local time, "2026-11-20T23:59"
//   instructions.md  shown beside the editor
//   submission.py    starter code; this is the file the student edits
//   test_*.py        pytest tests that import from submission
//   anything else    text data files (CSV, JSON, TXT) copied next to submission.py
const sources = import.meta.glob('../assignments/*/**/*', { query: '?raw', import: 'default', eager: true });

export const SUBMISSION_FILE = 'submission.py';

export const ASSIGNMENT_TYPES = { homework: 'Homework', quiz: 'Quiz', exam: 'Exam' };

export const formatDue = (due) =>
  new Date(due).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const isTest = (name) => /^test_.*\.py$/.test(name);

const folders = {};
for (const [path, content] of Object.entries(sources)) {
  const [, id, name] = path.match(/assignments\/([^/]+)\/(.+)$/);
  (folders[id] ??= {})[name] = content;
}

const assignments = Object.entries(folders).map(([id, files]) => {
  const { 'meta.json': meta = '{}', 'instructions.md': instructions = '', ...rest } = files;
  const names = Object.keys(rest);
  return {
    id,
    type: 'homework',
    ...JSON.parse(meta),
    instructions,
    starter: rest[SUBMISSION_FILE] ?? '',
    tests: names.filter(isTest),
    dataFiles: names.filter((name) => name !== SUBMISSION_FILE && !isTest(name)),
    files: rest,
  };
});
assignments.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.title.localeCompare(b.title));

// A blank editor with every library available and no tests.
export const PLAYGROUND = {
  id: 'playground',
  type: 'practice',
  title: 'Playground',
  course: 'Free practice',
  summary: 'Write and run any Python code. No tests.',
  instructions: '',
  starter: [
    'import numpy as np',
    '',
    'x = np.linspace(0, 2 * np.pi, 5)',
    'print(np.round(np.sin(x), 3))',
    '',
  ].join('\n'),
  tests: [],
  dataFiles: [],
  files: {},
};

export const ASSIGNMENTS = [...assignments, PLAYGROUND];
