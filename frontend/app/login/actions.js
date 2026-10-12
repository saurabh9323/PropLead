"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiRequest } from "@/utils/apiRequest";

export async function loginAction(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  let loginResult;
  let errorMessage;

  try {
    const result = await apiRequest("Login", "post", { email, password });

    if (!result.ok) {
      errorMessage = result.message || "Login failed";
    } else {
      loginResult = result.data;
    }
  } catch (error) {
    errorMessage = "Unable to reach the backend API";
  }

  if (errorMessage) {
    redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set("proplead_token", loginResult.token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: loginResult.expiresIn,
    path: "/",
  });

  redirect("/");
}

export async function logoutAction() {
  try {
    await apiRequest("Logout", "post");
  } catch (error) {
    // Logout should still clear the local cookie even if the API is unavailable.
  }

  const cookieStore = await cookies();
  cookieStore.delete("proplead_token");
  redirect("/login");
}
