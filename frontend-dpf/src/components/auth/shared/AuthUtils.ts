export type ValidationErrorBag = Record<string, unknown>;

export type ApiErrorData = {
  message?: unknown;
  errors?: unknown;
};

export type DashboardRole = "superadmin" | "admin" | "editor" | "mitra";

/**
 * Mengekstrak pesan error dari respons API.
 */
export const extractApiErrorMessage = (err: unknown): string | null => {
  if (!err || typeof err !== "object") return null;

  const response = (err as { response?: unknown }).response;
  if (!response || typeof response !== "object") return null;

  const data = (response as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;

  const { message, errors } = data as ApiErrorData;

  const messageString = typeof message === "string" ? message : null;

  if (errors && typeof errors === "object") {
    const firstValue = Object.values(errors as ValidationErrorBag)[0];
    if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
      return firstValue[0];
    }
  }

  return messageString;
};

/**
 * Menentukan role dashboard berdasarkan data user.
 */
export const resolveDashboardRole = (user: unknown): DashboardRole | null => {
  if (!user || typeof user !== "object") return null;

  const candidates: string[] = [];
  const roles = (user as any).roles;
  if (Array.isArray(roles)) {
    roles.forEach((r: any) => {
      if (r && typeof r === "object" && typeof r.name === "string") {
        candidates.push(r.name);
      }
    });
  }

  if (typeof (user as any).role_label === "string") {
    candidates.push((user as any).role_label);
  }

  const normalized = new Set(
    candidates.map((value) => String(value).toLowerCase().replace(/[^a-z]/g, ""))
  );

  if (normalized.has("superadmin")) return "superadmin";
  if (normalized.has("admin")) return "admin";
  if (normalized.has("editor")) return "editor";
  if (normalized.has("mitra")) return "mitra";
  return null;
};

/**
 * Mendapatkan path redirect berdasarkan role.
 */
export const getRedirectPath = (user: unknown): string => {
  const role = resolveDashboardRole(user) ?? "editor";
  return `/${role}/dashboard`;
};
