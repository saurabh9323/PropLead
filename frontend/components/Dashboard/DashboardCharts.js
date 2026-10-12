"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const colors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function DashboardCharts({ leadsBySource, statusDistribution }) {
  const sourceData = leadsBySource.map((item) => ({
    name: item.source,
    count: Number(item.count),
  }));
  const statusData = statusDistribution.map((item) => ({
    name: item.status,
    count: Number(item.count),
  }));

  return (
    <div className="mt-6 grid gap-5 xl:grid-cols-2">
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Leads by source
        </h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={sourceData}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" fontSize={12} stroke="#64748b" />
              <YAxis allowDecimals={false} fontSize={12} stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Status distribution
        </h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                innerRadius={60}
                nameKey="name"
                outerRadius={95}
                paddingAngle={3}
              >
                {statusData.map((entry, index) => (
                  <Cell fill={colors[index % colors.length]} key={entry.name} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {statusData.map((item, index) => (
            <div className="flex items-center gap-2 text-sm text-slate-600" key={item.name}>
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span>{item.name}</span>
              <span className="ml-auto font-semibold text-slate-950">{item.count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
