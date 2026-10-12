import { isApiConfigured } from "@/api/MainApi";
import { apiRequest } from "@/utils/apiRequest";

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

function StatusBadge({ status }) {
  const styles = {
    New: "bg-sky-50 text-sky-700 ring-sky-200",
    Contacted: "bg-amber-50 text-amber-700 ring-amber-200",
    "Site Visit": "bg-violet-50 text-violet-700 ring-violet-200",
    Closed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
        styles[status] || "bg-slate-50 text-slate-700 ring-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

function FilterForm({ filters }) {
  return (
    <form className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm" method="GET">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Search</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            defaultValue={filters.search}
            name="search"
            placeholder="Name or phone"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">Source</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            defaultValue={filters.source}
            name="source"
            placeholder="Website"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">Status</span>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            defaultValue={filters.status}
            name="status"
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">Sort by</span>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            defaultValue={filters.sortBy}
            name="sortBy"
          >
            <option value="created_at">Created date</option>
            <option value="budget">Budget</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">Direction</span>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            defaultValue={filters.sortOrder}
            name="sortOrder"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            type="submit"
          >
            Apply
          </button>
        </div>
      </div>
    </form>
  );
}

function LeadsTable({ leads }) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Contact</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Budget</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Location</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Source</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-950">{lead.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{lead.property_type}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-slate-800">{lead.phone}</p>
                  <p className="mt-1 text-xs text-slate-500">{lead.email || "No email"}</p>
                </td>
                <td className="px-4 py-4 font-medium text-slate-950">
                  {formatBudget(lead.budget)}
                </td>
                <td className="px-4 py-4 text-slate-700">{lead.location}</td>
                <td className="px-4 py-4 text-slate-700">{lead.source}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={lead.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function LeadsComp({ searchParams }) {
  const filters = getFilters(searchParams || {});
  const { data: leads, error } = await getLeads(filters);

  return (
    <>
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">Leads</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
            Lead directory
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-500">
          Search, filter, and sort the leads stored in Supabase through the Express API.
        </p>
      </header>

      <FilterForm filters={filters} />

      {error ? (
        <section className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <h2 className="font-semibold">Leads unavailable</h2>
          <p className="mt-2 text-sm">{error}</p>
        </section>
      ) : leads.length === 0 ? (
        <section className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
          <h2 className="font-semibold text-slate-950">No leads found</h2>
          <p className="mt-2 text-sm">
            Try clearing the search or filters. New lead creation will be added in a later stage.
          </p>
        </section>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{leads.length}</span> leads
            </p>
          </div>
          <LeadsTable leads={leads} />
        </>
      )}
    </>
  );
}
