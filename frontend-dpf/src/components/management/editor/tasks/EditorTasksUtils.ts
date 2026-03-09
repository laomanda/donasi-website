const taskStatusOrder: Record<string, number> = {
    open: 0,
    in_progress: 1,
    done: 2,
};

export const isForwardStatus = (current?: string | null, next?: string | null) => {
    const currentKey = String(current ?? "").toLowerCase();
    const nextKey = String(next ?? "").toLowerCase();
    if (!(currentKey in taskStatusOrder) || !(nextKey in taskStatusOrder)) return true;
    return taskStatusOrder[nextKey] >= taskStatusOrder[currentKey];
};

export const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

export const getTaskTone = (status?: string | null) => {
    const s = String(status ?? "").toLowerCase();
    if (s === "done") return "bg-emerald-600 text-white ring-emerald-700/60";
    if (s === "in_progress") return "bg-sky-600 text-white ring-sky-700/60";
    if (s === "open") return "bg-amber-700 text-white ring-amber-800/60";
    if (s === "cancelled") return "bg-rose-600 text-white ring-rose-700/60";
    return "bg-slate-600 text-white ring-slate-700/60";
};

export const formatTaskStatus = (status?: string | null) => {
    const s = String(status ?? "").toLowerCase();
    if (s === "done") return "Selesai";
    if (s === "in_progress") return "Dikerjakan";
    if (s === "open") return "Baru";
    if (s === "cancelled") return "Dibatalkan";
    return s || "-";
};

export const formatTaskPriority = (priority?: string | null) => {
    const s = String(priority ?? "").toLowerCase();
    if (s === "high") return "Tinggi";
    if (s === "low") return "Rendah";
    return "Normal";
};

export const getPriorityTone = (priority?: string | null) => {
    const s = String(priority ?? "").toLowerCase();
    if (s === "high") return "bg-rose-200 text-rose-900 ring-rose-300";
    if (s === "low") return "bg-sky-200 text-sky-900 ring-sky-300";
    return "bg-slate-200 text-slate-900 ring-slate-300";
};

export const getMetaTone = (tone: "due" | "from" | "attachments") => {
    if (tone === "due") return "bg-amber-100 text-amber-900 ring-amber-200";
    if (tone === "from") return "bg-emerald-100 text-emerald-900 ring-emerald-200";
    return "bg-violet-100 text-violet-900 ring-violet-200";
};

export const getStatusSelectTone = (status?: string | null) => {
    const s = String(status ?? "").toLowerCase();
    if (s === "done") return "border-emerald-300 text-emerald-900 focus:ring-emerald-200";
    if (s === "in_progress") return "border-sky-300 text-sky-900 focus:ring-sky-200";
    if (s === "open") return "border-amber-300 text-amber-900 focus:ring-amber-200";
    if (s === "cancelled") return "border-rose-300 text-rose-900 focus:ring-rose-200";
    return "border-slate-300 text-slate-900 focus:ring-slate-200";
};
