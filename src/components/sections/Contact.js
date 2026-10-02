import React from "react";
import { AiFillGithub, AiOutlineMail } from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import Section from "./Section";
import { profile } from "../../data/portfolio";

function Contact() {
  return (
    <Section id="contact" label="Contact" title="Let's build something">
      <div className="card contact">
        <p className="prose">
          I'm available for freelance engagements and senior full stack or AI
          engineering roles. The fastest way to reach me is email.
        </p>
        <div className="hero-actions">
          <a className="btn-accent" href={`mailto:${profile.email}`}>
            <AiOutlineMail /> {profile.email}
          </a>
          <a className="btn-ghost" href={profile.linkedin} target="_blank" rel="noreferrer">
            <FaLinkedinIn /> LinkedIn
          </a>
          <a className="btn-ghost" href={profile.github} target="_blank" rel="noreferrer">
            <AiFillGithub /> GitHub
          </a>
        </div>
      </div>
    </Section>
  );
}

export default Contact;
