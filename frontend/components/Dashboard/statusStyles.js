// One source of truth for lead-status colors (used by the funnel, table badges and charts).
export const STATUS_STYLES = {
  New: { hex: "#3b82f6", badge: "bg-blue-50 text-blue-700 ring-blue-200" },
  Contacted: { hex: "#f59e0b", badge: "bg-amber-50 text-amber-700 ring-amber-200" },
  "Site Visit": { hex: "#8b5cf6", badge: "bg-violet-50 text-violet-700 ring-violet-200" },
  Closed: { hex: "#10b981", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  Lost: { hex: "#f43f5e", badge: "bg-rose-50 text-rose-700 ring-rose-200" },
};

const FALLBACK = { hex: "#64748b", badge: "bg-slate-100 text-slate-700 ring-slate-200" };

export const getStatusStyle = (status) => STATUS_STYLES[status] || FALLBACK;
