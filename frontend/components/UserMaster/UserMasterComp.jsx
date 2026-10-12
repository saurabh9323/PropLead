import { redirect } from "next/navigation";
import { isApiConfigured } from "@/api/MainApi";
import { requireUser } from "@/lib/auth";
import { apiRequest } from "@/utils/apiRequest";
import UserMasterAlert from "./UserMasterAlert";
import UserMasterClient from "./UserMasterClient";

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

export default async function UserMasterComp({ searchParams }) {
  const currentUser = await requireUser();

  if (currentUser.role !== "admin") {
    redirect("/");
  }

  const params = (await searchParams) || {};

  const [{ data: users, error: usersError }, { data: roles, error: rolesError }] =
    await Promise.all([fetchList("Users", "users"), fetchList("Roles", "roles")]);

  return (
    <>
      <UserMasterAlert created={params.created} error={params.error} />
      <UserMasterClient
        users={users}
        roles={roles}
        usersError={usersError}
        rolesError={rolesError}
        startInAdd={Boolean(params.error)}
      />
    </>
  );
}
