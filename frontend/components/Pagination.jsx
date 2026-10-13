"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function Pagination({ pagination, label = "leads", onNavigate, loading = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [transitioning, startTransition] = useTransition();
  const pending = transitioning || loading;
  if (!pagination) return null;
  const { page, pageSize, total, totalPages } = pagination;
  const sizes = [...new Set([5, 10, 20, 50, 100, pageSize])].sort(
    (a, b) => a - b,
  );
  function navigate(nextPage, nextSize = pageSize) {
    if (onNavigate) return onNavigate(nextPage, nextSize);
    const query = new URLSearchParams(searchParams.toString());
    query.set("page", String(nextPage));
    query.set("pageSize", String(nextSize));
    query.delete("deleted");
    query.delete("saved");
    startTransition(() =>
      router.push(`${pathname}?${query}`, { scroll: false }),
    );
  }
  return (
    <nav
      aria-label={`${label} pagination`}
      aria-busy={pending}
      className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm"
    >
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          Rows per page
          <select
            value={pageSize}
            disabled={pending}
            onChange={(event) => navigate(1, Number(event.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2"
          >
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <p role="status">
          {pending
            ? "Loading…"
            : `Showing ${total ? (page - 1) * pageSize + 1 : 0}–${Math.min(page * pageSize, total)} of ${total} ${label}`}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending || page <= 1}
          onClick={() => navigate(page - 1)}
          className="rounded-lg border px-3 py-2 disabled:opacity-40"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={pending || page >= totalPages}
          onClick={() => navigate(page + 1)}
          className="rounded-lg border px-3 py-2 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
