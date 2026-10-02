import { useCallback, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Section from "../Section";
import Reveal from "../Reveal";
import ProjectCard from "./projects/ProjectCard";
import CaseStudyModal from "./projects/CaseStudyModal";
import { projects, additionalProjects } from "../../data/portfolio";
import "./Projects.css";

export default function Projects() {
  const [active, setActive] = useState(null);
  const triggerRef = useRef(null);

  const open = useCallback((project, trigger) => {
    triggerRef.current = trigger;
    setActive(project);
  }, []);

  const close = useCallback(() => {
    setActive(null);
    // Return focus to the card that opened the dialog.
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const activeIndex = active ? projects.findIndex((p) => p.id === active.id) : -1;

  return (
    <Section
      id="projects"
      label="Projects"
      title="Systems built for live markets and real users."
      lead="AI agents, market data pipelines, and the tooling between them. Open any card for the architecture and what made it hold up in production."
      className="projects"
    >
      <div className="bento">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={(i % 2) * 0.08} className={`bento-cell bento-cell--${i}`}>
            <ProjectCard project={p} index={i} onOpen={open} />
          </Reveal>
        ))}
      </div>

      <div className="more">
        <Reveal>
          <h3 className="more-title">More projects</h3>
        </Reveal>
        <ul className="more-grid">
          {additionalProjects.map((p, i) => (
            <Reveal as="li" key={p.title} delay={(i % 3) * 0.07} className="more-item">
              <div className="more-card">
                <span className="more-index mono">{String(i + 1).padStart(2, "0")}</span>
                <h4 className="more-name">{p.title}</h4>
                <p className="more-desc">{p.description}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {active && <CaseStudyModal key={active.id} project={active} index={activeIndex} onClose={close} />}
      </AnimatePresence>
    </Section>
  );
}
