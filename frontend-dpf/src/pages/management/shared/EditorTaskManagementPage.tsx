import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faFilter,
  faMagnifyingGlass,
  faPaperclip,
  faBan,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";
import { getAuthToken, getAuthUser } from "../../../lib/auth";
import { resolveApiBaseUrl } from "../../../lib/urls";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

type EditorTaskStatus = "open" | "in_progress" | "done" | "cancelled" | string;
type EditorTaskPriority = "low" | "normal" | "high" | string;

type EditorTaskAttachment = {
  id: number;
  original_name?: string | null;
  url?: string | null;
};

type EditorTaskItem = {
  id: number;
  title?: string | null;
  description?: string | null;
  status?: EditorTaskStatus | null;
  cancel_reason?: string | null;
  priority?: EditorTaskPriority | null;
  due_at?: string | null;
  created_at?: string | null;
  attachments?: EditorTaskAttachment[] | null;
  assignee?: { id?: number; name?: string | null; email?: string | null } | null;
  creator?: { id?: number; name?: string | null; email?: string | null } | null;
};

type EditorUserOption = {
  id: number;
  name?: string | null;
  email?: string | null;
};

type EditorTaskPayload = {
  data: EditorTaskItem[];
  current_page?: number;
  per_page?: number;
  last_page?: number;
  total?: number;
};

type EditorTaskManagementPageProps = {
  role: "admin" | "superadmin";
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatPriority = (value: EditorTaskPriority | null | undefined) => {
  const s = String(value ?? "").toLowerCase();
  if (s === "high") return "Tinggi";
  if (s === "low") return "Rendah";
  return "Normal";
};

const formatStatus = (value: EditorTaskStatus | null | undefined) => {
  const s = String(value ?? "").toLowerCase();
  if (s === "done") return "Selesai";
  if (s === "in_progress") return "Dikerjakan";
  if (s === "open") return "Baru";
  if (s === "cancelled") return "Dibatalkan";
  return s || "-";
};

const getStatusTone = (value: EditorTaskStatus | null | undefined) => {
  const s = String(value ?? "").toLowerCase();
  if (s === "done") return "bg-emerald-600 text-white ring-emerald-700/60";
  if (s === "in_progress") return "bg-sky-600 text-white ring-sky-700/60";
  if (s === "open") return "bg-amber-500 text-slate-900 ring-amber-600/60";
  if (s === "cancelled") return "bg-rose-600 text-white ring-rose-700/60";
  return "bg-slate-600 text-white ring-slate-700/60";
};

const isDeleteLocked = (value: EditorTaskStatus | null | undefined) => {
  const s = String(value ?? "").toLowerCase();
  return s === "in_progress" || s === "done";
};

export function EditorTaskManagementPage({ role }: EditorTaskManagementPageProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const apiBase = role === "superadmin" ? "/superadmin" : "/admin";
  const routeBase = role === "superadmin" ? "/superadmin" : "/admin";
  const storedUser = useMemo(() => getAuthUser(), []);

  const [items, setItems] = useState<EditorTaskItem[]>([]);
  const [editors, setEditors] = useState<EditorUserOption[]>([]);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<EditorTaskStatus>("");
  const [priority, setPriority] = useState<EditorTaskPriority>("");
  const [assignedTo, setAssignedTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const pageRef = useRef(page);
  const perPageRef = useRef(perPage);
  const appliedFiltersRef = useRef({
    q: "",
    status: "" as EditorTaskStatus,
    priority: "" as EditorTaskPriority,
    assignedTo: "",
  });
  const backgroundRefreshRef = useRef(false);

  const hasFilters = Boolean(q.trim() || status || priority || assignedTo);

  const pageLabel = useMemo(() => {
    if (!total) return "Tidak ada data.";
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return `Menampilkan ${start}-${end} dari ${total}.`;
  }, [page, perPage, total]);

  const fetchEditors = async () => {
    try {
      const res = await http.get<EditorUserOption[]>(`${apiBase}/editor-tasks/editors`);
      setEditors(res.data ?? []);
    } catch {
      // ignore
    }
  };

  const fetchTasks = async (
    nextPage: number,
    overrides?: Partial<{
      q: string;
      status: EditorTaskStatus;
      priority: EditorTaskPriority;
      assignedTo: string;
      perPage: number;
    }>,
    options?: { silent?: boolean }
  ) => {
    const qValue = (overrides?.q ?? q).trim();
    const statusValue = overrides?.status ?? status;
    const priorityValue = overrides?.priority ?? priority;
    const assignedValue = overrides?.assignedTo ?? assignedTo;
    const perPageValue = overrides?.perPage ?? perPage;

    appliedFiltersRef.current = {
      q: qValue,
      status: statusValue,
      priority: priorityValue,
      assignedTo: assignedValue,
    };

    if (!options?.silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await http.get<EditorTaskPayload>(`${apiBase}/editor-tasks`, {
        params: {
          page: nextPage,
          per_page: perPageValue,
          q: qValue || undefined,
          status: statusValue || undefined,
          priority: priorityValue || undefined,
          assigned_to: assignedValue || undefined,
        },
      });
      setItems(res.data.data ?? []);
      setPage(res.data.current_page ?? nextPage);
      setPerPage(res.data.per_page ?? perPageValue);
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
    void fetchEditors();
  }, []);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    perPageRef.current = perPage;
  }, [perPage]);

  useEffect(() => {
    void fetchTasks(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage]);

  useEffect(() => {
    let active = true;
    let pollId: number | null = null;
    let echo: Echo<any> | null = null;
    let channelName: string | null = null;

    if (typeof window === "undefined") return () => {};

    const token = getAuthToken();
    const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY as string | undefined;
    const userIdRaw = storedUser?.id;
    const userId = typeof userIdRaw === "number" ? userIdRaw : Number(userIdRaw);

    const refreshTasks = () => {
      if (backgroundRefreshRef.current) return;
      backgroundRefreshRef.current = true;
      const applied = appliedFiltersRef.current;
      void fetchTasks(
        pageRef.current,
        {
          q: applied.q,
          status: applied.status,
          priority: applied.priority,
          assignedTo: applied.assignedTo,
          perPage: perPageRef.current,
        },
        { silent: true }
      ).finally(() => {
        backgroundRefreshRef.current = false;
      });
    };

    const fallbackInterval = 5_000;

    if (!token || !pusherKey || !Number.isFinite(userId)) {
      pollId = window.setInterval(refreshTasks, fallbackInterval);
      return () => {
        active = false;
        if (pollId) window.clearInterval(pollId);
      };
    }

    const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER as string | undefined;
    const host = import.meta.env.VITE_PUSHER_HOST as string | undefined;
    const portValue = import.meta.env.VITE_PUSHER_PORT as string | undefined;
    const scheme = (import.meta.env.VITE_PUSHER_APP_SCHEME as string | undefined) ?? "https";
    const port = Number(portValue || (scheme === "https" ? 443 : 80));

    (window as any).Pusher = Pusher;
    echo = new Echo({
      broadcaster: "pusher",
      key: pusherKey,
      cluster,
      forceTLS: scheme === "https",
      wsHost: host || undefined,
      wsPort: host ? port : undefined,
      wssPort: host ? port : undefined,
      enabledTransports: ["ws", "wss"],
      authEndpoint: `${resolveApiBaseUrl()}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    channelName = `editor-tasks.${userId}`;
    echo.private(channelName).listen(".tasks.count", () => {
      if (!active) return;
      refreshTasks();
    });

    echo.connector?.pusher?.connection.bind("connected", () => {
      if (!active) return;
      if (pollId) {
        window.clearInterval(pollId);
        pollId = null;
      }
      refreshTasks();
    });

    echo.connector?.pusher?.connection.bind("error", () => {
      if (!active) return;
      if (!pollId) pollId = window.setInterval(refreshTasks, fallbackInterval);
    });

    return () => {
      active = false;
      if (echo && channelName) {
        echo.leave(channelName);
      }
      if (echo) echo.disconnect();
      if (pollId) window.clearInterval(pollId);
    };
  }, [storedUser]);

  const onApplyFilters = () => void fetchTasks(1);

  const onResetFilters = () => {
    setQ("");
    setStatus("");
    setPriority("");
    setAssignedTo("");
    void fetchTasks(1, { q: "", status: "", priority: "", assignedTo: "" });
  };

  const onDeleteTask = async (taskId: number) => {
    const current = items.find((item) => item.id === taskId);
    if (isDeleteLocked(current?.status)) {
      toast.error("Tugas yang dikerjakan atau selesai tidak bisa dihapus.", { title: "Hapus tugas" });
      setConfirmDeleteId(null);
      return;
    }
    setDeletingId(taskId);
    try {
      await http.delete(`${apiBase}/editor-tasks/${taskId}`);
      setItems((current) => current.filter((item) => item.id !== taskId));
      toast.success("Tugas dihapus.", { title: "Berhasil" });
    } catch {
      toast.error("Gagal menghapus tugas.", { title: "Error" });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const onCancelTask = async (taskId: number) => {
    const reason = cancelReason.trim();
    if (!reason) {
      toast.error("Alasan pembatalan wajib diisi.", { title: "Batalkan tugas" });
      return;
    }
    setCancellingId(taskId);
    try {
      await http.put(`${apiBase}/editor-tasks/${taskId}`, {
        status: "cancelled",
        cancel_reason: reason,
      });
      setItems((current) =>
        current.map((item) =>
          item.id === taskId ? { ...item, status: "cancelled", cancel_reason: reason } : item
        )
      );
      toast.success("Tugas dibatalkan.", { title: "Berhasil" });
    } catch {
      toast.error("Gagal membatalkan tugas.", { title: "Error" });
    } finally {
      setCancellingId(null);
      setConfirmCancelId(null);
      setCancelReason("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              <span className="h-2 w-2 rounded-full bg-brandGreen-400" />
              Tugas Editor
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
              Manajemen Tugas Editor
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Kirim tugas berisi instruksi dan lampiran untuk editor.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`${routeBase}/editor-tasks/create`)}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            <FontAwesomeIcon icon={faCirclePlus} />
            Buat Tugas
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Cari</span>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                </span>
                <input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Cari judul tugas..."
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
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
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              >
                <option value="">Semua</option>
                <option value="low">Rendah</option>
                <option value="normal">Normal</option>
                <option value="high">Tinggi</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Editor</span>
              <select
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
              >
                <option value="">Semua Editor</option>
                {editors.map((editor) => (
                  <option key={editor.id} value={editor.id}>
                    {editor.name ?? editor.email ?? `Editor ${editor.id}`}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
              <span className="text-slate-400">
                <FontAwesomeIcon icon={faFilter} />
              </span>
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

            <button
              type="button"
              onClick={onApplyFilters}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              Terapkan
            </button>

            {hasFilters ? (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Atur ulang
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-600">{pageLabel}</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-700 bg-rose-600 p-4 text-sm font-semibold text-white">
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
            Belum ada tugas yang dibuat.
          </div>
        ) : (
          items.map((task) => {
            const deleteLocked = isDeleteLocked(task.status);
            const statusValue = String(task.status ?? "").toLowerCase();
            const cancelLocked = statusValue === "cancelled" || statusValue === "done";
            return (
              <div key={task.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{task.title ?? "Tugas tanpa judul"}</p>
                    {task.description ? (
                      <p className="mt-1 text-xs font-medium text-slate-600">{task.description}</p>
                    ) : null}
                    {statusValue === "cancelled" && task.cancel_reason ? (
                      <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                        Alasan dibatalkan: {task.cancel_reason}
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
                      <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1">
                        Prioritas: {formatPriority(task.priority)}
                      </span>
                      <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1">
                        Tenggat: {formatDateTime(task.due_at)}
                      </span>
                      <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1">
                        Editor: {task.assignee?.name ?? "Semua Editor"}
                      </span>
                      {task.creator?.name ? (
                        <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1">
                          Dibuat: {task.creator.name}
                        </span>
                      ) : null}
                    </div>
                    {task.attachments && task.attachments.length > 0 ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                        <FontAwesomeIcon icon={faPaperclip} className="text-slate-400" />
                        {task.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="max-w-[180px] truncate rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {attachment.original_name ?? "Lampiran"}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1",
                        getStatusTone(task.status),
                      ].join(" ")}
                    >
                      {formatStatus(task.status)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDeleteId(null);
                        setConfirmCancelId((current) => (current === task.id ? null : task.id));
                        setCancelReason("");
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={cancellingId === task.id || cancelLocked}
                      title={cancelLocked ? "Tugas selesai atau dibatalkan tidak bisa dibatalkan ulang." : "Batalkan tugas"}
                    >
                      <FontAwesomeIcon icon={faBan} />
                      Batalkan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmCancelId(null);
                        setConfirmDeleteId((current) => (current === task.id ? null : task.id));
                      }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      disabled={deletingId === task.id || deleteLocked}
                      title={
                        deleteLocked
                          ? "Tugas yang dikerjakan atau selesai tidak bisa dihapus."
                          : "Hapus tugas"
                      }
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                {confirmCancelId === task.id && !cancelLocked ? (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-bold text-rose-800">Batalkan tugas</p>
                    <p className="mt-1 text-sm text-rose-700">
                      Tulis alasan pembatalan agar editor memahami perubahan.
                    </p>
                    <label className="mt-3 block">
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-700">
                        Alasan pembatalan
                      </span>
                      <textarea
                        value={cancelReason}
                        onChange={(event) => setCancelReason(event.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        placeholder="Contoh: tugas salah dikirim ke editor."
                      />
                    </label>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setConfirmCancelId(null)}
                        className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-white px-5 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                        disabled={cancellingId === task.id}
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => void onCancelTask(task.id)}
                        className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={cancellingId === task.id}
                      >
                        {cancellingId === task.id ? "Membatalkan..." : "Ya, batalkan"}
                      </button>
                    </div>
                  </div>
                ) : null}
                {confirmDeleteId === task.id && !deleteLocked ? (
                  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm font-bold text-red-800">Konfirmasi hapus</p>
                    <p className="mt-1 text-sm text-red-700">Klik "Ya, hapus" untuk melanjutkan.</p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                        disabled={deletingId === task.id}
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDeleteTask(task.id)}
                        className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={deletingId === task.id}
                      >
                        {deletingId === task.id ? "Menghapus..." : "Ya, hapus"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
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

export default EditorTaskManagementPage;
