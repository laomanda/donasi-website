const TOKEN_KEY = "dpf_auth_token";
const USER_KEY = "dpf_auth_user";

export type AuthUser = {
  id?: number;
  name?: string;
  email?: string;
  role_label?: string;
  roles?: Array<{ name: string }>;
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
};

export const getAuthUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as AuthUser;
  } catch {
    return null;
  }
};

export const setAuthUser = (user: AuthUser) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthUser = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_KEY);
};
