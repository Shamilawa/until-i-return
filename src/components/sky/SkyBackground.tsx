const CLOUDS = [
  { top: "8%", scale: 1, duration: 80, delay: -10, opacity: 0.9 },
  { top: "22%", scale: 0.6, duration: 110, delay: -60, opacity: 0.7 },
  { top: "40%", scale: 1.3, duration: 95, delay: -35, opacity: 0.55 },
  { top: "63%", scale: 0.8, duration: 125, delay: -90, opacity: 0.5 },
];

const SPARKLES = [
  { top: "6%", left: "12%", size: 10, delay: 0 },
  { top: "14%", left: "78%", size: 14, delay: 1.1 },
  { top: "30%", left: "88%", size: 8, delay: 0.5 },
  { top: "36%", left: "6%", size: 12, delay: 2 },
  { top: "55%", left: "70%", size: 9, delay: 1.6 },
  { top: "72%", left: "18%", size: 11, delay: 0.8 },
  { top: "84%", left: "86%", size: 8, delay: 2.4 },
];

/** Fixed watercolor sky with slow clouds and golden sparkles behind every page. */
export function SkyBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(60% 40% at 80% 10%, rgb(255 255 255 / 0.55), transparent 70%),
            radial-gradient(50% 35% at 10% 55%, rgb(255 190 214 / 0.45), transparent 70%),
            linear-gradient(to bottom, var(--sky-top) 0%, var(--sky-mid) 42%, var(--sky-low) 76%, var(--sky-base) 100%)`,
        }}
      />
      <div className="sky-motion absolute inset-0">
        {CLOUDS.map((c, i) => (
          <div
            key={i}
            className="absolute left-0 animate-drift"
            style={{ top: c.top, opacity: c.opacity, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
          >
            <Cloud scale={c.scale} />
          </div>
        ))}
        {SPARKLES.map((s, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            width={s.size}
            height={s.size}
            className="absolute animate-twinkle fill-gold"
            style={{ top: s.top, left: s.left, animationDelay: `${s.delay}s` }}
          >
            <path d="M12 0c1 7 4 10 12 12-8 2-11 5-12 12-1-7-4-10-12-12 8-2 11-5 12-12z" />
          </svg>
        ))}
      </div>
    </div>
  );
}

function Cloud({ scale }: { scale: number }) {
  return (
    <svg viewBox="0 0 200 80" width={200 * scale} height={80 * scale} style={{ fill: "var(--cloud)" }}>
      <ellipse cx="60" cy="52" rx="48" ry="22" />
      <ellipse cx="105" cy="38" rx="42" ry="30" />
      <ellipse cx="148" cy="54" rx="40" ry="20" />
      <ellipse cx="82" cy="34" rx="26" ry="20" />
    </svg>
  );
}
