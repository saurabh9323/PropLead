"use client";
export default function LeadError({ reset }) {
  return (
    <section
      role="alert"
      className="rounded-xl border border-rose-200 bg-white p-6"
    >
      <h2 className="text-xl font-semibold">Unable to load leads</h2>
      <p className="mt-2 text-slate-600">Please try again in a moment.</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-[#12352f] px-4 py-2 font-semibold text-white"
      >
        Try again
      </button>
    </section>
  );
}
