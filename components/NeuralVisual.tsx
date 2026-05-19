type Node = { x: number; y: number; layer: number };

const layerSizes = [2, 4, 3, 2];
const W = 200;
const H = 200;

const nodes: Node[] = layerSizes.flatMap((count, layerIdx) => {
  const x = 20 + layerIdx * ((W - 40) / (layerSizes.length - 1));
  const spacing = (H - 30) / (count + 1);
  return Array.from({ length: count }, (_, i) => ({
    x,
    y: 15 + spacing * (i + 1),
    layer: layerIdx,
  }));
});

const lines: { from: Node; to: Node }[] = [];
for (let i = 0; i < nodes.length; i++) {
  for (let j = 0; j < nodes.length; j++) {
    if (nodes[j].layer === nodes[i].layer + 1) {
      lines.push({ from: nodes[i], to: nodes[j] });
    }
  }
}

export function NeuralVisual() {
  return (
    <div className="neural-wrap">
      <div className="neural-glow" aria-hidden />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="neural-visual relative"
        aria-hidden
      >
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="node-grad">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </radialGradient>
        </defs>

        {lines.map((l, i) => (
          <line
            key={`l-${i}`}
            x1={l.from.x}
            y1={l.from.y}
            x2={l.to.x}
            y2={l.to.y}
            stroke="url(#line-grad)"
            strokeWidth={0.8}
            className="neural-line"
            style={{ animationDelay: `${(i % 8) * 220}ms` }}
          />
        ))}

        {nodes.map((n, i) => (
          <g key={`n-${i}`}>
            <circle
              cx={n.x}
              cy={n.y}
              r={10}
              fill="url(#node-grad)"
              className="neural-halo"
              style={{ animationDelay: `${(i % 5) * 240}ms` }}
            />
            <circle
              cx={n.x}
              cy={n.y}
              r={4}
              fill="url(#node-grad)"
              className="neural-node"
              style={{ animationDelay: `${(i % 5) * 240}ms` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
