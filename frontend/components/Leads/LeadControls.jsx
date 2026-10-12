"use client";

import { useActionState, useState } from "react";
import {
  addNoteAction,
  updateStatusAction,
  deleteLeadAction,
} from "@/actions/leadActions";
import { Feedback, inputClass, buttonClass, statuses } from "./LeadForm";

export function StatusForm({ lead }) {
  const [state, action, pending] = useActionState(
    updateStatusAction.bind(null, lead.id),
    {},
  );
  return (
    <form action={action} className="space-y-3">
      <Feedback state={state} />
      <label className="block text-sm font-medium">
        Lead status
        <select
          key={lead.status}
          name="status"
          defaultValue={lead.status}
          className={inputClass}
          disabled={pending}
        >
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>
      <button disabled={pending} className={buttonClass}>
        {pending ? "Updating…" : "Update status"}
      </button>
    </form>
  );
}

export function NoteForm({ id }) {
  const [note, setNote] = useState("");
  const [state, action, pending] = useActionState(async (previous, data) => {
    const result = await addNoteAction(id, previous, data);
    if (result.success) setNote("");
    return result;
  }, {});
  return (
    <form action={action} className="space-y-3">
      <Feedback state={state} />
      <label className="block text-sm font-medium">
        Add a note
        <textarea
          name="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          required
          maxLength={5000}
          placeholder="Record a conversation, follow-up or site visit…"
          className={inputClass}
          disabled={pending}
        />
      </label>
      <button disabled={pending} className={buttonClass}>
        {pending ? "Adding…" : "Add note"}
      </button>
    </form>
  );
}

export function DeleteLead({ id }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(
    deleteLeadAction.bind(null, id),
    {},
  );
  return (
    <div className="mt-6 border-t border-rose-100 pt-5">
      <Feedback state={state} />
      {confirming ? (
        <form action={action} className="space-y-3">
          <p className="text-sm text-rose-800">
            Delete this lead and all its notes? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              disabled={pending}
              className="rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Deleting…" : "Delete permanently"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirming(false)}
              className="px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="font-semibold text-rose-700"
        >
          Delete lead
        </button>
      )}
    </div>
  );
}
