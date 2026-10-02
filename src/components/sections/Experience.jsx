import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import Section from "../Section";
import Reveal from "../Reveal";
import useReducedMotion from "../../hooks/useReducedMotion";
import { experience } from "../../data/portfolio";
import "./Experience.css";

// Highlight chips per role (keyed by company). Kept here since they are presentation only.
const highlights = {
  Freelance: ["4 connected products", "105 MCP tools", "OPRA firehose", "10M+ Redis keys", "1,500+ tests"],
  "LNX Cloud Technology": ["5 years", "Partner", "Thousands of concurrent users", "Team lead & mentor"],
};

// Rail fill and node activation share the same anchor line (60% down the viewport).
const ANCHOR = 0.6;

export default function Experience() {
  const reduced = useReducedMotion();
  const listRef = useRef(null);
  const nodeRefs = useRef([]);
  const thresholds = useRef([]);
  const [active, setActive] = useState(() => experience.map(() => false));

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: [`start ${ANCHOR}`, `end ${ANCHOR}`],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });

  const update = useCallback((p) => {
    const next = thresholds.current.map((t) => p >= t - 0.001);
    setActive((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next));
  }, []);

  // Each node activates when the fill reaches it: threshold = node offset / list height.
  useEffect(() => {
    const measure = () => {
      const list = listRef.current;
      if (!list) return;
      const h = list.offsetHeight || 1;
      const top = list.getBoundingClientRect().top;
      thresholds.current = nodeRefs.current.map((el) => {
        if (!el) return 1;
        const r = el.getBoundingClientRect();
        return (r.top + r.height / 2 - top) / h;
      });
      update(scrollYProgress.get());
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [scrollYProgress, update]);

  useMotionValueEvent(scrollYProgress, "change", update);

  return (
    <Section
      id="experience"
      label="Experience"
      title="Six years of shipping production systems"
      lead="From partnering on a cloud engineering firm's client builds to being the long term engineering partner behind an options analytics company's AI products."
      className="experience"
    >
      <div ref={listRef} className="xp-timeline">
        <div className="xp-rail" aria-hidden="true">
          <motion.div className="xp-rail-fill" style={{ scaleY: reduced ? 1 : fill }} />
        </div>
        <ol className="xp-list">

        {experience.map((job, i) => {
          const on = reduced || active[i];
          const chips = highlights[job.company] || [];
          return (
            <li key={job.company + job.period} className={`xp-item${on ? " is-active" : ""}`}>
              <div className="xp-period mono">{job.period}</div>
              <div className="xp-node-col" aria-hidden="true">
                <span ref={(el) => (nodeRefs.current[i] = el)} className="xp-node" />
              </div>
              <Reveal className="xp-body">
                <div className="xp-period-inline mono">{job.period}</div>
                <h3 className="xp-role">{job.role}</h3>
                <p className="xp-company">
                  <span>{job.company}</span>
                  {job.location && (
                    <>
                      <span className="xp-dot" aria-hidden="true">
                        ·
                      </span>
                      <span className="muted">{job.location}</span>
                    </>
                  )}
                </p>
                {chips.length > 0 && (
                  <ul className="xp-chips" aria-label="Highlights">
                    {chips.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                )}
                <ul className="xp-points">
                  {job.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </Reveal>
            </li>
          );
        })}
        </ol>
      </div>
    </Section>
  );
}
