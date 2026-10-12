"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isApiConfigured } from "@/api/MainApi";
import { requireUser } from "@/lib/auth";
import { apiRequest } from "@/utils/apiRequest";

export async function createUserAction(formData) {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/");
  }

  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    roleId: formData.get("roleId"),
  };

  let redirectUrl = "/users?created=1";

  if (!isApiConfigured) {
    redirectUrl = "/users?error=API%20base%20URL%20is%20not%20configured";
  } else {
    try {
      const result = await apiRequest("Users", "post", payload);

      if (!result.ok) {
        redirectUrl = `/users?error=${encodeURIComponent(result.message || "Unable to create user")}`;
      } else {
        revalidatePath("/users");
      }
    } catch (error) {
      redirectUrl = "/users?error=Unable%20to%20reach%20the%20backend%20API";
    }
  }

  redirect(redirectUrl);
}
