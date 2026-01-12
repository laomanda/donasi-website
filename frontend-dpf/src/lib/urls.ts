const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "");

const readEnv = (value?: string) => {
  const trimmed = String(value ?? "").trim();
  return trimmed.length ? trimmed : null;
};

export const resolveApiBaseUrl = () => {
  const env = readEnv(import.meta.env.VITE_API_URL);
  if (env) return normalizeBaseUrl(env);

  if (import.meta.env.PROD && typeof window !== "undefined") {
    return `${window.location.origin}/api/v1`;
  }

  return "http://localhost:8000/api/v1";
};

export const resolveBackendBaseUrl = () => {
  const env = readEnv(import.meta.env.VITE_BACKEND_URL);
  if (env) return normalizeBaseUrl(env);

  return resolveApiBaseUrl().replace(/\/api(\/v1)?$/, "");
};

export const resolveStorageBaseUrl = () => {
  const env = readEnv(import.meta.env.VITE_STORAGE_URL);
  if (env) return normalizeBaseUrl(env);

  if (import.meta.env.PROD && typeof window !== "undefined") {
    return `${window.location.origin}/storage`;
  }

  return "http://localhost:8000/storage";
};
