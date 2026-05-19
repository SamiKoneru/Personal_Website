export function BerkeleyVisual() {
  return (
    <div className="berkeley-wrap" aria-hidden>
      <svg
        viewBox="0 0 200 240"
        className="berkeley-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sun */}
        <circle
          cx={155}
          cy={58}
          r={22}
          fill="#FDB515"
          opacity={0.35}
          className="berkeley-sun-halo"
        />
        <circle cx={155} cy={58} r={12} fill="#FDB515" />

        {/* Distant hills */}
        <path
          d="M0 200 Q 40 188 80 196 T 200 192 L 200 240 L 0 240 Z"
          fill="#003262"
          opacity={0.12}
        />

        {/* Campanile silhouette */}
        <g fill="#003262" className="berkeley-tower">
          {/* Pyramid top */}
          <polygon points="100,32 76,82 124,82" />
          {/* Capital under pyramid */}
          <rect x={74} y={80} width={52} height={4} />
          {/* Bell chamber */}
          <rect x={78} y={84} width={44} height={36} />
          {/* Cornice */}
          <rect x={72} y={120} width={56} height={5} />
          {/* Clock section */}
          <rect x={80} y={125} width={40} height={30} />
          {/* Main tower body */}
          <rect x={82} y={155} width={36} height={68} />
          {/* Base */}
          <rect x={74} y={223} width={52} height={8} />
        </g>

        {/* Bell arches (gold cutouts) */}
        <g fill="#FDB515">
          <rect x={84} y={92} width={5} height={22} rx={1.5} />
          <rect x={97.5} y={92} width={5} height={22} rx={1.5} />
          <rect x={111} y={92} width={5} height={22} rx={1.5} />
        </g>

        {/* Clock face */}
        <g>
          <circle cx={100} cy={140} r={9} fill="#FDB515" />
          <circle
            cx={100}
            cy={140}
            r={8}
            fill="none"
            stroke="#003262"
            strokeWidth={1.4}
          />
          <line
            x1={100}
            y1={140}
            x2={100}
            y2={134}
            stroke="#003262"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
          <line
            x1={100}
            y1={140}
            x2={104.5}
            y2={140}
            stroke="#003262"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </g>

        {/* Subtle window slits on tower body */}
        <g fill="#FDB515" opacity={0.4}>
          <rect x={97} y={170} width={6} height={10} rx={1} />
          <rect x={97} y={188} width={6} height={10} rx={1} />
          <rect x={97} y={206} width={6} height={10} rx={1} />
        </g>
      </svg>
    </div>
  );
}
