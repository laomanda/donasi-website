export const SETTINGS_EVENT = "dpf:settings-updated";
export const SEARCH_LIMIT_KEY = "dpf_search_limit";
export const SHOW_CLOCK_KEY = "dpf_show_clock";

export const emitSettingsUpdated = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SETTINGS_EVENT));
};

export const readSearchLimit = () => {
  if (typeof window === "undefined") return 5;
  const raw = window.localStorage.getItem(SEARCH_LIMIT_KEY);
  const n = Number(raw);
  if (!Number.isFinite(n)) return 5;
  const clamped = Math.max(3, Math.min(20, Math.floor(n)));
  return clamped;
};

export const readShowClock = () => {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(SHOW_CLOCK_KEY);
  if (raw === null) return true;
  return raw === "1";
};

export const setSearchLimit = (limit: number) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEARCH_LIMIT_KEY, String(limit));
  emitSettingsUpdated();
};

export const setShowClock = (value: boolean) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SHOW_CLOCK_KEY, value ? "1" : "0");
  emitSettingsUpdated();
};

