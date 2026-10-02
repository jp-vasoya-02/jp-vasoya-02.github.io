import React from "react";
import Section from "./Section";
import { education } from "../../data/portfolio";

function Education() {
  return (
    <Section id="education" label="Education" title="Academic background">
      <div className="edu-grid">
        {education.map((e) => (
          <div className="card" key={e.degree}>
            <span className="period">{e.period}</span>
            <h3>{e.degree}</h3>
            <p className="muted">{e.school}</p>
            {e.note && <p className="accent-text">{e.note}</p>}
          </div>
        ))}
      </div>
    </Section>
  );
}

export default Education;
