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
import { getStatusStyle } from "./statusStyles";

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #d1fae5",
  boxShadow: "none",
  fontSize: 13,
};

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="min-w-0 rounded-xl border border-emerald-100 bg-white p-4 sm:p-6">
      <h3 className="text-base font-bold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      {children}
    </section>
  );
}

export default function DashboardCharts({ leadsBySource, statusDistribution }) {
  const sourceData = leadsBySource.map((item) => ({
    name: item.source,
    count: Number(item.count),
  }));
  const statusData = statusDistribution.map((item) => ({
    name: item.status,
    count: Number(item.count),
  }));
  const total = statusData.reduce((sum, item) => sum + item.count, 0);

  // Horizontal bars keep long source names readable on narrow screens.
  const sourceChartHeight = Math.max(220, sourceData.length * 48 + 24);

  return (
    <div className="mt-6 grid gap-4 sm:gap-6 lg:grid-cols-2">
      <ChartCard subtitle="Where your enquiries are coming from" title="Leads by source">
        <div className="mt-4" style={{ height: sourceChartHeight }}>
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={sourceData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid horizontal={false} stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis allowDecimals={false} axisLine={false} fontSize={12} stroke="#64748b" tickLine={false} type="number" />
              <YAxis
                axisLine={false}
                dataKey="name"
                fontSize={12}
                stroke="#334155"
                tickLine={false}
                type="category"
                width={88}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ecfdf5" }} />
              <Bar barSize={20} dataKey="count" fill="#12352f" name="Leads" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard subtitle="How leads are split across stages" title="Status distribution">
        <div className="mt-4 grid items-center gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div className="relative mx-auto h-56 w-full max-w-[260px]">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  innerRadius="62%"
                  nameKey="name"
                  outerRadius="95%"
                  paddingAngle={3}
                  stroke="none"
                >
                  {statusData.map((entry) => (
                    <Cell fill={getStatusStyle(entry.name).hex} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-950">{total}</span>
              <span className="text-xs text-slate-500">total leads</span>
            </div>
          </div>

          <ul className="space-y-2.5">
            {statusData.map((item) => (
              <li className="flex items-center gap-3 text-sm text-slate-600" key={item.name}>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: getStatusStyle(item.name).hex }}
                />
                <span className="truncate">{item.name}</span>
                <span className="ml-auto font-bold text-slate-950">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </ChartCard>
    </div>
  );
}
