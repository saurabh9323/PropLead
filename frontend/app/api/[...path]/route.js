import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/utils/apiRequest";

const errorResponse = (statusCode, message) => NextResponse.json(
  { ok: false, statusCode, message, data: null, pagination: null },
  { status: statusCode },
);
const readable = /^(health|auth\/me|dashboard|roles|users(?:\/[^/]+)?|leads(?:\/[^/]+(?:\/notes)?)?)$/;
const writable = /^(auth\/(login|logout)|users|leads(?:\/list|\/[^/]+\/(update|delete|status|notes))?)$/;

async function forward(request, context) {
  const { path } = await context.params;
  const endpoint = path.join("/");
  const posting = request.method === "POST";
  if (!(posting ? writable : readable).test(endpoint)) return errorResponse(404, "Endpoint not found");
  // Same-origin cookie transport must not accept cross-site mutations.
  if (posting && request.headers.get("origin") && request.headers.get("origin") !== request.nextUrl.origin) {
    return errorResponse(403, "Cross-origin request denied");
  }
  const cookieStore = await cookies();
  const token = cookieStore.get("proplead_token")?.value;
  let body;
  if (posting) {
    if (!request.headers.get("content-type")?.includes("application/json")) return errorResponse(400, "Send an application/json object body");
    try { body = await request.json(); } catch { return errorResponse(400, "Invalid JSON body"); }
    if (!body || Array.isArray(body) || typeof body !== "object") return errorResponse(400, "Send a JSON object body");
  }
  try {
    const resource = path[0] === "auth" ? endpoint : path[0];
    const key = { health: "Health", "auth/login": "Login", "auth/logout": "Logout", "auth/me": "CurrentUser", dashboard: "Dashboard", roles: "Roles", users: "Users", leads: "Leads" }[resource];
    const suffix = path[0] === "auth" ? "" : path.length > 1 ? `/${path.slice(1).join("/")}` : "";
    const result = await apiRequest(key, request.method, posting ? body : undefined, token ? { Authorization: `Bearer ${token}` } : {}, `${suffix}${posting ? "" : request.nextUrl.search}`);
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
export const PUT = () => errorResponse(405, "Use GET for reads and POST for changes");
export const PATCH = PUT;
export const DELETE = PUT;
