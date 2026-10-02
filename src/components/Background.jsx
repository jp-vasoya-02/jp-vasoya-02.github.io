import "./Background.css";

// Fixed decorative layer: faint grid, top glow and film grain.
export default function Background() {
  return (
    <div className="bg-layer" aria-hidden="true">
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-noise" />
    </div>
  );
}
