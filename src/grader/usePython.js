import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_OUTPUT = 200_000; // characters of console output kept on screen

// Owns the Python worker. `status` is 'loading' | 'ready' | 'running' | 'failed'.
// run() resolves with the worker's result, or { stopped: true } after stop().
export function usePython() {
  const workerRef = useRef(null);
  const resolveRef = useRef(null);
  const bufferRef = useRef([]);
  const frameRef = useRef(0);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Starting Python…');
  const [output, setOutput] = useState([]);

  // Print calls can arrive thousands of times a second; flush them once per frame.
  const flush = useCallback(() => {
    frameRef.current = 0;
    const chunks = bufferRef.current;
    bufferRef.current = [];
    setOutput((prev) => {
      const next = [...prev];
      for (const chunk of chunks) {
        const last = next[next.length - 1];
        if (last && last.stream === chunk.stream) next[next.length - 1] = { ...last, text: last.text + chunk.text };
        else next.push(chunk);
      }
      let size = next.reduce((n, c) => n + c.text.length, 0);
      while (size > MAX_OUTPUT && next.length) {
        const drop = Math.min(next[0].text.length, size - MAX_OUTPUT);
        size -= drop;
        next[0] = { ...next[0], text: next[0].text.slice(drop), truncated: true };
        if (!next[0].text) next.shift();
      }
      return next;
    });
  }, []);

  const start = useCallback(() => {
    const worker = new Worker(new URL('./python.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      switch (data.type) {
        case 'status':
          setMessage(data.text);
          break;
        case 'ready':
          setStatus('ready');
          setMessage('Python ready');
          break;
        case 'failed':
          setStatus('failed');
          setMessage('Python could not load. Check your connection and reload the page.');
          break;
        case 'output':
          bufferRef.current.push({ stream: data.stream, text: data.text });
          frameRef.current ||= requestAnimationFrame(flush);
          break;
        case 'done':
          setStatus('ready');
          setMessage('Python ready');
          resolveRef.current?.(data.result);
          resolveRef.current = null;
          break;
      }
    };
    worker.onerror = () => {
      setStatus('failed');
      setMessage('Python could not load. Check your connection and reload the page.');
    };
    workerRef.current = worker;
    setStatus('loading');
    setMessage('Starting Python…');
  }, [flush]);

  useEffect(() => {
    start();
    return () => {
      workerRef.current?.terminate();
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [start]);

  const run = useCallback((request) => {
    bufferRef.current = [];
    setOutput([]);
    setStatus('running');
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      workerRef.current.postMessage(request);
    });
  }, []);

  // Python can't be interrupted from outside, so throw the worker away and start a new one.
  // The packages come back from the browser cache, so the restart takes a few seconds.
  const stop = useCallback(() => {
    workerRef.current?.terminate();
    bufferRef.current.push({ stream: 'stderr', text: '\nStopped.\n' });
    frameRef.current ||= requestAnimationFrame(flush);
    resolveRef.current?.({ stopped: true });
    resolveRef.current = null;
    start();
  }, [flush, start]);

  return { status, message, output, run, stop };
}
