"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/utils/apiRequest";
import {
  BarChart3,
  Home,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

const getNavItems = (role) => {
  const adminItems = [
    { label: "Control Room", href: "/", icon: Home, group: "Workspace" },
    { label: "Team & Roles", href: "/users", icon: ShieldCheck, group: "Workspace" },
    { label: "Lead Pipeline", href: "/leads", icon: BarChart3, group: "Workspace" },
  ];

  const crmItems = [
    { label: "Control Room", href: "/", icon: Home, group: "Workspace" },
    { label: "My Pipeline", href: "/leads", icon: BarChart3, group: "Sales Flow" },
  ];

  return role === "admin" ? adminItems : crmItems;
};

export default function AppShell({ user, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");

  function searchLeads(event) {
    event.preventDefault();
    const search = quickSearch.trim();
    if (!search) {
      router.push("/leads");
      return;
    }
    router.push(`/leads?search=${encodeURIComponent(search)}`);
  }

  async function logout(event) {
    event.preventDefault();
    if (loggingOut) return;
    setLoggingOut(true);
    const result = await apiRequest("Logout", "post", {});
    if (result.ok) { router.replace("/login"); router.refresh(); }
    else { setLoggingOut(false); window.alert(result.message); }
  }
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const navItems = getNavItems(user?.role);
  const groupedItems = navItems.reduce((groups, item) => {
    const group = item.group || "Menu";
    return {
      ...groups,
      [group]: [...(groups[group] || []), item],
    };
  }, {});

  const sidebarContent = (
    <>
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-white text-xl font-black text-[#12352f]">
            P
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-white">PropLead CRM</h1>
            <p className="truncate text-xs text-white/60">Lead Desk for Property Teams</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {Object.entries(groupedItems).map(([group, items]) => (
          <div className="mb-5" key={group}>
            <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-white/70">
              {group}
            </p>

            <div className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = item.href !== "#" && pathname === item.href;

                return (
                  <Link
                    className={
                      isActive
                        ? "flex items-center rounded-md bg-white px-3 py-2.5 text-sm font-bold text-[#0f766e] shadow-sm"
                        : "flex items-center rounded-md px-3 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10"
                    }
                    href={item.href}
                    key={item.label}
                    onClick={(event) => {
                      if (isActive) event.preventDefault();
                      setIsMobileNavOpen(false);
                    }}
                    prefetch
                  >
                    <Icon className="mr-3 shrink-0" size={19} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-md bg-white/10 p-3 text-sm">
          <p className="text-white/70">Workspace user</p>
          <p className="mt-1 truncate font-semibold text-white">{user?.name}</p>
          <p className="text-xs text-white/70">{user?.role}</p>
        </div>
        <form onSubmit={logout} className="mt-3">
          <button
            className="flex w-full items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            type="submit"
          >
            <LogOut size={17} />
            Logout
          </button>
        </form>
      </div>
    </>
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7f4] text-slate-950 lg:flex">
      <aside className="hidden bg-[#12352f] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-80 lg:flex-col">
        {sidebarContent}
      </aside>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setIsMobileNavOpen(false)}
            type="button"
          />
          <aside className="relative flex h-full w-[min(20rem,85vw)] flex-col bg-[#12352f] text-white shadow-2xl">
            <div className="absolute right-3 top-3">
              <button
                aria-label="Close navigation"
                className="rounded-md p-2 text-white/80 hover:bg-white/10"
                onClick={() => setIsMobileNavOpen(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      <section className="min-w-0 flex-1 lg:min-h-screen lg:pl-80">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-5 lg:mx-6 lg:mt-4 lg:rounded-md lg:border lg:py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            

            <div className="flex items-center justify-between gap-3 md:justify-end">
              <div className="truncate rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:text-sm">
                {user?.role} workspace active
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 font-semibold text-slate-700">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="min-w-0 px-4 py-5 sm:px-5 lg:px-10">{children}</div>
      </section>
    </main>
  );
}

