import { Component, Suspense, lazy, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { profile, stats } from "../../data/portfolio";
import { openCommandPalette } from "../../lib/actions";
import { scrollToId } from "../../lib/scroll";
import useReducedMotion from "../../hooks/useReducedMotion";
import CountUp from "./CountUp";
import TickerTape from "./TickerTape";
import "./Hero.css";

// three.js + R3F live in their own chunk and are only fetched once the page is idle.
const VolSurface = lazy(() => import("./VolSurface"));

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || "");

const EASE = [0.16, 1, 0.3, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
};

function supportsWebGL() {
  return typeof window !== "undefined" && "WebGLRenderingContext" in window;
}

// If WebGL fails to initialise, quietly keep the static gradient instead of breaking the page.
class SurfaceBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Hero() {
  const sectionRef = useRef(null);
  const reduced = useReducedMotion();
  const [showSurface, setShowSurface] = useState(false);

  useEffect(() => {
    if (!supportsWebGL()) return undefined;
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setShowSurface(true), { timeout: 900 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setShowSurface(true), 250);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <section id="hero" className="hero" ref={sectionRef} aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-gradient" />
        {showSurface && (
          <SurfaceBoundary>
            <Suspense fallback={null}>
              <VolSurface eventSource={sectionRef} />
            </Suspense>
          </SurfaceBoundary>
        )}
        <div className="hero-vignette" />
        <div className="hero-hud mono">
          <span className="hero-hud-dot" />
          σ(K, T) · implied vol surface
          {!reduced && <span className="hero-hud-hint">click to perturb</span>}
        </div>
      </div>

      <motion.div
        className="container hero-content"
        variants={container}
        initial={reduced ? false : "hidden"}
        animate="show"
      >
        <motion.p className="hero-eyebrow" variants={item}>
          <span className="hero-pulse" aria-hidden="true" />
          Available for freelance &amp; full-time roles
        </motion.p>

        <motion.h1 id="hero-title" className="hero-title" variants={item}>
          I build <span className="gradient-text hero-nowrap">AI agents</span> that run on{" "}
          <span className="gradient-text hero-nowrap">real-time</span> market data.
        </motion.h1>

        <motion.p className="hero-meta" variants={item}>
          <span>{profile.name}</span>
          <span className="hero-meta-sep" aria-hidden="true">
            ·
          </span>
          <span>{profile.title}</span>
          <span className="hero-meta-sep" aria-hidden="true">
            ·
          </span>
          <span>{profile.location}</span>
        </motion.p>

        <motion.p className="hero-lead" variants={item}>
          Six years shipping Python, Django, React and AWS. Lately: LLM agents on Claude and Bedrock, an MCP server
          with 105 tools that drives live trading charts, and pipelines that keep up with the US options firehose.
        </motion.p>

        <motion.div className="hero-ctas" variants={item}>
          <button type="button" className="btn btn-primary" onClick={() => scrollToId("agent")}>
            <span className="hero-prompt" aria-hidden="true">
              &gt;_
            </span>
            Ask my agent
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => scrollToId("projects")}>
            View projects
          </button>
          <button type="button" className="hero-palette-hint" onClick={openCommandPalette}>
            or press <span className="kbd">{isMac ? "⌘" : "Ctrl"}</span>
            <span className="kbd">K</span>
          </button>
        </motion.div>

        <motion.dl className="hero-stats" variants={item}>
          {stats.map((s, i) => (
            <div className="hero-stat" key={s.label}>
              <dt className="hero-stat-label">{s.label}</dt>
              <dd className="hero-stat-value">
                <CountUp value={s.value} delay={0.7 + i * 0.12} />
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      <TickerTape />
    </section>
  );
}
