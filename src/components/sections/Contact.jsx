import { FiCopy, FiFileText, FiArrowUpRight } from "react-icons/fi";
import { FaLinkedinIn } from "react-icons/fa";
import { AiFillGithub } from "react-icons/ai";
import Reveal from "../Reveal";
import { profile } from "../../data/portfolio";
import { copyEmail, openResume } from "../../lib/actions";
import "./Contact.css";

export default function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="container">
        <Reveal className="contact-panel">
          <div className="contact-glow" aria-hidden="true" />
          <p className="section-label">Contact</p>
          <h2 className="contact-title gradient-text">Have a hard real-time or AI problem?</h2>
          <p className="lead contact-lead">
            I&apos;m available for freelance engagements and senior full stack / AI engineering roles. I usually reply
            within a day.
          </p>

          <div className="contact-actions">
            <button
              type="button"
              className="btn btn-primary contact-email"
              onClick={copyEmail}
              aria-label={`Copy email address ${profile.email}`}
            >
              <FiCopy aria-hidden="true" />
              <span className="contact-email-text">{profile.email}</span>
            </button>
            <button type="button" className="btn btn-ghost" onClick={openResume}>
              <FiFileText aria-hidden="true" />
              Open resume
            </button>
            <a className="btn btn-ghost" href={profile.linkedin} target="_blank" rel="noreferrer">
              <FaLinkedinIn aria-hidden="true" />
              LinkedIn
              <FiArrowUpRight aria-hidden="true" className="contact-ext" />
            </a>
            <a className="btn btn-ghost" href={profile.github} target="_blank" rel="noreferrer">
              <AiFillGithub aria-hidden="true" />
              GitHub
              <FiArrowUpRight aria-hidden="true" className="contact-ext" />
            </a>
          </div>

          <p className="contact-meta mono">
            <span aria-hidden="true">📍 </span>
            {profile.location} · Remote worldwide · IST (UTC+5:30)
          </p>
        </Reveal>
      </div>
    </section>
  );
}
