import { getAuthHeaders } from "@/lib/auth";
import Link from "next/link";
import { loadLead } from "@/lib/leads";
import { apiRequest } from "@/utils/apiRequest";

const date = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));

export default async function LeadDetailPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const { lead, error } = await loadLead(id);
  if (error)
    return (
      <div role="alert" className="rounded-xl bg-rose-50 p-6 text-rose-800">
        <p>{error}</p>
        <Link href="/leads" className="mt-3 inline-block underline">
          Back to leads
        </Link>
      </div>
    );
  let notes;
  try {
    notes = await apiRequest("Leads", "get", undefined, await getAuthHeaders(), `/${id}/notes`);
  } catch {
    notes = { ok: false, message: "Unable to load notes. Please try again." };
  }
  const info = [
    ["Phone", lead.phone],
    ["Email", lead.email || "—"],
    [
      "Budget",
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(lead.budget),
    ],
    ["Location", lead.location],
    ["Property type", lead.property_type],
    ["Source", lead.source],
    ["Created", date(lead.created_at)],
    ["Last updated", date(lead.updated_at)],
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/leads" className="text-sm font-semibold text-emerald-800">
        ← Back to leads
      </Link>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="break-words text-3xl font-bold">{lead.name}</h1>
          <p className="mt-2 text-emerald-800">{lead.status}</p>
        </div>
        <Link
          href={`/leads/${id}/edit`}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold"
        >
          Update lead
        </Link>
      </header>
      {query.saved === "1" && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-3 text-emerald-800"
        >
          Lead saved successfully.
        </p>
      )}
      <div>
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Lead information</h2>
          <dl className="mt-5 grid gap-6 sm:grid-cols-2">
            {info.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-slate-500">{label}</dt>
                <dd className="mt-1 break-words font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-5 text-xl font-semibold">Notes & comments</h2>
        {!notes.ok ? (
          <p role="alert" className="mt-5 text-rose-700">
            {notes.message}
          </p>
        ) : notes.data.length ? (
          <ul className="mt-6 divide-y divide-slate-100">
            {notes.data.map((note) => (
              <li key={note.id} className="py-4">
                <p className="whitespace-pre-wrap break-words text-slate-800">
                  {note.note}
                </p>
                <time
                  dateTime={note.created_at}
                  className="mt-2 block text-xs text-slate-500"
                >
                  {date(note.created_at)} IST
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            No notes yet. Open Update lead to add a note.
          </p>
        )}
      </section>
    </div>
  );
}
