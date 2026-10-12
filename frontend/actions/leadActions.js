"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { apiRequest } from "@/utils/apiRequest";

const fields = [
  "name",
  "phone",
  "email",
  "budget",
  "location",
  "property_type",
  "source",
  "status",
];
const validId = (id) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );

async function mutate(id, method, payload, suffix = "") {
  try {
    return await apiRequest(
      "Leads",
      method,
      payload,
      {},
      id ? `/${id}${suffix}` : "",
    );
  } catch {
    return {
      ok: false,
      message: "Unable to reach the backend. Please try again.",
    };
  }
}

function refresh(id) {
  revalidatePath("/");
  revalidatePath("/leads");
  if (id) revalidatePath(`/leads/${id}`);
}

export async function saveLeadAction(id, previous, formData) {
  await requireUser();
  if (id && !validId(id)) return { error: "Invalid lead ID." };
  const payload = Object.fromEntries(
    fields.map((field) => [field, formData.get(field)]),
  );
  const result = await mutate(id, id ? "put" : "post", payload);
  if (!result.ok) return { error: result.message || "Unable to save lead." };
  refresh(id);
  redirect(`/leads/${result.data.id}?saved=1`);
}

export async function updateStatusAction(id, previous, formData) {
  await requireUser();
  if (!validId(id)) return { error: "Invalid lead ID." };
  const result = await mutate(
    id,
    "patch",
    { status: formData.get("status") },
    "/status",
  );
  if (!result.ok)
    return { error: result.message || "Unable to update status." };
  refresh(id);
  return { success: "Status updated." };
}

export async function addNoteAction(id, previous, formData) {
  await requireUser();
  if (!validId(id)) return { error: "Invalid lead ID." };
  const result = await mutate(
    id,
    "post",
    { note: formData.get("note") },
    "/notes",
  );
  if (!result.ok) return { error: result.message || "Unable to add note." };
  refresh(id);
  return { success: "Note added.", resetKey: result.data.id };
}

export async function deleteLeadAction(id) {
  const user = await requireUser();
  if (user.role !== "admin") return { error: "Only admins can delete leads." };
  if (!validId(id)) return { error: "Invalid lead ID." };
  const result = await mutate(id, "delete");
  if (!result.ok) return { error: result.message || "Unable to delete lead." };
  refresh(id);
  redirect("/leads?deleted=1");
}
