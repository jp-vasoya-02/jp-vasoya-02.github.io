import React from "react";
import Section from "./Section";
import { profile } from "../../data/portfolio";

function About() {
  return (
    <Section id="about" label="About" title="Engineer, partner, product owner">
      <p className="prose">{profile.summary}</p>
      <p className="prose">
        My core stack is Python, Django, React, TypeScript, and AWS. I care about
        systems that hold up under real load, measurable guardrails around AI,
        and clear communication with the people I build for.
      </p>
    </Section>
  );
}

export default About;
