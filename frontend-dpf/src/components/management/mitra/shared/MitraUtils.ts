import { resolveStorageBaseUrl } from "../../../../lib/urls";

export const formatIDR = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
};

export const formatDateShort = (dateStr: string, locale: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

export const formatDateLong = (dateStr: string, locale: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const resolveStorageUrl = (path: string) => {
  if (!path) return "";
  const baseUrl = resolveStorageBaseUrl();
  return `${baseUrl}/${path}`;
};
