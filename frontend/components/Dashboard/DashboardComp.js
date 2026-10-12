import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { isApiConfigured } from "@/api/MainApi";
import { apiRequest } from "@/utils/apiRequest";
import DashboardCharts from "./DashboardCharts";

async function getDashboardData() {
  if (!isApiConfigured) {
    return {
      dashboard: null,
      leads: [],
      error: "NEXT_PUBLIC_API_BASE_URL is not configured.",
    };
  }

  try {
    const [dashboardResult, leadsResult] = await Promise.all([
      apiRequest("Dashboard", "get"),
      apiRequest("Leads", "get", {
        sortBy: "created_at",
        sortOrder: "desc",
      }),
    ]);

    if (!dashboardResult.ok) {
      return {
        dashboard: null,
        leads: [],
        error: dashboardResult.message || "Unable to load dashboard.",
      };
    }

    return {
      dashboard: dashboardResult.data,
      leads: leadsResult.ok ? leadsResult.data || [] : [],
      error: null,
    };
  } catch (error) {
    return {
      dashboard: null,
      leads: [],
      error: "Unable to reach the backend API.",
    };
  }
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

function getStatusCount(statusDistribution, status) {
  const item = statusDistribution.find((entry) => entry.status === status);
  return Number(item?.count || 0);
}

function StatCard({ label, value, helper, icon: Icon, tone = "purple" }) {
  const tones = {
    purple: "bg-fuchsia-50 text-fuchsia-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <section className="rounded-md border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-600">{label}</p>
          <p className="mt-5 break-words text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
            {value}
          </p>
        </div>
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-md ${tones[tone]}`}>
          <Icon size={22} />
        </div>
      </div>
      <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-600">
        {helper}
        <ArrowRight size={16} />
      </p>
    </section>
  );
}

function MiniMetric({ label, value, helper, icon: Icon }) {
  return (
    <section className="flex items-center gap-5 rounded-md border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-700">
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-600">{label}</p>
        <p className="mt-2 break-words text-2xl font-black tracking-normal text-slate-950">
          {value}
        </p>
        <p className="text-sm text-slate-500">{helper}</p>
      </div>
    </section>
  );
}

function ProgressPanel({ closedLeads, totalLeads, conversionRate }) {
  const remainingLeads = Math.max(totalLeads - closedLeads, 0);
  const progressWidth = Math.min(Number(conversionRate || 0), 100);

  return (
    <section className="rounded-md border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-600">
          Conversion Progress
        </p>
        <p className="text-lg font-black tracking-normal text-emerald-600">
          {formatPercent(conversionRate)} Converted
        </p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-emerald-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progressWidth}%` }} />
      </div>
      <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="font-semibold text-emerald-600">{closedLeads} closed leads</span>
        <span className="font-semibold text-amber-600">{remainingLeads} still open</span>
      </div>
    </section>
  );
}

function LeadPortfolioTable({ leads }) {
  const recentLeads = leads.slice(0, 6);

  return (
    <section className="rounded-md border border-emerald-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 p-5">
        <div>
          <h3 className="text-lg font-black tracking-normal text-slate-950">
            Priority lead portfolio
          </h3>
          <p className="text-sm text-slate-500">Newest property enquiries moving through the sales pipeline</p>
        </div>
        <span className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-bold text-slate-700">
          {leads.length} lead records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-emerald-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-5 py-3">Lead</th>
              <th className="px-5 py-3">Property</th>
              <th className="px-5 py-3">Budget</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100">
            {recentLeads.map((lead) => (
              <tr className="hover:bg-emerald-50/40" key={lead.id}>
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-950">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.phone}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800">{lead.property_type}</p>
                  <p className="text-xs text-slate-500">{lead.location}</p>
                </td>
                <td className="px-5 py-4 font-bold text-slate-950">
                  {currencyFormatter.format(Number(lead.budget || 0))}
                </td>
                <td className="px-5 py-4 text-slate-700">{lead.source}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OperationalPulse({ statusDistribution, totalLeads }) {
  const maxCount = Math.max(...statusDistribution.map((item) => Number(item.count)), 1);

  return (
    <section className="rounded-md border border-emerald-100 bg-white shadow-sm">
      <div className="border-b border-emerald-100 p-5">
        <h3 className="text-lg font-black tracking-normal text-slate-950">Pipeline health</h3>
        <p className="text-sm text-slate-500">Status movement across active opportunities</p>
      </div>
      <div className="space-y-5 p-5">
        {statusDistribution.map((item) => {
          const count = Number(item.count);
          const width = Math.max((count / maxCount) * 100, 4);

          return (
            <div key={item.status}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">{item.status}</span>
                <span className="font-black text-slate-950">{count}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100">
                <div className="h-full rounded-full bg-[#12352f]" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}

        {totalLeads === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            Lead activity will appear after records are added.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default async function DashboardComp() {
  const { dashboard, leads, error } = await getDashboardData();
  const totalLeads = dashboard?.totalLeads || 0;
  const leadsBySource = dashboard?.leadsBySource || [];
  const statusDistribution = dashboard?.statusDistribution || [];
  const closedLeads = getStatusCount(statusDistribution, "Closed");
  const contactedLeads = getStatusCount(statusDistribution, "Contacted");
  const siteVisitLeads = getStatusCount(statusDistribution, "Site Visit");
  const newLeads = getStatusCount(statusDistribution, "New");
  const totalBudget = leads.reduce((sum, lead) => sum + Number(lead.budget || 0), 0);
  const averageBudget = totalLeads > 0 ? totalBudget / totalLeads : 0;
  const topSource = leadsBySource[0]?.source || "No source";

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-emerald-100 pb-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#12352f]">
            <span>Portfolio-Wide</span>
            <span className="text-slate-400">Live CRM snapshot</span>
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
            PropLead control room
          </h2>
          <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
            Track lead quality, site-visit movement, budget pipeline, and closures from one focused CRM workspace.
          </p>
        </div>
        <button
          className="flex w-fit items-center gap-2 rounded-md border border-emerald-200 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-emerald-50"
          type="button"
        >
          <RefreshCw size={17} />
          Sync pipeline
        </button>
      </header>

      {error ? (
        <section className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <h2 className="font-semibold">Dashboard unavailable</h2>
          <p className="mt-2 text-sm">{error}</p>
        </section>
      ) : (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <StatCard helper="All saved leads" icon={Users} label="Total Leads" value={totalLeads} />
            <StatCard
              helper="Fresh pipeline entries"
              icon={Clock3}
              label="New Leads"
              tone="blue"
              value={newLeads}
            />
            <StatCard
              helper="Follow-up conversations"
              icon={CalendarDays}
              label="Contacted"
              tone="amber"
              value={contactedLeads}
            />
            <StatCard
              helper="Visits scheduled"
              icon={Building2}
              label="Site Visits"
              tone="green"
              value={siteVisitLeads}
            />
            <StatCard
              helper="Deals won"
              icon={CheckCircle2}
              label="Closed"
              tone="green"
              value={closedLeads}
            />
            <StatCard
              helper="Closed / total leads"
              icon={TrendingUp}
              label="Conversion"
              tone="rose"
              value={formatPercent(dashboard.conversionRate)}
            />
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <MiniMetric
              helper="Across visible pipeline"
              icon={IndianRupee}
              label="Total Budget"
              value={currencyFormatter.format(totalBudget)}
            />
            <MiniMetric
              helper="Per saved lead"
              icon={TrendingUp}
              label="Average Budget"
              value={currencyFormatter.format(averageBudget)}
            />
            <MiniMetric
              helper="Highest active channel"
              icon={ShieldCheck}
              label="Top Source"
              value={topSource}
            />
            <MiniMetric
              helper="Active acquisition channels"
              icon={Building2}
              label="Lead Sources"
              value={leadsBySource.length}
            />
          </section>

          <div className="mt-6">
            <ProgressPanel
              closedLeads={closedLeads}
              conversionRate={dashboard.conversionRate}
              totalLeads={totalLeads}
            />
          </div>

          {totalLeads === 0 ? (
            <section className="mt-6 rounded-md border border-dashed border-slate-300 bg-white p-6 text-slate-600">
              <h2 className="font-semibold text-slate-950">No leads yet</h2>
              <p className="mt-2 text-sm">
                Dashboard metrics will appear after leads are added through the backend API.
              </p>
            </section>
          ) : (
            <>
              <DashboardCharts
                leadsBySource={leadsBySource}
                statusDistribution={statusDistribution}
              />
              <div className="mt-6 grid gap-5 xl:grid-cols-[2fr_1fr]">
                <LeadPortfolioTable leads={leads} />
                <OperationalPulse statusDistribution={statusDistribution} totalLeads={totalLeads} />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}


