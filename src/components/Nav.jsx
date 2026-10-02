import { useEffect, useState } from "react";
import { HiOutlineMenuAlt4, HiX } from "react-icons/hi";
import { navSections, openCommandPalette, openResume } from "../lib/actions";
import { scrollToId } from "../lib/scroll";
import useActiveSection from "../hooks/useActiveSection";
import "./Nav.css";

// Observe every section (not only nav targets) so the highlight clears on the hero, GitHub, education and FAQ.
const ids = ["hero", ...navSections.map((s) => s.id), "github", "education", "faq"];
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(ids);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 900px)");
    const onWide = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [open]);

  function go(e, id) {
    e.preventDefault();
    setOpen(false);
    scrollToId(id);
  }

  return (
    <header className={`nav ${scrolled || open ? "is-scrolled" : ""}`}>
      <div className="container nav-inner">
        <a href="#top" className="nav-brand" onClick={(e) => go(e, "top")} aria-label="Back to top">
          <span className="nav-mark">JV</span>
          <span className="nav-name">Jaydip Vasoya</span>
        </a>

        <nav className={`nav-links ${open ? "is-open" : ""}`} aria-label="Primary">
          {navSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={active === s.id ? "is-active" : ""}
              onClick={(e) => go(e, s.id)}
            >
              {s.label}
            </a>
          ))}
          <button
            type="button"
            className="nav-resume-mobile"
            onClick={() => {
              setOpen(false);
              openResume();
            }}
          >
            Resume ↗
          </button>
        </nav>

        <div className="nav-actions">
          <button type="button" className="nav-search" onClick={openCommandPalette} aria-label="Open command menu">
            <span>Search</span>
            <span className="kbd">{isMac ? "⌘" : "Ctrl"}</span>
            <span className="kbd">K</span>
          </button>
          <button type="button" className="btn btn-primary nav-cta" onClick={openResume}>
            Resume
          </button>
          <button
            type="button"
            className="nav-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <HiX /> : <HiOutlineMenuAlt4 />}
          </button>
        </div>
      </div>
    </header>
  );
}
