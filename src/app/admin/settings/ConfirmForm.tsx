"use client";

import { useActionState, useId, useState } from "react";
import type { FormState } from "@/lib/form-state";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  /** The word that has to be typed before the button works. */
  word: string;
  title: string;
  description: string;
  button: string;
};

export function ConfirmForm({ action, word, title, description, button }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const [typed, setTyped] = useState("");
  const inputId = useId();

  return (
    <form
      action={(formData) => {
        formAction(formData);
        setTyped("");
      }}
      className="flex flex-col gap-2"
    >
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="text-sm text-ink-soft">{description}</p>
      <label htmlFor={inputId} className="field-label mb-0 mt-1">
        Type {word} to confirm
      </label>
      <input
        id={inputId}
        name="confirm"
        className="field"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        autoCapitalize="characters"
      />
      {state?.error && (
        <p role="alert" className="text-sm font-semibold text-seal">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="text-sm font-semibold text-ink">
          {state.success}
        </p>
      )}
      <button type="submit" className="btn btn-danger self-start" disabled={pending || typed !== word}>
        {pending ? "Working…" : button}
      </button>
    </form>
  );
}
