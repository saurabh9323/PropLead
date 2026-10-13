import Link from "next/link";
import LeadForm from "@/components/Leads/LeadForm";
import { loadLead } from "@/lib/leads";
import { NoteForm } from "@/components/Leads/LeadControls";

export default async function EditLeadPage({ params }) {
  const { id } = await params;
  const { lead, error } = await loadLead(id);
  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/leads/${id}`}
        className="text-sm font-semibold text-emerald-800"
      >
        Back to lead
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Update lead</h1>
      {error ? (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-rose-50 p-4 text-rose-800"
        >
          {error}
        </p>
      ) : (
        <>
          <LeadForm lead={lead} />
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Notes & comments</h2>
            <NoteForm id={id} />
          </section>
        </>
      )}
    </div>
  );
}
