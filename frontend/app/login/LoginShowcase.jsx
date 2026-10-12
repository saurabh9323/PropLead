"use client";

import { Building2, CalendarDays, CheckCircle2, Users } from "lucide-react";
import { useRef, useState } from "react";

// Illustrative sample data, only to show what each stage looks like.
const stages = [
  {
    id: "enquiries",
    label: "Enquiries",
    icon: Users,
    title: "Every enquiry in one place",
    text: "New leads arrive with their source, budget and property type, ready to assign.",
    rows: [
      { name: "Aarav Mehta", detail: "Apartment, Pune", budget: "₹61L" },
      { name: "Neha Kapoor", detail: "Villa, Noida", budget: "₹1.2Cr" },
    ],
  },
  {
    id: "follow-ups",
    label: "Follow-ups",
    icon: CalendarDays,
    title: "Nothing slips through",
    text: "See who has been contacted and who is still waiting for a call back.",
    rows: [
      { name: "Rohan Verma", detail: "Call back today", budget: "₹52L" },
      { name: "Isha Nair", detail: "Waiting for documents", budget: "₹43L" },
    ],
  },
  {
    id: "site-visits",
    label: "Site visits",
    icon: Building2,
    title: "Visits, scheduled and tracked",
    text: "Know which buyers are visiting a property this week and which ones are next.",
    rows: [
      { name: "Kabir Shah", detail: "Visit on Saturday", budget: "₹78L" },
      { name: "Meera Iyer", detail: "Visit on Sunday", budget: "₹95L" },
    ],
  },
  {
    id: "closures",
    label: "Closures",
    icon: CheckCircle2,
    title: "See what is actually closing",
    text: "Follow conversion from first enquiry to signed deal, stage by stage.",
    rows: [
      { name: "Dev Malhotra", detail: "Deal closed", budget: "₹66L" },
      { name: "Anaya Rao", detail: "Deal closed", budget: "₹1.4Cr" },
    ],
  },
];

const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

export default function LoginShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef([]);
  const stage = stages[activeIndex];

  const selectStage = (index, focus = false) => {
    setActiveIndex(index);
    if (focus) tabRefs.current[index]?.focus();
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectStage((activeIndex + 1) % stages.length, true);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectStage((activeIndex - 1 + stages.length) % stages.length, true);
    }
  };

  return (
    <div className="mt-6 max-w-xl xl:mt-8">
      <div
        aria-label="Pipeline stages"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
        onKeyDown={onKeyDown}
        role="tablist"
      >
        {stages.map((item, index) => {
          const active = index === activeIndex;
          const Icon = item.icon;

          return (
            <button
              aria-controls="showcase-panel"
              aria-selected={active}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                active
                  ? "border-white bg-white text-[#12352f]"
                  : "border-white/15 bg-white/10 text-white hover:bg-white/15"
              }`}
              id={`showcase-tab-${item.id}`}
              key={item.id}
              onClick={() => selectStage(index)}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              role="tab"
              tabIndex={active ? 0 : -1}
              type="button"
            >
              <Icon className="shrink-0" size={16} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`showcase-tab-${stage.id}`}
        className="mt-3 rounded-xl border border-white/15 bg-white/10 p-4"
        id="showcase-panel"
        role="tabpanel"
      >
        <h3 className="text-lg font-semibold">{stage.title}</h3>
        <p className="mt-1 text-sm leading-6 text-white/75">{stage.text}</p>

        <ul className="mt-3 space-y-2">
          {stage.rows.map((row) => (
            <li
              className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-slate-900"
              key={row.name}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-900">
                {initials(row.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{row.name}</span>
                <span className="block truncate text-xs text-slate-500">{row.detail}</span>
              </span>
              <span className="text-sm font-semibold tabular-nums">{row.budget}</span>
            </li>
          ))}
        </ul>

        <div aria-hidden="true" className="mt-3 flex gap-1.5">
          {stages.map((item, index) => (
            <span
              className={`h-1.5 flex-1 rounded-full transition-colors motion-reduce:transition-none ${
                index <= activeIndex ? "bg-emerald-300" : "bg-white/15"
              }`}
              key={item.id}
            />
          ))}
        </div>
        <p className="mt-1.5 text-xs text-white/50">Sample data</p>
      </div>
    </div>
  );
}