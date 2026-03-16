export type ValidationErrorBag = Record<string, unknown>;

export type ApiErrorData = {
  message?: unknown;
  errors?: unknown;
};

export type DashboardRole = "superadmin" | "admin" | "editor" | "mitra" | "custom";

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
  
  // Jika punya role tapi tidak termasuk 4 role utama, berarti custom
  if (candidates.length > 0) {
    return "custom";
  }

  // Cek apakah punya permission (baik direct maupun dari role)
  let hasPerms = Array.isArray((user as any).permissions) && (user as any).permissions.length > 0;
  if (!hasPerms && Array.isArray((user as any).roles)) {
    (user as any).roles.forEach((r: any) => {
      if (Array.isArray(r.permissions) && r.permissions.length > 0) {
        hasPerms = true;
      }
    });
  }

  if (hasPerms) {
    return "custom";
  }

  return null;
};

/**
 * Mendapatkan path redirect berdasarkan role.
 */
export const getRedirectPath = (user: unknown): string => {
  const role = resolveDashboardRole(user) ?? "editor";
  if (role === "custom") return "/management/dashboard";
  return `/${role}/dashboard`;
};

/**
 * Memetakan error message dari backend Laravel ke kunci i18n kita.
 */
export const translateBackendError = (message: string): string => {
  const msg = message.toLowerCase();
  
  if (msg.includes("required")) return "validation.required";
  if (msg.includes("email") && msg.includes("taken")) return "validation.unique_email";
  if (msg.includes("email") && (msg.includes("format") || msg.includes("must be a valid"))) return "validation.email";
  if (msg.includes("password") && msg.includes("at least 8")) return "validation.password_min";
  if (msg.includes("confirmation") && msg.includes("match")) return "validation.password_confirmed";
  
  return message; // Fallback jika tidak dikenali
};
