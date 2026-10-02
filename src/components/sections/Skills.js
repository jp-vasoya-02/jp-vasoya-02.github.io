import React from "react";
import Section from "./Section";
import { skills } from "../../data/portfolio";

function Skills() {
  return (
    <Section id="skills" label="Skills" title="Technical toolkit">
      <div className="skill-grid">
        {skills.map((s) => (
          <div className="card skill" key={s.group}>
            <h3>{s.group}</h3>
            <ul className="tags">
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default Skills;
