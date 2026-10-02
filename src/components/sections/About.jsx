import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiZap, FiShield, FiLayers } from "react-icons/fi";
import Reveal from "../Reveal";
import useReducedMotion from "../../hooks/useReducedMotion";
import "./About.css";

// Condensed from profile.summary. `accent: true` segments finish in the accent color.
const statement = [
  { text: "I'm a senior full stack engineer with 6+ years of building FinTech platforms and production AI products: " },
  { text: "AI agents", accent: true },
  { text: " on Claude and AWS Bedrock, desktop and voice assistants, and pipelines that tame " },
  { text: "real time market data.", accent: true },
  { text: " I own the work from " },
  { text: "architecture to production", accent: true },
  { text: " and talk directly with the people who use it." },
];

const words = statement.flatMap((seg) =>
  seg.text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ({ w, accent: !!seg.accent }))
);

const DIM = "rgba(255, 255, 255, 0.18)";
const TEXT = "#f2f4f8"; // var(--text)
const ACCENT = "#5eead4"; // var(--accent)

const principles = [
  {
    icon: <FiZap />,
    title: "Ship to production",
    text: "Architecture through deploy and on-call: tuned Nginx, Gunicorn and a Redis holding 10M+ keys.",
  },
  {
    icon: <FiShield />,
    title: "Guardrails over vibes",
    text: "Agents get tool limits, leak detection and a deterministic scoring engine, backed by 1,500+ tests.",
  },
  {
    icon: <FiLayers />,
    title: "Own the whole stack",
    text: "Django, React, Electron and AWS end to end, with direct client communication along the way.",
  },
];

function Word({ word, accent, progress, range }) {
  const color = useTransform(progress, range, [DIM, accent ? ACCENT : TEXT]);
  return (
    <motion.span className="about-word" style={{ color }}>
      {word}
    </motion.span>
  );
}

export default function About() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });

  const n = words.length;

  return (
    <section id="about" className="section about">
      <div className="container">
        <Reveal>
          <p className="section-label">About</p>
        </Reveal>

        <p ref={ref} className="about-statement">
          {words.map(({ w, accent }, i) => {
            const content = (
              <>
                {w}
                {i < n - 1 ? " " : ""}
              </>
            );
            if (reduced) {
              return (
                <span key={i} className="about-word" style={{ color: accent ? ACCENT : TEXT }}>
                  {content}
                </span>
              );
            }
            const start = i / n;
            const end = Math.min(1, start + 2.5 / n);
            return <Word key={i} word={content} accent={accent} progress={scrollYProgress} range={[start, end]} />;
          })}
        </p>

        <ul className="about-principles">
          {principles.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.08} className="card about-principle">
              <span className="about-principle-icon" aria-hidden="true">
                {p.icon}
              </span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
