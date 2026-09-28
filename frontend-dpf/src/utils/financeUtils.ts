/**
 * YWDP Digital Waqf - Finance Utilities
 * Centralized formatting, styling, and file download helpers for Finance Module
 */

/**
 * Format number to Indonesian Rupiah currency string.
 * Example: 1000000 -> "Rp 1.000.000"
 */
export const formatRupiah = (value: number | string | null | undefined): string => {
  const num = typeof value === 'string' ? Number(value) : (value ?? 0);
  if (!Number.isFinite(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format number with thousand separators without currency symbol.
 * Example: 1250000 -> "1.250.000"
 */
export const formatNumber = (value: number | string | null | undefined): string => {
  const num = typeof value === 'string' ? Number(value) : (value ?? 0);
  if (!Number.isFinite(num)) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
};

/**
 * Compact Indonesian Rupiah display for charts and high-level KPIs.
 * Example: 2500000000 -> "Rp 2,5 M", 15000000 -> "Rp 15 Jt"
 */
export const formatCompactRupiah = (value: number | null | undefined): string => {
  const num = value ?? 0;
  if (!Number.isFinite(num) || num === 0) return 'Rp 0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 1_000_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000_000).toFixed(1).replace('.', ',')} T`;
  }
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace('.', ',')} Jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${(abs / 1_000).toFixed(0)} rb`;
  }
  return formatRupiah(num);
};

/**
 * Standard Indonesian Date formatting.
 * Example: "2026-09-28" -> "28 Sep 2026"
 */
export const formatFinanceDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Standard Indonesian Date + Time formatting.
 */
export const formatFinanceDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Extract clean error message from Laravel HTTP 422 or server response.
 */
export const extractFinanceErrorMessage = (error: unknown, fallback = 'Terjadi kesalahan sistem.'): string => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;

  const errObj = error as {
    response?: {
      data?: {
        message?: string;
        errors?: Record<string, string[]>;
      };
    };
    message?: string;
  };
  const errors = errObj?.response?.data?.errors;
  if (errors && typeof errors === 'object') {
    const firstField = Object.keys(errors)[0];
    if (firstField && Array.isArray(errors[firstField]) && errors[firstField].length > 0) {
      return String(errors[firstField][0]);
    }
  }

  const serverMessage = errObj?.response?.data?.message || errObj?.message;
  if (typeof serverMessage === 'string' && serverMessage.trim()) {
    return serverMessage.trim();
  }

  return fallback;
};

/**
 * Trigger browser file download from Blob response (used for Excel / PDF exports).
 */
export const downloadBlobFile = (data: BlobPart, filename: string, mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') => {
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Standard Indonesian label for Account Types.
 */
export const getAccountTypeLabel = (type: string | null | undefined): string => {
  switch (type?.toLowerCase()) {
    case 'asset':
      return 'Aset';
    case 'liability':
      return 'Liabilitas';
    case 'net_asset':
    case 'equity':
      return 'Aset Neto';
    case 'revenue':
      return 'Penerimaan';
    case 'expense':
      return 'Beban';
    default:
      return type || '-';
  }
};

/**
 * Standard Indonesian label for Normal Balance.
 */
export const getNormalBalanceLabel = (balance: string | null | undefined): string => {
  switch (balance?.toLowerCase()) {
    case 'debit':
      return 'Debit';
    case 'credit':
      return 'Kredit';
    default:
      return balance || '-';
  }
};

/**
 * Subtle badge color classes for Account Types (semantic, clean, not loud).
 */
export const getAccountTypeBadgeClass = (type: string | null | undefined): string => {
  switch (type?.toLowerCase()) {
    case 'asset':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'liability':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'net_asset':
    case 'equity':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'revenue':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'expense':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

