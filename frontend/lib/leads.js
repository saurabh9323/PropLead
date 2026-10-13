import { notFound } from "next/navigation";
import { apiRequest } from "@/utils/apiRequest";
import { requireUser, getAuthHeaders } from "@/lib/auth";

export async function loadLead(id) {
  const user = await requireUser();
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  )
    notFound();
  let result;
  try {
    result = await apiRequest("Leads", "get", undefined, await getAuthHeaders(), `/${id}`);
  } catch {
    return { error: "Unable to reach the backend. Please try again." };
  }
  if (result.statusCode === 404) notFound();
  if (!result.ok) return { error: result.message || "Unable to load lead." };
  return { lead: result.data, user };
}
