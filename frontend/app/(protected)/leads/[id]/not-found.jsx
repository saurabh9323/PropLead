import Link from "next/link";
export default function LeadNotFound() {
  return (
    <section className="rounded-xl bg-white p-8">
      <h1 className="text-2xl font-bold">Lead not found</h1>
      <p className="mt-3 text-slate-600">
        This lead may have been deleted or the link is invalid.
      </p>
      <Link
        href="/leads"
        className="mt-5 inline-block font-semibold text-emerald-800"
      >
        Back to leads
      </Link>
    </section>
  );
}
