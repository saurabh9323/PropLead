"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function SyncButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-60 sm:w-auto"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      type="button"
    >
      <RefreshCw className={isPending ? "animate-spin" : ""} size={16} />
      {isPending ? "Syncing…" : "Sync pipeline"}
    </button>
  );
}
