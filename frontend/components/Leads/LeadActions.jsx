"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Swal from "sweetalert2";
import { apiRequest } from "@/utils/apiRequest";

const baseButtonClass =
  "group relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";

function Tooltip({ label }) {
  return (
    <span className="pointer-events-none absolute -top-9 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white shadow-lg group-hover:block group-focus-visible:block">
      {label}
    </span>
  );
}

export default function LeadActions({ lead, canDelete, onDeleted, disabled = false }) {
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (deleting || disabled) return;

    const confirmation = await Swal.fire({
      title: "Delete lead?",
      text: `Delete ${lead.name} and all associated notes? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete lead",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#be123c",
      focusCancel: true,
    });

    if (!confirmation.isConfirmed) return;

    setDeleting(true);

    try {
      const result = await apiRequest("Leads", "delete", undefined, {}, `/${lead.id}`);

      if (!result.ok) {
        await Swal.fire({ title: "Unable to delete", text: result.message, icon: "error" });
        return;
      }

      onDeleted();
      await Swal.fire({ title: "Lead deleted", text: result.message, icon: "success" });
    } catch {
      await Swal.fire({ title: "Unable to delete", text: "Please try again.", icon: "error" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2" aria-label={`Actions for ${lead.name}`}>
      <Link
        aria-label={`View ${lead.name}`}
        className={baseButtonClass}
        href={`/leads/${lead.id}`}
        prefetch={false}
        title="View lead"
      >
        <Eye size={17} />
        <Tooltip label="View" />
      </Link>

      <Link
        aria-label={`Edit ${lead.name}`}
        className={baseButtonClass}
        href={`/leads/${lead.id}/edit`}
        prefetch={false}
        title="Edit lead"
      >
        <Pencil size={17} />
        <Tooltip label="Edit" />
      </Link>

      {canDelete ? (
        <button
          aria-label={`Delete ${lead.name}`}
          className={`${baseButtonClass} hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-rose-600`}
          disabled={deleting || disabled}
          onClick={remove}
          title="Delete lead"
          type="button"
        >
          <Trash2 size={17} />
          <Tooltip label={deleting ? "Deleting..." : "Delete"} />
        </button>
      ) : null}
    </div>
  );
}
