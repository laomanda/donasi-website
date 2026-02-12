import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faBookOpen,
  faBuildingColumns,
  faClipboardCheck,
  faHandshake,
  faHeadset,
  faHeart,
  faListCheck,
  faPenToSquare,
  faReceipt,
  faSitemap,
  faTruckRampBox,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import http from "../../../lib/http";
import imagePlaceholder from "../../../brand/assets/image-placeholder.jpg";
import { readSearchLimit, SETTINGS_EVENT } from "../../../lib/settings";

type SearchRole = "editor" | "admin" | "superadmin";

type PaginationPayload<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

type Article = {
  id: number;
  title: string;
  category?: string | null;
  excerpt?: string | null;
  status?: string | null;
  thumbnail_path?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type Program = {
  id: number;
  title: string;
  category?: string | null;
  short_description?: string | null;
  status?: string | null;
  thumbnail_path?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type Partner = {
  id: number;
  name: string;
  logo_path?: string | null;
  url?: string | null;
  order?: number | null;
  is_active?: boolean | null;
};

type OrganizationMember = {
  id: number;
  name: string;
  position_title: string;
  group: string;
  photo_path?: string | null;
  is_active?: boolean | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type DonationStatus = "pending" | "paid" | "failed" | "expired" | "cancelled" | string;

type Donation = {
  id: number;
  donation_code?: string | null;
  donor_name?: string | null;
  amount?: number | string | null;
  status?: DonationStatus | null;
  payment_source?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  program?: { id?: number; title?: string | null } | null;
};

type EditorTaskStatus = "open" | "in_progress" | "done" | "cancelled" | string;
type EditorTaskPriority = "low" | "normal" | "high" | string;

type EditorTask = {
  id: number;
  title?: string | null;
  description?: string | null;
  status?: EditorTaskStatus | null;
  priority?: EditorTaskPriority | null;
  due_at?: string | null;
  created_at?: string | null;
  assignee?: { id?: number; name?: string | null; email?: string | null } | null;
  creator?: { id?: number; name?: string | null; email?: string | null } | null;
};

type PickupStatus = "baru" | "dijadwalkan" | "selesai" | "dibatalkan" | string;

type PickupRequest = {
  id: number;
  donor_name?: string | null;
  donor_phone?: string | null;
  city?: string | null;
  district?: string | null;
  wakaf_type?: string | null;
  status?: PickupStatus | null;
  created_at?: string | null;
};

type ConsultationStatus = "baru" | "dibalas" | "ditutup" | string;

type Consultation = {
  id: number;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  topic?: string | null;
  message?: string | null;
  status?: ConsultationStatus | null;
  created_at?: string | null;
};

type BankAccount = {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_visible_public: boolean;
  order?: number | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type User = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at?: string | null;
  roles?: { id?: number; name: string }[];
  role_label?: string | null;
};

type LoadState<T> = {
  data: T[];
  total: number;
  loading: boolean;
  error: string | null;
};

type Tone = "slate" | "primary" | "green" | "sky" | "amber" | "red";

const createInitialState = <T,>(): LoadState<T> => ({
  data: [],
  total: 0,
  loading: false,
  error: null,
});

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
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

const formatCurrency = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
};

const getBackendBaseUrl = () => {
  const api = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  const backend = import.meta.env.VITE_BACKEND_URL ?? api.replace(/\/api(\/v1)?$/, "");
  return String(backend).replace(/\/$/, "");
};

const resolveStorageUrl = (path: string | null | undefined) => {
  const value = String(path ?? "").trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  const clean = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${getBackendBaseUrl()}/storage/${clean}`;
};

const badgeTone = (tone: "neutral" | "green" | "amber" | "red" | "sky") => {
  if (tone === "green") return "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100";
  if (tone === "sky") return "bg-sky-50 text-sky-700 ring-sky-100";
  if (tone === "amber") return "bg-amber-50 text-amber-700 ring-amber-100";
  if (tone === "red") return "bg-red-100 text-red-700 ring-red-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

const sectionBadgeTone = (tone: Tone) => {
  if (tone === "primary") return "bg-primary-50 text-primary-700 ring-primary-100";
  if (tone === "green") return "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100";
  if (tone === "sky") return "bg-sky-50 text-sky-700 ring-sky-100";
  if (tone === "amber") return "bg-amber-50 text-amber-700 ring-amber-100";
  if (tone === "red") return "bg-red-50 text-red-700 ring-red-100";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

const donationStatusLabel = (status: DonationStatus) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "paid") return { label: "Lunas", tone: "green" as const };
  if (value === "pending") return { label: "Menunggu", tone: "amber" as const };
  if (value === "failed" || value === "cancelled") return { label: "Gagal", tone: "red" as const };
  if (value === "expired") return { label: "Kedaluwarsa", tone: "neutral" as const };
  return { label: String(status || "-"), tone: "neutral" as const };
};

const articleStatusLabel = (status: string) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "published") return { label: "Terbit", tone: "green" as const };
  if (value === "review") return { label: "Menunggu peninjauan", tone: "amber" as const };
  return { label: "Draf", tone: "neutral" as const };
};

const programStatusLabel = (status: string) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "active") return { label: "Berjalan", tone: "green" as const };
  if (value === "completed" || value === "archived") return { label: "Tersalurkan", tone: "neutral" as const };
  return { label: "Segera", tone: "amber" as const };
};

const editorTaskStatusLabel = (status: EditorTaskStatus) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "done") return { label: "Selesai", tone: "green" as const };
  if (value === "in_progress") return { label: "Dikerjakan", tone: "sky" as const };
  if (value === "open") return { label: "Baru", tone: "amber" as const };
  if (value === "cancelled") return { label: "Dibatalkan", tone: "red" as const };
  return { label: String(status || "-"), tone: "neutral" as const };
};

const editorTaskPriorityLabel = (priority: EditorTaskPriority) => {
  const value = String(priority ?? "").toLowerCase();
  if (value === "high") return "Tinggi";
  if (value === "low") return "Rendah";
  return "Normal";
};

const pickupStatusLabel = (status: PickupStatus) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "baru") return { label: "Baru", tone: "amber" as const };
  if (value === "dijadwalkan") return { label: "Dijadwalkan", tone: "sky" as const };
  if (value === "selesai") return { label: "Selesai", tone: "green" as const };
  if (value === "dibatalkan") return { label: "Dibatalkan", tone: "red" as const };
  return { label: String(status || "-"), tone: "neutral" as const };
};

const consultationStatusLabel = (status: ConsultationStatus) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "baru") return { label: "Baru", tone: "amber" as const };
  if (value === "dibalas") return { label: "Dibalas", tone: "green" as const };
  if (value === "ditutup") return { label: "Ditutup", tone: "neutral" as const };
  return { label: String(status || "-"), tone: "neutral" as const };
};

const bankAccountVisibilityLabel = (isVisible: boolean) => {
  if (isVisible) return { label: "Tampil", tone: "green" as const };
  return { label: "Disembunyikan", tone: "neutral" as const };
};

const getUserRoleLabel = (user: User) => {
  const roles = Array.isArray(user.roles) ? user.roles : [];
  const roleNames = roles.map((r) => String(r?.name ?? "").trim()).filter(Boolean);
  if (roleNames.length) return roleNames.join(", ");
  const label = String(user.role_label ?? "").trim();
  return label || "-";
};

const toneStyles: Record<Tone, { border: string; icon: string; ring: string }> = {
  slate: {
    border: "border-l-slate-200",
    icon: "border-slate-200 bg-white text-slate-700",
    ring: "ring-slate-200",
  },
  primary: {
    border: "border-l-primary-300",
    icon: "border-primary-100 bg-primary-50 text-primary-700",
    ring: "ring-primary-100",
  },
  green: {
    border: "border-l-brandGreen-300",
    icon: "border-brandGreen-100 bg-brandGreen-50 text-brandGreen-700",
    ring: "ring-brandGreen-100",
  },
  sky: {
    border: "border-l-sky-300",
    icon: "border-sky-100 bg-sky-50 text-sky-700",
    ring: "ring-sky-100",
  },
  amber: {
    border: "border-l-amber-300",
    icon: "border-amber-100 bg-amber-50 text-amber-700",
    ring: "ring-amber-100",
  },
  red: {
    border: "border-l-red-300",
    icon: "border-red-100 bg-red-50 text-red-700",
    ring: "ring-red-100",
  },
};

function ResultRow({
  title,
  subtitle,
  metaLeft,
  metaRight,
  imageUrl,
  icon,
  tone = "slate",
  onClick,
}: {
  title: string;
  subtitle?: string | null;
  metaLeft?: React.ReactNode;
  metaRight?: React.ReactNode;
  imageUrl?: string | null;
  icon?: IconProp;
  tone?: Tone;
  onClick: () => void;
}) {
  const toneClass = toneStyles[tone] ?? toneStyles.slate;
  const showIcon = Boolean(icon);

  return (
    <button type="button" onClick={onClick} className="group w-full text-left">
      <div
        className={[
          "flex items-start gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:bg-slate-50",
          "border-l-4",
          toneClass.border,
        ].join(" ")}
      >
        <div
          className={[
            "h-12 w-12 shrink-0 overflow-hidden rounded-2xl ring-1",
            showIcon ? "flex items-center justify-center border" : "bg-slate-100",
            showIcon ? toneClass.icon : toneClass.ring,
          ].join(" ")}
        >
          {showIcon ? (
            <FontAwesomeIcon icon={icon as IconProp} className="text-sm" />
          ) : (
            <img
              src={imageUrl ?? imagePlaceholder}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-bold text-slate-900">{title}</p>
          {subtitle ? <p className="mt-1 line-clamp-2 text-xs text-slate-600">{subtitle}</p> : null}
          {(metaLeft || metaRight) && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600">
              <div className="flex flex-wrap items-center gap-2">{metaLeft}</div>
              {metaRight ? <div className="shrink-0">{metaRight}</div> : null}
            </div>
          )}
        </div>

        <span
          className={[
            "mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition",
            "group-hover:opacity-90",
            toneClass.icon,
          ].join(" ")}
        >
          <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
        </span>
      </div>
    </button>
  );
}

function SectionCard({
  category,
  title,
  description,
  count,
  icon,
  tone,
  children,
}: {
  category: string;
  title: string;
  description: string;
  count: number;
  icon: IconProp;
  tone: Tone;
  children: React.ReactNode;
}) {
  const toneClass = toneStyles[tone] ?? toneStyles.slate;
  return (
    <div className={["rounded-[28px] border border-slate-200 border-l-4 bg-white p-6 shadow-sm", toneClass.border].join(" ")}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{category}</p>
          <h2 className="mt-2 flex items-center gap-2 font-heading text-xl font-semibold text-slate-900">
            <span className={["flex h-9 w-9 items-center justify-center rounded-2xl border", toneClass.icon].join(" ")}>
              <FontAwesomeIcon icon={icon} className="text-sm" />
            </span>
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
        <span className={["inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1", sectionBadgeTone(tone)].join(" ")}>
          {count} hasil
        </span>
      </div>

      <div className="mt-5 space-y-3">{children}</div>
    </div>
  );
}

function LoadingList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm animate-pulse">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-100" />
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-2/3 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{message}</div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
      {message}
    </div>
  );
}

const headerCopy: Record<SearchRole, { title: string; description: string; tagTone: Tone }> = {
  editor: {
    title: "Hasil pencarian",
    description: "Menampilkan hasil dari artikel, program, mitra, dan struktur organisasi.",
    tagTone: "primary",
  },
  admin: {
    title: "Pencarian Admin",
    description:
      "Temukan donasi, konfirmasi donasi, tugas editor, jemput wakaf, konsultasi, dan rekening. Gunakan kolom pencarian di bilah atas untuk mengganti kata kunci.",
    tagTone: "primary",
  },
  superadmin: {
    title: "Cari data SuperAdmin",
    description: "Temukan pengguna dan peran. Gunakan kolom pencarian di bilah atas untuk mengganti kata kunci.",
    tagTone: "green",
  },
};

const renderSectionContent = <T,>(
  state: LoadState<T>,
  emptyLabel: string,
  renderItem: (item: T) => React.ReactNode
) => {
  if (state.loading) return <LoadingList />;
  if (state.error) return <ErrorState message={state.error} />;
  if (!state.data.length) return <EmptyState message={emptyLabel} />;
  return state.data.map(renderItem);
};

export function SearchPage({ role }: { role: SearchRole }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = useMemo(() => (params.get("q") ?? "").trim(), [params]);
  const [searchLimit, setSearchLimit] = useState(() => readSearchLimit());

  const [articlesState, setArticlesState] = useState<LoadState<Article>>(() => createInitialState());
  const [programsState, setProgramsState] = useState<LoadState<Program>>(() => createInitialState());
  const [partnersState, setPartnersState] = useState<LoadState<Partner>>(() => createInitialState());
  const [membersState, setMembersState] = useState<LoadState<OrganizationMember>>(() => createInitialState());
  const [donationsState, setDonationsState] = useState<LoadState<Donation>>(() => createInitialState());
  const [donationConfirmationsState, setDonationConfirmationsState] = useState<LoadState<Donation>>(() =>
    createInitialState()
  );
  const [editorTasksState, setEditorTasksState] = useState<LoadState<EditorTask>>(() => createInitialState());
  const [pickupRequestsState, setPickupRequestsState] = useState<LoadState<PickupRequest>>(() => createInitialState());
  const [consultationsState, setConsultationsState] = useState<LoadState<Consultation>>(() =>
    createInitialState()
  );
  const [bankAccountsState, setBankAccountsState] = useState<LoadState<BankAccount>>(() => createInitialState());
  const [usersState, setUsersState] = useState<LoadState<User>>(() => createInitialState());

  useEffect(() => {
    const onSync = () => setSearchLimit(readSearchLimit());
    window.addEventListener(SETTINGS_EVENT, onSync);
    window.addEventListener("storage", onSync);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, onSync);
      window.removeEventListener("storage", onSync);
    };
  }, []);

  useEffect(() => {
    const resetAll = () => {
      setArticlesState(createInitialState());
      setProgramsState(createInitialState());
      setPartnersState(createInitialState());
      setMembersState(createInitialState());
      setDonationsState(createInitialState());
      setDonationConfirmationsState(createInitialState());
      setEditorTasksState(createInitialState());
      setPickupRequestsState(createInitialState());
      setConsultationsState(createInitialState());
      setBankAccountsState(createInitialState());
      setUsersState(createInitialState());
    };

    if (!q) {
      resetAll();
      return;
    }

    let active = true;
    const term = q;
    const limit = searchLimit;
    const apiBase = `/${role}`;

    const loadArticles = async () => {
      setArticlesState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<Article>>(`${apiBase}/articles`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setArticlesState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setArticlesState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil artikel." });
      }
    };

    const loadPrograms = async () => {
      setProgramsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<Program>>(`${apiBase}/programs`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setProgramsState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setProgramsState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil program." });
      }
    };

    const loadPartners = async () => {
      setPartnersState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<Partner[]>(`${apiBase}/partners`);
        if (!active) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const lower = term.toLowerCase();
        const filtered = list
          .filter((p) => {
            return (
              String(p.name ?? "").toLowerCase().includes(lower) ||
              String(p.url ?? "").toLowerCase().includes(lower)
            );
          })
          .sort((a, b) => (Number(a.order ?? 0) || 0) - (Number(b.order ?? 0) || 0));
        setPartnersState({
          data: filtered.slice(0, limit),
          total: filtered.length,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setPartnersState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil mitra." });
      }
    };

    const loadMembers = async () => {
      setMembersState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<OrganizationMember>>(`${apiBase}/organization-members`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setMembersState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setMembersState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil struktur." });
      }
    };

    const loadDonations = async () => {
      setDonationsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<Donation>>(`${apiBase}/donations`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setDonationsState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setDonationsState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil donasi." });
      }
    };

    const loadDonationConfirmations = async () => {
      setDonationConfirmationsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<Donation>>(`${apiBase}/donations`, {
          params: { q: term, page: 1, per_page: limit, payment_source: "manual" },
        });
        if (!active) return;
        setDonationConfirmationsState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setDonationConfirmationsState({
          data: [],
          total: 0,
          loading: false,
          error: "Gagal memuat hasil konfirmasi donasi.",
        });
      }
    };

    const loadEditorTasks = async () => {
      setEditorTasksState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<EditorTask>>(`${apiBase}/editor-tasks`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setEditorTasksState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setEditorTasksState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil tugas editor." });
      }
    };

    const loadPickupRequests = async () => {
      setPickupRequestsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<PickupRequest>>(`${apiBase}/pickup-requests`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setPickupRequestsState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setPickupRequestsState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil jemput wakaf." });
      }
    };

    const loadConsultations = async () => {
      setConsultationsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<Consultation>>(`${apiBase}/consultations`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setConsultationsState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setConsultationsState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil konsultasi." });
      }
    };

    const loadBankAccounts = async () => {
      setBankAccountsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<BankAccount[]>(`${apiBase}/bank-accounts`);
        if (!active) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const lower = term.toLowerCase();
        const filtered = list
          .filter((acc) => {
            const bank = String(acc.bank_name ?? "").toLowerCase();
            const number = String(acc.account_number ?? "").toLowerCase();
            const name = String(acc.account_name ?? "").toLowerCase();
            return bank.includes(lower) || number.includes(lower) || name.includes(lower);
          })
          .sort((a, b) => (Number(a.order ?? 0) || 0) - (Number(b.order ?? 0) || 0));
        setBankAccountsState({
          data: filtered.slice(0, limit),
          total: filtered.length,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setBankAccountsState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil rekening." });
      }
    };

    const loadUsers = async () => {
      setUsersState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await http.get<PaginationPayload<User>>(`${apiBase}/users`, {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setUsersState({
          data: res.data?.data ?? [],
          total: res.data?.total ?? 0,
          loading: false,
          error: null,
        });
      } catch {
        if (!active) return;
        setUsersState({ data: [], total: 0, loading: false, error: "Gagal memuat hasil pengguna." });
      }
    };

    if (role === "admin") {
      void loadDonations();
      void loadDonationConfirmations();
      void loadEditorTasks();
      void loadPickupRequests();
      void loadConsultations();
      void loadBankAccounts();
    }

    if (role === "editor") {
      void loadArticles();
      void loadPrograms();
      void loadPartners();
      void loadMembers();
    }

    if (role === "superadmin") {
      void loadUsers();
    }

    return () => {
      active = false;
    };
  }, [q, role, searchLimit]);

  const totalResults = useMemo(() => {
    if (role === "admin") {
      return (
        donationsState.total +
        donationConfirmationsState.total +
        editorTasksState.total +
        pickupRequestsState.total +
        consultationsState.total +
        bankAccountsState.total
      );
    }
    if (role === "superadmin") {
      return usersState.total;
    }
    return articlesState.total + programsState.total + partnersState.total + membersState.total;
  }, [
    role,
    donationsState.total,
    donationConfirmationsState.total,
    editorTasksState.total,
    pickupRequestsState.total,
    consultationsState.total,
    bankAccountsState.total,
    articlesState.total,
    programsState.total,
    partnersState.total,
    membersState.total,
    usersState.total,
  ]);

  const header = headerCopy[role];
  const tagToneClass = sectionBadgeTone(header.tagTone);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 border-l-4 border-brandGreen-400 bg-white p-6 shadow-sm sm:p-8">
        <div className="min-w-0">
          <span className={["inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ring-1", tagToneClass].join(" ")}>
            Pencarian
          </span>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">{header.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{header.description}</p>

          {q ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-primary-700 ring-1 ring-primary-100">
                Kata kunci: <span className="ml-1 font-bold text-slate-900">{q}</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-brandGreen-700 ring-1 ring-brandGreen-100">
                Total hasil: <span className="ml-1 font-bold">{totalResults}</span>
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {!q ? (
        <div className="rounded-[28px] border border-dashed border-brandGreen-200 bg-brandGreen-50 p-8 text-center text-sm font-semibold text-slate-700">
          Ketik kata kunci di kolom pencarian pada top bar untuk menampilkan hasil.
        </div>
      ) : (
        <div className={role === "superadmin" ? "grid gap-6" : "grid gap-6 lg:grid-cols-2"}>
          {role === "admin" ? (
            <>
              <SectionCard
                category="Operasional"
                title="Donasi"
                description="Hasil paling relevan dari data donasi."
                count={donationsState.total}
                icon={faReceipt}
                tone="red"
              >
                {renderSectionContent(donationsState, "Tidak ada donasi yang cocok.", (item) => {
                  const code = String(item.donation_code ?? "").trim() || `#${item.id}`;
                  const donor = String(item.donor_name ?? "").trim() || "Anonim";
                  const programTitle = String(item.program?.title ?? "").trim() || "Tanpa program";
                  const status = donationStatusLabel(String(item.status ?? ""));
                  const when = item.paid_at ?? item.created_at;
                  const meta = [
                    <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
                      {status.label}
                    </span>,
                    <span key="amount" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                      {formatCurrency(item.amount)}
                    </span>,
                  ];
                  return (
                    <ResultRow
                      key={item.id}
                      title={code}
                      subtitle={`${donor} - ${programTitle}`}
                      icon={faReceipt}
                      tone="red"
                      metaLeft={meta}
                      metaRight={<span className="text-[11px] font-semibold text-slate-500">Diperbarui: {formatDate(when)}</span>}
                      onClick={() => navigate(`/admin/donations/${item.id}`)}
                    />
                  );
                })}
              </SectionCard>

              <SectionCard
                category="Operasional"
                title="Konfirmasi Donasi"
                description="Transfer manual yang membutuhkan verifikasi."
                count={donationConfirmationsState.total}
                icon={faClipboardCheck}
                tone="amber"
              >
                {renderSectionContent(donationConfirmationsState, "Tidak ada konfirmasi donasi yang cocok.", (item) => {
                  const code = String(item.donation_code ?? "").trim() || `#${item.id}`;
                  const donor = String(item.donor_name ?? "").trim() || "Anonim";
                  const status = donationStatusLabel(String(item.status ?? ""));
                  const when = item.paid_at ?? item.created_at;
                  const meta = [
                    <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
                      {status.label}
                    </span>,
                    <span key="amount" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                      {formatCurrency(item.amount)}
                    </span>,
                    <span key="manual" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                      Manual
                    </span>,
                  ];
                  return (
                    <ResultRow
                      key={item.id}
                      title={code}
                      subtitle={`Transfer manual - ${donor}`}
                      icon={faClipboardCheck}
                      tone="amber"
                      metaLeft={meta}
                      metaRight={<span className="text-[11px] font-semibold text-slate-500">Dikirim: {formatDate(when)}</span>}
                      onClick={() => navigate(`/admin/donations/${item.id}`)}
                    />
                  );
                })}
              </SectionCard>

              <SectionCard
                category="Operasional"
                title="Tugas Editor"
                description="Instruksi dan lampiran untuk editor."
                count={editorTasksState.total}
                icon={faListCheck}
                tone="primary"
              >
                {renderSectionContent(editorTasksState, "Tidak ada tugas editor yang cocok.", (item) => {
                  const status = editorTaskStatusLabel(String(item.status ?? ""));
                  const meta = [
                    <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
                      {status.label}
                    </span>,
                    <span key="priority" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                      Prioritas: {editorTaskPriorityLabel(String(item.priority ?? ""))}
                    </span>,
                    <span key="due" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                      Tenggat: {formatDateTime(item.due_at)}
                    </span>,
                  ];
                  return (
                    <ResultRow
                      key={item.id}
                      title={item.title ?? "Tugas tanpa judul"}
                      subtitle={item.description}
                      icon={faListCheck}
                      tone="primary"
                      metaLeft={meta}
                      metaRight={
                        <span className="text-[11px] font-semibold text-slate-500">
                          Editor: {item.assignee?.name ?? "Semua Editor"}
                        </span>
                      }
                      onClick={() => navigate(`/admin/editor-tasks`)}
                    />
                  );
                })}
              </SectionCard>

              <SectionCard
                category="Operasional"
                title="Jemput Wakaf"
                description="Permintaan jemput wakaf terbaru."
                count={pickupRequestsState.total}
                icon={faTruckRampBox}
                tone="green"
              >
                {renderSectionContent(pickupRequestsState, "Tidak ada permintaan jemput yang cocok.", (item) => {
                  const status = pickupStatusLabel(String(item.status ?? ""));
                  const location = [item.city, item.district].filter(Boolean).join(", ");
                  const meta = [
                    <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
                      {status.label}
                    </span>,
                    <span key="type" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                      Jenis: {item.wakaf_type ?? "-"}
                    </span>,
                    <span key="phone" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                      Kontak: {item.donor_phone ?? "-"}
                    </span>,
                  ];
                  return (
                    <ResultRow
                      key={item.id}
                      title={item.donor_name ?? "Pemohon"}
                      subtitle={location || null}
                      icon={faTruckRampBox}
                      tone="green"
                      metaLeft={meta}
                      metaRight={<span className="text-[11px] font-semibold text-slate-500">Dibuat: {formatDateTime(item.created_at)}</span>}
                      onClick={() => navigate(`/admin/pickup-requests/${item.id}`)}
                    />
                  );
                })}
              </SectionCard>

              <SectionCard
                category="Operasional"
                title="Konsultasi"
                description="Pertanyaan dan tindak lanjut konsultasi."
                count={consultationsState.total}
                icon={faHeadset}
                tone="sky"
              >
                {renderSectionContent(consultationsState, "Tidak ada konsultasi yang cocok.", (item) => {
                  const status = consultationStatusLabel(String(item.status ?? ""));
                  const contact = item.phone ?? item.email ?? "-";
                  const meta = [
                    <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
                      {status.label}
                    </span>,
                    <span key="contact" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                      Kontak: {contact}
                    </span>,
                  ];
                  return (
                    <ResultRow
                      key={item.id}
                      title={item.name ?? "Pemohon"}
                      subtitle={item.topic ?? item.message ?? null}
                      icon={faHeadset}
                      tone="sky"
                      metaLeft={meta}
                      metaRight={<span className="text-[11px] font-semibold text-slate-500">Dibuat: {formatDateTime(item.created_at)}</span>}
                      onClick={() => navigate(`/admin/consultations/${item.id}`)}
                    />
                  );
                })}
              </SectionCard>

              <SectionCard
                category="Keuangan"
                title="Rekening"
                description="Rekening resmi yang tampil di halaman donasi."
                count={bankAccountsState.total}
                icon={faBuildingColumns}
                tone="primary"
              >
                {renderSectionContent(bankAccountsState, "Tidak ada rekening yang cocok.", (item) => {
                  const visibility = bankAccountVisibilityLabel(Boolean(item.is_visible_public));
                  const meta = [
                    <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(visibility.tone)}`}>
                      {visibility.label}
                    </span>,
                    <span key="order" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                      Urutan: #{item.order ?? 0}
                    </span>,
                  ];
                  return (
                    <ResultRow
                      key={item.id}
                      title={item.bank_name}
                      subtitle={`${item.account_number} - ${item.account_name}`}
                      icon={faBuildingColumns}
                      tone="primary"
                      metaLeft={meta}
                      metaRight={
                        <span className="text-[11px] font-semibold text-slate-500">
                          Diperbarui: {formatDate(item.updated_at ?? item.created_at)}
                        </span>
                      }
                      onClick={() => navigate(`/admin/bank-accounts/${item.id}/edit`)}
                    />
                  );
                })}
              </SectionCard>
            </>
          ) : null}
          {role === "editor" ? (
            <>
              <SectionCard
                category="Konten"
                title="Artikel"
                description="Hasil paling relevan dari data artikel."
                count={articlesState.total}
                icon={faBookOpen}
                tone="primary"
              >
                {renderSectionContent(articlesState, "Tidak ada artikel yang cocok.", (item) => {
                  const status = articleStatusLabel(String(item.status ?? ""));
                  const meta = [
                    <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
                      {status.label}
                    </span>,
                    item.category ? (
                      <span key="category" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                        {item.category}
                      </span>
                    ) : null,
                  ].filter(Boolean);

                  const imageUrl = resolveStorageUrl(item.thumbnail_path) ?? imagePlaceholder;
                  return (
                    <ResultRow
                      key={item.id}
                      title={item.title}
                      subtitle={item.excerpt}
                      imageUrl={imageUrl}
                      metaLeft={meta}
                      metaRight={<span className="text-[11px] font-semibold text-slate-500">Diperbarui: {formatDate(item.updated_at ?? item.created_at)}</span>}
                      tone="primary"
                      onClick={() => navigate(`/editor/articles/${item.id}/edit`)}
                    />
                  );
                })}
              </SectionCard>

              <SectionCard
                category="Konten"
                title="Program"
                description="Hasil paling relevan dari data program."
                count={programsState.total}
                icon={faHeart}
                tone="green"
              >
                {renderSectionContent(programsState, "Tidak ada program yang cocok.", (item) => {
                  const status = programStatusLabel(String(item.status ?? ""));
                  const meta = [
                    <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(status.tone)}`}>
                      {status.label}
                    </span>,
                    item.category ? (
                      <span key="category" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                        {item.category}
                      </span>
                    ) : null,
                  ].filter(Boolean);

                  const imageUrl = resolveStorageUrl(item.thumbnail_path) ?? imagePlaceholder;
                  return (
                    <ResultRow
                      key={item.id}
                      title={item.title}
                      subtitle={item.short_description}
                      imageUrl={imageUrl}
                      metaLeft={meta}
                      metaRight={<span className="text-[11px] font-semibold text-slate-500">Diperbarui: {formatDate(item.updated_at ?? item.created_at)}</span>}
                      tone="green"
                      onClick={() => navigate(`/editor/programs/${item.id}/edit`)}
                    />
                  );
                })}
              </SectionCard>

              <SectionCard
                category="Organisasi"
                title="Mitra"
                description="Hasil paling relevan dari data mitra."
                count={partnersState.total}
                icon={faHandshake}
                tone="sky"
              >
                {renderSectionContent(partnersState, "Tidak ada mitra yang cocok.", (item) => {
                  const active = Boolean(item.is_active);
                  const meta = [
                    <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(active ? "green" : "red")}`}>
                      {active ? "Aktif" : "Nonaktif"}
                    </span>,
                    item.url ? (
                      <span key="url" className="inline-flex max-w-[14rem] items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 truncate">
                        {String(item.url).replace(/^https?:\/\//, "")}
                      </span>
                    ) : null,
                  ].filter(Boolean);

                  const imageUrl = resolveStorageUrl(item.logo_path) ?? imagePlaceholder;
                  return (
                    <ResultRow
                      key={item.id}
                      title={item.name}
                      subtitle={null}
                      imageUrl={imageUrl}
                      metaLeft={meta}
                      tone="sky"
                      onClick={() => navigate(`/editor/partners/${item.id}/edit`)}
                    />
                  );
                })}
              </SectionCard>

              <SectionCard
                category="Organisasi"
                title="Struktur"
                description="Hasil paling relevan dari data struktur."
                count={membersState.total}
                icon={faSitemap}
                tone="amber"
              >
                {renderSectionContent(membersState, "Tidak ada anggota struktur yang cocok.", (item) => {
                  const active = Boolean(item.is_active);
                  const meta = [
                    <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(active ? "green" : "red")}`}>
                      {active ? "Aktif" : "Nonaktif"}
                    </span>,
                    <span key="group" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                      {item.group}
                    </span>,
                  ];

                  const imageUrl = resolveStorageUrl(item.photo_path) ?? imagePlaceholder;
                  return (
                    <ResultRow
                      key={item.id}
                      title={item.name}
                      subtitle={item.position_title}
                      imageUrl={imageUrl}
                      metaLeft={meta}
                      metaRight={<span className="text-[11px] font-semibold text-slate-500">Diperbarui: {formatDate(item.updated_at ?? item.created_at)}</span>}
                      tone="amber"
                      onClick={() => navigate(`/editor/organization-members/${item.id}`)}
                    />
                  );
                })}
              </SectionCard>
            </>
          ) : null}

          {role === "superadmin" ? (
            <SectionCard
              category="Akses"
              title="Pengguna"
              description="Hasil paling relevan dari data pengguna."
              count={usersState.total}
              icon={faUsers}
              tone="green"
            >
              {renderSectionContent(usersState, "Tidak ada pengguna yang cocok.", (item) => {
                const meta = [
                  <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(item.is_active ? "green" : "neutral")}`}>
                    {item.is_active ? "Aktif" : "Nonaktif"}
                  </span>,
                  <span key="role" className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                    {getUserRoleLabel(item)}
                  </span>,
                ];

                return (
                  <ResultRow
                    key={item.id}
                    title={item.name}
                    subtitle={item.email}
                    icon={faUsers}
                    metaLeft={meta}
                    metaRight={<span className="text-[11px] font-semibold text-slate-500">Dibuat: {formatDate(item.created_at)}</span>}
                    tone="green"
                    onClick={() => navigate(`/superadmin/users/${item.id}/edit`)}
                  />
                );
              })}
            </SectionCard>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default SearchPage;

