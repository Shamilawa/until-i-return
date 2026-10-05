export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center" role="status">
      <svg viewBox="0 0 24 24" width="36" height="36" className="animate-twinkle fill-gold" aria-hidden>
        <path d="M12 0c1 7 4 10 12 12-8 2-11 5-12 12-1-7-4-10-12-12 8-2 11-5 12-12z" />
      </svg>
      <p className="font-display text-ink-soft">Gathering stardust…</p>
    </div>
  );
}
