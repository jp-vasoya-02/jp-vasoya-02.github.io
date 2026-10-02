import { FiAward } from "react-icons/fi";
import Section from "../Section";
import Reveal from "../Reveal";
import { education } from "../../data/portfolio";
import "./Education.css";

export default function Education() {
  return (
    <Section id="education" label="Education" title="Computer science foundations" className="education">
      <ul className="edu-grid">
        {education.map((e, i) => (
          <Reveal as="li" key={e.degree} delay={i * 0.08} className="card edu-card">
            <p className="edu-period mono">{e.period}</p>
            <h3 className="edu-degree">{e.degree}</h3>
            <p className="edu-school">{e.school}</p>
            {e.note && (
              <p className="edu-note mono">
                <FiAward aria-hidden="true" />
                {e.note.replace(/,\s*/, " · ")}
              </p>
            )}
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
