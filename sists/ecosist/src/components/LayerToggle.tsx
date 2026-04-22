export interface Layers {
  alerts: boolean;
  quakes: boolean;
  events: boolean;
}

interface LayerToggleProps {
  layers: Layers;
  onChange: (next: Layers) => void;
  counts: { alerts: number; quakes: number; events: number };
}

export const LayerToggle = ({ layers, onChange, counts }: LayerToggleProps) => {
  const Toggle = ({
    k,
    label,
    color,
    count,
  }: {
    k: keyof Layers;
    label: string;
    color: string;
    count: number;
  }) => (
    <button
      onClick={() => onChange({ ...layers, [k]: !layers[k] })}
      className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition ${
        layers[k]
          ? "border-ink-600 bg-ink-800 text-ink-100"
          : "border-ink-800 bg-ink-950/40 text-ink-500 hover:border-ink-700"
      }`}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: layers[k] ? color : "#475569" }}
        aria-hidden
      />
      <span>{label}</span>
      <span className="font-mono text-[10px] text-ink-400">{count}</span>
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle k="alerts" label="Alerts" color="#f97316" count={counts.alerts} />
      <Toggle k="quakes" label="Quakes" color="#eab308" count={counts.quakes} />
      <Toggle k="events" label="Events" color="#14b8a6" count={counts.events} />
    </div>
  );
};
