import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faListCheck,
    faMagnifyingGlass,
    faPaperclip,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";
import { getAuthUser } from "../../../lib/auth";


type EditorTaskItem = {
    id: number;
    title?: string | null;
    description?: string | null;
    status?: string | null;
    cancel_reason?: string | null;
    priority?: string | null;
    due_at?: string | null;
    created_at?: string | null;
    attachments?: { id: number; original_name?: string | null; url?: string | null }[] | null;
    creator?: { id?: number; name?: string | null; email?: string | null } | null;
    assignee?: { id?: number; name?: string | null; email?: string | null } | null;
};

type EditorTaskPayload = {
    data: EditorTaskItem[];
    current_page?: number;
    per_page?: number;
    last_page?: number;
    total?: number;
};

const formatDateTime = (value: string | null | undefined) => {
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

const getTaskTone = (status?: string | null) => {
    const s = String(status ?? "").toLowerCase();
    if (s === "done") return "bg-emerald-600 text-white ring-emerald-700/60";
    if (s === "in_progress") return "bg-sky-600 text-white ring-sky-700/60";
    if (s === "open") return "bg-amber-700 text-white ring-amber-800/60";
    if (s === "cancelled") return "bg-rose-600 text-white ring-rose-700/60";
    return "bg-slate-600 text-white ring-slate-700/60";
};

const formatTaskStatus = (status?: string | null) => {
    const s = String(status ?? "").toLowerCase();
    if (s === "done") return "Selesai";
    if (s === "in_progress") return "Dikerjakan";
    if (s === "open") return "Baru";
    if (s === "cancelled") return "Dibatalkan";
    return s || "-";
};

const formatTaskPriority = (priority?: string | null) => {
    const s = String(priority ?? "").toLowerCase();
    if (s === "high") return "Tinggi";
    if (s === "low") return "Rendah";
    return "Normal";
};

const getPriorityTone = (priority?: string | null) => {
    const s = String(priority ?? "").toLowerCase();
    if (s === "high") return "bg-rose-200 text-rose-900 ring-rose-300";
    if (s === "low") return "bg-sky-200 text-sky-900 ring-sky-300";
    return "bg-slate-200 text-slate-900 ring-slate-300";
};

const getMetaTone = (tone: "due" | "from" | "attachments") => {
    if (tone === "due") return "bg-amber-200 text-amber-900 ring-amber-300";
    if (tone === "from") return "bg-emerald-200 text-emerald-900 ring-emerald-300";
    return "bg-violet-200 text-violet-900 ring-violet-300";
};

const getStatusSelectTone = (status?: string | null) => {
    const s = String(status ?? "").toLowerCase();
    if (s === "done") return "border-emerald-300 text-emerald-900 focus:ring-emerald-200";
    if (s === "in_progress") return "border-sky-300 text-sky-900 focus:ring-sky-200";
    if (s === "open") return "border-amber-300 text-amber-900 focus:ring-amber-200";
    if (s === "cancelled") return "border-rose-300 text-rose-900 focus:ring-rose-200";
    return "border-slate-300 text-slate-900 focus:ring-slate-200";
};

const taskStatusOrder: Record<string, number> = {
    open: 0,
    in_progress: 1,
    done: 2,
};

const isForwardStatus = (current?: string | null, next?: string | null) => {
    const currentKey = String(current ?? "").toLowerCase();
    const nextKey = String(next ?? "").toLowerCase();
    if (!(currentKey in taskStatusOrder) || !(nextKey in taskStatusOrder)) return true;
    return taskStatusOrder[nextKey] >= taskStatusOrder[currentKey];
};

const statusOptions = [
    { value: "open", label: "Baru" },
    { value: "in_progress", label: "Dikerjakan" },
    { value: "done", label: "Selesai" },
    { value: "cancelled", label: "Dibatalkan" },
];

export function EditorTasksPage() {
    const toast = useToast();
    const storedUser = useMemo(() => getAuthUser(), []);
    const [items, setItems] = useState<EditorTaskItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [updatingIds, setUpdatingIds] = useState<number[]>([]);
    const pageRef = useRef(page);
    const perPageRef = useRef(perPage);
    const statusRef = useRef(statusFilter);
    const searchRef = useRef(searchQuery);
    const priorityRef = useRef(priorityFilter);
    const backgroundRefreshRef = useRef(false);

    const pageLabel = useMemo(() => {
        if (!total) return "Tidak ada data.";
        const start = (page - 1) * perPage + 1;
        const end = Math.min(page * perPage, total);
        return `Menampilkan ${start}-${end} dari ${total}.`;
    }, [page, perPage, total]);

    const fetchTasks = async (
        nextPage: number,
        overrides?: Partial<{
            status: string;
            priority: string;
            q: string;
            perPage: number;
        }>,
        options?: { silent?: boolean }
    ) => {
        const resolvedPerPage = overrides?.perPage ?? perPage;
        const resolvedStatus = overrides?.status ?? statusFilter;
        const resolvedPriority = overrides?.priority ?? priorityFilter;
        const resolvedQuery = overrides?.q ?? searchQuery;
        if (!options?.silent) {
            setLoading(true);
            setError(null);
        }
        try {
            const res = await http.get<EditorTaskPayload>("/editor/tasks", {
                params: {
                    page: nextPage,
                    per_page: resolvedPerPage,
                    status: resolvedStatus || undefined,
                    priority: resolvedPriority || undefined,
                    q: resolvedQuery || undefined,
                },
            });
            setItems(res.data.data ?? []);
            setPage(res.data.current_page ?? nextPage);
            setPerPage(res.data.per_page ?? resolvedPerPage);
            setLastPage(res.data.last_page ?? 1);
            setTotal(res.data.total ?? 0);
        } catch {
            if (!options?.silent) {
                setError("Gagal memuat tugas editor.");
            }
        } finally {
            if (!options?.silent) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    useEffect(() => {
        perPageRef.current = perPage;
    }, [perPage]);

    useEffect(() => {
        statusRef.current = statusFilter;
    }, [statusFilter]);

    useEffect(() => {
        searchRef.current = searchQuery;
    }, [searchQuery]);

    useEffect(() => {
        priorityRef.current = priorityFilter;
    }, [priorityFilter]);

    useEffect(() => {
        const handle = window.setTimeout(() => {
            setSearchQuery(searchInput.trim());
        }, 400);
        return () => window.clearTimeout(handle);
    }, [searchInput]);

    useEffect(() => {
        void fetchTasks(1, {
            status: statusFilter,
            priority: priorityFilter,
            q: searchQuery,
            perPage,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, priorityFilter, searchQuery, perPage]);

    useEffect(() => {
        let pollId: number | null = null;

        if (typeof window === "undefined") return () => { };

        const refreshTasks = () => {
            if (backgroundRefreshRef.current) return;
            backgroundRefreshRef.current = true;
            void fetchTasks(
                pageRef.current,
                {
                    status: statusRef.current,
                    priority: priorityRef.current,
                    q: searchRef.current,
                    perPage: perPageRef.current,
                },
                { silent: true }
            ).finally(() => {
                backgroundRefreshRef.current = false;
            });
        };

        const fallbackInterval = 5_000;
        pollId = window.setInterval(refreshTasks, fallbackInterval);

        return () => {
            if (pollId) window.clearInterval(pollId);
        };
    }, [storedUser]);

    const onUpdateStatus = async (taskId: number, nextStatus: string) => {
        const current = items.find((item) => item.id === taskId);
        if (!current || current.status === nextStatus) return;
        if (!isForwardStatus(current.status, nextStatus)) {
            toast.error("Status tidak bisa kembali ke tahap sebelumnya.", { title: "Status tugas" });
            return;
        }

        setItems((state) =>
            state.map((item) => (item.id === taskId ? { ...item, status: nextStatus } : item))
        );
        setUpdatingIds((ids) => Array.from(new Set([...ids, taskId])));

        try {
            await http.patch(`/editor/tasks/${taskId}`, { status: nextStatus });
        } catch {
            setItems((state) =>
                state.map((item) => (item.id === taskId ? { ...item, status: current.status } : item))
            );
            toast.error("Gagal memperbarui status tugas.", { title: "Update tugas" });
        } finally {
            setUpdatingIds((ids) => ids.filter((id) => id !== taskId));
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                            <span className="h-2 w-2 rounded-full bg-brandGreen-400" />
                            Tugas Editor
                        </span>
                        <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
                            Tugas dari Admin
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            Pantau dan selesaikan tugas yang dikirim admin atau superadmin.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                        <FontAwesomeIcon icon={faListCheck} />
                        <span>Total: {total}</span>
                    </div>
                </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <label className="block">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Cari</span>
                            <div className="relative mt-2">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                                </span>
                                <input
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    placeholder="Cari Judul Atau Deskripsi..."
                                    className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                                />
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</span>
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                            >
                                <option value="">Semua</option>
                                <option value="open">Baru</option>
                                <option value="in_progress">Dikerjakan</option>
                                <option value="done">Selesai</option>
                                <option value="cancelled">Dibatalkan</option>
                            </select>
                        </label>

                        <label className="block">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Prioritas</span>
                            <select
                                value={priorityFilter}
                                onChange={(event) => setPriorityFilter(event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                            >
                                <option value="">Semua</option>
                                <option value="high">Tinggi</option>
                                <option value="normal">Normal</option>
                                <option value="low">Rendah</option>
                            </select>
                        </label>
                    </div>

                    <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                        <span>Per halaman</span>
                        <select
                            value={perPage}
                            onChange={(event) => setPerPage(Number(event.target.value))}
                            className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm font-bold text-slate-700 focus:outline-none"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>
                    </label>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-slate-600">{pageLabel}</p>
                </div>
            </div>

            {error ? (
                <div className="flex items-center gap-3 rounded-2xl border border-rose-700 bg-rose-600 p-4 text-sm font-semibold text-white">
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                    {error}
                </div>
            ) : null}

            <div className="space-y-4">
                {loading && items.length === 0 ? (
                    <div className="space-y-3">
                        <div className="h-24 w-full animate-pulse rounded-3xl bg-slate-200" />
                        <div className="h-24 w-full animate-pulse rounded-3xl bg-slate-200" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-500">
                        Belum ada tugas yang perlu dikerjakan.
                    </div>
                ) : (
                    items.map((item) => (
                        <TaskCard
                            key={`task-${item.id}`}
                            item={item}
                            busy={updatingIds.includes(item.id)}
                            onStatusChange={(status) => onUpdateStatus(item.id, status)}
                        />
                    ))
                )}
            </div>

            <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold text-slate-600">{pageLabel}</div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => void fetchTasks(Math.max(1, page - 1))}
                        disabled={page <= 1 || loading}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                        Sebelumnya
                    </button>
                    <button
                        type="button"
                        onClick={() => void fetchTasks(Math.min(lastPage, page + 1))}
                        disabled={page >= lastPage || loading}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                        Berikutnya
                    </button>
                </div>
            </div>
        </div>
    );
}

function TaskCard({
    item,
    busy,
    onStatusChange,
}: {
    item: EditorTaskItem;
    busy: boolean;
    onStatusChange: (status: string) => void;
}) {
    const [showDetail, setShowDetail] = useState(false);
    const status = String(item.status ?? "open");
    const statusTone = getTaskTone(status);
    const statusLabel = formatTaskStatus(status);
    const priorityLabel = formatTaskPriority(item.priority);
    const dueLabel = formatDateTime(item.due_at ?? null);
    const attachments = item.attachments ?? [];
    const creatorName = item.creator?.name ?? null;
    const assigneeName = item.assignee?.name ?? "Semua Editor";
    const priorityTone = getPriorityTone(item.priority);
    const selectTone = getStatusSelectTone(status);
    const metaBase = "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ring-1";
    const isCancelled = status === "cancelled";
    const allowedStatusOptions = isCancelled
        ? statusOptions.filter((option) => option.value === "cancelled")
        : statusOptions.filter((option) => option.value !== "cancelled" && isForwardStatus(status, option.value));

    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="text-base font-semibold text-slate-900">{item.title ?? "Tugas tanpa judul"}</p>
                        <span
                            className={[
                                "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1",
                                statusTone,
                            ].join(" ")}
                        >
                            {statusLabel}
                        </span>
                    </div>
                    {item.description ? (
                        <p className="text-sm font-medium text-slate-600">{item.description}</p>
                    ) : null}
                    {isCancelled && item.cancel_reason ? (
                        <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                            Alasan dibatalkan: {item.cancel_reason}
                        </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={[metaBase, priorityTone].join(" ")}>
                            Prioritas: {priorityLabel}
                        </span>
                        <span className={[metaBase, getMetaTone("due")].join(" ")}>
                            Tenggat: {dueLabel}
                        </span>
                        {creatorName ? (
                            <span className={[metaBase, getMetaTone("from")].join(" ")}>
                                Dari: {creatorName}
                            </span>
                        ) : null}
                        {attachments.length > 0 ? (
                            <span className={[metaBase, getMetaTone("attachments")].join(" ")}>
                                Lampiran: {attachments.length}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="flex w-full flex-col gap-3 lg:w-[240px]">
                    <button
                        type="button"
                        onClick={() => setShowDetail((value) => !value)}
                        className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        {showDetail ? "Tutup Detail" : "Lihat Detail"}
                    </button>
                    <div className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</p>
                        <select
                            value={status}
                            onChange={(event) => onStatusChange(event.target.value)}
                            disabled={busy || isCancelled}
                            aria-label="Status tugas"
                            className={[
                                "mt-2 w-full rounded-2xl border bg-white px-3 py-2 text-xs font-bold shadow-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100",
                                selectTone,
                            ].join(" ")}
                        >
                            {allowedStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {showDetail ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">ID Tugas</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">#{item.id}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Dibuat</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(item.created_at ?? null)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Ditujukan</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{assigneeName}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{statusLabel}</p>
                        </div>
                        {isCancelled && item.cancel_reason ? (
                            <div className="sm:col-span-2">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Alasan pembatalan</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{item.cancel_reason}</p>
                            </div>
                        ) : null}
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Prioritas</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{priorityLabel}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Tenggat</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{dueLabel}</p>
                        </div>
                        {creatorName ? (
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Dari</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{creatorName}</p>
                            </div>
                        ) : null}
                    </div>

                    {attachments.length > 0 ? (
                        <div className="mt-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Lampiran</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                                <FontAwesomeIcon icon={faPaperclip} className="text-slate-400" />
                                {attachments.map((attachment) => (
                                    <a
                                        key={attachment.id}
                                        href={attachment.url ?? "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="max-w-[220px] truncate rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        {attachment.original_name ?? "Lampiran"}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

export default EditorTasksPage;
