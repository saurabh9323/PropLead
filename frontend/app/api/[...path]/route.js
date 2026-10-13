import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/utils/apiRequest";

const errorResponse = (statusCode, message) => NextResponse.json(
  { ok: false, statusCode, message, data: null, pagination: null },
  { status: statusCode },
);
const readableRoutes = new Set(["health", "auth/me", "dashboard", "roles", "users", "leads"]);
const postableRoutes = new Set(["auth/login", "auth/logout", "users", "leads", "leads/list"]);
const puttable = /^leads\/[^/]+$/;
const deletable = /^leads\/[^/]+$/;
const userDetail = /^users\/[^/]+$/;
const leadDetail = /^leads\/[^/]+$/;
const leadNotes = /^leads\/[^/]+\/notes$/;
const leadActions = /^leads\/[^/]+\/(update|delete|status|notes)$/;

function isAllowedMethod(method, endpoint) {
  if (method === "GET") return readableRoutes.has(endpoint) || userDetail.test(endpoint) || leadDetail.test(endpoint) || leadNotes.test(endpoint);
  if (method === "POST") return postableRoutes.has(endpoint) || leadActions.test(endpoint);
  if (method === "PUT") return puttable.test(endpoint);
  if (method === "DELETE") return deletable.test(endpoint);
  return false;
}

async function forward(request, context) {
  const { path } = await context.params;
  const endpoint = path.join("/").replace(/^\/+|\/+$/g, "");
  const method = request.method;
  const hasBody = ["POST", "PUT"].includes(method);
  if (!isAllowedMethod(method, endpoint)) return errorResponse(404, "Endpoint not found");
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
    const resource = path[0] === "auth" ? endpoint : path[0];
    const key = { health: "Health", "auth/login": "Login", "auth/logout": "Logout", "auth/me": "CurrentUser", dashboard: "Dashboard", roles: "Roles", users: "Users", leads: "Leads" }[resource];
    const suffix = path[0] === "auth" ? "" : path.length > 1 ? `/${path.slice(1).join("/")}` : "";
    const result = await apiRequest(key, method, hasBody ? body : undefined, token ? { Authorization: `Bearer ${token}` } : {}, `${suffix}${method === "GET" ? request.nextUrl.search : ""}`);
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
