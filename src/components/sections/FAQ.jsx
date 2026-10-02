import Section from "../Section";
import Reveal from "../Reveal";
import { faq } from "../../data/portfolio";
import "./FAQ.css";

export default function FAQ() {
  return (
    <Section id="faq" label="FAQ" title="Quick answers" className="faq">
      <div className="faq-list">
        {faq.map((item, i) => (
          <Reveal key={item.q} delay={Math.min(i, 4) * 0.05}>
            <details className="faq-item" open={i === 0}>
              <summary>
                <h3>{item.q}</h3>
                <span className="faq-icon" aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
