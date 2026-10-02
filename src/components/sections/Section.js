import React from "react";
import { Container } from "react-bootstrap";

function Section({ id, label, title, children }) {
  return (
    <section className="section" id={id}>
      <Container>
        <p className="section-label">{label}</p>
        <h2 className="section-title">{title}</h2>
        {children}
      </Container>
    </section>
  );
}

export default Section;
