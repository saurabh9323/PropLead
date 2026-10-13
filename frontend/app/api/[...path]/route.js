import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/utils/apiRequest";

const errorResponse = (statusCode, message) => NextResponse.json(
  { ok: false, statusCode, message, data: null, pagination: null },
  { status: statusCode },
);

function getProxyTarget(method, parts) {
  const [group, id, child] = parts;

  if (group === "health" && parts.length === 1 && method === "GET") return { key: "Health", suffix: "" };

  if (group === "auth") {
    if (id === "login" && method === "POST") return { key: "Login", suffix: "" };
    if (id === "logout" && method === "POST") return { key: "Logout", suffix: "" };
    if (id === "me" && method === "GET") return { key: "CurrentUser", suffix: "" };
  }

  if (group === "dashboard" && parts.length === 1 && method === "GET") return { key: "Dashboard", suffix: "" };
  if (group === "roles" && parts.length === 1 && method === "GET") return { key: "Roles", suffix: "" };

  if (group === "users") {
    if (parts.length === 1 && ["GET", "POST"].includes(method)) return { key: "Users", suffix: "" };
    if (parts.length === 2 && method === "GET") return { key: "Users", suffix: `/${id}` };
  }

  if (group === "leads") {
    if (parts.length === 1 && ["GET", "POST"].includes(method)) return { key: "Leads", suffix: "" };
    if (id === "list" && parts.length === 2 && method === "POST") return { key: "Leads", suffix: "/list" };
    if (parts.length === 2 && ["GET", "PUT", "DELETE"].includes(method)) return { key: "Leads", suffix: `/${id}` };
    if (parts.length === 3 && child === "notes" && ["GET", "POST"].includes(method)) return { key: "Leads", suffix: `/${id}/notes` };
    if (parts.length === 3 && ["update", "delete", "status"].includes(child) && method === "POST") return { key: "Leads", suffix: `/${id}/${child}` };
  }

  return null;
}

async function forward(request, context) {
  const { path } = await context.params;
  const parts = path.map((part) => part.trim()).filter(Boolean);
  const endpoint = parts.join("/");
  const method = request.method;
  const hasBody = ["POST", "PUT"].includes(method);
  const target = getProxyTarget(method, parts);
  if (!target) return errorResponse(404, "Endpoint not found");
  // Same-origin cookie transport must not accept cross-site mutations.
  if (method !== "GET" && request.headers.get("origin") && request.headers.get("origin") !== request.nextUrl.origin) {
    return errorResponse(403, "Cross-origin request denied");
  }
  const cookieStore = await cookies();
  const token = cookieStore.get("proplead_token")?.value;
  let body;
  if (hasBody) {
    if (!request.headers.get("content-type")?.includes("application/json")) return errorResponse(400, "Send an application/json object body");
    try { body = await request.json(); } catch { return errorResponse(400, "Invalid JSON body"); }
    if (!body || Array.isArray(body) || typeof body !== "object") return errorResponse(400, "Send a JSON object body");
  }
  try {
    const result = await apiRequest(target.key, method, hasBody ? body : undefined, token ? { Authorization: `Bearer ${token}` } : {}, `${target.suffix}${method === "GET" ? request.nextUrl.search : ""}`);
    if (endpoint === "auth/login" && result.ok) {
      cookieStore.set("proplead_token", result.data.token, {
        httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: result.data.expiresIn,
      });
      // The browser authenticates using the HttpOnly cookie, not a stored bearer token.
      delete result.data.token;
    }
    if (endpoint === "auth/logout") {
      cookieStore.delete("proplead_token");
      if (result.ok) return NextResponse.json(result, { status: result.statusCode });
      return NextResponse.json({ ok: true, statusCode: 200, message: "Logout successful", data: { loggedOut: true }, pagination: null });
    }
    return NextResponse.json(result, { status: result.statusCode });
  } catch {
    if (endpoint === "auth/logout") {
      cookieStore.delete("proplead_token");
      return NextResponse.json({ ok: true, statusCode: 200, message: "Signed out locally", data: { loggedOut: true }, pagination: null });
    }
    return errorResponse(502, "Unable to reach the backend API");
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;
export const PATCH = () => errorResponse(405, "Use GET, POST, PUT, or DELETE");
