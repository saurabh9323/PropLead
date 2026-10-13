"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Swal from "sweetalert2";
import { apiRequest } from "@/utils/apiRequest";

export default function LeadActions({ lead, canDelete, onDeleted, disabled = false }) {
  const menu = useRef(null);
  const [deleting, setDeleting] = useState(false);
  async function remove() {
    if (deleting || disabled) return;
    menu.current?.removeAttribute("open");
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
      const result = await apiRequest("Leads", "post", {}, {}, `/${lead.id}/delete`);
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
    <details ref={menu} className="min-w-28 text-sm">
      <summary className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700" aria-label={`Actions for ${lead.name}`}>
        {deleting ? "Deleting…" : "Actions"}
      </summary>
      <div className="mt-2 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-1">
        <Link href={`/leads/${lead.id}`} prefetch={false} className="rounded px-3 py-2 text-emerald-900 hover:bg-emerald-50">View</Link>
        <Link href={`/leads/${lead.id}/edit`} prefetch={false} className="rounded px-3 py-2 text-emerald-900 hover:bg-emerald-50">Update</Link>
        {canDelete && <button type="button" disabled={deleting || disabled} onClick={remove} className="rounded px-3 py-2 text-left text-rose-700 hover:bg-rose-50 disabled:opacity-50">Delete</button>}
      </div>
    </details>
  );
}
