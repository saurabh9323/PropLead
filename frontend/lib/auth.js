import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isApiConfigured } from "@/api/MainApi";
import { apiRequest } from "@/utils/apiRequest";

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("proplead_token")?.value;
}

export async function getAuthHeaders() {
  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getCurrentUser = cache(async function getCurrentUser() {
  if (!isApiConfigured) return null;

  const token = await getAuthToken();
  if (!token) return null;

  try {
    const result = await apiRequest("CurrentUser", "get", undefined, { Authorization: `Bearer ${token}` });

    return result.ok ? result.data : null;
  } catch (error) {
    return null;
  }
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
