import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Toast() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    let t;
    const onToast = (e) => {
      setMsg(e.detail);
      clearTimeout(t);
      t = setTimeout(() => setMsg(null), 2200);
    };
    window.addEventListener("app:toast", onToast);
    return () => {
      clearTimeout(t);
      window.removeEventListener("app:toast", onToast);
    };
  }, []);
  return (
    <div aria-live="polite" style={{ position: "fixed", bottom: 24, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 80, pointerEvents: "none" }}>
      <AnimatePresence>
        {msg && (
          <motion.div
            key={msg}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              background: "var(--bg-elev)",
              border: "1px solid var(--border-strong)",
              borderRadius: 999,
              padding: "10px 18px",
              fontSize: "0.9rem",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            }}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
