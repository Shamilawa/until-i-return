import type { ReactNode } from "react";

export function EmptyState({ emoji, title, children }: { emoji: string; title: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 py-10 text-center">
      <span className="animate-float text-5xl" aria-hidden>
        {emoji}
      </span>
      <p className="font-display text-xl font-semibold text-ink">{title}</p>
      {children && <div className="max-w-xs text-sm text-ink-soft">{children}</div>}
    </div>
  );
}
