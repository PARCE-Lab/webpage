import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { thrusts, keywordLinks } from '../data/research.js';

// Obsidian-style graph of the research keywords: each thrust is a hub linked to its
// tags, and `keywordLinks` join tags across thrusts. A small force simulation lays it
// out (nodes bloom outward when scrolled into view and can be dragged); hovering or
// tapping a node highlights its neighbours and explains its cross-thrust links.

const W = 1000;
const H = 600;
const PAD = 12; // gap between a label and the canvas edge
const LABEL_H = 30; // height reserved for a node plus its label

// Force constants, tuned for ~20 nodes.
const REPULSION = 8000;
const SPOKE = { length: 100, strength: 0.05 };
const CROSS = { length: 280, strength: 0.001 };
const GRAVITY = 0.005;
const DAMPING = 0.82;
const ALPHA_DECAY = 0.98;
const ALPHA_MIN = 0.004;

// Approximate rendered label width, so the layout can keep labels apart and on-canvas.
const labelWidth = (text, hub) => text.length * (hub ? 8.2 : 6.9) + 14;

function clamp(n) {
  n.x = Math.min(W - n.w / 2 - PAD, Math.max(n.w / 2 + PAD, n.x));
  n.y = Math.min(H - LABEL_H, Math.max(PAD + 8, n.y));
}

function buildGraph() {
  const nodes = [];
  const edges = [];
  thrusts.forEach((t, i) => {
    // Seed each hub in its own quadrant so the layout is stable from load to load.
    const hx = W / 2 + (i % 2 ? 1 : -1) * 190;
    const hy = H / 2 + (i < 2 ? -1 : 1) * 120;
    nodes.push({ id: t.id, hub: true, label: t.short, thrust: t, x: hx, y: hy, w: labelWidth(t.short, true) });
    t.tags.forEach((tag, j) => {
      const a = (j / t.tags.length) * Math.PI * 2 + i;
      nodes.push({ id: tag, hub: false, label: tag, thrust: t, x: hx + 60 * Math.cos(a), y: hy + 60 * Math.sin(a), w: labelWidth(tag, false) });
      edges.push({ id: `${t.id}>${tag}`, source: t.id, target: tag, cross: false });
    });
  });
  const ids = new Set(nodes.map((n) => n.id));
  keywordLinks.forEach((l) => {
    if (ids.has(l.a) && ids.has(l.b)) edges.push({ id: `${l.a}|${l.b}`, source: l.a, target: l.b, cross: true, why: l.why });
  });
  return { nodes, edges };
}

// One simulation step. Mutates node positions/velocities in place.
function step(nodes, byId, edges, alpha, fixedId) {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const d2 = Math.max(dx * dx + dy * dy, 100);
      const f = (REPULSION * alpha) / d2;
      const d = Math.sqrt(d2);
      dx /= d;
      dy /= d;
      a.vx -= dx * f; a.vy -= dy * f;
      b.vx += dx * f; b.vy += dy * f;

      // Labels are wide and short: push overlapping label boxes apart along the
      // axis that needs the smaller move.
      const ox = (a.w + b.w) / 2 - Math.abs(b.x - a.x);
      const oy = LABEL_H - Math.abs(b.y - a.y);
      if (ox > 0 && oy > 0) {
        const push = 0.25 * Math.max(alpha, 0.1);
        if (oy < ox) {
          const s = (b.y >= a.y ? 1 : -1) * oy * push;
          a.vy -= s; b.vy += s;
        } else {
          const s = (b.x >= a.x ? 1 : -1) * ox * push;
          a.vx -= s; b.vx += s;
        }
      }
    }
  }
  edges.forEach((e) => {
    const a = byId[e.source];
    const b = byId[e.target];
    const { length, strength } = e.cross ? CROSS : SPOKE;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const f = (d - length) * strength * alpha;
    a.vx += (dx / d) * f; a.vy += (dy / d) * f;
    b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
  });
  nodes.forEach((n) => {
    if (n.id === fixedId) { n.vx = 0; n.vy = 0; return; }
    n.vx = (n.vx + (W / 2 - n.x) * GRAVITY * alpha) * DAMPING;
    n.vy = (n.vy + (H / 2 - n.y) * GRAVITY * alpha) * DAMPING;
    n.x += n.vx;
    n.y += n.vy;
    clamp(n);
  });
}

function scrollToThrust(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function KeywordGraph() {
  const graph = useMemo(buildGraph, []);
  const sim = useRef(null);
  const svgRef = useRef(null);
  const drag = useRef(null);
  const [, setFrame] = useState(0);
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const inView = useInView(svgRef, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();

  if (!sim.current) {
    const nodes = graph.nodes.map((n) => ({ ...n, vx: 0, vy: 0, home: { x: n.x, y: n.y } }));
    sim.current = { nodes, byId: Object.fromEntries(nodes.map((n) => [n.id, n])), alpha: 1, raf: 0, started: false };
    // Start collapsed toward the centre so the graph blooms open when it appears.
    nodes.forEach((n) => { n.x = W / 2 + (n.x - W / 2) * 0.15; n.y = H / 2 + (n.y - H / 2) * 0.15; });
  }

  const kick = (alpha) => {
    const s = sim.current;
    s.alpha = Math.max(s.alpha, alpha);
    if (s.raf) return;
    const tick = () => {
      step(s.nodes, s.byId, graph.edges, s.alpha, drag.current?.id);
      s.alpha *= ALPHA_DECAY;
      setFrame((f) => f + 1);
      s.raf = s.alpha > ALPHA_MIN || drag.current ? requestAnimationFrame(tick) : 0;
    };
    s.raf = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const s = sim.current;
    if (s.started || !(inView || reduce)) return;
    s.started = true;
    if (reduce) {
      // No animation: settle the layout up front and draw the final state.
      s.nodes.forEach((n) => { n.x = n.home.x; n.y = n.home.y; });
      for (let i = 0; i < 400; i++) step(s.nodes, s.byId, graph.edges, Math.max(0.05, 1 - i / 400), null);
      setFrame((f) => f + 1);
    } else {
      kick(1);
    }
  }, [inView, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => cancelAnimationFrame(sim.current.raf), []);

  const toSvg = (e) => {
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svgRef.current.getScreenCTM().inverse());
    return { x: pt.x, y: pt.y };
  };

  const onPointerDown = (e, id) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id, start: { x: e.clientX, y: e.clientY }, moved: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.start.x, e.clientY - d.start.y) < 4) return;
    d.moved = true;
    const n = sim.current.byId[d.id];
    const p = toSvg(e);
    n.x = p.x;
    n.y = p.y;
    clamp(n);
    if (!reduce) kick(0.3);
    else setFrame((f) => f + 1);
  };
  const onPointerUp = (id) => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) {
      const n = sim.current.byId[id];
      if (n.hub) scrollToThrust(id);
      else setSelected((s) => (s === id ? null : id));
    }
  };

  const active = hover ?? selected;
  const { byId } = sim.current;
  const focus = useMemo(() => {
    if (!active) return null;
    const nodes = new Set([active]);
    const edges = new Set();
    graph.edges.forEach((e) => {
      if (e.source === active || e.target === active) { nodes.add(e.source); nodes.add(e.target); edges.add(e.id); }
    });
    return { nodes, edges };
  }, [active, graph.edges]);

  const activeNode = active && byId[active];
  const activeLinks = activeNode && !activeNode.hub ? graph.edges.filter((e) => e.cross && (e.source === active || e.target === active)) : [];

  return (
    <div className="kg">
      <div className="kg-canvas">
        <svg
          ref={svgRef}
          className={`kg-svg${focus ? ' has-focus' : ''}`}
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-label="Graph connecting the keywords of each research thrust"
          onPointerMove={onPointerMove}
        >
          {graph.edges.map((e) => {
            const a = byId[e.source];
            const b = byId[e.target];
            const lit = focus?.edges.has(e.id);
            return (
              <line
                key={e.id}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                className={`kg-edge${e.cross ? ' cross' : ''}${lit ? ' lit' : ''}${focus && !lit ? ' dim' : ''}`}
              />
            );
          })}
          {sim.current.nodes.map((n) => {
            const lit = focus?.nodes.has(n.id);
            return (
              <g
                key={n.id}
                className={`kg-node${n.hub ? ' hub' : ''}${n.id === active ? ' active' : ''}${focus && !lit ? ' dim' : ''}`}
                tabIndex={0}
                role="button"
                aria-label={n.hub ? `${n.thrust.title}: jump to section` : `${n.label} (${n.thrust.title})`}
                onPointerEnter={() => setHover(n.id)}
                onPointerLeave={() => setHover(null)}
                onPointerDown={(e) => onPointerDown(e, n.id)}
                onPointerUp={() => onPointerUp(n.id)}
                onFocus={() => setHover(n.id)}
                onBlur={() => setHover(null)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  if (n.hub) scrollToThrust(n.id);
                  else setSelected((s) => (s === n.id ? null : n.id));
                }}
              >
                <circle cx={n.x} cy={n.y} r={16} className="kg-hit" />
                <circle cx={n.x} cy={n.y} r={n.hub ? 8 : 4.5} className="kg-dot" />
                <text x={n.x} y={n.y + (n.hub ? 25 : 19)} textAnchor="middle" className="kg-label">{n.label}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="kg-info" aria-live="polite">
        {!activeNode && <p>Hover or tap a keyword to see its connections. Drag nodes to rearrange the graph; select a thrust to jump to it.</p>}
        {activeNode?.hub && <p><strong>{activeNode.thrust.title}</strong> · {activeNode.thrust.tags.join(', ')}</p>}
        {activeNode && !activeNode.hub && (
          <>
            <p><strong>{activeNode.label}</strong> · {activeNode.thrust.title}</p>
            {activeLinks.map((e) => (
              <p key={e.id}>↔ <strong>{e.source === active ? e.target : e.source}</strong>: {e.why}</p>
            ))}
          </>
        )}
      </div>

      <details className="kg-list">
        <summary>View the connections as a list</summary>
        <ul>
          {graph.edges.filter((e) => e.cross).map((e) => (
            <li key={e.id}><strong>{e.source}</strong> ↔ <strong>{e.target}</strong>: {e.why}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
