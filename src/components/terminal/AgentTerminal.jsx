import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FiArrowRight,
  FiCheck,
  FiCopy,
  FiFileText,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiCornerDownLeft,
  FiX,
} from "react-icons/fi";
import Section from "../Section";
import Reveal from "../Reveal";
import useReducedMotion from "../../hooks/useReducedMotion";
import { copyEmail, openResume } from "../../lib/actions";
import { scrollToId } from "../../lib/scroll";
import { AGENT_TITLE, GREETING, SUGGESTIONS, respond } from "./agentScript";
import "./AgentTerminal.css";

// ---------- inline text: `code` and **bold** ----------

function parseInline(text) {
  return text
    .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith("`") && part.endsWith("`")) return { k: "c", s: part.slice(1, -1) };
      if (part.startsWith("**") && part.endsWith("**")) return { k: "b", s: part.slice(2, -2) };
      return { k: "t", s: part };
    });
}

const segLen = (segs) => segs.reduce((n, g) => n + g.s.length, 0);

function Inline({ segs, upTo = Infinity }) {
  let left = upTo;
  const out = [];
  for (let i = 0; i < segs.length && left > 0; i++) {
    const g = segs[i];
    const s = g.s.length > left ? g.s.slice(0, left) : g.s;
    left -= s.length;
    if (g.k === "c") out.push(<code key={i}>{s}</code>);
    else if (g.k === "b") out.push(<strong key={i}>{s}</strong>);
    else out.push(<Fragment key={i}>{s}</Fragment>);
  }
  return out;
}

// ---------- block preparation (cost = streaming "units") ----------

const ROW_COST = 10;
const WIDGET_COST = 8;

function prepareBlocks(blocks) {
  return blocks.map((b) => {
    switch (b.type) {
      case "p":
      case "note":
      case "code": {
        const segs = b.type === "code" ? [{ k: "t", s: b.text }] : parseInline(b.text);
        return { ...b, segs, cost: segLen(segs) };
      }
      case "list": {
        const items = b.items.map((t) => parseInline(t));
        return { ...b, segItems: items, cost: items.reduce((n, s) => n + segLen(s), 0) };
      }
      case "table": {
        const rows = b.rows.map((r) => r.map((c) => parseInline(c)));
        return { ...b, segRows: rows, cost: (rows.length + 1) * ROW_COST };
      }
      default:
        return { ...b, cost: WIDGET_COST };
    }
  });
}

const ICONS = {
  mail: FiMail,
  github: FiGithub,
  linkedin: FiLinkedin,
  copy: FiCopy,
  file: FiFileText,
  arrow: FiArrowRight,
};

function runAction(item) {
  if (item.action === "copyEmail") copyEmail();
  else if (item.action === "openResume") openResume();
  else if (item.action === "scroll") scrollToId(item.target);
}

const Cursor = () => <span className="at-cursor" aria-hidden="true" />;

function Block({ b, shown, cursor }) {
  switch (b.type) {
    case "p":
      return (
        <p className="at-p">
          <Inline segs={b.segs} upTo={shown} />
          {cursor && <Cursor />}
        </p>
      );
    case "note":
      return (
        <p className="at-note">
          <Inline segs={b.segs} upTo={shown} />
          {cursor && <Cursor />}
        </p>
      );
    case "code":
      return (
        <p className="at-code">
          <Inline segs={b.segs} upTo={shown} />
          {cursor && <Cursor />}
        </p>
      );
    case "list": {
      const Tag = b.ordered ? "ol" : "ul";
      let left = shown;
      const items = [];
      for (let i = 0; i < b.segItems.length && left > 0; i++) {
        const len = segLen(b.segItems[i]);
        const take = Math.min(len, left);
        left -= take;
        const last = left <= 0 || i === b.segItems.length - 1;
        items.push(
          <li key={i}>
            <Inline segs={b.segItems[i]} upTo={take} />
            {cursor && last && <Cursor />}
          </li>,
        );
      }
      return <Tag className="at-list">{items}</Tag>;
    }
    case "table": {
      const rows = Math.max(0, Math.ceil(shown / ROW_COST) - 1);
      return (
        <div className="at-table-wrap">
          <table className="at-table">
            <thead>
              <tr>
                {b.head.map((h) => (
                  <th key={h} scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.segRows.slice(0, rows).map((r, i) => (
                <tr key={i} className="at-in">
                  {r.map((c, j) => (
                    <td key={j}>
                      <Inline segs={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "tags":
      return (
        <ul className="tags at-tags at-in">
          {b.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      );
    case "links":
      return (
        <div className="at-links at-in">
          {b.items.map((l) => {
            const Icon = ICONS[l.icon] ?? FiArrowRight;
            const external = /^https?:/.test(l.href);
            return (
              <a
                key={l.href}
                href={l.href}
                className="at-link"
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <Icon aria-hidden="true" />
                <span>{l.label}</span>
              </a>
            );
          })}
        </div>
      );
    case "actions":
      return (
        <div className="at-actions at-in">
          {b.items.map((a) => {
            const Icon = ICONS[a.icon] ?? FiArrowRight;
            return (
              <button
                key={a.label}
                type="button"
                className={`at-action${a.primary ? " is-primary" : ""}`}
                onClick={() => runAction(a)}
              >
                <Icon aria-hidden="true" />
                {a.label}
              </button>
            );
          })}
        </div>
      );
    default:
      return null;
  }
}

function AgentBody({ blocks, revealed, streaming }) {
  let budget = revealed;
  const out = [];
  for (let i = 0; i < blocks.length && budget > 0; i++) {
    const b = blocks[i];
    const shown = Math.min(budget, b.cost);
    budget -= shown;
    const isLast = budget <= 0 || i === blocks.length - 1;
    out.push(<Block key={i} b={b} shown={shown} cursor={streaming && isLast} />);
  }
  return <div className="at-body">{out}</div>;
}

function ToolChip({ tool }) {
  const done = tool.status === "done";
  return (
    <div className={`at-tool${done ? " is-done" : ""}`}>
      <span className="at-tool-call">
        <span className="at-tool-arrow" aria-hidden="true">→</span> {tool.name}({tool.args})
      </span>
      <span className="at-tool-status">
        {done ? (
          <>
            <FiCheck aria-hidden="true" className="at-tool-check" />
            {tool.result} · {tool.ms}ms
          </>
        ) : (
          <>
            <span className="at-spinner" aria-hidden="true" />
            running…
          </>
        )}
      </span>
    </div>
  );
}

function Entry({ e }) {
  if (e.kind === "user") {
    return (
      <div className="at-entry at-user at-in">
        <span className="at-prompt" aria-hidden="true">❯</span>
        <span className="sr-only">You asked: </span>
        <span className="at-user-text">{e.text}</span>
      </div>
    );
  }
  const visibleTools = e.tools.filter((t) => t.status !== "pending");
  return (
    <div className="at-entry at-agent at-in">
      {visibleTools.length > 0 && (
        <div className="at-tools">
          {visibleTools.map((t, i) => (
            <ToolChip key={i} tool={t} />
          ))}
        </div>
      )}
      <AgentBody blocks={e.blocks} revealed={e.revealed} streaming={!e.done} />
    </div>
  );
}

// ---------- runner helpers ----------

const fakeMs = () => 18 + Math.round(Math.random() * 70);

function makeAgentEntry(id, tools, blocks) {
  const prepared = prepareBlocks(blocks);
  return {
    id,
    kind: "agent",
    tools: tools.map((t) => ({ ...t, status: "pending", ms: 0 })),
    blocks: prepared,
    total: prepared.reduce((n, b) => n + b.cost, 0),
    revealed: 0,
    done: false,
  };
}

function completeEntry(e) {
  if (e.kind !== "agent" || e.done) return e;
  return {
    ...e,
    tools: e.tools.map((t) => (t.status === "done" ? t : { ...t, status: "done", ms: t.ms || fakeMs() })),
    revealed: e.total,
    done: true,
  };
}

// ---------- component ----------

export default function AgentTerminal() {
  const reduced = useReducedMotion();
  const [entries, setEntries] = useState([]);
  const [busy, setBusy] = useState(false);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [caretAtEnd, setCaretAtEnd] = useState(true);

  const windowRef = useRef(null);
  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const idRef = useRef(0);
  const runnerRef = useRef(null);
  const greetedRef = useRef(false);
  const stickRef = useRef(true);
  const refocusRef = useRef(false);
  const historyRef = useRef([]);
  const historyIdxRef = useRef(-1);
  const draftRef = useRef("");

  const nextId = () => ++idRef.current;

  const patchEntry = useCallback((id, fn) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? fn(e) : e)));
  }, []);

  // Finish whatever is streaming right now, instantly.
  const finishCurrent = useCallback(() => {
    const r = runnerRef.current;
    if (!r) return;
    clearTimeout(r.timer);
    runnerRef.current = null;
    patchEntry(r.id, completeEntry);
    setBusy(false);
  }, [patchEntry]);

  // Animate tool calls, then stream the answer.
  const play = useCallback(
    (entry) => {
      if (reduced) {
        setEntries((prev) => [...prev, completeEntry(entry)]);
        return;
      }
      const r = { id: entry.id, timer: 0 };
      runnerRef.current = r;
      setBusy(true);
      setEntries((prev) => [...prev, entry]);

      const later = (fn, ms) => {
        r.timer = setTimeout(() => {
          if (runnerRef.current === r) fn();
        }, ms);
      };

      const base = Math.max(2, Math.ceil(entry.total / 170));
      let revealed = 0;
      const stream = () => {
        revealed = Math.min(entry.total, revealed + base + Math.floor(Math.random() * (base + 2)));
        if (revealed >= entry.total) {
          runnerRef.current = null;
          patchEntry(entry.id, completeEntry);
          setBusy(false);
          return;
        }
        patchEntry(entry.id, (e) => ({ ...e, revealed }));
        later(stream, 14 + Math.floor(Math.random() * 7));
      };

      let i = 0;
      const nextTool = () => {
        if (i >= entry.tools.length) {
          later(stream, entry.tools.length ? 160 : 220);
          return;
        }
        const idx = i++;
        const wait = 260 + Math.round(Math.random() * 300);
        const ms = fakeMs();
        patchEntry(entry.id, (e) => ({
          ...e,
          tools: e.tools.map((t, j) => (j === idx ? { ...t, status: "running" } : t)),
        }));
        later(() => {
          patchEntry(entry.id, (e) => ({
            ...e,
            tools: e.tools.map((t, j) => (j === idx ? { ...t, status: "done", ms } : t)),
          }));
          later(nextTool, 110);
        }, wait);
      };
      later(nextTool, 120);
    },
    [reduced, patchEntry],
  );

  const greet = useCallback(
    (instant) => {
      if (greetedRef.current) return;
      greetedRef.current = true;
      const entry = makeAgentEntry(nextId(), [], [{ type: "p", text: GREETING }]);
      if (instant) setEntries((prev) => [completeEntry(entry), ...prev]);
      else play(entry);
    },
    [play],
  );

  const run = useCallback(
    (raw, { fromInput = false } = {}) => {
      const text = String(raw ?? "").trim();
      if (!text) return;
      finishCurrent();
      greet(true);

      const hist = historyRef.current;
      if (hist[hist.length - 1] !== text) hist.push(text);
      historyIdxRef.current = -1;
      draftRef.current = "";
      stickRef.current = true;
      refocusRef.current = fromInput;

      const res = respond(text);
      if (res.kind === "clear") {
        setEntries([]);
        return;
      }
      setEntries((prev) => [...prev, { id: nextId(), kind: "user", text }]);
      play(makeAgentEntry(nextId(), res.tools, res.blocks));
    },
    [finishCurrent, greet, play],
  );

  // Greeting on first scroll into view.
  useEffect(() => {
    const el = windowRef.current;
    if (!el || greetedRef.current) return undefined;
    if (!("IntersectionObserver" in window)) {
      greet(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (items) => {
        if (items.some((it) => it.isIntersecting)) {
          io.disconnect();
          greet(false);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [greet]);

  // Commands from the command palette.
  useEffect(() => {
    const onCmd = (e) => run(e.detail);
    window.addEventListener("app:terminal", onCmd);
    return () => window.removeEventListener("app:terminal", onCmd);
  }, [run]);

  // Stop timers on unmount.
  useEffect(() => () => clearTimeout(runnerRef.current?.timer), []);

  // Keep the output pinned to the bottom (inner container only).
  useLayoutEffect(() => {
    const el = outputRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [entries]);

  // Give focus back after an answer the user typed finishes.
  useEffect(() => {
    if (!busy && refocusRef.current) {
      refocusRef.current = false;
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [busy]);

  const onScroll = () => {
    const el = outputRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
  };

  const syncCaret = () => {
    const el = inputRef.current;
    if (!el) return;
    const atEnd = el.selectionStart === el.value.length && el.selectionEnd === el.value.length;
    setCaretAtEnd(atEnd && el.scrollWidth <= el.clientWidth + 1);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (busy || !value.trim()) return;
    const text = value;
    setValue("");
    setCaretAtEnd(true);
    run(text, { fromInput: true });
  };

  const onKeyDown = (e) => {
    const hist = historyRef.current;
    if (e.key === "ArrowUp") {
      if (!hist.length) return;
      e.preventDefault();
      if (historyIdxRef.current === -1) {
        draftRef.current = value;
        historyIdxRef.current = hist.length - 1;
      } else {
        historyIdxRef.current = Math.max(0, historyIdxRef.current - 1);
      }
      setValue(hist[historyIdxRef.current]);
      setCaretAtEnd(true);
    } else if (e.key === "ArrowDown") {
      if (historyIdxRef.current === -1) return;
      e.preventDefault();
      const next = historyIdxRef.current + 1;
      if (next >= hist.length) {
        historyIdxRef.current = -1;
        setValue(draftRef.current);
      } else {
        historyIdxRef.current = next;
        setValue(hist[next]);
      }
      setCaretAtEnd(true);
    } else if (e.key === "Escape") {
      setValue("");
      historyIdxRef.current = -1;
    }
  };

  // Clicking anywhere in the console focuses the input (without moving the page).
  const onWindowClick = (e) => {
    if (e.target.closest("a, button, input, .at-table-wrap")) return;
    if (window.getSelection?.().toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  const showBlock = !busy && (focused ? caretAtEnd : !value);

  return (
    <Section
      id="agent"
      label="Ask my agent"
      title="Don't just read the résumé. Interrogate it."
      lead="A small agent console wired to my portfolio data. It calls tools and streams its answers the same way the agents I ship in production do."
      className="agent-section"
    >
      <Reveal className="at-layout" delay={0.1}>
        <div className="at-main">
          <div
            ref={windowRef}
            className={`at-window${busy ? " is-busy" : ""}`}
            onClick={onWindowClick}
          >
            <div className="at-titlebar">
              <span className="at-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="at-title mono">{AGENT_TITLE}</span>
              <span className={`at-status mono${busy ? " is-busy" : ""}`}>
                <span className="at-status-dot" aria-hidden="true" />
                {busy ? "streaming" : "ready"}
              </span>
            </div>

            <div
              ref={outputRef}
              className="at-output"
              role="log"
              aria-live="polite"
              aria-label="Agent conversation"
              aria-busy={busy}
              onScroll={onScroll}
              data-lenis-prevent
              tabIndex={0}
            >
              {entries.length === 0 && (
                <p className="at-empty">
                  <span className="at-prompt" aria-hidden="true">❯</span> type <code>help</code> to get started
                </p>
              )}
              {entries.map((e) => (
                <Entry key={e.id} e={e} />
              ))}
            </div>

            <form className="at-inputline" onSubmit={onSubmit}>
              <label htmlFor="agent-input" className="sr-only">
                Ask the agent about Jaydip&apos;s projects, stack or experience
              </label>
              <span className="at-prompt" aria-hidden="true">❯</span>
              <div className="at-field">
                <input
                  ref={inputRef}
                  id="agent-input"
                  className={`at-input${showBlock ? " hide-caret" : ""}`}
                  type="text"
                  value={value}
                  disabled={busy}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="send"
                  placeholder="Ask about projects, stack, experience…"
                  onChange={(e) => {
                    setValue(e.target.value);
                    historyIdxRef.current = -1;
                    syncCaret();
                  }}
                  onSelect={syncCaret}
                  onKeyDown={onKeyDown}
                  onFocus={() => {
                    setFocused(true);
                    syncCaret();
                  }}
                  onBlur={() => setFocused(false)}
                />
                <span className="at-mirror" aria-hidden="true">
                  <span className="at-mirror-text">{value}</span>
                  {showBlock && <span className={`at-caret${focused ? " is-focused" : ""}`} />}
                  {!value && (
                    <span className="at-placeholder">
                      {busy ? "agent is responding…" : "Ask about projects, stack, experience…"}
                    </span>
                  )}
                </span>
              </div>
              <button
                type="submit"
                className="at-send"
                disabled={busy || !value.trim()}
                aria-label="Send"
              >
                <FiCornerDownLeft aria-hidden="true" />
              </button>
            </form>
          </div>

          <div className="at-chips" role="group" aria-label="Suggested questions">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="at-chip mono" onClick={() => run(s)}>
                <span aria-hidden="true">❯</span> {s}
              </button>
            ))}
            {entries.length > 1 && (
              <button type="button" className="at-chip at-chip-ghost mono" onClick={() => run("clear")}>
                <FiX aria-hidden="true" /> clear
              </button>
            )}
          </div>
        </div>

        <aside className="at-aside">
          <p className="at-aside-label mono">How this works</p>
          <p className="at-aside-text">
            Scripted tool calls and streaming that mirror the agents I build in production
            <span className="at-aside-stack"> (LangGraph · Claude · WebSockets)</span>.
          </p>
          <ol className="at-steps">
            <li>
              <span className="mono">01</span> Route the intent
            </li>
            <li>
              <span className="mono">02</span> Call tools over portfolio data
            </li>
            <li>
              <span className="mono">03</span> Stream tokens back to the UI
            </li>
          </ol>
          <p className="at-aside-foot">
            Tip: <span className="kbd">↑</span> <span className="kbd">↓</span> for history. No LLM calls — nothing
            leaves your browser.
          </p>
        </aside>
      </Reveal>
    </Section>
  );
}
