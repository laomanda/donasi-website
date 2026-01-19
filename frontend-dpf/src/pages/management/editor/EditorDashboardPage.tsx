import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faCheckCircle,
  faClock,
  faHeart,
  faLayerGroup,
  faPaperclip,
  faPenToSquare,
  faSitemap,
  faTriangleExclamation,
  faChartPie,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../../lib/http";
import { getAuthUser } from "../../../lib/auth";
import { useToast } from "../../../components/ui/ToastProvider";

/* --- Types --- */

type ActivityItem = {
  type: "article" | "program";
  id: number;
  title: string;
  status: string;
  action: "created" | "updated" | "published" | string;
  occurred_at: string;
};

type TaskAttachment = {
  id: number;
  original_name?: string | null;
  url?: string | null;
};

type EditorTaskItem = {
  id: number;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  cancel_reason?: string | null;
  priority?: string | null;
  due_at?: string | null;
  created_at?: string | null;
  attachments?: TaskAttachment[] | null;
  creator?: { id?: number; name?: string | null; email?: string | null } | null;
  assignee?: { id?: number; name?: string | null; email?: string | null } | null;
};

type EditorDashboardPayload = {
  stats?: {
    articles?: { draft?: number; review?: number; published?: number; total?: number };
    programs?: { active?: number; inactive?: number; total?: number };
    programs_highlight?: number;
    partners_active?: number;
    organization_members?: number;
  };
  tasks?: { items?: EditorTaskItem[] };
  activities?: ActivityItem[];
};

/* --- Helpers --- */

const formatCount = (value: number) => new Intl.NumberFormat("id-ID").format(value);

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

const getGreeting = (date: Date) => {
  const hour = date.getHours();
  if (hour >= 4 && hour < 11) return "Selamat Pagi";
  if (hour >= 11 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 19) return "Selamat Sore";
  return "Selamat Malam";
};

const getTaskTone = (status?: string | null) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "done") return "bg-emerald-600 text-white ring-emerald-700/60";
  if (s === "in_progress") return "bg-sky-600 text-white ring-sky-700/60";
  if (s === "open") return "bg-amber-500 text-slate-900 ring-amber-600/60";
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
/* --- Components --- */

export function EditorDashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState<EditorDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskItems, setTaskItems] = useState<EditorTaskItem[]>([]);
  const [taskUpdatingIds, setTaskUpdatingIds] = useState<number[]>([]);
  const today = useMemo(() => new Date(), []);
  const storedUser = useMemo(() => getAuthUser(), []);
  const displayName = storedUser?.name || "Editor";

  const stats = useMemo(() => {
    const articles = data?.stats?.articles ?? {};
    const programs = data?.stats?.programs ?? {};
    return {
      articlesDraft: Number(articles.draft ?? 0),
      articlesReview: Number(articles.review ?? 0),
      articlesPublished: Number(articles.published ?? 0),
      articlesTotal: Number(articles.total ?? 0),
      programsActive: Number(programs.active ?? 0),
      programsInactive: Number(programs.inactive ?? 0),
      programsTotal: Number(programs.total ?? 0),
      programsHighlight: Number(data?.stats?.programs_highlight ?? 0),
      partnersActive: Number(data?.stats?.partners_active ?? 0),
      organizationMembers: Number(data?.stats?.organization_members ?? 0),
    };
  }, [data]);

  const activities = data?.activities ?? [];
  useEffect(() => {
    let active = true;
    setLoading(true);
    http.get<EditorDashboardPayload>("/editor/dashboard")
      .then((res) => { if (active) { setData(res.data); setError(null); } })
      .catch(() => { if (active) setError("Gagal memuat data dashboard."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!data) return;
    setTaskItems(data.tasks?.items ?? []);
  }, [data]);

  const onUpdateTaskStatus = async (taskId: number, nextStatus: string) => {
    const current = taskItems.find((item) => item.id === taskId);
    if (!current || current.status === nextStatus) return;
    if (String(current.status ?? "").toLowerCase() === "cancelled") return;
    if (!isForwardStatus(current.status, nextStatus)) {
      toast.error("Status tidak bisa kembali ke tahap sebelumnya.", { title: "Status tugas" });
      return;
    }

    setTaskItems((items) =>
      items.map((item) => (item.id === taskId ? { ...item, status: nextStatus } : item))
    );
    setTaskUpdatingIds((ids) => Array.from(new Set([...ids, taskId])));

    try {
      await http.patch(`/editor/tasks/${taskId}`, { status: nextStatus });
    } catch {
      setTaskItems((items) =>
        items.map((item) => (item.id === taskId ? { ...item, status: current.status } : item))
      );
      toast.error("Gagal memperbarui status tugas.", { title: "Update tugas" });
    } finally {
      setTaskUpdatingIds((ids) => ids.filter((id) => id !== taskId));
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              <span className="h-2 w-2 rounded-full bg-brandGreen-400" />
              Ruang Kerja Editor
            </span>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {getGreeting(today)}, <span className="text-brandGreen-600">{displayName}</span>
            </h1>
            <p className="text-sm font-medium text-slate-600">
              Fokus pada tugas penting agar progres hari ini lebih jelas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/editor/articles/create")}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-slate-900">
                <FontAwesomeIcon icon={faBookOpen} size="xs" />
              </span>
              Buat Artikel
            </button>

            <button
              type="button"
              onClick={() => navigate("/editor/programs/create")}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-emerald-700">
                <FontAwesomeIcon icon={faHeart} size="xs" />
              </span>
              Buat Program
            </button>
          </div>
        </header>
      </div>

        {/* ALERTS */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-700 bg-rose-600 p-4 text-sm font-semibold text-white">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            {error}
          </div>
        )}

        {/* STATS ROW (Modern Cards) */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            loading={loading}
            title="Artikel Draf"
            value={formatCount(stats.articlesDraft)}
            icon={faPenToSquare}
            theme="amber"
          />
          <StatCard
            loading={loading}
            title="Artikel Terbit"
            value={formatCount(stats.articlesPublished)}
            icon={faCheckCircle}
            theme="emerald"
          />
          <StatCard
            loading={loading}
            title="Program Aktif"
            value={formatCount(stats.programsActive)}
            icon={faHeart}
            theme="rose"
          />
          <StatCard
            loading={loading}
            title="Program Nonaktif"
            value={formatCount(stats.programsInactive)}
            icon={faChartPie}
            theme="slate"
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <Panel title="Tugas dari Admin" subtitle="Tugas yang dikirim admin atau superadmin">
              <div className="space-y-3">
                {loading ? (
                  [1, 2, 3].map((i) => <SkeletonRow key={i} />)
                ) : taskItems.length === 0 ? (
                  <EmptyState label="Belum ada tugas baru untuk editor." />
                ) : (
                  taskItems.map((item) => (
                    <TaskItemRow
                      key={`task-${item.id}`}
                      item={item}
                      busy={taskUpdatingIds.includes(item.id)}
                      onStatusChange={(status) => onUpdateTaskStatus(item.id, status)}
                    />
                  ))
                )}
              </div>
            </Panel>

            {/* Activity Log */}
            <Panel title="Aktivitas Terbaru" subtitle="Rekam jejak perubahan konten">
                <div className="relative ml-3 space-y-6 border-l-2 border-slate-200 pb-2">
                   {loading ? (
                      <div className="pl-6 pt-1"><div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" /></div>
                   ) : activities.length === 0 ? (
                      <div className="pl-6"><EmptyState label="Belum ada aktivitas tercatat." /></div>
                   ) : (
                      activities.slice(0, 5).map((act, i) => <ActivityTimelineRow key={i} item={act} />)
                   )}
                </div>
            </Panel>
          </div>

          <div className="space-y-6 lg:col-span-2 lg:sticky lg:top-24 lg:self-start lg:h-fit">
            <Panel title="Ringkasan Editor" subtitle="Sekilas kondisi konten yang perlu perhatian">
              <div className="flex flex-wrap justify-center gap-3">
                <SummaryItem
                  className="w-full sm:w-[calc(50%-0.375rem)]"
                  loading={loading}
                  label="Artikel"
                  value={stats.articlesReview}
                  icon={faClock}
                  tone="bg-sky-600 text-white"
                />
                <SummaryItem
                  className="w-full sm:w-[calc(50%-0.375rem)]"
                  loading={loading}
                  label="Total Artikel"
                  value={stats.articlesTotal}
                  icon={faBookOpen}
                  tone="bg-slate-900 text-white"
                />
                <SummaryItem
                  className="w-full sm:w-[calc(50%-0.375rem)]"
                  loading={loading}
                  label="Program"
                  value={stats.programsHighlight}
                  icon={faHeart}
                  tone="bg-rose-600 text-white"
                />
                <SummaryItem
                  className="w-full sm:w-[calc(50%-0.375rem)]"
                  loading={loading}
                  label="Mitra Aktif"
                  value={stats.partnersActive}
                  icon={faUserGroup}
                  tone="bg-emerald-600 text-white"
                />
                <SummaryItem
                  className="w-full sm:w-[calc(50%-0.375rem)]"
                  loading={loading}
                  label="Organisasi"
                  value={stats.organizationMembers}
                  icon={faSitemap}
                  tone="bg-amber-500 text-slate-900"
                />
              </div>
            </Panel>

          </div>
        </div>
    </div>
  );
}

/* --- Styled Sub-Components --- */

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 space-y-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
          <h2 className="font-heading text-xl font-bold text-slate-900">{title}</h2>
        </div>
        {subtitle ? <p className="text-sm font-medium text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function StatCard({
  loading,
  title,
  value,
  icon,
  theme,
}: {
  loading: boolean;
  title: string;
  value: string;
  icon: any;
  theme: "emerald" | "amber" | "rose" | "violet" | "slate";
}) {
  const [primaryTitle, secondaryTitle] = (() => {
    const parts = String(title ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return [parts[0] ?? "", ""];
    return [parts[0] ?? "", parts.slice(1).join(" ")];
  })();

  const styles = {
    emerald: { accent: "border-l-emerald-600", icon: "bg-emerald-600 text-white" },
    amber: { accent: "border-l-amber-500", icon: "bg-amber-500 text-slate-900" },
    rose: { accent: "border-l-rose-600", icon: "bg-rose-600 text-white" },
    violet: { accent: "border-l-violet-600", icon: "bg-violet-600 text-white" },
    slate: { accent: "border-l-slate-700", icon: "bg-slate-700 text-white" },
  }[theme];

  return (
    <div className={`rounded-[24px] border border-slate-200 border-l-4 p-5 shadow-sm ${styles.accent}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
          ) : (
            <span className="block font-heading text-3xl font-bold text-slate-900">{value}</span>
          )}
          <div className="mt-2 min-h-[34px] text-xs font-bold uppercase leading-4 tracking-[0.18em] text-slate-500">
            <span className="block">{primaryTitle}</span>
            {secondaryTitle && <span className="block">{secondaryTitle}</span>}
          </div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm ${styles.icon}`}>
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>
    </div>
  );
}

function SummaryItem({
  loading,
  label,
  value,
  icon,
  tone,
  className,
}: {
  loading: boolean;
  label: string;
  value: number;
  icon: any;
  tone: string;
  className?: string;
}) {
  return (
    <div className={["flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm", className].filter(Boolean).join(" ")}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm ${tone}`}>
        <FontAwesomeIcon icon={icon} className="text-sm" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
        {loading ? (
          <div className="mt-1 h-5 w-16 animate-pulse rounded bg-slate-200" />
        ) : (
          <p className="text-lg font-bold text-slate-900">{formatCount(value)}</p>
        )}
      </div>
    </div>
  );
}

function TaskItemRow({
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
  const statusOptions = [
    { value: "open", label: "Baru" },
    { value: "in_progress", label: "Dikerjakan" },
    { value: "done", label: "Selesai" },
    { value: "cancelled", label: "Dibatalkan" },
  ];
  const isCancelled = status === "cancelled";
  const allowedStatusOptions = isCancelled
    ? statusOptions.filter((option) => option.value === "cancelled")
    : statusOptions.filter((option) => option.value !== "cancelled" && isForwardStatus(status, option.value));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-start">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-start gap-2">
            <p className="text-base font-semibold text-slate-900">{item.title ?? "Tugas tanpa judul"}</p>
            <span className={["inline-flex text-white items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1", statusTone].join(" ")}>
              {statusLabel}
            </span>
          </div>
          {item.description ? (
            <p className="text-sm font-medium text-slate-600">{item.description}</p>
          ) : null}
          {isCancelled && item.cancel_reason ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
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
              <span className={[metaBase, getMetaTone("from")].join(" ")}>Dari: {creatorName}</span>
            ) : null}
            {attachments.length > 0 ? (
              <span className={[metaBase, getMetaTone("attachments")].join(" ")}>
                Lampiran: {attachments.length}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
          <button
            type="button"
            onClick={() => setShowDetail((value) => !value)}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-brandGreen-500 hover:text-white"
          >
            {showDetail ? "Tutup Detail" : "Lihat Detail"}
          </button>
          <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</p>
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              disabled={busy || isCancelled}
              aria-label="Status tugas"
              className={[
                "mt-2 w-full rounded-xl border bg-white px-3 py-2 text-xs font-bold shadow-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100",
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

function ActivityTimelineRow({ item }: { item: ActivityItem }) {
  const icon = item.type === "program" ? faHeart : faBookOpen;
  const actionRaw = String(item.action ?? "").toLowerCase();
  const actionLabel =
    actionRaw === "created" ? "Dibuat" : actionRaw === "updated" ? "Diperbarui" : actionRaw === "published" ? "Diterbitkan" : "Diperbarui";
  const isCreated = actionRaw === "created";
  const typeLabel = item.type === "program" ? "Program" : "Artikel";

  return (
    <div className="group relative flex gap-4 rounded-r-xl pl-6 pb-2 transition hover:bg-slate-200/40">
      {/* Timeline Dot */}
      <div
        className={[
          "absolute -left-[5px] top-1 h-3 w-3 rounded-full border-2 border-white ring-1 ring-slate-300 transition-colors",
          isCreated ? "bg-emerald-600" : "bg-slate-900 group-hover:bg-slate-800",
        ].join(" ")}
      />

      <div className="min-w-0 flex-1 py-1">
        <p className="text-sm font-medium text-slate-700">
          <span className="font-bold text-slate-900">{actionLabel}</span>: "{item.title}"
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
          <FontAwesomeIcon icon={icon} className="text-slate-400" />
          <span>{typeLabel}</span>
          <span aria-hidden="true">-</span>
          <span>{formatDateTime(item.occurred_at)}</span>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return <div className="h-16 w-full animate-pulse rounded-2xl bg-slate-200" />;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-8 text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white ring-1 ring-slate-800">
        <FontAwesomeIcon icon={faLayerGroup} />
      </div>
      <p className="text-xs font-semibold text-slate-600">{label}</p>
    </div>
  );
}
