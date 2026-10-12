"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveLeadAction } from "@/actions/leadActions";

export const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100";
export const buttonClass =
  "rounded-lg bg-[#12352f] px-5 py-2.5 font-semibold text-white hover:bg-emerald-900 disabled:opacity-50";
export const statuses = ["New", "Contacted", "Site Visit", "Closed"];

export function Feedback({ state }) {
  if (!state?.error && !state?.success) return null;
  return (
    <p
      role={state.error ? "alert" : "status"}
      className={`rounded-lg p-3 text-sm ${state.error ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}
    >
      {state.error || state.success}
    </p>
  );
}

export default function LeadForm({ lead }) {
  const [state, action, pending] = useActionState(
    saveLeadAction.bind(null, lead?.id || null),
    {},
  );
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    budget: "",
    location: "",
    property_type: "",
    source: "",
    status: "New",
    ...lead,
  });
  const change = (event) =>
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const fields = [
    { name: "name", label: "Name", autoComplete: "name" },
    { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
    {
      name: "email",
      label: "Email (optional)",
      type: "email",
      autoComplete: "email",
      optional: true,
    },
    {
      name: "budget",
      label: "Budget (₹)",
      type: "number",
      min: "0",
      max: "9999999999.99",
      step: "0.01",
    },
    { name: "location", label: "Location" },
    { name: "property_type", label: "Property type", list: "property-types" },
    { name: "source", label: "Lead source", list: "lead-sources" },
  ];
  return (
    <form
      action={action}
      className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-8"
    >
      <Feedback state={state} />
      <fieldset disabled={pending} className="grid gap-5 sm:grid-cols-2">
        {fields.map(({ name, label, optional, ...props }) => (
          <label key={name} className="text-sm font-medium text-slate-700">
            {label}
            <input
              {...props}
              name={name}
              value={values[name] ?? ""}
              onChange={change}
              required={!optional}
              maxLength={props.type === "number" ? undefined : 250}
              className={inputClass}
            />
          </label>
        ))}
        <label className="text-sm font-medium text-slate-700">
          Status
          <select
            name="status"
            value={values.status}
            onChange={change}
            className={inputClass}
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      </fieldset>
      <datalist id="property-types">
        {["1 BHK", "2 BHK", "3 BHK", "Plot", "Villa", "Commercial"].map(
          (value) => (
            <option key={value} value={value} />
          ),
        )}
      </datalist>
      <datalist id="lead-sources">
        {["Facebook", "Google", "Referral", "Website", "Walk-in"].map(
          (value) => (
            <option key={value} value={value} />
          ),
        )}
      </datalist>
      <div className="flex items-center justify-end gap-4 border-t pt-5">
        <Link
          href={lead ? `/leads/${lead.id}` : "/leads"}
          className="text-sm font-semibold text-slate-600"
        >
          Cancel
        </Link>
        <button disabled={pending} className={buttonClass}>
          {pending ? "Saving…" : lead ? "Save changes" : "Create lead"}
        </button>
      </div>
    </form>
  );
}
