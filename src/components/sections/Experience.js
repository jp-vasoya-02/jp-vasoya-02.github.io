import React from "react";
import Section from "./Section";
import { experience } from "../../data/portfolio";

function Experience() {
  return (
    <Section id="experience" label="Experience" title="Where I've worked">
      <ol className="timeline">
        {experience.map((job) => (
          <li className="timeline-item" key={job.role}>
            <div className="timeline-head">
              <div>
                <h3>{job.role}</h3>
                <p className="muted">
                  {job.company}
                  {job.location && ` · ${job.location}`}
                </p>
              </div>
              <span className="period">{job.period}</span>
            </div>
            <ul className="bullets">
              {job.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export default Experience;
