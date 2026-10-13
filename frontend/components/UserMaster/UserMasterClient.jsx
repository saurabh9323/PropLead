"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/utils/apiRequest";

const PAGE_SIZE = 10;

/* ---------- helpers ---------- */

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(date);
}

function isActive(user) {
  if (user.status) return String(user.status).toLowerCase() === "active";
  return user.is_active !== false;
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

/* ---------- icons ---------- */

const PlusCircle = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" strokeLinecap="round" />
  </svg>
);

const Kebab = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="19" r="1.7" />
  </svg>
);

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------- row actions ---------- */

function RowMenu({ user }) {
  const [pos, setPos] = useState(null);
  const [copied, setCopied] = useState("");
  const btnRef = useRef(null);

  useEffect(() => {
    if (!pos) return undefined;
    const close = () => setPos(null);
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [pos]);

  function toggle() {
    if (pos) return setPos(null);
    const r = btnRef.current.getBoundingClientRect();
    const openUp = window.innerHeight - r.bottom < 120;
    setPos({ right: window.innerWidth - r.right, top: openUp ? undefined : r.bottom + 4, bottom: openUp ? window.innerHeight - r.top + 4 : undefined });
  }

  async function copy(text, label) {
    try {
      await navigator.clipboard.writeText(String(text ?? ""));
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* clipboard unavailable */
    }
    setPos(null);
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={Boolean(pos)}
        aria-label={`Actions for ${user.name}`}
        className="rounded-lg p-1.5 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
      >
        <Kebab />
      </button>
      {copied ? <span className="ml-1 text-xs text-emerald-600">{copied} copied</span> : null}

      {pos ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPos(null)} aria-hidden="true" />
          <div
            role="menu"
            style={{ right: pos.right, top: pos.top, bottom: pos.bottom }}
            className="fixed z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left text-sm shadow-lg"
          >
            <button role="menuitem" type="button" onClick={() => copy(user.email, "Email")} className="block w-full px-3 py-2 text-left text-slate-700 hover:bg-emerald-50 hover:text-emerald-800">
              Copy email
            </button>
            <button role="menuitem" type="button" onClick={() => copy(user.id, "User ID")} className="block w-full px-3 py-2 text-left text-slate-700 hover:bg-emerald-50 hover:text-emerald-800">
              Copy user ID
            </button>
          </div>
        </>
      ) : null}
    </>
  );
}

/* ---------- list view ---------- */

function ListView({ users, error, onNew }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((u) =>
      [u.name, u.email, u.role].some((v) => String(v || "").toLowerCase().includes(needle))
    );
  }, [users, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <div>
        <p className="text-sm font-semibold text-emerald-800">Admin workspace</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">User Master</h2>
        <p className="mt-1 text-sm text-slate-500">Create users and assign their CRM access role.</p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search..."
          aria-label="Search users"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:max-w-md"
        />
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#12352f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          New
          <PlusCircle />
        </button>
      </div>

      {error ? (
        <div role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <p className="font-semibold">Users could not be loaded</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-emerald-50/60 text-slate-600">
                  <th scope="col" className="px-4 py-3.5 font-medium">Name</th>
                  <th scope="col" className="px-4 py-3.5 font-medium">Email</th>
                  <th scope="col" className="px-4 py-3.5 font-medium">Role</th>
                  <th scope="col" className="hidden px-4 py-3.5 font-medium lg:table-cell">Created</th>
                  <th scope="col" className="px-4 py-3.5 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3.5 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((user) => {
                  const active = isActive(user);
                  return (
                    <tr key={user.id} className="hover:bg-emerald-50/40">
                      <td className="px-4 py-4 font-medium text-slate-900">{user.name}</td>
                      <td className="px-4 py-4 text-slate-700">{user.email}</td>
                      <td className="px-4 py-4 capitalize text-slate-700">{user.role || "-"}</td>
                      <td className="hidden whitespace-nowrap px-4 py-4 text-slate-600 lg:table-cell">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
                            active
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-300"
                              : "bg-slate-100 text-slate-600 ring-slate-300"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <RowMenu user={user} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {rows.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <h3 className="font-semibold text-slate-900">
                  {query ? "No users match your search" : "No users yet"}
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
                  {query ? "Try a different name, email or role." : "Select New to add the first user."}
                </p>
              </div>
            ) : null}
          </div>

          {filtered.length > PAGE_SIZE ? (
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
              <p>
                Showing {(current - 1) * PAGE_SIZE + 1}-{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage(current - 1)}
                  disabled={current === 1}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage(current + 1)}
                  disabled={current === pageCount}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}

/* ---------- add view ---------- */

function AddView({ roles, rolesError, onCancel }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const disabled = roles.length === 0 || pending;
  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    const fields = event.currentTarget.elements;
    const body = Object.fromEntries(["name", "email", "password", "roleId"].map(name => [name, fields.namedItem(name).value]));
    setPending(true);
    const result = await apiRequest("Users", "post", body);
    if (result.ok) { onCancel(); router.refresh(); }
    else setError(result.message);
    setPending(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
      >
        <ArrowLeft />
        Back to users
      </button>

      <h2 className="mt-3 text-2xl font-semibold text-slate-900">Add User</h2>
      <p className="mt-1 text-sm text-slate-500">
        The user signs in with this email and password and gets the access of the role you pick.
      </p>

      <form onSubmit={submit} className="mt-6">
        {error && <p role="alert" className="mb-4 text-rose-700">{error}</p>}
        {roles.length === 0 ? (
          <p role="alert" className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {rolesError || "No roles exist yet."} Users cannot be created until roles are available.
          </p>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Full name</span>
            <input className={inputClass} name="name" placeholder="Asha Verma" autoComplete="off" required disabled={disabled} />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input className={inputClass} name="email" type="email" placeholder="asha@proplead.test" autoComplete="off" required disabled={disabled} />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input className={inputClass} name="password" type="password" minLength={6} autoComplete="new-password" placeholder="At least 6 characters" required disabled={disabled} />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <select className={inputClass} name="roleId" required disabled={disabled} defaultValue="">
              <option value="" disabled>Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-emerald-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="rounded-lg bg-[#12352f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Create user
          </button>
        </div>
      </form>
    </>
  );
}

/* ---------- root ---------- */

export default function UserMasterClient({ users, roles, usersError, rolesError, startInAdd = false }) {
  const [view, setView] = useState(startInAdd ? "add" : "list");

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
      {view === "add" ? (
        <AddView roles={roles} rolesError={rolesError} onCancel={() => setView("list")} />
      ) : (
        <ListView users={users} error={usersError} onNew={() => setView("add")} />
      )}
    </section>
  );
}
