"use client";

import { useState, useTransition } from "react";
import { hideJourney, startJourney } from "@/server/actions";

type Props = {
  readerName: string;
  /** When the journey was started (Sri Lanka time), or null if it has not been. */
  startedLabel: string | null;
};

export function JourneyControl({ readerName, startedLabel }: Props) {
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();
  const started = startedLabel !== null;

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      setArmed(false);
    });
  }

  return (
    <section className={`card flex flex-col gap-3 ${started ? "" : "border-gold/70 shadow-glow"}`}>
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">
          {started ? "The journey has started ✈️" : "Before take-off"}
        </h2>
        <p className="text-sm text-ink-soft">
          {started
            ? `Started ${startedLabel}. ${readerName} can see the countdown and her letters.`
            : `${readerName} only sees a waiting screen. Tap this when your plane takes off and the countdown and letters appear for her.`}
        </p>
      </div>

      {!armed ? (
        started ? (
          <button type="button" className="btn btn-soft self-start" onClick={() => setArmed(true)}>
            Hide it from her again
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => setArmed(true)}>
            Start the journey
          </button>
        )
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn ${started ? "btn-danger" : "btn-primary"}`}
            disabled={pending}
            onClick={() => run(started ? hideJourney : startJourney)}
          >
            {pending ? "Working…" : started ? "Yes, hide it" : "Yes, show her now"}
          </button>
          <button type="button" className="btn btn-soft" disabled={pending} onClick={() => setArmed(false)}>
            Not yet
          </button>
        </div>
      )}
    </section>
  );
}
