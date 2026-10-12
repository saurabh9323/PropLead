import { redirect } from "next/navigation";
import { isApiConfigured } from "@/api/MainApi";
import { requireUser } from "@/lib/auth";
import { apiRequest } from "@/utils/apiRequest";
import { createUserAction } from "@/actions/userActions";
import UserMasterAlert from "./UserMasterAlert";

async function getUsers() {
  if (!isApiConfigured) {
    return {
      data: [],
      error: "NEXT_PUBLIC_API_BASE_URL is not configured.",
    };
  }

  try {
    const result = await apiRequest("Users", "get");

    if (!result.ok) {
      return {
        data: [],
        error: result.message || "Unable to load users.",
      };
    }

    return {
      data: result.data || [],
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: "Unable to reach the backend API.",
    };
  }
}

async function getRoles() {
  if (!isApiConfigured) {
    return {
      data: [],
      error: "NEXT_PUBLIC_API_BASE_URL is not configured.",
    };
  }

  try {
    const result = await apiRequest("Roles", "get");

    if (!result.ok) {
      return {
        data: [],
        error: result.message || "Unable to load roles.",
      };
    }

    return {
      data: result.data || [],
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: "Unable to reach the backend API.",
    };
  }
}

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function UserForm({ roles }) {
  return (
    <form action={createUserAction} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">Add user</h3>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Name</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            name="name"
            placeholder="User name"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">Email</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            name="email"
            placeholder="user@proplead.test"
            required
            type="email"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">Password</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            name="password"
            placeholder="Minimum 6 characters"
            required
            type="password"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">Role</span>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            name="roleId"
            required
          >
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        className="mt-5 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        type="submit"
      >
        Create user
      </button>
    </form>
  );
}

function UsersTable({ users }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Email</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Role</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-950">{user.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{user.id}</p>
                </td>
                <td className="px-4 py-4 text-slate-700">{user.email}</td>
                <td className="px-4 py-4">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-700">{formatDate(user.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function UserMasterComp({ searchParams }) {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/");
  }

  const params = searchParams || {};
  const [{ data: users, error: usersError }, { data: roles, error: rolesError }] =
    await Promise.all([getUsers(), getRoles()]);
  const error = usersError || rolesError;

  return (
    <>
      <UserMasterAlert created={params?.created} error={params?.error} />
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">Admin</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
            User Master
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-500">
          Create users, assign roles, and review account details for PropLead CRM.
        </p>
      </header>

      {params?.created ? (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          User created successfully.
        </div>
      ) : null}

      {params?.error ? (
        <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {params.error}
        </div>
      ) : null}

      <section className="mt-6">
        <UserForm roles={roles} />
      </section>

      <section className="mt-6">
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-800">
            <h3 className="font-semibold">User Master unavailable</h3>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
            <h3 className="font-semibold text-slate-950">No users found</h3>
            <p className="mt-2 text-sm">Create the first user from the form above.</p>
          </div>
        ) : (
          <UsersTable users={users} />
        )}
      </section>
    </>
  );
}
