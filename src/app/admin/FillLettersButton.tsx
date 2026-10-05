"use client";

import { useActionState } from "react";
import { fillLetters } from "@/server/actions";

/** Puts a placeholder letter on every remaining letter day, so her letterbox shows the full run of envelopes. */
export function FillLettersButton() {
  const [state, formAction, pending] = useActionState(fillLetters, null);

  return (
    <form action={formAction} className="card flex flex-col gap-2 p-4">
      <p className="text-sm text-ink">
        Add a sealed placeholder for every letter day until the reunion that has no letter yet. She sees the envelopes
        waiting; you fill in the words later.
      </p>
      <button type="submit" className="btn btn-soft self-start" disabled={pending}>
        {pending ? "Adding…" : "Fill every letter day"}
      </button>
      {state?.success && (
        <p role="status" className="text-sm font-semibold text-ink">
          {state.success}
        </p>
      )}
    </form>
  );
}
