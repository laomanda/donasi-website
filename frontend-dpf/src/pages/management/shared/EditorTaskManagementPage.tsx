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
  faListCheck,
  faCalendarDays,
  faUserCircle,
  faFlag,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import http from "../../../lib/http";
import { useToast } from "../../../components/ui/ToastProvider";
import { getAuthUser } from "../../../lib/auth";


type EditorTaskStatus = "open" | "in_progress" | "done" | "cancelled" | string;
type EditorTaskPriority = "low" | "normal" | "high" | string;

// ... types remain the same ...
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
  if (s === "done") return "bg-emerald-600 text-white shadow-md shadow-emerald-600/20";
  if (s === "in_progress") return "bg-blue-600 text-white shadow-md shadow-blue-600/20";
  if (s === "open") return "bg-amber-500 text-white shadow-md shadow-amber-500/20";
  if (s === "cancelled") return "bg-rose-600 text-white shadow-md shadow-rose-600/20";
  return "bg-slate-600 text-white shadow-md shadow-slate-600/20";
};

const getPriorityTone = (value: EditorTaskPriority | null | undefined) => {
  const s = String(value ?? "").toLowerCase();
  if (s === "high") return "bg-rose-600 text-white shadow-md shadow-rose-600/20";
  if (s === "low") return "bg-slate-500 text-white shadow-md shadow-slate-500/20";
  return "bg-indigo-600 text-white shadow-md shadow-indigo-600/20";
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
    const handler = setTimeout(() => {
      void fetchTasks(1, { q, status, priority, assignedTo, perPage });
    }, 500);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, priority, assignedTo, perPage]);

  useEffect(() => {
    let pollId: number | null = null;

    if (typeof window === "undefined") return () => { };

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
    pollId = window.setInterval(refreshTasks, fallbackInterval);

    return () => {
      if (pollId) window.clearInterval(pollId);
    };
  }, [storedUser]);

  const onResetFilters = () => {
    setQ("");
    setStatus("");
    setPriority("");
    setAssignedTo("");
    // The useEffect will trigger the fetch, so we don't need to call it manually here immediately
    // but setting state is enough.
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
    <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-8 pb-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 shadow-xl">
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.6)]" />
                  Manajemen Konten
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-5xl text-shadow-sm">
                  Tugas Editor
                </h1>
                <p className="mt-2 max-w-2xl text-lg font-medium text-emerald-100/90">
                  Kelola penugasan konten, pantau progres editor, dan pastikan target publikasi tercapai tepat waktu.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`${routeBase}/editor-tasks/create`)}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-emerald-700 shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition group-hover:bg-emerald-200">
                  <FontAwesomeIcon icon={faCirclePlus} className="text-xs" />
                </div>
                Buat Tugas Baru
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FontAwesomeIcon icon={faFilter} />
            </div>
            Filter & Pencarian
          </h3>
          {hasFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Pencarian</span>
              <div className="relative mt-2 group">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition group-focus-within:text-emerald-500">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Judul tugas..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</span>
              <div className="relative mt-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="">Semua Status</option>
                  <option value="open">Baru</option>
                  <option value="in_progress">Dikerjakan</option>
                  <option value="done">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
                </div>
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Prioritas</span>
              <div className="relative mt-2">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="">Semua Prioritas</option>
                  <option value="low">Rendah</option>
                  <option value="normal">Normal</option>
                  <option value="high">Tinggi</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <FontAwesomeIcon icon={faFlag} className="text-xs" />
                </div>
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Editor</span>
              <div className="relative mt-2">
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="">Semua Editor</option>
                  {editors.map((editor) => (
                    <option key={editor.id} value={editor.id}>
                      {editor.name ?? editor.email ?? `Editor ${editor.id}`}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <FontAwesomeIcon icon={faUserCircle} className="text-xs" />
                </div>
              </div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-50 pt-6 mt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Tampilkan</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Per Halaman</span>
            </div>

            <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg w-full sm:w-auto text-center sm:text-right">
              {pageLabel}
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 flex items-start gap-4 shadow-sm">
          <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <FontAwesomeIcon icon={faBan} />
          </div>
          <div>
            <h3 className="font-bold text-rose-700">Terjadi Kesalahan</h3>
            <p className="text-sm text-rose-600 mt-1">{error}</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6">
        {loading && items.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
              <div className="h-6 w-1/3 bg-slate-100 rounded-full mb-4" />
              <div className="h-4 w-2/3 bg-slate-100 rounded-full mb-2" />
              <div className="h-4 w-1/2 bg-slate-100 rounded-full" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <FontAwesomeIcon icon={faListCheck} className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Belum ada tugas</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              Buat tugas baru untuk mulai menugaskan pekerjaan kepada editor.
            </p>
          </div>
        ) : (
          items.map((task) => {
            const deleteLocked = isDeleteLocked(task.status);
            const statusValue = String(task.status ?? "").toLowerCase();
            const cancelLocked = statusValue === "cancelled" || statusValue === "done";
            return (
              <div key={task.id} className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-emerald-200">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-4 flex-1 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusTone(task.status)}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${task.status === 'in_progress' ? 'animate-pulse bg-white' : 'bg-white/70'}`} />
                          {formatStatus(task.status)}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getPriorityTone(task.priority)}`}>
                          <FontAwesomeIcon icon={faFlag} />
                          {formatPriority(task.priority)}
                        </span>
                      </div>
                      <h3 className="font-heading text-xl font-bold text-slate-900 transition">
                        {task.title ?? "Tugas tanpa judul"}
                      </h3>
                      {task.description && (
                        <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {statusValue === "cancelled" && task.cancel_reason && (
                      <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 flex items-start gap-3">
                        <FontAwesomeIcon icon={faBan} className="mt-0.5 text-rose-500" />
                        <div>
                          <p className="text-xs font-bold text-rose-700 uppercase">Alasan Pembatalan</p>
                          <p className="text-sm text-rose-800 mt-0.5 font-medium">{task.cancel_reason}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 border-t border-slate-100 pt-4 mt-2">
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                        <FontAwesomeIcon icon={faCalendarDays} className="text-emerald-500" />
                        <span>Tenggat: {formatDateTime(task.due_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                        <FontAwesomeIcon icon={faUserCircle} className="text-blue-500" />
                        <span>Editor: <span className="text-slate-700">{task.assignee?.name ?? "Semua Editor"}</span></span>
                      </div>
                      {task.creator?.name && (
                        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                          <FontAwesomeIcon icon={faUserCircle} className="text-indigo-500" />
                          <span>Dibuat: <span className="text-slate-700">{task.creator.name}</span></span>
                        </div>
                      )}
                    </div>

                    {task.attachments && task.attachments.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {task.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-emerald-600"
                          >
                            <FontAwesomeIcon icon={faPaperclip} />
                            {attachment.original_name ?? "Lampiran"}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 w-full md:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDeleteId(null);
                        setConfirmCancelId((current) => (current === task.id ? null : task.id));
                        setCancelReason("");
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={cancellingId === task.id || cancelLocked}
                      title={cancelLocked ? "Tidak bisa dibatalkan ulang." : "Batalkan tugas"}
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
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={deletingId === task.id || deleteLocked}
                      title={deleteLocked ? "Tugas aktif tidak bisa dihapus." : "Hapus tugas"}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>

                {/* Confirmation Zones */}
                {confirmCancelId === task.id && !cancelLocked && (
                  <div className="mt-6 rounded-2xl bg-rose-50 p-6 border border-rose-100 animate-slide-up">
                    <h4 className="font-bold text-rose-800 flex items-center gap-2">
                      <FontAwesomeIcon icon={faBan} />
                      Konfirmasi Pembatalan
                    </h4>
                    <p className="mt-1 text-sm text-rose-700 font-medium">
                      Mohon berikan alasan pembatalan untuk memberitahu editor.
                    </p>
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={cancelReason}
                        onChange={(event) => setCancelReason(event.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-200/50"
                        placeholder="Contoh: Salah penugasan, revisi brief..."
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setConfirmCancelId(null)}
                          className="rounded-xl px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => void onCancelTask(task.id)}
                          className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition"
                          disabled={cancellingId === task.id}
                        >
                          {cancellingId === task.id ? "Memproses..." : "Ya, Batalkan Tugas"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {confirmDeleteId === task.id && !deleteLocked && (
                  <div className="mt-6 rounded-2xl bg-slate-50 p-6 border border-slate-100 animate-slide-up">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <FontAwesomeIcon icon={faTrash} className="text-slate-400" />
                      Konfirmasi Penghapusan
                    </h4>
                    <p className="mt-1 text-sm text-slate-600 font-medium">
                      Tugas ini akan dihapus permanen dan tidak dapat dikembalikan.
                    </p>
                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => void onDeleteTask(task.id)}
                        className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-lg hover:bg-black transition"
                        disabled={deletingId === task.id}
                      >
                        {deletingId === task.id ? "Memproses..." : "Ya, Hapus Permanen"}
                      </button>
                    </div>
                  </div>
                )}
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
