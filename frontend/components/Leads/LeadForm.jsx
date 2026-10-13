"use client";

import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/utils/apiRequest";

export const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100";
export const buttonClass =
  "rounded-lg bg-[#12352f] px-5 py-2.5 font-semibold text-white hover:bg-emerald-900 disabled:opacity-50";
export const statuses = ["New", "Contacted", "Site Visit", "Closed"];
export const propertyTypes = ["Apartment", "Villa", "Plot", "Commercial", "1 BHK", "2 BHK", "3 BHK", "4 BHK"];
export const leadSources = ["Website", "Referral", "Walk-in", "Social Media", "Google", "Google Ads", "Facebook", "Instagram", "Other"];

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

function SearchableDropdown({ label, name, value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function choose(option) {
    setQuery(option);
    onChange({ target: { name, value: option } });
    setOpen(false);
  }

  return (
    <label className="relative text-sm font-medium text-slate-700">
      {label}
      <div className="relative">
        <input
          autoComplete="off"
          className={`${inputClass} pr-10`}
          disabled={disabled}
          name={name}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange(event);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={`Search ${label.toLowerCase()}`}
          required
          value={value ?? ""}
        />
        <button
          aria-label={`Open ${label} options`}
          className="absolute bottom-0 right-2 top-1 grid place-items-center rounded px-1 text-slate-500 hover:text-slate-900"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <ChevronDown size={18} />
        </button>
      </div>
      {open ? (
        <div className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-emerald-50 ${
                  option === value ? "font-semibold text-emerald-800" : "text-slate-700"
                }`}
                key={option}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
                type="button"
              >
                <span>{option}</span>
                {option === value ? <Check size={16} /> : null}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-slate-500">No matching option</p>
          )}
        </div>
      ) : null}
    </label>
  );
}

export default function LeadForm({ lead }) {
  const router = useRouter();
  const [state, setState] = useState({});
  const [pending, setPending] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    const result = await apiRequest(
      "Leads",
      lead ? "put" : "post",
      values,
      {},
      lead ? `/${lead.id}` : "",
    );
    if (result.ok) { router.push(`/leads/${result.data.id}?saved=1`); router.refresh(); }
    else setState({ error: result.message });
    setPending(false);
  }
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
      label: "Budget (INR)",
      type: "number",
      min: "0",
      max: "9999999999.99",
      step: "0.01",
    },
    { name: "location", label: "Location" },
  ];
  return (
    <form
      onSubmit={submit}
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
        <SearchableDropdown
          disabled={pending}
          label="Property type"
          name="property_type"
          onChange={change}
          options={propertyTypes}
          value={values.property_type}
        />
        <SearchableDropdown
          disabled={pending}
          label="Lead source"
          name="source"
          onChange={change}
          options={leadSources}
          value={values.source}
        />
        <SearchableDropdown
          disabled={pending}
          label="Status"
          name="status"
          onChange={change}
          options={statuses}
          value={values.status}
        />
      </fieldset>
      <div className="flex items-center justify-end gap-4 border-t pt-5">
        <Link
          href={lead ? `/leads/${lead.id}` : "/leads"}
          className="text-sm font-semibold text-slate-600"
        >
          Cancel
        </Link>
        <button disabled={pending} className={buttonClass}>
          {pending ? "Saving..." : lead ? "Save changes" : "Create lead"}
        </button>
      </div>
    </form>
  );
}
