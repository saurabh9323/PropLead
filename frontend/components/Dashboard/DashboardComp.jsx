import { getAuthHeaders } from "@/lib/auth";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Layers,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { isApiConfigured } from "@/api/MainApi";
import { apiRequest } from "@/utils/apiRequest";
import DashboardCharts from "./DashboardCharts";
import SyncButton from "./SyncButton";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { getPagination } from "@/lib/pagination";
import { getStatusStyle } from "./statusStyles";

async function getDashboardData(paging) {
  if (!isApiConfigured) {
    return {
      dashboard: null,
      leads: [],
      error: "NEXT_PUBLIC_API_BASE_URL is not configured.",
    };
  }

  try {
    const dashboardResult = await apiRequest("Dashboard", "get", paging, await getAuthHeaders());

    if (!dashboardResult.ok) {
      return {
        dashboard: null,
        leads: [],
        error: dashboardResult.message || "Unable to load dashboard.",
      };
    }

    return {
      dashboard: dashboardResult.data,
      pagination: dashboardResult.pagination,
      leads: dashboardResult.data.recentLeads || [],
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

// Short form (Rs 1.2Cr, Rs 45L) so big budgets never overflow small cards.
const compactCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

function getStatusCount(statusDistribution, status) {
  const item = statusDistribution.find((entry) => entry.status === status);
  return Number(item?.count || 0);
}

function StatCard({ label, value, helper, icon: Icon, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };

  return (
    <section className="min-w-0 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-3 whitespace-nowrap text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {value}
          </p>
        </div>
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${tones[tone]}`}
        >
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium leading-5 text-slate-500">{helper}</p>
    </section>
  );
}

function MiniMetric({ label, value, fullValue, helper, icon: Icon }) {
  return (
    <section className="flex min-w-0 items-center gap-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#12352f] text-emerald-100">
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <p
          className="truncate text-xl font-black text-slate-950 sm:text-2xl"
          title={fullValue || String(value)}
        >
          {value}
        </p>
        <p className="truncate text-xs text-slate-500">{helper}</p>
      </div>
    </section>
  );
}

// The one bold moment: conversion on the left, live pipeline funnel on the right.
function PipelineHero({
  closedLeads,
  totalLeads,
  conversionRate,
  statusDistribution,
}) {
  const remainingLeads = Math.max(totalLeads - closedLeads, 0);
  const progressWidth = Math.min(Number(conversionRate || 0), 100);
  const maxCount = Math.max(
    ...statusDistribution.map((item) => Number(item.count)),
    1,
  );

  return (
    <section className="mt-6 overflow-hidden rounded-3xl bg-[#12352f] text-white shadow-lg">
      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
        <div className="min-w-0">
          <p className="text-sm font-medium text-emerald-200">
            Conversion rate
          </p>
          <p className="mt-2 break-words text-5xl font-black tracking-tight sm:text-6xl">
            {formatPercent(conversionRate)}
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-emerald-100/80">
            {closedLeads} of {totalLeads} leads have closed.
          </p>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
            <span className="font-semibold text-emerald-300">
              {closedLeads} closed
            </span>
            <span className="font-semibold text-amber-300">
              {remainingLeads} still open
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-bold">Pipeline health</h3>
          <p className="mt-1 text-sm text-emerald-100/70">
            Leads at each stage right now
          </p>
          <ul className="mt-5 space-y-4">
            {statusDistribution.map((item) => {
              const count = Number(item.count);
              const width = Math.max((count / maxCount) * 100, 3);

              return (
                <li key={item.status}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-emerald-50">
                      {item.status}
                    </span>
                    <span className="font-black">{count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${width}%`,
                        backgroundColor: getStatusStyle(item.status).hex,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${getStatusStyle(status).badge}`}
    >
      {status}
    </span>
  );
}

function LeadPortfolioTable({ leads, pagination }) {
  const recentLeads = leads;

  return (
    <section className="mt-6 min-w-0 rounded-xl border border-emerald-100 bg-white">
      <div className="flex flex-col gap-2 border-b border-emerald-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h3 className="text-base font-bold text-slate-950 sm:text-lg">
            Latest enquiries
          </h3>
          <p className="text-sm text-slate-500">
            Newest property leads in your pipeline
          </p>
        </div>
        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
          {pagination.total} {pagination.total === 1 ? "lead" : "leads"} total
        </span>
      </div>

      {recentLeads.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">
          No lead records on this page.
        </p>
      ) : (
        <>
          {/* Tablet and desktop: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-emerald-50/60 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Lead</th>
                  <th className="px-5 py-3 font-semibold">Property</th>
                  <th className="px-5 py-3 font-semibold">Budget</th>
                  <th className="px-5 py-3 font-semibold">Source</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {recentLeads.map((lead) => (
                  <tr className="hover:bg-emerald-50/40" key={lead.id}>
                    <td className="px-5 py-4">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-bold text-emerald-900 hover:underline"
                      >
                        {lead.name}
                      </Link>
                      <p className="text-xs text-slate-500">{lead.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {lead.property_type}
                      </p>
                      <p className="text-xs text-slate-500">{lead.location}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-950">
                      {currencyFormatter.format(Number(lead.budget || 0))}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{lead.source}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards, no sideways scrolling */}
          <ul className="divide-y divide-emerald-100 md:hidden">
            {recentLeads.map((lead) => (
              <li className="p-4" key={lead.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="block truncate font-bold text-emerald-900 hover:underline"
                    >
                      {lead.name}
                    </Link>
                    <p className="text-xs text-slate-500">{lead.phone}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="min-w-0">
                    <dt className="text-xs text-slate-500">Property</dt>
                    <dd className="truncate font-semibold text-slate-800">
                      {lead.property_type}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-slate-500">Location</dt>
                    <dd className="truncate text-slate-700">{lead.location}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-slate-500">Budget</dt>
                    <dd className="truncate font-bold text-slate-950">
                      {currencyFormatter.format(Number(lead.budget || 0))}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-slate-500">Source</dt>
                    <dd className="truncate text-slate-700">{lead.source}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
      <Pagination pagination={pagination} />
    </section>
  );
}

export default async function DashboardComp({ searchParams = {} }) {
  const { dashboard, leads, pagination, error } = await getDashboardData(
    getPagination(searchParams),
  );
  const totalLeads = dashboard?.totalLeads || 0;
  const leadsBySource = dashboard?.leadsBySource || [];
  const statusDistribution = dashboard?.statusDistribution || [];
  const closedLeads = getStatusCount(statusDistribution, "Closed");
  const contactedLeads = getStatusCount(statusDistribution, "Contacted");
  const siteVisitLeads = getStatusCount(statusDistribution, "Site Visit");
  const newLeads = getStatusCount(statusDistribution, "New");
  const totalBudget = Number(dashboard?.totalBudget || 0);
  const averageBudget = Number(dashboard?.averageBudget || 0);
  const topSource = leadsBySource[0]?.source || "No source";

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <header className="flex flex-col gap-4 border-b border-emerald-100 pb-5 sm:pb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-800">
            Live CRM snapshot
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
            PropLead control room
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            Track lead quality, site visits, budget pipeline and closures in one
            workspace.
          </p>
        </div>
        <div className="self-start md:self-end">
          <SyncButton />
        </div>
      </header>

      {error ? (
        <section
          className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
          role="alert"
        >
          <h2 className="font-semibold">Dashboard unavailable</h2>
          <p className="mt-2 text-sm">{error}</p>
        </section>
      ) : (
        <>
          <PipelineHero
            closedLeads={closedLeads}
            conversionRate={dashboard.conversionRate}
            statusDistribution={statusDistribution}
            totalLeads={totalLeads}
          />

          <section className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-5">
            <StatCard
              helper="All saved leads"
              icon={Users}
              label="Total leads"
              value={totalLeads}
            />
            <StatCard
              helper="Fresh entries"
              icon={Clock3}
              label="New"
              tone="blue"
              value={newLeads}
            />
            <StatCard
              helper="Follow-up stage"
              icon={CalendarDays}
              label="Contacted"
              tone="amber"
              value={contactedLeads}
            />
            <StatCard
              helper="Scheduled visits"
              icon={Building2}
              label="Site visits"
              tone="violet"
              value={siteVisitLeads}
            />
            <StatCard
              helper="Deals won"
              icon={CheckCircle2}
              label="Closed"
              tone="green"
              value={closedLeads}
            />
          </section>

          <section className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <MiniMetric
              fullValue={currencyFormatter.format(totalBudget)}
              helper="Across all leads"
              icon={IndianRupee}
              label="Total budget"
              value={compactCurrencyFormatter.format(totalBudget)}
            />
            <MiniMetric
              fullValue={currencyFormatter.format(averageBudget)}
              helper="Per lead"
              icon={TrendingUp}
              label="Average budget"
              value={compactCurrencyFormatter.format(averageBudget)}
            />
            <MiniMetric
              helper="Most enquiries come from here"
              icon={ShieldCheck}
              label="Top source"
              value={topSource}
            />
            <MiniMetric
              helper="Active channels"
              icon={Layers}
              label="Lead sources"
              value={leadsBySource.length}
            />
          </section>

          {totalLeads === 0 ? (
            <section className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
              <h2 className="font-semibold text-slate-950">No leads yet</h2>
              <p className="mt-2 text-sm">
                Add your first lead and your metrics will show up here.
              </p>
              <Link
                href="/leads/new"
                className="mt-4 inline-block rounded-lg bg-[#12352f] px-4 py-2 font-semibold text-white"
              >
                Add lead
              </Link>
            </section>
          ) : (
            <>
              <DashboardCharts
                leadsBySource={leadsBySource}
                statusDistribution={statusDistribution}
              />
              <LeadPortfolioTable
                leads={leads}
                pagination={pagination}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
