function normalizeApiBaseUrl(url) {
  if (!url) return "";

  const trimmedUrl = url.replace(/\/+$/, "");
  return trimmedUrl.endsWith("/api") ? trimmedUrl : `${trimmedUrl}/api`;
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL);

export const apiurls = {
  Health: `${API_BASE_URL}/health`,
  Login: `${API_BASE_URL}/auth/login`,
  Logout: `${API_BASE_URL}/auth/logout`,
  CurrentUser: `${API_BASE_URL}/auth/me`,
  Dashboard: `${API_BASE_URL}/dashboard`,
  Leads: `${API_BASE_URL}/leads`,
  Users: `${API_BASE_URL}/users`,
  Roles: `${API_BASE_URL}/roles`,
};

// Browser calls stay on the Next.js origin so the HttpOnly session cookie is used.
export const browserApiUrls = {
  Health: "/api/health",
  Login: "/api/auth/login",
  Logout: "/api/auth/logout",
  CurrentUser: "/api/auth/me",
  Dashboard: "/api/dashboard",
  Leads: "/api/leads",
  Users: "/api/users",
  Roles: "/api/roles",
};

export const isApiConfigured = Boolean(API_BASE_URL);
