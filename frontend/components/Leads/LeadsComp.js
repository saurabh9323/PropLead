import { Inbox, Mail, MapPin, Phone, Search } from "lucide-react";
import { isApiConfigured } from "@/api/MainApi";
import { apiRequest } from "@/utils/apiRequest";
import { getStatusStyle } from "../Dashboard/statusStyles";

const statusOptions = ["New", "Contacted", "Site Visit", "Closed"];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

async function getLeads(filters) {
  if (!isApiConfigured) {
    return {
      data: [],
      error: "NEXT_PUBLIC_API_BASE_URL is not configured.",
    };
  }

  try {
    const result = await apiRequest("Leads", "get", filters);

    if (!result.ok) {
      return {
        data: [],
        error: result.message || "Unable to load leads.",
      };
    }

    return {
      data: result.data || [],
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: "Unable to reach the backend API.",
    };
  }
}

function formatBudget(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return currencyFormatter.format(numericValue);
}

function getFilters(params) {
  return {
    search: typeof params.search === "string" ? params.search.trim() : "",
    source: typeof params.source === "string" ? params.source.trim() : "",
    status: typeof params.status === "string" ? params.status : "",
    sortBy: params.sortBy === "budget" ? "budget" : "created_at",
    sortOrder: params.sortOrder === "asc" ? "asc" : "desc",
  };
}

// Build a link that keeps the current filters but changes some of them.
function buildHref(filters, overrides = {}) {
  const merged = { ...filters, ...overrides };
  const query = new URLSearchParams();

  Object.entries(merged).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const text = query.toString();
  return text ? `?${text}` : "?";
}

function getInitials(name) {
  return String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:text-sm";

function StatusBadge({ status }) {
  const style = getStatusStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style.badge}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.hex }} />
      {status}
    </span>
  );
}

function Avatar({ name }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-900">
      {getInitials(name)}
    </span>
  );
}

function StatusTabs({ filters }) {
  const tabs = [{ label: "All leads", value: "" }, ...statusOptions.map((s) => ({ label: s, value: s }))];

  return (
    <nav aria-label="Filter by status" className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {tabs.map((tab) => {
          const active = filters.status === tab.value;

          return (
            <li key={tab.label}>
              <a
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                  active
                    ? "bg-[#12352f] text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50"
                }`}
                href={buildHref(filters, { status: tab.value })}
              >
                {tab.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function FilterForm({ filters }) {
  const hasActiveFilters = Boolean(filters.search || filters.source || filters.status);

  return (
    <form className="mt-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5" method="GET">
      {/* Status is chosen with the tabs above; keep it when the form is submitted. */}
      <input name="status" type="hidden" value={filters.status} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[2fr_1.2fr_1fr_1fr_auto] xl:items-end">
        <label className="block sm:col-span-2 xl:col-span-1">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Search</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className={`${inputClass} pl-9`}
              defaultValue={filters.search}
              name="search"
              placeholder="Name or phone"
              type="search"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Source</span>
          <input className={inputClass} defaultValue={filters.source} name="source" placeholder="e.g. Website" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Sort by</span>
          <select className={inputClass} defaultValue={filters.sortBy} name="sortBy">
            <option value="created_at">Created date</option>
            <option value="budget">Budget</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Order</span>
          <select className={inputClass} defaultValue={filters.sortOrder} name="sortOrder">
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>

        <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end xl:col-span-1">
          {hasActiveFilters ? (
            <a
              className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
              href="?"
            >
              Clear
            </a>
          ) : null}
          <button
            className="rounded-lg bg-[#12352f] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0c2420] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            type="submit"
          >
            Apply
          </button>
        </div>
      </div>
    </form>
  );
}

function ContactInfo({ lead }) {
  return (
    <div className="min-w-0 space-y-1 text-sm">
      {lead.phone ? (
        <a
          className="flex items-center gap-2 font-medium text-slate-800 hover:text-emerald-700"
          href={`tel:${lead.phone}`}
        >
          <Phone className="shrink-0 text-slate-400" size={14} />
          <span className="truncate">{lead.phone}</span>
        </a>
      ) : null}
      {lead.email ? (
        <a
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-700"
          href={`mailto:${lead.email}`}
        >
          <Mail className="shrink-0 text-slate-400" size={14} />
          <span className="truncate">{lead.email}</span>
        </a>
      ) : null}
      {!lead.phone && !lead.email ? <span className="text-slate-400">No contact details</span> : null}
    </div>
  );
}

function LeadsTable({ leads }) {
  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Tablet and desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Lead</th>
              <th className="px-5 py-3 font-semibold">Contact</th>
              <th className="px-5 py-3 text-right font-semibold">Budget</th>
              <th className="px-5 py-3 font-semibold">Location</th>
              <th className="px-5 py-3 font-semibold">Source</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr className="transition-colors hover:bg-emerald-50/50" key={lead.id}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={lead.name} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{lead.name}</p>
                      <p className="text-xs text-slate-500">{lead.property_type}</p>
                    </div>
                  </div>
                </td>
                <td className="max-w-[240px] px-5 py-3.5">
                  <ContactInfo lead={lead} />
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                  {formatBudget(lead.budget)}
                </td>
                <td className="px-5 py-3.5 text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="shrink-0 text-slate-400" size={14} />
                    {lead.location || "-"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-700">{lead.source || "-"}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={lead.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards, no sideways scrolling */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {leads.map((lead) => (
          <li className="p-4" key={lead.id}>
            <div className="flex items-start gap-3">
              <Avatar name={lead.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-semibold text-slate-900">{lead.name}</p>
                  <StatusBadge status={lead.status} />
                </div>
                <p className="text-xs text-slate-500">{lead.property_type}</p>
              </div>
            </div>

            <div className="mt-3">
              <ContactInfo lead={lead} />
            </div>

            <dl className="mt-3 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Budget</dt>
                <dd className="truncate font-semibold text-slate-900">{formatBudget(lead.budget)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Location</dt>
                <dd className="truncate text-slate-700">{lead.location || "-"}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Source</dt>
                <dd className="truncate text-slate-700">{lead.source || "-"}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function LeadsComp({ searchParams }) {
  const filters = getFilters(searchParams || {});
  const { data: leads, error } = await getLeads(filters);

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-emerald-800">Leads</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Lead directory
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Search, filter and sort every lead in your pipeline.
          </p>
        </div>
        {!error ? (
          <p className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
          </p>
        ) : null}
      </header>

      <StatusTabs filters={filters} />
      <FilterForm filters={filters} />

      {error ? (
        <section
          className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
          role="alert"
        >
          <h2 className="font-semibold">Leads unavailable</h2>
          <p className="mt-2 text-sm">{error}</p>
        </section>
      ) : leads.length === 0 ? (
        <section className="mt-3 flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
            <Inbox size={22} />
          </span>
          <h2 className="mt-4 font-semibold text-slate-950">No leads found</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Nothing matches these filters. Clear them to see every lead.
          </p>
          <a
            className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            href="?"
          >
            Clear filters
          </a>
        </section>
      ) : (
        <LeadsTable leads={leads} />
      )}
    </div>
  );
}