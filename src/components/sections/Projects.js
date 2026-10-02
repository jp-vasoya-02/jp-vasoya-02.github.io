import React from "react";
import Section from "./Section";
import { projects, additionalProjects } from "../../data/portfolio";

function Projects() {
  return (
    <Section id="projects" label="Projects" title="Selected work">
      <div className="project-grid">
        {projects.map((p) => (
          <article className="card project" key={p.title}>
            <h3>{p.title}</h3>
            <p className="muted">{p.description}</p>
            <ul className="bullets">
              {p.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <ul className="tags">
              {p.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <h3 className="subheading">More projects</h3>
      <div className="mini-grid">
        {additionalProjects.map((p) => (
          <div className="mini" key={p.title}>
            <h4>{p.title}</h4>
            <p className="muted">{p.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default Projects;
