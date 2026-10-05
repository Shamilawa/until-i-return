import { PEOPLE } from "@/lib/config";

// Quadratic curve from Abu Dhabi to Sri Lanka in the 340x150 illustration.
const FROM = { x: 62, y: 62 };
const TO = { x: 268, y: 112 };
const CONTROL = { x: 170, y: -6 };

function pointAt(t: number) {
  const u = 1 - t;
  return {
    x: u * u * FROM.x + 2 * u * t * CONTROL.x + t * t * TO.x,
    y: u * u * FROM.y + 2 * u * t * CONTROL.y + t * t * TO.y,
    angle:
      (Math.atan2(
        2 * u * (CONTROL.y - FROM.y) + 2 * t * (TO.y - CONTROL.y),
        2 * u * (CONTROL.x - FROM.x) + 2 * t * (TO.x - CONTROL.x),
      ) *
        180) /
      Math.PI,
  };
}

const CURVE = `M${FROM.x} ${FROM.y} Q${CONTROL.x} ${CONTROL.y} ${TO.x} ${TO.y}`;

/** A soft map with a paper plane sitting at `fraction` of the way home. */
export function FlightPath({ fraction }: { fraction: number }) {
  const plane = pointAt(fraction);
  return (
    <svg
      viewBox="0 0 340 150"
      className="w-full"
      role="img"
      aria-label={`${Math.round(fraction * 100)}% of the way from ${PEOPLE.author.city} to ${PEOPLE.reader.city}`}
    >
      {/* sea */}
      <rect x="0" y="0" width="340" height="150" rx="20" fill="#dff1fb" opacity="0.7" />
      {/* soft landmasses: Arabian coast, the subcontinent, and the teardrop island */}
      <path d="M0 18 C30 10 70 22 92 46 C104 62 84 84 60 92 C40 100 14 96 0 104 Z" fill="#fbe3c4" />
      <path d="M196 0 C204 30 222 62 246 92 C256 70 276 38 300 0 Z" fill="#d9ecc8" />
      <path d="M262 100 C274 100 280 112 276 124 C272 134 260 134 257 124 C254 113 255 102 262 100 Z" fill="#c9e6b6" />

      <path d={CURVE} fill="none" stroke="#9a8fc4" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0.5 8" />
      <path
        d={CURVE}
        fill="none"
        stroke="#f2b63c"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${fraction} 1`}
      />

      <Pin x={FROM.x} y={FROM.y} label={PEOPLE.author.city} labelDy={22} />
      <Pin x={TO.x} y={TO.y} label={PEOPLE.reader.city} labelDy={-14} heart />

      <g transform={`translate(${plane.x} ${plane.y}) rotate(${plane.angle})`}>
        <g className="animate-float">
          <path d="M-11 -7 L13 0 L-11 7 L-6 0 Z" fill="#ffffff" stroke="#3b3260" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M-6 0 L13 0" stroke="#3b3260" strokeWidth="1.2" />
        </g>
      </g>
    </svg>
  );
}

function Pin({ x, y, label, labelDy, heart }: { x: number; y: number; label: string; labelDy: number; heart?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r="7" fill="#fff" opacity="0.9" />
      {heart ? (
        <path
          transform={`translate(${x - 5} ${y - 4.5}) scale(0.42)`}
          d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"
          fill="#e8628f"
        />
      ) : (
        <circle cx={x} cy={y} r="3.5" fill="#e8628f" />
      )}
      <text
        x={x}
        y={y + labelDy}
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#3b3260"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {label}
      </text>
    </g>
  );
}
