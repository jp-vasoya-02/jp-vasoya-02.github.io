import { AiFillGithub, AiOutlineMail } from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { ImBlog } from "react-icons/im";
import { profile } from "../data/portfolio";

export default function Footer() {
  const year = new Date().getFullYear();
  const links = [
    { href: profile.github, label: "GitHub", icon: <AiFillGithub /> },
    { href: profile.linkedin, label: "LinkedIn", icon: <FaLinkedinIn /> },
    { href: profile.blog, label: "Blog", icon: <ImBlog /> },
    { href: `mailto:${profile.email}`, label: "Email", icon: <AiOutlineMail /> },
  ];
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "28px 0" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <p className="muted" style={{ fontSize: "0.88rem" }}>
          © {year} {profile.name} · {profile.location}
        </p>
        <ul style={{ display: "flex", gap: 8, listStyle: "none" }}>
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={l.label}
                className="footer-icon"
              >
                {l.icon}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
