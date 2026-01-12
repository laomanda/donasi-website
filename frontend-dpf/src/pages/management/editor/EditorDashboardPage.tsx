import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBookOpen,
  faCheckCircle,
  faClock,
  faFilePen,
  faHeart,
  faLayerGroup,
  faPenToSquare,
  faTriangleExclamation,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import http from "../../../lib/http";
import { getAuthUser } from "../../../lib/auth";

/* --- Types --- */

type LastDraft = {
  type: "article" | "program";
  id: number;
  title: string;
  updated_at: string;
};

type TodoItem = {
  type: "article" | "program";
  id: number;
  title: string;
  status: string;
  category: string | null;
  updated_at: string;
  reason: string;
};

type ActivityItem = {
  type: "article" | "program";
  id: number;
  title: string;
  status: string;
  action: "created" | "updated" | "published" | string;
  occurred_at: string;
};

type EditorDashboardPayload = {
  stats?: {
    articles?: { draft?: number; review?: number; published?: number; total?: number };
    programs?: { active?: number; inactive?: number; total?: number };
    programs_highlight?: number;
    partners_active?: number;
    organization_members?: number;
  };
  quick_actions?: { last_draft?: LastDraft | null };
  todo?: { items?: TodoItem[] };
  activities?: ActivityItem[];
  landing?: { hero_title?: unknown; cta_text?: unknown; updated_at?: unknown; source?: unknown };
  notifications?: unknown;
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

// Logic warna status modern (Solid Pills)
const getStatusStyles = (status: string) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "published" || s === "active") return { bg: "bg-emerald-100", text: "text-emerald-700", icon: faCheckCircle };
  if (s === "review") return { bg: "bg-blue-100", text: "text-blue-700", icon: faClock };
  if (s === "draft") return { bg: "bg-amber-100", text: "text-amber-700", icon: faFilePen };
  if (s === "archived" || s === "inactive") return { bg: "bg-slate-100", text: "text-slate-600", icon: faLayerGroup };
  return { bg: "bg-slate-100", text: "text-slate-600", icon: faLayerGroup };
};



const getNotificationReadStorageKey = (user: { id?: number; email?: string } | null) => {
  if (user?.id !== undefined && user.id !== null) return `dpf.editor.notifications.read.id:${user.id}`;
  if (user?.email) return `dpf.editor.notifications.read.email:${user.email}`;
  return "dpf.editor.notifications.read.anon";
};

/* --- Components --- */

export function EditorDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<EditorDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationKeys] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const key = getNotificationReadStorageKey(getAuthUser());
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((value): value is string => typeof value === "string");
    } catch {
      return [];
    }
  });
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const today = useMemo(() => new Date(), []);
  const storedUser = useMemo(() => getAuthUser(), []);
  const displayName = storedUser?.name || "Editor";

  const stats = useMemo(() => {
    const articles = data?.stats?.articles ?? {};
    const programs = data?.stats?.programs ?? {};
    return {
      articlesDraft: Number(articles.draft ?? 0),
      articlesPublished: Number(articles.published ?? 0),
      programsActive: Number(programs.active ?? 0),
      programsInactive: Number(programs.inactive ?? 0),
    };
  }, [data]);

  const lastDraft = data?.quick_actions?.last_draft ?? null;
  const todoItems = data?.todo?.items ?? [];
  const activities = data?.activities ?? [];

  const notificationReadStorageKey = useMemo(() => getNotificationReadStorageKey(storedUser), [storedUser]);

  const onContinueLastDraft = () => {
    if (!lastDraft) return;
    navigate(lastDraft.type === "article" ? "/editor/articles" : "/editor/programs");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(notificationReadStorageKey, JSON.stringify(readNotificationKeys));
    } catch {
      // ignore storage errors
    }
  }, [notificationReadStorageKey, readNotificationKeys]);

  // Close popup logic
  useEffect(() => {
    if (!notificationsOpen) return;
    const onClick = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [notificationsOpen]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    http.get<EditorDashboardPayload>("/editor/dashboard")
      .then((res) => { if (active) { setData(res.data); setError(null); } })
      .catch(() => { if (active) setError("Gagal memuat data dashboard."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-brandGreen-100 bg-white p-6 shadow-sm sm:p-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-brandGreen-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brandGreen-700 ring-1 ring-brandGreen-100">
              <span className="h-2 w-2 rounded-full bg-brandGreen-600" />
              Ruang Kerja Editor
            </span>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {getGreeting(today)}, <span className="text-brandGreen-700">{displayName}</span>
            </h1>
            <p className="text-sm font-medium text-slate-600">
              Fokus pada tugas penting agar progres hari ini lebih jelas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/editor/articles/create")}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-primary-700">
                <FontAwesomeIcon icon={faBookOpen} size="xs" />
              </span>
              Buat Artikel
            </button>

            <button
              type="button"
              onClick={() => navigate("/editor/programs/create")}
              className="inline-flex items-center gap-2 rounded-2xl bg-brandGreen-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brandGreen-700"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-brandGreen-700">
                <FontAwesomeIcon icon={faHeart} size="xs" />
              </span>
              Buat Program
            </button>
          </div>
        </header>
      </div>

        {/* ALERTS */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
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

        <div className="grid gap-6">
          <div className="space-y-6">

            {/* Quick Draft & Todos */}
            <Panel title="Tugas Editor" subtitle="Fokus selesaikan pekerjaan yang tertunda">
               {/* Last Draft Banner */}
               {lastDraft && !loading ? (
                 <button
                   type="button"
                   onClick={onContinueLastDraft}
                   className="mb-6 w-full overflow-hidden rounded-3xl bg-brandGreen-600 p-6 text-left text-white shadow-soft transition hover:bg-brandGreen-700"
                 >
                   <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                     <div className="min-w-0">
                       <span className="inline-flex items-center rounded-full bg-brandGreen-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-brandGreen-400">
                        Draf terakhir
                       </span>
                       <h3 className="mt-2 line-clamp-1 font-heading text-lg font-bold">{lastDraft.title}</h3>
                       <p className="mt-1 text-xs font-semibold text-brandGreen-100">
                         Disimpan pada {formatDateTime(lastDraft.updated_at)}
                       </p>
                     </div>
                     <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-brandGreen-700 shadow-sm">
                       Lanjutkan <FontAwesomeIcon icon={faArrowRight} />
                     </span>
                   </div>
                 </button>
               ) : null}

               {/* Todo List */}
               <div className="space-y-3">
                 {loading ? (
                   [1,2,3].map(i => <SkeletonRow key={i} />)
                 ) : todoItems.length === 0 ? (
                   <EmptyState label="Hore! Tidak ada tanggungan tugas saat ini." />
                 ) : (
                   todoItems.map((item) => <TodoItemRow key={`todo-${item.id}`} item={item} onClick={() => navigate(item.type === 'article' ? '/editor/articles' : '/editor/programs')} />)
                 )}
               </div>
            </Panel>

            {/* Activity Log */}
            <Panel title="Aktivitas Terbaru" subtitle="Rekam jejak perubahan konten">
                <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 pb-2">
                   {loading ? (
                      <div className="pl-6 pt-1"><div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" /></div>
                   ) : activities.length === 0 ? (
                      <div className="pl-6"><EmptyState label="Belum ada aktivitas tercatat." /></div>
                   ) : (
                      activities.slice(0, 5).map((act, i) => <ActivityTimelineRow key={i} item={act} />)
                   )}
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
          <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />
          <h2 className="font-heading text-xl font-bold text-slate-900">{title}</h2>
        </div>
        {subtitle ? <p className="text-sm font-medium text-slate-600">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function StatCard({ loading, title, value, icon, theme }: { loading: boolean, title: string, value: string, icon: any, theme: "emerald" | "amber" | "rose" | "violet" | "slate" }) {
  const [primaryTitle, secondaryTitle] = (() => {
    const parts = String(title ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return [parts[0] ?? "", ""];
    return [parts[0] ?? "", parts.slice(1).join(" ")];
  })();

  const styles = {
    emerald: { card: "bg-emerald-50 ring-emerald-100", icon: "text-emerald-700 ring-emerald-100" },
    amber: { card: "bg-amber-50 ring-amber-100", icon: "text-amber-700 ring-amber-100" },
    rose: { card: "bg-rose-50 ring-rose-100", icon: "text-rose-700 ring-rose-100" },
    violet: { card: "bg-violet-50 ring-violet-100", icon: "text-violet-700 ring-violet-100" },
    slate: { card: "bg-slate-50 ring-slate-200", icon: "text-slate-700 ring-slate-200" },
  }[theme];

  return (
    <div className={`relative overflow-hidden rounded-[2rem] p-6 shadow-soft ring-1 ring-inset ${styles.card}`}>
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[120px]">
        <div className="flex items-start justify-between">
           <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ${styles.icon}`}>
              <FontAwesomeIcon icon={icon} />
           </div>
        </div>
        <div>
           {loading ? (
             <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
           ) : (
             <span className="block font-heading text-3xl font-bold text-slate-900">{value}</span>
           )}
           <div className="mt-2 min-h-[34px] text-xs font-bold uppercase leading-4 tracking-[0.18em] text-slate-600">
             <span className="block">{primaryTitle}</span>
             {secondaryTitle && <span className="block">{secondaryTitle}</span>}
           </div>
        </div>
      </div>
    </div>
  );
}

function TodoItemRow({ item, onClick }: { item: TodoItem, onClick: () => void }) {
  const isProgram = item.type === "program";
  const { bg, text } = getStatusStyles(item.status);

  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer items-start gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:bg-primary-50"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${isProgram ? "bg-rose-50 text-rose-600 group-hover:bg-rose-100" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"}`}>
        <FontAwesomeIcon icon={isProgram ? faHeart : faBookOpen} />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
           <h4 className="font-bold text-slate-800 truncate group-hover:text-primary-700 transition-colors">{item.title}</h4>
           <span className="text-[10px] font-bold text-slate-400">{formatDateTime(item.updated_at)}</span>
        </div>
        <p className="text-xs font-medium text-slate-500 line-clamp-1 mb-3">{item.reason}</p>
        <div className="flex items-center gap-2">
           <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${bg} ${text}`}>
              {item.status}
           </span>
           {item.category ? (
             <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600">
               {item.category}
             </span>
           ) : null}
        </div>
      </div>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
         <FontAwesomeIcon icon={faArrowRight} className="text-primary-400" />
      </div>
    </div>
  );
}

function ActivityTimelineRow({ item }: { item: ActivityItem }) {
  const icon = item.type === "program" ? faHeart : faBookOpen;
  const isCreated = item.action.toLowerCase() === "created";

  return (
    <div className="group relative flex gap-4 rounded-r-xl pl-6 pb-2 transition-colors hover:bg-primary-50">
      {/* Timeline Dot */}
      <div
        className={[
          "absolute -left-[5px] top-1 h-3 w-3 rounded-full border-2 border-white ring-1 ring-slate-200 transition-colors",
          isCreated ? "bg-brandGreen-600" : "bg-primary-600 group-hover:bg-primary-700",
        ].join(" ")}
      />

      <div className="min-w-0 flex-1 py-1">
        <p className="text-sm font-medium text-slate-700">
          <span className="font-bold text-slate-900">{item.action}</span>: "{item.title}"
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
          <FontAwesomeIcon icon={icon} className="text-slate-400" />
          <span className="capitalize">{item.type}</span>
          <span aria-hidden="true">-</span>
          <span>{formatDateTime(item.occurred_at)}</span>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return <div className="h-16 w-full animate-pulse rounded-2xl bg-slate-100" />;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-100 bg-primary-50 py-8 text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary-600 ring-1 ring-primary-100">
        <FontAwesomeIcon icon={faLayerGroup} />
      </div>
      <p className="text-xs font-semibold text-slate-600">{label}</p>
    </div>
  );
}

