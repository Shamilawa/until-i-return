"use client";

import { useActionState } from "react";
import { PEOPLE, WEEKDAYS } from "@/lib/config";
import { saveSettings } from "@/server/actions";

type Props = {
  metOn: string;
  leaveAt: string;
  reunionAt: string;
  letterWeekday: number;
  letterTime: string;
  sweetMessages: string;
};

export function SettingsForm(props: Props) {
  const [state, formAction, pending] = useActionState(saveSettings, null);

  return (
    <form action={formAction} className="card flex flex-col gap-4">
      <p className="text-sm text-ink-soft">All times are in {PEOPLE.reader.city} time.</p>

      <div>
        <label htmlFor="reunionAt" className="field-label">
          Reunion
        </label>
        <input id="reunionAt" name="reunionAt" type="datetime-local" className="field" defaultValue={props.reunionAt} required />
      </div>
      <div>
        <label htmlFor="leaveAt" className="field-label">
          The day I leave
        </label>
        <input id="leaveAt" name="leaveAt" type="datetime-local" className="field" defaultValue={props.leaveAt} required />
      </div>
      <div>
        <label htmlFor="metOn" className="field-label">
          The day we met
        </label>
        <input id="metOn" name="metOn" type="date" className="field" defaultValue={props.metOn} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="letterWeekday" className="field-label">
            Letter day
          </label>
          <select id="letterWeekday" name="letterWeekday" className="field" defaultValue={props.letterWeekday}>
            {WEEKDAYS.map((day, i) => (
              <option key={day} value={i}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="letterTime" className="field-label">
            Letter time
          </label>
          <input id="letterTime" name="letterTime" type="time" className="field" defaultValue={props.letterTime} required />
        </div>
      </div>
      <p className="-mt-2 text-xs text-ink-soft">Used to pre-fill new letters. Letters already scheduled keep their time.</p>

      <div>
        <label htmlFor="sweetMessages" className="field-label">
          Sweet messages (one per line)
        </label>
        <textarea id="sweetMessages" name="sweetMessages" className="field min-h-40" defaultValue={props.sweetMessages} />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-2xl bg-seal/10 px-4 py-2 text-sm font-semibold text-seal">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="rounded-2xl bg-gold/25 px-4 py-2 text-sm font-semibold text-ink">
          {state.success}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
