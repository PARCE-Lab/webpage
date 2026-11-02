import { useState } from 'react';
import { formatDue } from '../grader/assignments.js';
import { submitWork } from '../grader/api.js';

// The student's email and VCU ID are remembered in this browser for the next submission.
const STUDENT_KEY = 'grader-student';
function loadStudent() {
  try {
    return JSON.parse(localStorage.getItem(STUDENT_KEY)) ?? {};
  } catch {
    return {};
  }
}
function saveStudent(student) {
  try {
    localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
  } catch {
    // Not remembered; the form still works.
  }
}

// Submit form. runTests() runs the assignment's tests and resolves with the result
// (or null if stopped); the server stores the code, those results, and a receipt hash.
export default function SubmitPanel({ assignment, code, server, runTests, busy }) {
  const [student, setStudent] = useState(loadStudent);
  const [honor, setHonor] = useState(false);
  const [state, setState] = useState({ phase: 'idle' });
  const pastDue = assignment.due && new Date() > new Date(assignment.due);

  const update = (field) => (e) => setStudent((s) => ({ ...s, [field]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const email = (student.email ?? '').trim();
    const vcuId = (student.vcuId ?? '').trim().toUpperCase();
    saveStudent({ email, vcuId });
    let results = null;
    if (assignment.tests.length) {
      setState({ phase: 'testing' });
      results = await runTests();
      if (!results) return setState({ phase: 'idle' });
    }
    setState({ phase: 'sending' });
    try {
      const receipt = await submitWork({ assignmentId: assignment.id, email, vcuId, code, results });
      setState({ phase: 'done', receipt });
    } catch (error) {
      setState({ phase: 'error', message: error.message });
    }
  }

  if (server === 'offline') {
    return (
      <div className="grader-panel grader-submit">
        <h3>Submitting isn’t available here yet</h3>
        <p className="muted">
          Submissions are saved by the lab’s grader server, which this site isn’t connected to yet. Use{' '}
          <strong>Download</strong> and hand in <code>submission.py</code> the way your instructor asks.
        </p>
      </div>
    );
  }

  if (state.phase === 'done') {
    const { receipt } = state;
    return (
      <div className="grader-panel grader-submit is-done" role="status">
        <h3>Submitted ✓</h3>
        <p>
          Received {formatDue(receipt.submittedAt)}
          {receipt.late ? <strong className="grader-late"> (late)</strong> : ' (on time)'}
          {receipt.browserScore && <>. Score in your browser: {receipt.browserScore}; your instructor re-runs the tests for the final grade</>}.
        </p>
        <p className="muted">Your receipt is a fingerprint (SHA-256) of exactly the code you submitted. Keep it in case of questions.</p>
        <code className="grader-receipt">{receipt.receipt}</code>
        <div className="grader-submit-row">
          <button type="button" className="text-button" onClick={() => navigator.clipboard?.writeText(receipt.receipt)}>Copy receipt</button>
          <button type="button" className="text-button" onClick={() => setState({ phase: 'idle' })}>Submit again</button>
        </div>
      </div>
    );
  }

  const working = state.phase === 'testing' || state.phase === 'sending';
  return (
    <form className="grader-panel grader-submit" onSubmit={submit}>
      <h3>Submit your work</h3>
      <p className="muted">
        {assignment.tests.length > 0 ? 'Your tests run once more, then your code and results are sent. ' : 'Your code is sent as it is now. '}
        You can submit again; the last submission counts.
        {assignment.due && <> Due {formatDue(assignment.due)}.</>}
      </p>
      {pastDue && <p className="grader-late">The due date has passed. You can still submit, but it will be marked late.</p>}
      <div className="grader-fields">
        <label>
          <span>Email</span>
          <input type="email" required autoComplete="email" placeholder="you@vcu.edu" value={student.email ?? ''} onChange={update('email')} />
        </label>
        <label>
          <span>VCU ID</span>
          <input
            required
            pattern="[Vv][0-9]{8}"
            title="V followed by 8 digits, e.g. V00123456"
            placeholder="V00123456"
            value={student.vcuId ?? ''}
            onChange={update('vcuId')}
          />
        </label>
      </div>
      <label className="grader-check">
        <input type="checkbox" required checked={honor} onChange={(e) => setHonor(e.target.checked)} />
        <span>This is my own work, written under the course’s honor code.</span>
      </label>
      {state.phase === 'error' && <p className="grader-error" role="alert">{state.message}</p>}
      <div className="grader-submit-row">
        <button type="submit" className="btn btn-gold" disabled={busy || working || server !== 'online'}>
          {state.phase === 'testing' ? 'Running tests…' : state.phase === 'sending' ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
