import { redirect } from "next/navigation";
import { isApiConfigured } from "@/api/MainApi";
import { requireUser } from "@/lib/auth";
import { apiRequest } from "@/utils/apiRequest";
import { createUserAction } from "@/actions/userActions";
import UserMasterAlert from "./UserMasterAlert";

/* ---------- data ---------- */

async function fetchList(resource, label) {
  if (!isApiConfigured) {
    return { data: [], error: "NEXT_PUBLIC_API_BASE_URL is not configured." };
  }

  try {
    const result = await apiRequest(resource, "get");

    if (!result.ok) {
      return { data: [], error: result.message || `Unable to load ${label}.` };
    }

    return { data: result.data || [], error: null };
  } catch {
    return { data: [], error: "Unable to reach the backend API." };
  }
}

/* ---------- helpers ---------- */

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_TONES = [
  "bg-emerald-100 text-emerald-800",
  "bg-sky-100 text-sky-800",
  "bg-amber-100 text-amber-800",
  "bg-violet-100 text-violet-800",
  "bg-rose-100 text-rose-800",
  "bg-teal-100 text-teal-800",
];

function avatarTone(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % AVATAR_TONES.length;
  }
  return AVATAR_TONES[hash];
}

const ROLE_TONES = {
  admin: "bg-slate-900 text-white ring-slate-900",
  manager: "bg-sky-50 text-sky-700 ring-sky-200",
  sales: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function roleTone(role = "") {
  return ROLE_TONES[String(role).toLowerCase()] || "bg-slate-100 text-slate-700 ring-slate-200";
}

function buildHref({ q, role }) {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (role) qs.set("role", role);
  const str = qs.toString();
  return str ? `?${str}` : "?";
}

const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

/* ---------- pieces ---------- */

function Toolbar({ q, role, roleCounts, total }) {
  const tabs = [{ label: "All", value: "", count: total }, ...roleCounts];

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Filter by role" className="flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const active = (role || "") === tab.value;
          return (
            <a
              key={tab.value || "all"}
              href={buildHref({ q, role: tab.value })}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="capitalize">{tab.label}</span>
              <span
                className={`rounded px-1.5 text-xs tabular-nums ${
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </a>
          );
        })}
      </nav>

      <form method="get" role="search" className="flex w-full gap-2 sm:w-auto">
        {role ? <input type="hidden" name="role" value={role} /> : null}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          aria-label="Search users"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:w-64"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          Search
        </button>
      </form>
    </div>
  );
}

function UsersTable({ users }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">User</th>
            <th scope="col" className="px-4 py-3 font-medium">Role</th>
            <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarTone(
                      user.name || user.email
                    )}`}
                  >
                    {initials(user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{user.name}</p>
                    <p className="truncate text-slate-500">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${roleTone(
                    user.role
                  )}`}
                >
                  {user.role || "-"}
                </span>
              </td>
              <td className="hidden whitespace-nowrap px-4 py-3.5 text-slate-600 md:table-cell">
                {formatDate(user.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ filtered }) {
  return (
    <div className="px-6 py-14 text-center">
      <h3 className="font-semibold text-slate-900">
        {filtered ? "No users match your search" : "No users yet"}
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
        {filtered
          ? "Try a different name or email, or clear the filters."
          : "Add the first user with the form. They can sign in as soon as they are created."}
      </p>
      {filtered ? (
        <a
          href="?"
          className="mt-4 inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Clear filters
        </a>
      ) : null}
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div role="alert" className="m-4 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      <p className="font-semibold">Users could not be loaded</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}

function UserForm({ roles, rolesError }) {
  const disabled = roles.length === 0;

  return (
    <form
      action={createUserAction}
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">Add user</h3>
        <p className="mt-1 text-sm text-slate-500">
          The user signs in with this email and password.
        </p>
      </div>

      <div className="space-y-4 px-5 py-5">
        {disabled ? (
          <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {rolesError || "No roles exist yet."} Users can't be created until roles are available.
          </p>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Full name</span>
          <input
            className={inputClass}
            name="name"
            placeholder="Asha Verma"
            autoComplete="off"
            required
            disabled={disabled}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className={inputClass}
            name="email"
            type="email"
            placeholder="asha@proplead.test"
            autoComplete="off"
            required
            disabled={disabled}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            className={inputClass}
            name="password"
            type="password"
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            required
            disabled={disabled}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Role</span>
          <select className={inputClass} name="roleId" required disabled={disabled} defaultValue="">
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-5 py-3.5">
        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Create user
        </button>
      </div>
    </form>
  );
}

/* ---------- page ---------- */

export default async function UserMasterComp({ searchParams }) {
  const currentUser = await requireUser();

  if (currentUser.role !== "admin") {
    redirect("/");
  }

  const params = (await searchParams) || {};
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const role = typeof params.role === "string" ? params.role : "";

  const [{ data: users, error: usersError }, { data: roles, error: rolesError }] =
    await Promise.all([fetchList("Users", "users"), fetchList("Roles", "roles")]);

  // role tabs with counts, built from the full list
  const counts = users.reduce((acc, u) => {
    const key = String(u.role || "").toLowerCase();
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const roleCounts = Object.keys(counts)
    .sort()
    .map((key) => ({ label: key, value: key, count: counts[key] }));

  const needle = q.toLowerCase();
  const visible = users.filter((u) => {
    const matchesRole = !role || String(u.role || "").toLowerCase() === role.toLowerCase();
    const matchesText =
      !needle ||
      String(u.name || "").toLowerCase().includes(needle) ||
      String(u.email || "").toLowerCase().includes(needle);
    return matchesRole && matchesText;
  });

  return (
    <>
      <UserMasterAlert created={params.created} error={params.error} />

      <header className="flex flex-col gap-1 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-emerald-600">Admin</p>
        <h2 className="text-2xl font-semibold text-slate-950 sm:text-3xl">User Master</h2>
        <p className="max-w-xl text-sm leading-6 text-slate-500">
          Add people to PropLead CRM and choose what each of them can do.
        </p>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-labelledby="users-heading"
          className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-baseline justify-between px-5 pt-4">
            <h3 id="users-heading" className="text-base font-semibold text-slate-900">
              Users
            </h3>
            <p className="text-sm text-slate-500">
              {visible.length === users.length
                ? `${users.length} total`
                : `${visible.length} of ${users.length}`}
            </p>
          </div>

          {usersError ? (
            <ErrorState message={usersError} />
          ) : (
            <>
              <Toolbar q={q} role={role} roleCounts={roleCounts} total={users.length} />
              {visible.length === 0 ? (
                <EmptyState filtered={Boolean(q || role)} />
              ) : (
                <UsersTable users={visible} />
              )}
            </>
          )}
        </section>

        <aside className="lg:sticky lg:top-6">
          <UserForm roles={roles} rolesError={rolesError} />
        </aside>
      </div>
    </>
  );
}