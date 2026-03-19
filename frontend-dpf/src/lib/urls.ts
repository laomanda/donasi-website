const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "");

const readEnv = (value?: string) => {
  const trimmed = String(value ?? "").trim();
  return trimmed.length ? trimmed : null;
};

export const resolveApiBaseUrl = () => {
  const env = readEnv(import.meta.env.VITE_API_URL);
  if (env) return normalizeBaseUrl(env);

  // Jika di produksi dan variabel tidak ada, asumsikan API ada di subpath /api/v1
  if (import.meta.env.PROD && typeof window !== "undefined") {
    return `${window.location.origin}/api/v1`;
  }

  return "http://localhost:8000/api/v1";
};

export const resolveBackendBaseUrl = () => {
  const env = readEnv(import.meta.env.VITE_BACKEND_URL);
  if (env) return normalizeBaseUrl(env);

  // Base URL backend biasanya adalah origin saat ini di produksi (tanpa /api/v1)
  if (import.meta.env.PROD && typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:8000";
};

export const resolveStorageBaseUrl = () => {
  const env = readEnv(import.meta.env.VITE_STORAGE_URL);
  if (env) return normalizeBaseUrl(env);

  if (import.meta.env.PROD && typeof window !== "undefined") {
    return `${window.location.origin}/storage`;
  }

  return "http://localhost:8000/storage";
};

/**
 * Resolves a full storage URL for a given path.
 * Handles removing duplicate '/storage/' or leading slashes.
 */
export const resolveStorageUrl = (path: string | null | undefined, fallback?: string): string | undefined => {
  const value = String(path ?? "").trim();
  if (!value) return fallback;
  if (value.startsWith("http")) return value;

  const baseUrl = resolveStorageBaseUrl();
  const clean = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${baseUrl}/${clean}`;
};

export const resolveMidtransClientKey = () => {
  return readEnv(import.meta.env.VITE_MIDTRANS_CLIENT_KEY) || "";
};

export const resolveMidtransSnapUrl = () => {
  const envURL = readEnv(import.meta.env.VITE_MIDTRANS_SNAP_URL);
  if (envURL) return envURL;

  const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true" || import.meta.env.PROD;
  return isProd 
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
};
