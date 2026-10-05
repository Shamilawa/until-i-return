"use client";

import { useActionState } from "react";
import { login } from "@/server/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="card flex w-full flex-col gap-4">
      <div>
        <label htmlFor="username" className="field-label">
          Name
        </label>
        <input
          id="username"
          name="username"
          className="field"
          defaultValue={state?.username}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Secret word
        </label>
        <input id="password" name="password" type="password" className="field" autoComplete="current-password" required />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-2xl bg-seal/10 px-4 py-2 text-sm font-semibold text-seal">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Opening the door…" : "Come in"}
      </button>
    </form>
  );
}
