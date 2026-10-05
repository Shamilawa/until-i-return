export type EnvelopeState = "locked" | "unread" | "read";

/** Original envelope illustration: sealed, sealed-and-glowing, or opened with the letter peeking out. */
export function Envelope({ state, className }: { state: EnvelopeState; className?: string }) {
  const opened = state === "read";
  return (
    <svg
      viewBox="0 0 120 96"
      className={`${className ?? ""} ${state === "unread" ? "animate-glow" : ""}`}
      style={state === "locked" ? { filter: "saturate(0.55)", opacity: 0.85 } : undefined}
      aria-hidden
    >
      {opened && (
        <>
          {/* raised flap and the letter peeking out */}
          <path d="M8 34 L60 2 L112 34 Z" fill="#f6e3c3" stroke="#e2cca8" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="22" y="14" width="76" height="52" rx="4" fill="#fffdf8" stroke="#e9d9bd" strokeWidth="1.2" />
          <path d="M32 28h56M32 38h56M32 48h36" stroke="#e3cfae" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      <rect x="8" y="32" width="104" height="60" rx="8" fill="#fff5e2" stroke="#e2cca8" strokeWidth="1.5" />
      <path d="M8 90 L48 60 M112 90 L72 60" stroke="#e2cca8" strokeWidth="1.5" strokeLinecap="round" />
      {opened ? (
        <path d="M9 36 L60 68 L111 36" fill="none" stroke="#e2cca8" strokeWidth="1.5" strokeLinejoin="round" />
      ) : (
        <>
          <path d="M9 36 Q9 33 12 33 L108 33 Q111 33 111 36 L60 70 Z" fill="#fbe9cd" stroke="#e2cca8" strokeWidth="1.5" strokeLinejoin="round" />
          <WaxSeal cx={60} cy={66} />
        </>
      )}
    </svg>
  );
}

export function WaxSeal({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <path
        d="M0 -13 C5 -14 9 -11 12 -7 C15 -3 14 3 12 7 C9 12 4 14 0 13 C-5 14 -10 11 -12 7 C-15 2 -14 -4 -11 -8 C-8 -12 -4 -14 0 -13 Z"
        fill="#d6455f"
      />
      <circle r="8.5" fill="none" stroke="#b9324b" strokeWidth="1" />
      <path d="M0 5 C-6 1 -6 -4 -3 -4.5 C-1.5 -4.8 0 -3.5 0 -2.5 C0 -3.5 1.5 -4.8 3 -4.5 C6 -4 6 1 0 5 Z" fill="#ffe1e6" />
    </g>
  );
}
