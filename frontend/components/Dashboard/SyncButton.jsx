"use client";

import { BarChart3, MoreVertical, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export default function SyncButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const close = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => event.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const refreshDashboard = () => {
    setOpen(false);
    startTransition(() => router.refresh());
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open dashboard actions"
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200 bg-white text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <MoreVertical size={20} />
      </button>

      {open ? (
        <div
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-xl"
          role="menu"
        >
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-60"
            disabled={isPending}
            onClick={refreshDashboard}
            role="menuitem"
            type="button"
          >
            <RefreshCw className={isPending ? "animate-spin" : ""} size={16} />
            {isPending ? "Syncing..." : "Refresh dashboard"}
          </button>
          <Link
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
            href="/leads"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <BarChart3 size={16} />
            View lead pipeline
          </Link>
          <Link
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
            href="/leads/new"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <Plus size={16} />
            Add new lead
          </Link>
        </div>
      ) : null}
    </div>
  );
}
