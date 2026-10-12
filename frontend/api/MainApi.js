const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiurls = {
  Login: `${API_BASE_URL}/auth/login`,
  Logout: `${API_BASE_URL}/auth/logout`,
  CurrentUser: `${API_BASE_URL}/auth/me`,
  Dashboard: `${API_BASE_URL}/dashboard`,
  Leads: `${API_BASE_URL}/leads`,
  Users: `${API_BASE_URL}/users`,
  Roles: `${API_BASE_URL}/roles`,
};

export const isApiConfigured = Boolean(API_BASE_URL);
