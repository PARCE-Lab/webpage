import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { marked } from 'marked';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import { Console, TestResults } from '../components/GraderOutput.jsx';
import { ASSIGNMENTS, ASSIGNMENT_TYPES, PLAYGROUND, SUBMISSION_FILE } from '../grader/assignments.js';
import { loadPrivateFiles, saveAssignment, useGraderServer } from '../grader/api.js';
import { usePython } from '../grader/usePython.js';

// Private files (grader-private/<id>/): never published, used only by `npm run regrade`.
const HIDDEN_TESTS_FILE = 'test_hidden.py';
const SOLUTION_FILE = 'solution.py';

const EDITABLE = ASSIGNMENTS.filter((a) => a !== PLAYGROUND);

const BLANK = {
  id: '',
  title: '',
  type: 'homework',
  course: '',
  due: '',
  order: '',
  summary: '',
  instructions: 'Complete `my_function` in `submission.py`.\n',
  starter: [
    'def my_function(x):',
    '    """Return x squared."""',
    '    # TODO: your code here',
    '    raise NotImplementedError',
    '',
    '',
    'if __name__ == "__main__":',
    '    print(my_function(3))',
    '',
  ].join('\n'),
  testsFile: 'test_submission.py',
  tests: [
    'import pytest',
    '',
    'from submission import my_function',
    '',
    '',
    '@pytest.mark.points(1)',
    'def test_small_number():',
    '    """my_function(3) returns 9"""',
    '    assert my_function(3) == 9',
    '',
  ].join('\n'),
  hiddenTests: '',
  solution: 'def my_function(x):\n    return x * x\n',
  dataFiles: {},
};

const slugify = (text) => text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);

function fromAssignment(a, privateFiles) {
  const testsFile = a.tests.includes('test_submission.py') ? 'test_submission.py' : a.tests[0] ?? 'test_submission.py';
  return {
    id: a.id,
    title: a.title ?? '',
    type: a.type ?? 'homework',
    course: a.course ?? '',
    due: a.due ?? '',
    order: a.order ?? '',
    summary: a.summary ?? '',
    instructions: a.instructions,
    starter: a.starter,
    testsFile,
    tests: a.files[testsFile] ?? '',
    hiddenTests: privateFiles[HIDDEN_TESTS_FILE] ?? '',
    solution: privateFiles[SOLUTION_FILE] ?? '',
    dataFiles: Object.fromEntries(a.dataFiles.map((name) => [name, a.files[name]])),
  };
}

export default function GraderAuthor() {
  const server = useGraderServer();
  const python = usePython();
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null); // id of the assignment being edited, or null for a new one
  const [version, setVersion] = useState(0); // remounts the code editors when another assignment loads
  const [idTouched, setIdTouched] = useState(false);
  const [check, setCheck] = useState(null);
  const [status, setStatus] = useState(null);
  const preview = useMemo(() => marked.parse(form.instructions), [form.instructions]);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const input = (field) => (e) => set(field)(e.target.value);
  const id = idTouched || editing ? form.id : slugify(form.title);

  async function load(choice) {
    setCheck(null);
    setStatus(null);
    if (!choice) {
      setEditing(null);
      setIdTouched(false);
      setForm(BLANK);
    } else {
      const assignment = EDITABLE.find((a) => a.id === choice);
      let privateFiles = {};
      if (server === 'online') {
        try {
          privateFiles = await loadPrivateFiles(choice);
        } catch (error) {
          setStatus({ error: `Hidden tests couldn’t be loaded: ${error.message}` });
        }
      }
      setEditing(choice);
      setForm(fromAssignment(assignment, privateFiles));
    }
    setVersion((v) => v + 1);
  }

  // Runs the visible and hidden tests against the solution or the starter code.
  async function runCheck(which) {
    setCheck(null);
    const files = { ...form.dataFiles, [SUBMISSION_FILE]: which === 'solution' ? form.solution : form.starter, [form.testsFile]: form.tests };
    const tests = [form.testsFile];
    if (form.hiddenTests.trim()) {
      files[HIDDEN_TESTS_FILE] = form.hiddenTests;
      tests.push(HIDDEN_TESTS_FILE);
    }
    const outcome = await python.run({ kind: 'test', files, tests });
    if (!outcome.stopped && !outcome.crashed) setCheck({ which, ...outcome });
  }

  async function addDataFiles(e) {
    const picked = await Promise.all([...e.target.files].map(async (file) => [file.name, await file.text()]));
    setForm((f) => ({ ...f, dataFiles: { ...f.dataFiles, ...Object.fromEntries(picked) } }));
    e.target.value = '';
  }

  async function save(e) {
    e.preventDefault();
    const meta = { title: form.title.trim(), type: form.type, course: form.course.trim(), summary: form.summary.trim() };
    if (form.due) meta.due = form.due;
    if (form.order !== '') meta.order = Number(form.order);
    const privateFiles = {};
    if (form.hiddenTests.trim()) privateFiles[HIDDEN_TESTS_FILE] = form.hiddenTests;
    if (form.solution.trim()) privateFiles[SOLUTION_FILE] = form.solution;
    setStatus({ saving: true });
    try {
      const saved = await saveAssignment({
        id,
        overwrite: editing === id,
        files: {
          'meta.json': JSON.stringify(meta, null, 2) + '\n',
          'instructions.md': form.instructions,
          [SUBMISSION_FILE]: form.starter,
          [form.testsFile]: form.tests,
          ...form.dataFiles,
        },
        privateFiles,
      });
      setEditing(id);
      setForm((f) => ({ ...f, id }));
      setStatus({ saved: saved.path });
    } catch (error) {
      setStatus({ error: error.message });
    }
  }

  const ready = python.status === 'ready';

  return (
    <>
      <Seo title="Create an Assignment" description="Create and edit Python grader homework, quizzes, and exams." />
      <PageHero eyebrow="Teaching · Tools · Instructors" title="Create an assignment.">
        <p>
          Write the instructions, starter code, and tests for a homework, quiz, or exam. Check the tests against your
          solution, then save. Students see it in the <Link to="/teaching/tools">Python grader</Link>.
        </p>
      </PageHero>

      <section className="section grader-section">
        <div className="container">
          {server === 'offline' && (
            <div className="notice author-offline">
              <h2>Saving needs the local grader server.</h2>
              <p>
                Run the site on your computer with <code>npm run dev</code> and open this page there to save
                assignments. You can still write and check an assignment here.
              </p>
            </div>
          )}

          <form className="author-form" onSubmit={save}>
            <div className="grader-bar">
              <label className="grader-picker">
                <span>Start from</span>
                <select value={editing ?? ''} onChange={(e) => load(e.target.value)}>
                  <option value="">New assignment</option>
                  {EDITABLE.map((a) => (
                    <option key={a.id} value={a.id}>Edit: {a.course ? `${a.course}: ${a.title}` : a.title}</option>
                  ))}
                </select>
              </label>
            </div>

            <fieldset className="grader-panel author-section">
              <legend>Details</legend>
              <div className="grader-fields author-grid">
                <label className="span-2">
                  <span>Title</span>
                  <input required value={form.title} onChange={input('title')} placeholder="Linear regression with NumPy" />
                </label>
                <label>
                  <span>ID (used in the link)</span>
                  <input
                    required
                    pattern="[a-z0-9][a-z0-9\-]{0,63}"
                    title="Lowercase letters, digits, and dashes"
                    value={id}
                    disabled={Boolean(editing)}
                    onChange={(e) => {
                      setIdTouched(true);
                      set('id')(e.target.value);
                    }}
                  />
                </label>
                <label>
                  <span>Type</span>
                  <select value={form.type} onChange={input('type')}>
                    {Object.entries(ASSIGNMENT_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label>
                  <span>Course</span>
                  <input value={form.course} onChange={input('course')} placeholder="EGMN 491" />
                </label>
                <label>
                  <span>Due (optional)</span>
                  <input type="datetime-local" value={form.due} onChange={input('due')} />
                </label>
                <label>
                  <span>Menu order (optional)</span>
                  <input type="number" value={form.order} onChange={input('order')} />
                </label>
                <label className="span-2">
                  <span>One-line summary</span>
                  <input value={form.summary} onChange={input('summary')} />
                </label>
              </div>
            </fieldset>

            <fieldset className="grader-panel author-section">
              <legend>Instructions</legend>
              <p className="muted">Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>`code`</code>, lists, and code blocks.</p>
              <textarea className="author-textarea" rows={10} value={form.instructions} onChange={input('instructions')} />
              <details className="author-preview">
                <summary>Preview</summary>
                <div className="grader-instructions" dangerouslySetInnerHTML={{ __html: preview }} />
              </details>
            </fieldset>

            <fieldset className="grader-panel author-section">
              <legend>Code</legend>
              <AuthorEditor label="Starter code" file={`${SUBMISSION_FILE} · published, students edit this`} value={form.starter} onChange={set('starter')} key={`s${version}`} />
              <AuthorEditor label="Tests" file={`${form.testsFile} · published, students can run these`} value={form.tests} onChange={set('tests')} key={`t${version}`} />
              <AuthorEditor
                label="Hidden tests (optional)"
                file={`${HIDDEN_TESTS_FILE} · private, used only when you regrade submissions`}
                value={form.hiddenTests}
                onChange={set('hiddenTests')}
                key={`h${version}`}
              />
              <AuthorEditor label="Reference solution" file={`${SOLUTION_FILE} · private, never shown to students`} value={form.solution} onChange={set('solution')} key={`r${version}`} />
              <p className="muted">
                Tests use pytest: <code>from submission import …</code>, <code>@pytest.mark.points(2)</code> to weight a test, and
                the first docstring line as the name students see.
              </p>
            </fieldset>

            <fieldset className="grader-panel author-section">
              <legend>Data files</legend>
              <p className="muted">Text files (CSV, TXT, JSON) placed next to <code>{SUBMISSION_FILE}</code>. They are published with the site.</p>
              {Object.keys(form.dataFiles).length > 0 && (
                <ul className="author-files">
                  {Object.keys(form.dataFiles).map((name) => (
                    <li key={name}>
                      <code>{name}</code>
                      {editing && EDITABLE.find((a) => a.id === editing)?.dataFiles.includes(name) ? (
                        <span className="muted"> (saved; delete it from the folder to remove it)</span>
                      ) : (
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setForm((f) => ({ ...f, dataFiles: Object.fromEntries(Object.entries(f.dataFiles).filter(([n]) => n !== name)) }))}
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <input type="file" multiple accept=".csv,.txt,.json" onChange={addDataFiles} />
            </fieldset>

            <div className="grader-panel author-section">
              <h3>Check your tests</h3>
              <p className="muted">The solution should get every point; the starter code usually gets none. Both include the hidden tests.</p>
              <div className="grader-actions">
                <button type="button" className="btn btn-primary" disabled={!ready} onClick={() => runCheck('solution')}>✓ Test the solution</button>
                <button type="button" className="btn btn-secondary" disabled={!ready} onClick={() => runCheck('starter')}>Test the starter code</button>
                {python.status === 'running' && <button type="button" className="btn btn-secondary grader-stop" onClick={python.stop}>■ Stop</button>}
                <span className={`grader-status is-${python.status}`} role="status">{python.message}</span>
              </div>
            </div>
            {check && (
              <>
                <h3 className="author-check-title">Results for the {check.which === 'solution' ? 'reference solution' : 'starter code'}</h3>
                <TestResults result={check} />
              </>
            )}
            <Console output={python.output} />

            <div className="author-save">
              <button type="submit" className="btn btn-gold" disabled={server !== 'online' || status?.saving}>
                {status?.saving ? 'Saving…' : editing ? 'Save changes' : 'Create assignment'}
              </button>
              {status?.saved && (
                <p role="status">
                  Saved to <code>{status.saved}</code>.{' '}
                  <Link to={`/teaching/tools?a=${editing}`}>Open it in the grader →</Link>
                </p>
              )}
              {status?.error && <p className="grader-error" role="alert">{status.error}</p>}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function AuthorEditor({ label, file, value, onChange }) {
  return (
    <div className="author-editor">
      <div className="author-editor-label">
        <strong>{label}</strong> <span className="muted">{file}</span>
      </div>
      <div className="grader-editor">
        <CodeEditor value={value} onChange={onChange} label={label} />
      </div>
    </div>
  );
}
