import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { marked } from 'marked';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import SubmitPanel from '../components/SubmitPanel.jsx';
import { Console, TestResults } from '../components/GraderOutput.jsx';
import { ASSIGNMENTS, ASSIGNMENT_TYPES, PLAYGROUND, SUBMISSION_FILE, formatDue } from '../grader/assignments.js';
import { useGraderServer } from '../grader/api.js';
import { usePython } from '../grader/usePython.js';
import { download } from '../utils/download.js';

// Drafts live only in this browser; storage can be unavailable (private mode), so never rely on it.
const draftKey = (id) => `grader-draft:${id}`;
function loadDraft(id) {
  try {
    return localStorage.getItem(draftKey(id));
  } catch {
    return null;
  }
}
function saveDraft(id, code) {
  try {
    localStorage.setItem(draftKey(id), code);
  } catch {
    // Not saved; the editor still works.
  }
}

// Menu groups: Homework, Quiz, Exam, then the playground.
const GROUPS = [
  ...Object.entries(ASSIGNMENT_TYPES).map(([type, label]) => [label, ASSIGNMENTS.filter((a) => a.type === type)]),
  ['Practice', [PLAYGROUND]],
].filter(([, items]) => items.length);

export default function PythonGrader() {
  const [params, setParams] = useSearchParams();
  const assignment = ASSIGNMENTS.find((a) => a.id === params.get('a')) ?? ASSIGNMENTS[0];
  const [code, setCode] = useState(() => loadDraft(assignment.id) ?? assignment.starter);
  const [result, setResult] = useState(null);
  const python = usePython();
  const server = useGraderServer();
  const instructions = useMemo(() => marked.parse(assignment.instructions), [assignment]);

  // Switching assignments loads that assignment's draft (or its starter code).
  const [loadedId, setLoadedId] = useState(assignment.id);
  if (loadedId !== assignment.id) {
    setLoadedId(assignment.id);
    setCode(loadDraft(assignment.id) ?? assignment.starter);
    setResult(null);
  }

  useEffect(() => saveDraft(loadedId, code), [loadedId, code]);

  const files = { ...assignment.files, [SUBMISSION_FILE]: code };
  const ready = python.status === 'ready';
  const running = python.status === 'running';

  async function runCode() {
    setResult(null);
    const outcome = await python.run({ kind: 'script', files, entry: SUBMISSION_FILE });
    if (!outcome.stopped) setResult({ kind: 'script', ...outcome });
  }

  // Resolves with the test results, or null if stopped or Python crashed.
  async function runTests() {
    setResult(null);
    const outcome = await python.run({ kind: 'test', files, tests: assignment.tests });
    if (outcome.stopped || outcome.crashed) return null;
    setResult({ kind: 'test', ...outcome });
    return { tests: outcome.tests, errors: outcome.errors };
  }

  function reset() {
    if (code === assignment.starter || window.confirm('Replace your code with the starter code? You can undo with Ctrl+Z.')) {
      setCode(assignment.starter);
    }
  }

  return (
    <>
      <Seo
        title="Python Grader"
        description="Write, run, and test Python in the browser with NumPy, pandas, scikit-learn, SciPy, and Matplotlib. Nothing to install."
      />
      <PageHero eyebrow="Teaching · Tools" title="Python grader.">
        <p>
          Write and run Python in your browser and check your work against your instructor’s tests. NumPy, pandas,
          scikit-learn, SciPy, and Matplotlib are ready to use, so there’s nothing to install.
        </p>
      </PageHero>

      <section className="section grader-section">
        <div className="container">
          <div className="grader-bar">
            <label className="grader-picker">
              <span>Assignment</span>
              <select value={assignment.id} onChange={(e) => setParams({ a: e.target.value }, { replace: true })}>
                {GROUPS.map(([label, items]) => (
                  <optgroup key={label} label={label}>
                    {items.map((a) => (
                      <option key={a.id} value={a.id}>{a.course ? `${a.course}: ${a.title}` : a.title}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <span className={`grader-status is-${python.status}`} role="status">{python.message}</span>
          </div>

          <div className="grader-layout">
            <article className="grader-brief">
              <div className="grader-tags">
                {ASSIGNMENT_TYPES[assignment.type] && <span className="grader-type">{ASSIGNMENT_TYPES[assignment.type]}</span>}
                {assignment.course && <span className="role">{assignment.course}</span>}
              </div>
              <h2>{assignment.title}</h2>
              {assignment.due && <p className="grader-due">Due {formatDue(assignment.due)}</p>}
              {assignment.summary && <p className="grader-summary">{assignment.summary}</p>}
              {/* Instructions are Markdown written by the course staff and bundled with the site. */}
              {assignment.instructions && <div className="grader-instructions" dangerouslySetInnerHTML={{ __html: instructions }} />}
              {assignment.dataFiles.length > 0 && (
                <div className="grader-files">
                  <h3>Files you can open</h3>
                  <ul>
                    {assignment.dataFiles.map((name) => (
                      <li key={name}>
                        <button type="button" className="text-button" onClick={() => download(name.split('/').pop(), assignment.files[name])}>
                          {name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>

            <div className="grader-work">
              <div className="grader-editor">
                <div className="grader-editor-head">
                  <code>{SUBMISSION_FILE}</code>
                  <div className="grader-editor-tools">
                    <button type="button" className="text-button" onClick={reset} disabled={running}>Reset</button>
                    <button type="button" className="text-button" onClick={() => download(SUBMISSION_FILE, code, 'text/x-python')}>Download</button>
                  </div>
                </div>
                <CodeEditor key={assignment.id} value={code} onChange={setCode} label={`Python code for ${assignment.title}`} />
              </div>
              <p className="grader-hint">Your code is saved in this browser. Tab indents; press Esc then Tab to leave the editor.</p>

              <div className="grader-actions">
                <button type="button" className="btn btn-secondary" onClick={runCode} disabled={!ready}>▶ Run code</button>
                {assignment.tests.length > 0 && (
                  <button type="button" className="btn btn-primary" onClick={runTests} disabled={!ready}>✓ Run tests</button>
                )}
                {running && <button type="button" className="btn btn-secondary grader-stop" onClick={python.stop}>■ Stop</button>}
              </div>

              {result?.kind === 'test' && <TestResults result={result} />}

              {result?.figures?.length > 0 && (
                <div className="grader-panel grader-figures">
                  {result.figures.map((src, i) => <img key={i} src={src} alt={`Figure ${i + 1} from your code`} />)}
                </div>
              )}

              <Console output={python.output} />

              {assignment !== PLAYGROUND && (
                <SubmitPanel key={assignment.id} assignment={assignment} code={code} server={server} runTests={runTests} busy={!ready} />
              )}
            </div>
          </div>

          <div className="notice grader-notice">
            <h2>Run tests gives you practice feedback.</h2>
            <p>
              Tests run on your own computer so you can check your work as you go. When you submit, your instructor
              re-runs the tests on your submitted code, and that score is the one that counts. It may include tests you
              can’t see here. Need PyTorch? It can’t run in the browser; use Google Colab.
            </p>
            <p>
              Back to <Link to="/teaching">Teaching</Link>. Instructors: <Link to="/teaching/tools/author">create or edit an assignment</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
