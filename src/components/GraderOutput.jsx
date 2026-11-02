import { motion } from 'motion/react';

// Score bar and per-test list for a run_tests result ({ tests, errors }).
export function TestResults({ result }) {
  if (result.errors.length) {
    return (
      <div className="grader-panel">
        <h3>Tests could not run</h3>
        <p className="muted">Usually a syntax error or a missing function in the code. Details:</p>
        {result.errors.map((error, i) => <pre className="grader-trace" key={i}>{error}</pre>)}
      </div>
    );
  }
  const total = result.tests.reduce((n, test) => n + test.points, 0);
  const earned = result.tests.reduce((n, test) => n + (test.outcome === 'passed' ? test.points : 0), 0);
  const passed = result.tests.filter((test) => test.outcome === 'passed').length;
  return (
    <div className="grader-panel">
      <div className="grader-score">
        <div>
          <strong>{earned} / {total}</strong> points
        </div>
        <span className="muted">{passed} of {result.tests.length} tests passed</span>
      </div>
      <div className="grader-meter" aria-hidden="true">
        <motion.div
          className="grader-meter-fill"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: total ? earned / total : 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <ul className="grader-tests">
        {result.tests.map((test, i) => (
          <li key={i} className={`grader-test is-${test.outcome}`}>
            <span className="grader-test-icon" aria-hidden="true">{test.outcome === 'passed' ? '✓' : test.outcome === 'skipped' ? '–' : '✗'}</span>
            <div className="grader-test-body">
              <div className="grader-test-head">
                <span>{test.name}</span>
                <span className="grader-test-points">
                  <span className="sr-only">{test.outcome}, </span>
                  {test.outcome === 'passed' ? test.points : 0}/{test.points}
                </span>
              </div>
              {test.message && (
                <details>
                  <summary>Why it failed</summary>
                  <pre className="grader-trace">{test.message}</pre>
                </details>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// The console under the editor: stdout, with stderr in red.
export function Console({ output }) {
  return (
    <div className="grader-console-wrap">
      <div className="grader-console-head">Output</div>
      <pre className="grader-console" aria-live="polite">
        {output.length === 0 && <span className="grader-console-empty">Run the code to see its output here.</span>}
        {output[0]?.truncated && <span className="grader-console-empty">… earlier output hidden …{'\n'}</span>}
        {output.map((chunk, i) => <span key={i} className={chunk.stream === 'stderr' ? 'is-err' : undefined}>{chunk.text}</span>)}
      </pre>
    </div>
  );
}
