"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/utils/apiRequest";
import { Feedback, inputClass, buttonClass, statuses } from "./LeadForm";


function useLeadMutation(id, suffix, onSuccess) {
  const router = useRouter();
  const [state, setState] = useState({});
  const [pending, setPending] = useState(false);
  async function submit(event, body) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    const result = await apiRequest("Leads", "post", body, {}, `/${id}/${suffix}`);
    setState(result.ok ? { success: result.message } : { error: result.message });
    if (result.ok) { onSuccess?.(); router.refresh(); }
    setPending(false);
  }
  return [state, submit, pending];
}

export function StatusForm({ lead }) {
  const [status, setStatus] = useState(lead.status);
  const [state, submit, pending] = useLeadMutation(lead.id, "status");
  return (
    <form onSubmit={(event) => submit(event, { status })} className="space-y-3">
      <Feedback state={state} />
      <label className="block text-sm font-medium">
        Lead status
        <select
          key={lead.status}
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
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
  const [state, submit, pending] = useLeadMutation(id, "notes", () => setNote(""));
  return (
    <form onSubmit={(event) => submit(event, { note })} className="space-y-3">
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
  const router = useRouter();
  const [state, submit, pending] = useLeadMutation(id, "delete", () => router.push("/leads?deleted=1"));
  return (
    <div className="mt-6 border-t border-rose-100 pt-5">
      <Feedback state={state} />
      {confirming ? (
        <form onSubmit={(event) => submit(event, {})} className="space-y-3">
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
