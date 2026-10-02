import { useEffect, useMemo, useRef } from "react";
import { animate, useInView } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion";

// "1,500+" -> { prefix: "", number: 1500, suffix: "+", separator: true, decimals: 0 }
export function parseStat(value) {
  const match = String(value).match(/^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const raw = match[2];
  return {
    prefix: match[1],
    number: parseFloat(raw.replace(/,/g, "")),
    suffix: match[3],
    separator: raw.includes(","),
    decimals: (raw.split(".")[1] || "").length,
  };
}

function formatNumber(n, { separator, decimals }) {
  if (separator) {
    return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  return n.toFixed(decimals);
}

// Counts from 0 to the numeric part of `value` the first time it scrolls into view.
// A hidden "ghost" copy of the final value reserves the width so nothing shifts.
export default function CountUp({ value, delay = 0, duration = 1.8, className = "" }) {
  const rootRef = useRef(null);
  const liveRef = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(rootRef, { once: true, margin: "-40px" });
  const parsed = useMemo(() => parseStat(value), [value]);

  useEffect(() => {
    const el = liveRef.current;
    if (!el || !parsed) return undefined;
    if (reduced) {
      el.textContent = formatNumber(parsed.number, parsed);
      return undefined;
    }
    if (!inView) return undefined;
    const factor = 10 ** parsed.decimals;
    const controls = animate(0, parsed.number, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = formatNumber(Math.round(v * factor) / factor, parsed);
      },
    });
    return () => controls.stop();
  }, [inView, reduced, parsed, delay, duration]);

  if (!parsed) return <span className={className}>{value}</span>;

  const final = formatNumber(parsed.number, parsed);
  const initial = reduced ? final : formatNumber(0, parsed);

  return (
    <span ref={rootRef} className={`countup ${className}`}>
      <span className="sr-only">{value}</span>
      <span className="countup-body" aria-hidden="true">
        {parsed.prefix}
        <span className="countup-num">
          <span className="countup-ghost">{final}</span>
          <span className="countup-live" ref={liveRef}>
            {initial}
          </span>
        </span>
        {parsed.suffix && <span className="countup-suffix">{parsed.suffix}</span>}
      </span>
    </span>
  );
}
