import React from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AiFillGithub, AiOutlineMail } from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { profile, stats } from "../../data/portfolio";

function Hero() {
  return (
    <section className="hero" id="home">
      <Container>
        <p className="eyebrow">
          <span className="status-dot" /> Open to freelance and full time roles
        </p>
        <h1 className="hero-name">{profile.name}</h1>
        <h2 className="hero-title">
          {profile.title}
          <span className="hero-tagline">{profile.tagline}</span>
        </h2>
        <p className="hero-lead">
          I build FinTech platforms and production AI products, from LLM agents
          and MCP servers to real time market data pipelines, and own them from
          architecture to production.
        </p>
        <p className="hero-location">
          <HiOutlineLocationMarker /> {profile.location}
        </p>

        <div className="hero-actions">
          <a className="btn-accent" href={`mailto:${profile.email}`}>
            <AiOutlineMail /> Get in touch
          </a>
          <Link className="btn-ghost" to="/resume">
            View resume
          </Link>
          <a className="icon-link" href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <AiFillGithub />
          </a>
          <a className="icon-link" href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <FaLinkedinIn />
          </a>
        </div>

        <dl className="stats">
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <dt>{s.value}</dt>
              <dd>{s.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

export default Hero;
