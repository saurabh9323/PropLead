import Link from "next/link";
import LeadForm from "@/components/Leads/LeadForm";
import { requireUser } from "@/lib/auth";

export default async function NewLeadPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/leads" className="text-sm font-semibold text-emerald-800">
        Back to leads
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Add lead</h1>
      <p className="mt-2 text-slate-500">
        Capture an enquiry and start tracking its progress.
      </p>
      <LeadForm />
    </div>
  );
}
