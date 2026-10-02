import Reveal from "./Reveal";

export default function Section({ id, label, title, lead, children, className = "" }) {
  return (
    <section id={id} className={`section ${className}`}>
      <div className="container">
        <Reveal>
          <p className="section-label">{label}</p>
          <h2 className="display">{title}</h2>
          {lead && <p className="lead">{lead}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
