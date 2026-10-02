import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useIsPresent } from "framer-motion";
import { FiX } from "react-icons/fi";
import FlowDiagram from "./FlowDiagram";
import { lockScroll } from "../../../lib/scroll";
import useReducedMotion from "../../../hooks/useReducedMotion";
import "./CaseStudyModal.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

const ease = [0.16, 1, 0.3, 1];

export default function CaseStudyModal({ project, index, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const reduced = useReducedMotion();
  const isPresent = useIsPresent();
  const titleId = `case-title-${project.id}`;

  // Scroll lock + initial focus.
  useEffect(() => {
    lockScroll(true);
    closeRef.current?.focus({ preventScroll: true });
    return () => lockScroll(false);
  }, []);

  // Esc to close, Tab trapped inside the panel.
  useEffect(() => {
    if (!isPresent) return undefined; // closing: let focus go back to the card
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panelRef.current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose, isPresent]);

  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : {
        initial: { opacity: 0, y: 24, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 12, scale: 0.98 },
        transition: { duration: 0.45, ease },
      };

  return createPortal(
    <motion.div
      className="csm-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.3 }}
      style={{ pointerEvents: isPresent ? "auto" : "none" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={panelRef}
        className="csm-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-lenis-prevent
        {...panelMotion}
      >
        <header className="csm-head">
          <p className="csm-kicker mono">
            Case study <span className="muted">/ {String(index + 1).padStart(2, "0")}</span>
          </p>
          <button ref={closeRef} type="button" className="csm-close" onClick={onClose} aria-label="Close case study">
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="csm-body">
          <h3 className="csm-title" id={titleId}>
            {project.title}
          </h3>
          <p className="csm-desc">{project.description}</p>

          <section className="csm-block" aria-labelledby={`${titleId}-arch`}>
            <h4 className="csm-h mono" id={`${titleId}-arch`}>
              Architecture
            </h4>
            <FlowDiagram stages={project.flow} label={`${project.title} architecture, in order`} />
          </section>

          <section className="csm-block" aria-labelledby={`${titleId}-hl`}>
            <h4 className="csm-h mono" id={`${titleId}-hl`}>
              Highlights
            </h4>
            <ul className="csm-points">
              {project.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>

          <section className="csm-block" aria-labelledby={`${titleId}-stack`}>
            <h4 className="csm-h mono" id={`${titleId}-stack`}>
              Stack
            </h4>
            <ul className="tags">
              {project.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
