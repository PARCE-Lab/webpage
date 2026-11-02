import { useEffect, useState } from 'react';

// Talks to server/grader-api.js, which only the local dev/preview server provides.
const API = `${import.meta.env.BASE_URL}api/grader/`;

async function request(path, body) {
  let response;
  try {
    response = await fetch(API + path, body && {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the grader server.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? `The grader server answered ${response.status}.`);
  return data;
}

export const submitWork = (submission) => request('submissions', submission);
export const saveAssignment = (assignment) => request('assignments', assignment);

let health;
// 'checking' | 'online' | 'offline'. On GitHub Pages the endpoint doesn't exist, so it's 'offline'.
export function useGraderServer() {
  const [state, setState] = useState('checking');
  useEffect(() => {
    let live = true;
    health ??= request('health').then(() => 'online', () => 'offline');
    health.then((result) => live && setState(result));
    return () => {
      live = false;
    };
  }, []);
  return state;
}

export const loadPrivateFiles = (id) => request('private', { id }).then((data) => data.files);
