import Link from "next/link";
import LeadForm from "@/components/Leads/LeadForm";
import { loadLead } from "@/lib/leads";

export default async function EditLeadPage({ params }) {
  const { id } = await params;
  const { lead, error } = await loadLead(id);
  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/leads/${id}`}
        className="text-sm font-semibold text-emerald-800"
      >
        ← Back to lead
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Edit lead</h1>
      {error ? (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-rose-50 p-4 text-rose-800"
        >
          {error}
        </p>
      ) : (
        <LeadForm lead={lead} />
      )}
    </div>
  );
}
