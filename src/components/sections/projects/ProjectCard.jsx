import { useRef } from "react";
import { FiArrowRight } from "react-icons/fi";
import ProjectVisual from "./ProjectVisual";
import useReducedMotion from "../../../hooks/useReducedMotion";

const KICKERS = {
  agent: "AI agent",
  flow: "Market data",
  mcp: "Desktop · MCP",
  voice: "Voice AI",
};

const MAX_TILT = 4; // degrees

export default function ProjectCard({ project, index, onOpen }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const onPointerMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    if (reduced || e.pointerType !== "mouse") return;
    const px = x / r.width - 0.5;
    const py = y / r.height - 0.5;
    el.style.setProperty("--ry", `${(px * MAX_TILT * 2).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-py * MAX_TILT * 2).toFixed(2)}deg`);
  };

  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const titleId = `pcard-${project.id}`;

  return (
    <article
      ref={ref}
      className={`pcard pcard--${project.visual}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-labelledby={titleId}
    >
      <div className="pcard-visual">
        <ProjectVisual type={project.visual} />
      </div>
      <div className="pcard-body">
        <p className="pcard-kicker mono">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span className="pcard-kicker-sep" aria-hidden="true" />
          {KICKERS[project.visual]}
        </p>
        <h3 className="pcard-title" id={titleId}>
          {/* Stretched button: its ::after covers the whole card so the card is one click target. */}
          <button type="button" className="pcard-trigger" onClick={(e) => onOpen(project, e.currentTarget)}>
            {project.title}
            <span className="sr-only">, open case study</span>
          </button>
        </h3>
        <p className="pcard-desc">{project.description}</p>
        <ul className="tags pcard-tags" aria-label="Tech stack">
          {project.tech.slice(0, 5).map((t) => (
            <li key={t}>{t}</li>
          ))}
          {project.tech.length > 5 && <li className="pcard-more">+{project.tech.length - 5}</li>}
        </ul>
        <span className="pcard-cta" aria-hidden="true">
          View case study <FiArrowRight />
        </span>
      </div>
    </article>
  );
}
