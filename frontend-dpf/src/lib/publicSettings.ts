import { resolveApiBaseUrl } from "./urls";

export type PublicSettings = Record<string, string>;

type SettingItem = {
  key: string;
  value: string | null;
};

export const fetchPublicSettings = async (keys: string[]): Promise<PublicSettings> => {
  const uniqueKeys = Array.from(new Set(keys.map((key) => String(key).trim()).filter(Boolean)));
  if (!uniqueKeys.length) return {};

  const url = new URL(`${resolveApiBaseUrl()}/settings`);
  url.searchParams.set("keys", uniqueKeys.join(","));

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to load settings (${response.status})`);
  }

  const payload = (await response.json()) as SettingItem[];
  if (!Array.isArray(payload)) return {};

  return payload.reduce<PublicSettings>((acc, item) => {
    if (!item || typeof item.key !== "string") return acc;
    acc[item.key] = item.value === null || item.value === undefined ? "" : String(item.value);
    return acc;
  }, {});
};
