import { ticker } from "../../data/portfolio";
import "./TickerTape.css";

function TickerList({ hidden = false }) {
  return (
    <ul className="ticker-list" aria-hidden={hidden || undefined}>
      {ticker.map((item) => (
        <li className="ticker-item" key={item.symbol}>
          <span className="ticker-symbol">{item.symbol}</span>
          <span className="ticker-up" aria-hidden="true">
            ▲
          </span>
          <span className="ticker-note">{item.note}</span>
        </li>
      ))}
    </ul>
  );
}

// Infinite CSS marquee. The list is rendered twice and the track slides by -50%,
// so the loop is seamless. The second copy is hidden from assistive tech.
export default function TickerTape() {
  return (
    <div className="ticker" role="region" aria-label="Tech stack">
      <div className="ticker-track">
        <TickerList />
        <TickerList hidden />
      </div>
    </div>
  );
}
