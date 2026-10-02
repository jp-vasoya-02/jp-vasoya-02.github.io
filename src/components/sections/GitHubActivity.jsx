import { useEffect, useMemo, useRef, useState } from "react";
import { AiFillGithub } from "react-icons/ai";
import Section from "../Section";
import Reveal from "../Reveal";
import { profile } from "../../data/portfolio";
import { fetchContributions, summarize, toWeeks } from "./github/contributions";
import "./GitHubActivity.css";

const USER = profile.github.split("/").pop();
const FIRST_YEAR = 2021;
const thisYear = new Date().getFullYear();
const YEARS = ["last", ...Array.from({ length: thisYear - FIRST_YEAR + 1 }, (_, i) => String(thisYear - i))];

const fmtDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default function GitHubActivity() {
  const [year, setYear] = useState("last");
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ status: "loading", data: s.data }));
    fetchContributions(USER, year, ctrl.signal)
      .then((data) => setState({ status: "ready", data }))
      .catch((err) => {
        if (err.name !== "AbortError") setState({ status: "error", data: null });
      });
    return () => ctrl.abort();
  }, [year]);

  const scrollRef = useRef(null);
  const days = state.data?.days;

  // On narrow screens the graph scrolls sideways; start at the most recent weeks.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && days) el.scrollLeft = el.scrollWidth;
  }, [days]);
  const { weeks, months } = useMemo(() => toWeeks(days || []), [days]);
  const stats = useMemo(() => summarize(days || []), [days]);

  const statItems = state.data && [
    { value: state.data.total.toLocaleString("en-US"), label: year === "last" ? "contributions in the last year" : `contributions in ${year}` },
    { value: stats.activeDays, label: "active days" },
    { value: `${stats.longest}d`, label: "longest streak" },
    { value: stats.best ? stats.best.count : 0, label: stats.best ? `best day · ${fmtDate(stats.best.date)}` : "best day" },
  ];

  return (
    <Section
      id="github"
      label="Open source & activity"
      title="Shipping, every week."
      lead="My GitHub contribution graph, loaded live from my profile."
      className="gh"
    >
      <Reveal className="card gh-card">
        <div className="gh-head">
          <a className="gh-user" href={profile.github} target="_blank" rel="noreferrer">
            <AiFillGithub aria-hidden="true" /> @{USER}
          </a>
          <div className="gh-years" role="group" aria-label="Contribution year">
            {YEARS.map((y) => (
              <button
                key={y}
                type="button"
                className={`gh-year${y === year ? " is-on" : ""}`}
                aria-pressed={y === year}
                onClick={() => setYear(y)}
              >
                {y === "last" ? "Last 12 months" : y}
              </button>
            ))}
          </div>
        </div>

        {state.status === "error" ? (
          <p className="gh-error">
            Couldn&apos;t load the contribution graph right now.{" "}
            <a href={profile.github} target="_blank" rel="noreferrer">
              See it on GitHub ↗
            </a>
          </p>
        ) : (
          <>
            <dl className="gh-stats" aria-busy={state.status === "loading"}>
              {(statItems || Array.from({ length: 4 }, (_, i) => ({ value: "—", label: "loading", key: i }))).map((s, i) => (
                <div className="gh-stat" key={s.key ?? s.label + i}>
                  <dt>{s.label}</dt>
                  <dd className="mono">{s.value}</dd>
                </div>
              ))}
            </dl>

            <div ref={scrollRef} className={`gh-scroll${state.status === "loading" ? " is-loading" : ""}`}>
              <div className="gh-graph" style={{ "--weeks": weeks.length || 53 }}>
                <div className="gh-months" aria-hidden="true">
                  {months.map((m) => (
                    <span key={`${m.col}-${m.label}`} style={{ gridColumn: m.col + 1 }}>
                      {m.label}
                    </span>
                  ))}
                </div>
                <div className="gh-days mono" aria-hidden="true">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>
                <div className="gh-grid" role="img" aria-label={state.data ? `${state.data.total} GitHub contributions` : "Loading contributions"}>
                  {weeks.map((week, col) =>
                    week.map((d, row) => (
                      <span
                        key={`${col}-${row}`}
                        className={d ? `gh-cell l${d.level}` : "gh-cell is-empty"}
                        style={{ "--col": col }}
                        title={d ? `${d.count} contribution${d.count === 1 ? "" : "s"} on ${fmtDate(d.date)}` : undefined}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="gh-foot">
              <span className="muted">Mirrors the contribution calendar on my GitHub profile.</span>
              <span className="gh-legend" aria-hidden="true">
                Less
                {[0, 1, 2, 3, 4].map((l) => (
                  <span key={l} className={`gh-cell l${l}`} />
                ))}
                More
              </span>
            </div>
          </>
        )}
      </Reveal>
    </Section>
  );
}
