import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { AiFillGithub, AiOutlineMail, AiOutlineFilePdf } from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { HiOutlineArrowRight, HiOutlineTerminal } from "react-icons/hi";
import { ImBlog } from "react-icons/im";
import { profile, terminalPrompts } from "../data/portfolio";
import { copyEmail, navSections, openResume } from "../lib/actions";
import { lockScroll, scrollToId } from "../lib/scroll";
import "./CommandPalette.css";

export function runTerminalCommand(cmd) {
  scrollToId("agent");
  window.dispatchEvent(new CustomEvent("app:terminal", { detail: cmd }));
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("app:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("app:palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    lockScroll(true);
    return () => lockScroll(false);
  }, [open]);

  const run = (fn) => () => {
    setOpen(false);
    // Let the dialog close before scrolling/opening.
    setTimeout(fn, 60);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      className="cmdk"
      overlayClassName="cmdk-overlay"
      contentClassName="cmdk-content"
    >
      <Command.Input placeholder="Type a command or search…" className="cmdk-input" />
      <Command.List className="cmdk-list" data-lenis-prevent>
        <Command.Empty className="cmdk-empty">No results.</Command.Empty>

        <Command.Group heading="Navigate">
          {navSections.map((s) => (
            <Command.Item key={s.id} value={`go ${s.label}`} onSelect={run(() => scrollToId(s.id))}>
              <HiOutlineArrowRight /> {s.label}
            </Command.Item>
          ))}
          <Command.Item value="go faq questions" onSelect={run(() => scrollToId("faq"))}>
            <HiOutlineArrowRight /> FAQ
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Actions">
          <Command.Item value="copy email contact" onSelect={run(copyEmail)}>
            <AiOutlineMail /> Copy email <span className="cmdk-hint">{profile.email}</span>
          </Command.Item>
          <Command.Item value="resume cv pdf download" onSelect={run(openResume)}>
            <AiOutlineFilePdf /> Open resume (PDF)
          </Command.Item>
          <Command.Item value="github code" onSelect={run(() => window.open(profile.github, "_blank", "noopener"))}>
            <AiFillGithub /> GitHub
          </Command.Item>
          <Command.Item value="linkedin" onSelect={run(() => window.open(profile.linkedin, "_blank", "noopener"))}>
            <FaLinkedinIn /> LinkedIn
          </Command.Item>
          <Command.Item value="blog articles" onSelect={run(() => window.open(profile.blog, "_blank", "noopener"))}>
            <ImBlog /> Blog
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Ask my agent">
          {terminalPrompts.map((p) => (
            <Command.Item key={p} value={`ask agent ${p}`} onSelect={run(() => runTerminalCommand(p))}>
              <HiOutlineTerminal /> <span className="mono">{p}</span>
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
      <div className="cmdk-footer">
        <span><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
        <span><span className="kbd">↵</span> select</span>
        <span><span className="kbd">esc</span> close</span>
      </div>
    </Command.Dialog>
  );
}
