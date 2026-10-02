import { Fragment } from "react";
import { motion } from "framer-motion";
import useReducedMotion from "../../../hooks/useReducedMotion";
import "./FlowDiagram.css";

// Desktop is a 3 + 3 "snake": row one flows right, drops down, row two flows left.
// Connector directions for the five links, in order.
const DIRS = ["right", "right", "down", "left", "left"];

export default function FlowDiagram({ stages, label = "Architecture" }) {
  const reduced = useReducedMotion();
  const step = 0.12;

  const reveal = (i) =>
    reduced
      ? { initial: false }
      : {
          initial: { opacity: 0, y: 10, scale: 0.97 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { duration: 0.5, delay: 0.15 + i * step, ease: [0.16, 1, 0.3, 1] },
        };

  return (
    <figure className={`fd ${reduced ? "is-static" : ""}`}>
      <ol className="fd-grid" aria-label={label}>
        {stages.map((stage, i) => (
          <Fragment key={stage}>
            <motion.li className="fd-node" data-i={i} style={{ "--i": i }} {...reveal(i * 2)}>
              <span className="fd-step mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="fd-label mono">{stage}</span>
            </motion.li>
            {i < stages.length - 1 && (
              <motion.li
                className="fd-conn"
                data-i={i}
                data-dir={DIRS[i] ?? "right"}
                aria-hidden="true"
                {...reveal(i * 2 + 1)}
              >
                <span className="fd-track" />
                <span className="fd-particle" style={{ animationDelay: `${i * 0.25}s` }} />
                <span className="fd-particle" style={{ animationDelay: `${i * 0.25 + 0.9}s` }} />
              </motion.li>
            )}
          </Fragment>
        ))}
      </ol>
    </figure>
  );
}
