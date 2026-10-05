import { EmptyState } from "@/components/ui/EmptyState";

// Phase 2: the shared timeline with photos lands here.
export default function StoryPage() {
  return (
    <>
      <header className="px-1">
        <h1 className="font-display text-2xl font-semibold text-ink">Our Story</h1>
        <p className="text-sm text-ink-soft">Every chapter, from the day we met.</p>
      </header>
      <EmptyState emoji="📖" title="The first page is being written…">
        Our moments and photos will live here very soon.
      </EmptyState>
    </>
  );
}
