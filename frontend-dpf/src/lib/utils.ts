import { resolveStorageBaseUrl } from "./urls";

export const formatCurrency = (val: string | number, _locale?: string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val));
};

export const formatNumber = (val: string | number) => {
    return new Intl.NumberFormat('id-ID').format(Number(val));
};

export const getImageUrl = (path?: string | null) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    return `${resolveStorageBaseUrl()}/${path}`; 
};

export const normalizeProgramStatus = (status: string | undefined | null, _locale: string, _t: any) => {
    if (!status) return "";
    return status;
};
