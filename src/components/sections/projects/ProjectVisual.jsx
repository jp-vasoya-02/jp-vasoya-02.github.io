import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import useReducedMotion from "../../../hooks/useReducedMotion";
import "./ProjectVisual.css";

const ease = [0.16, 1, 0.3, 1];

/* ------------------------------------------------------------------ */
/* agent: user question -> tool call -> streamed answer                */
/* ------------------------------------------------------------------ */
const ANSWER = [
  "Heavy call buying at the $140 strike",
  "$4.2M premium, 68% filled at the ask",
  "Skew is bullish vs the 20 day average",
];
const AGENT_STEPS = 2 + ANSWER.length; // user, tool, answer lines

function AgentVisual({ active, reduced }) {
  const [step, setStep] = useState(reduced ? AGENT_STEPS : 0);

  useEffect(() => {
    if (reduced) {
      setStep(AGENT_STEPS);
      return undefined;
    }
    if (!active) return undefined;
    // Each step waits a beat; after the last one, hold then restart.
    const delay = step === 0 ? 500 : step === 1 ? 1100 : step >= AGENT_STEPS ? 3200 : 650;
    const t = setTimeout(() => setStep((s) => (s >= AGENT_STEPS ? 0 : s + 1)), delay);
    return () => clearTimeout(t);
  }, [active, reduced, step]);

  const toolDone = step >= 3;
  const fade = reduced
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.45, ease } };

  return (
    <div className="pv-agent">
      <AnimatePresence initial={false}>
        {step >= 1 && (
          <motion.div key="q" className="pv-bubble pv-bubble--user" {...fade}>
            Any unusual NVDA call flow today?
          </motion.div>
        )}
        {step >= 2 && (
          <motion.div key="tool" className={`pv-tool ${toolDone ? "is-done" : ""}`} {...fade}>
            <span className="pv-tool-dot" aria-hidden="true" />
            <span className="mono">get_options_flow()</span>
            <span className="pv-tool-status mono">{toolDone ? "200 · 84ms" : "running"}</span>
          </motion.div>
        )}
        {step >= 3 && (
          <motion.div key="a" className="pv-bubble pv-bubble--agent" {...fade}>
            {ANSWER.map((line, i) => {
              const shown = step >= 3 + i || reduced;
              return (
                <span key={line} className={`pv-line ${shown ? "is-shown" : ""}`}>
                  <span className="pv-line-text">{line}</span>
                </span>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* flow: live options tape + bounded queue                             */
/* ------------------------------------------------------------------ */
const TICKERS = [
  ["SPY", 572],
  ["NVDA", 140],
  ["TSLA", 255],
  ["AAPL", 228],
  ["QQQ", 492],
];

let rowId = 0;
function makeRow(seed) {
  const r = seed ?? Math.random();
  const [ticker, base] = TICKERS[Math.floor(r * 997) % TICKERS.length];
  const strike = base + (Math.floor(r * 113) % 9) * 5 - 20;
  const call = Math.floor(r * 71) % 3 !== 0;
  const prem = 0.2 + ((r * 7919) % 4.6);
  const ask = Math.floor(r * 37) % 5 < 3;
  rowId += 1;
  return { id: rowId, ticker, strike, cp: call ? "C" : "P", prem: `$${prem.toFixed(1)}M`, ask };
}

const SEED_ROWS = [0.12, 0.47, 0.83, 0.29, 0.66, 0.91, 0.38].map((s) => makeRow(s));

function FlowVisual({ active, reduced }) {
  const [rows, setRows] = useState(SEED_ROWS);
  const [queue, setQueue] = useState(0.24);

  useEffect(() => {
    if (!active || reduced) return undefined;
    const t = setInterval(() => {
      const row = makeRow();
      const drift = (Math.random() - 0.45) * 0.22;
      setRows((prev) => [row, ...prev].slice(0, 7));
      setQueue((q) => Math.min(0.86, Math.max(0.08, q + drift)));
    }, 1100);
    return () => clearInterval(t);
  }, [active, reduced]);

  return (
    <div className="pv-flow">
      <div className="pv-flow-head mono" aria-hidden="true">
        <span>Sym</span>
        <span>Strike</span>
        <span>C/P</span>
        <span>Prem</span>
        <span>Side</span>
      </div>
      <div className="pv-flow-rows">
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <motion.div
              key={row.id}
              layout={!reduced}
              className="pv-flow-row mono"
              initial={{ opacity: 0, y: -14, backgroundColor: "rgba(94,234,212,0.14)" }}
              animate={{ opacity: 1, y: 0, backgroundColor: "rgba(94,234,212,0)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              <span className="pv-flow-sym">{row.ticker}</span>
              <span>{row.strike}</span>
              <span className={row.cp === "C" ? "is-up" : "is-down"}>{row.cp}</span>
              <span>{row.prem}</span>
              <span className={row.ask ? "is-up" : "is-down"}>{row.ask ? "ASK" : "BID"}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="pv-queue mono">
        <span>queue</span>
        <span className="pv-queue-track">
          <span className="pv-queue-fill" style={{ transform: `scaleX(${queue})` }} />
        </span>
        <span>{(queue * 50).toFixed(1)}k / 50k</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* mcp: 105 tools in 17 groups lighting up in waves + chart drawing    */
/* ------------------------------------------------------------------ */
const COLS = 15;
const CELLS = Array.from({ length: 105 }, (_, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  // 17 groups: sixteen of six tools and one of nine.
  const group = Math.min(16, Math.floor(i / 6));
  return { i, delay: (col + row) * 0.07, alt: group % 2 === 1 };
});

function McpVisual() {
  return (
    <div className="pv-mcp">
      <div className="pv-mcp-top">
        <div className="pv-mcp-grid" aria-hidden="true">
          {CELLS.map((c) => (
            <span key={c.i} className={`pv-cell ${c.alt ? "is-alt" : ""}`} style={{ animationDelay: `${c.delay}s` }} />
          ))}
        </div>
        <p className="pv-mcp-count mono">
          <strong>105</strong> tools
          <span className="muted"> · </span>
          <strong>17</strong> groups
        </p>
      </div>
      <svg className="pv-mcp-chart" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="22" x2="300" y2="22" className="pv-mcp-level" />
        <path
          className="pv-mcp-line"
          pathLength="1"
          d="M0 46 L20 42 L38 47 L58 36 L76 39 L96 30 L114 34 L134 24 L152 28 L170 19 L190 25 L208 16 L228 20 L246 11 L266 15 L286 7 L300 9"
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* voice: waveform + cycling live transcript                           */
/* ------------------------------------------------------------------ */
const BARS = Array.from({ length: 44 }, (_, i) => {
  const h = 0.25 + Math.abs(Math.sin(i * 0.61) * Math.cos(i * 0.23)) * 0.75;
  return { i, h, dur: 0.7 + ((i * 37) % 9) / 10, delay: -((i * 13) % 10) / 10 };
});

const CAPTIONS = [
  { who: "You", text: "What's the put/call ratio on SPY right now?" },
  { who: "Agent", text: "0.82 and falling. Calls led the last hour." },
  { who: "You", text: "Set an alert if TSLA breaks 260." },
  { who: "Agent", text: "Done. I'll ping you on the break." },
];

function VoiceVisual({ active, reduced }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!active || reduced) return undefined;
    const t = setInterval(() => setIdx((i) => (i + 1) % CAPTIONS.length), 2600);
    return () => clearInterval(t);
  }, [active, reduced]);

  const cap = CAPTIONS[idx];
  return (
    <div className="pv-voice">
      <div className="pv-voice-top mono">
        <span className="pv-live">
          <span className="pv-live-dot" aria-hidden="true" /> live
        </span>
        <span className="muted">gemini-live · 56 tools</span>
      </div>
      <div className="pv-wave" aria-hidden="true">
        {BARS.map((b) => (
          <span
            key={b.i}
            className="pv-bar"
            style={{ "--h": b.h, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
          />
        ))}
      </div>
      <div className="pv-caption">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease }}
          >
            <span className={`pv-who mono ${cap.who === "Agent" ? "is-agent" : ""}`}>{cap.who}</span>
            {cap.text}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

const VISUALS = { agent: AgentVisual, flow: FlowVisual, mcp: McpVisual, voice: VoiceVisual };

export default function ProjectVisual({ type, paused = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-40px" });
  const reduced = useReducedMotion();
  const Visual = VISUALS[type] ?? AgentVisual;
  // Paused while a case study covers the page, so hidden visuals stop animating.
  const active = inView && !reduced && !paused;

  return (
    <div
      ref={ref}
      className={`pv pv--${type}`}
      data-active={active ? "true" : "false"}
      data-static={reduced ? "true" : "false"}
      aria-hidden="true"
    >
      <Visual active={active} reduced={reduced} />
    </div>
  );
}
