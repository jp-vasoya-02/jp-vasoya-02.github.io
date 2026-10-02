import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";
import Section from "../Section";
import Reveal from "../Reveal";
import useReducedMotion from "../../hooks/useReducedMotion";
import { skills } from "../../data/portfolio";
import "./Skills.css";

const FIELD_H = 540;
const CYCLE_MS = 3200;
const LABEL_FONT = '500 13px Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

// Short display labels for nodes; the full text stays in the sr-only list and title.
const shortLabel = (s) =>
  s
    .replace(/\s*\(.*\)\s*$/, "")
    .replace("Options flow and dark pool analytics", "Options flow & dark pool")
    .replace("Unit and integration testing", "Unit & integration tests");

// Small deterministic PRNG so the layout is identical on every render / visit.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let measureCtx;
function textWidth(text) {
  if (!measureCtx) {
    const c = document.createElement("canvas");
    measureCtx = c.getContext("2d");
  }
  if (!measureCtx) return text.length * 7.4;
  measureCtx.font = LABEL_FONT;
  return measureCtx.measureText(text).width;
}

/*
 * Layout: the largest group sits at the centre, the other hubs on an ellipse; each group's nodes start on a seeded golden-angle
 * spiral around the hub, then a short box-repulsion pass pushes label boxes apart (within
 * the group) and clamps them inside the field. Computed in px for the measured width.
 */
function computeLayout(width, height) {
  const rand = mulberry32(20190601);
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.37;
  const ry = height * 0.36;
  const pad = 8;
  // The largest group (AI) anchors the centre; the rest orbit it on an ellipse.
  const core = skills.reduce((best, g, i) => (g.items.length > skills[best].items.length ? i : best), 0);
  const ring = skills.length - 1;

  return skills.map((g, gi) => {
    const slot = gi < core ? gi : gi - 1;
    const a = -Math.PI / 2 + (slot / ring) * Math.PI * 2 + 0.2;
    const hub = gi === core ? { x: cx, y: cy } : { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry };
    const twist = rand() * Math.PI * 2;

    const nodes = g.items.map((item, i) => {
      const label = shortLabel(item);
      const ang = twist + i * 2.39996;
      const r = 16 * Math.sqrt(i + 0.6) + rand() * 6;
      const x = hub.x + Math.cos(ang) * r * 1.35;
      const y = hub.y + Math.sin(ang) * r;
      const w = Math.ceil(textWidth(label) * 1.06) + 20;
      return { item, label, x, y, w, h: 26, side: x < hub.x ? "left" : "right", dur: 5 + rand() * 4, delay: -rand() * 6 };
    });

    // Label box for a node (dot + gap + pill), relative to the node position.
    const box = (nd) =>
      nd.side === "right"
        ? { l: nd.x - 6, r: nd.x + 10 + nd.w, t: nd.y - nd.h / 2, b: nd.y + nd.h / 2 }
        : { l: nd.x - 10 - nd.w, r: nd.x + 6, t: nd.y - nd.h / 2, b: nd.y + nd.h / 2 };

    const gap = 4;
    for (let it = 0; it < 220; it++) {
      let moved = false;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const A = box(nodes[i]);
          const B = box(nodes[j]);
          const ox = Math.min(A.r, B.r) - Math.max(A.l, B.l) + gap;
          const oy = Math.min(A.b, B.b) - Math.max(A.t, B.t) + gap;
          if (ox <= 0 || oy <= 0) continue;
          moved = true;
          if (oy < ox) {
            const dir = nodes[i].y <= nodes[j].y ? -1 : 1;
            nodes[i].y += (dir * oy) / 2;
            nodes[j].y -= (dir * oy) / 2;
          } else {
            const dir = nodes[i].x <= nodes[j].x ? -1 : 1;
            nodes[i].x += (dir * ox) / 2;
            nodes[j].x -= (dir * ox) / 2;
          }
        }
      }
      // Keep every label box inside the field.
      for (const nd of nodes) {
        const b = box(nd);
        if (b.l < pad) nd.x += pad - b.l;
        if (b.r > width - pad) nd.x -= b.r - (width - pad);
        if (b.t < pad) nd.y += pad - b.t;
        if (b.b > height - pad) nd.y -= b.b - (height - pad);
      }
      if (!moved) break;
    }

    // Constellation edges: link each node to its nearest earlier node (a small spanning tree).
    const edges = [];
    for (let i = 1; i < nodes.length; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let j = 0; j < i; j++) {
        const d = (nodes[i].x - nodes[j].x) ** 2 + (nodes[i].y - nodes[j].y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      }
      edges.push([best, i]);
    }

    return { group: g.group, hub, nodes, edges, dur: 7 + rand() * 4, delay: -rand() * 6 };
  });
}

function useMediaQuery(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return match;
}

function Constellation({ active, onNodeHover }) {
  const fieldRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [hoverNode, setHoverNode] = useState(null);

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => (width > 0 ? computeLayout(width, FIELD_H) : []), [width]);

  return (
    <div ref={fieldRef} className="sk-field" style={{ height: FIELD_H }} aria-hidden="true">
      {width > 0 && (
        <svg className="sk-orbit" width={width} height={FIELD_H}>
          <ellipse cx={width / 2} cy={FIELD_H / 2} rx={width * 0.37} ry={FIELD_H * 0.36} />
        </svg>
      )}
      {layout.map((g, gi) => {
        const on = gi === active;
        return (
          <div
            key={g.group}
            className={`sk-cluster${on ? " is-on" : ""}`}
            style={{ animationDuration: `${g.dur}s`, animationDelay: `${g.delay}s` }}
          >
            <svg className="sk-lines" width={width} height={FIELD_H}>
              {g.edges.map(([a, b]) => (
                <line key={`${a}-${b}`} x1={g.nodes[a].x} y1={g.nodes[a].y} x2={g.nodes[b].x} y2={g.nodes[b].y} />
              ))}
            </svg>
            {g.nodes.map((nd, i) => {
              const key = `${gi}-${i}`;
              return (
                <div
                  key={nd.item}
                  className={`sk-node sk-${nd.side}${hoverNode === key ? " is-hover" : ""}`}
                  style={{
                    left: nd.x,
                    top: nd.y,
                    "--d": `${on ? i * 28 : 0}ms`,
                    animationDuration: `${nd.dur}s`,
                    animationDelay: `${nd.delay}s`,
                  }}
                  onMouseEnter={() => {
                    setHoverNode(key);
                    onNodeHover(gi);
                  }}
                  onMouseLeave={() => setHoverNode(null)}
                  title={nd.item}
                >
                  <span className="sk-dot" />
                  <span className="sk-label">{nd.label}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function Skills() {
  const reduced = useReducedMotion();
  const compact = useMediaQuery("(max-width: 899px)");
  const [active, setActive] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const wrapRef = useRef(null);
  const inView = useInView(wrapRef, { margin: "-15% 0px -15% 0px" });

  // Auto-cycle categories until the user interacts (only while visible, never with reduced motion).
  useEffect(() => {
    if (compact || reduced || interacted || !inView) return;
    const id = setInterval(() => setActive((a) => (a + 1) % skills.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [compact, reduced, interacted, inView]);

  const pick = (i) => {
    setInteracted(true);
    setActive(i);
  };

  const total = skills.reduce((s, g) => s + g.items.length, 0);

  return (
    <Section
      id="skills"
      label="Skills"
      title="The stack I build with"
      lead={`${total} skills across ${skills.length} areas, from Django and Redis Streams to Claude, LangGraph and MCP.`}
      className="skills"
    >
      {compact ? (
        <div className="sk-grid">
          {skills.map((g, i) => (
            <Reveal key={g.group} delay={(i % 2) * 0.06} className="sk-group card">
              <h3>
                {g.group}
                <span className="mono muted">{g.items.length}</span>
              </h3>
              <ul className="tags">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal>
          <div ref={wrapRef} className="sk-wrap">
            <div className="sk-cats" role="group" aria-label="Skill categories">
              {skills.map((g, i) => (
                <button
                  key={g.group}
                  type="button"
                  className={`sk-cat${i === active ? " is-on" : ""}`}
                  aria-pressed={i === active}
                  onMouseEnter={() => pick(i)}
                  onFocus={() => pick(i)}
                  onClick={() => pick(i)}
                >
                  <span className="sk-cat-name">{g.group}</span>
                  <span className="sk-cat-count mono">{String(g.items.length).padStart(2, "0")}</span>
                </button>
              ))}
              <p className="sk-hint mono">
                {interacted || reduced ? "Hover a category or a star" : "Auto-cycling · hover to explore"}
              </p>
            </div>

            <div className="sk-stage">
              <Constellation active={active} onNodeHover={pick} />
              <ul className="sr-only">
                {skills.map((g) => (
                  <li key={g.group}>
                    {g.group}: {g.items.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      )}
    </Section>
  );
}
