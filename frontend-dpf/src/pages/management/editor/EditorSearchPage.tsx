import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faHeart,
  faHandshake,
  faPenToSquare,
  faSitemap,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import http from "../../../lib/http";
import imagePlaceholder from "../../../brand/assets/image-placeholder.jpg";
import { readSearchLimit, SETTINGS_EVENT } from "../../../lib/settings";

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

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
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

const badgeTone = (tone: "neutral" | "green" | "amber") => {
  if (tone === "green") return "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100";
  if (tone === "amber") return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

const articleStatusLabel = (status: string) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "published") return { label: "Terbit", tone: "green" as const };
  if (value === "review") return { label: "Menunggu peninjauan", tone: "amber" as const };
  return { label: "Draf", tone: "neutral" as const };
};

const programStatusLabel = (status: string) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "active") return { label: "Aktif", tone: "green" as const };
  if (value === "completed") return { label: "Selesai", tone: "neutral" as const };
  if (value === "archived") return { label: "Arsip", tone: "neutral" as const };
  return { label: "Segera", tone: "amber" as const };
};

function ResultRow({
  title,
  subtitle,
  metaLeft,
  metaRight,
  imageUrl,
  onClick,
}: {
  title: string;
  subtitle?: string | null;
  metaLeft?: React.ReactNode;
  metaRight?: React.ReactNode;
  imageUrl?: string | null;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="group w-full text-left">
      <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm transition hover:bg-slate-50">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
          <img
            src={imageUrl ?? imagePlaceholder}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{title}</p>
          {subtitle ? <p className="mt-1 line-clamp-2 text-xs text-slate-600">{subtitle}</p> : null}
          {(metaLeft || metaRight) && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600">
              <div className="flex flex-wrap items-center gap-2">{metaLeft}</div>
              {metaRight ? <div className="shrink-0">{metaRight}</div> : null}
            </div>
          )}
        </div>

        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition group-hover:bg-slate-50">
          <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
        </span>
      </div>
    </button>
  );
}

export function EditorSearchPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = useMemo(() => (params.get("q") ?? "").trim(), [params]);
  const [searchLimit, setSearchLimit] = useState(() => readSearchLimit());

  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesTotal, setArticlesTotal] = useState(0);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsTotal, setProgramsTotal] = useState(0);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [programsError, setProgramsError] = useState<string | null>(null);

  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersTotal, setPartnersTotal] = useState(0);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnersError, setPartnersError] = useState<string | null>(null);

  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

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
    if (!q) {
      setArticles([]);
      setArticlesTotal(0);
      setPrograms([]);
      setProgramsTotal(0);
      setPartners([]);
      setPartnersTotal(0);
      setMembers([]);
      setMembersTotal(0);
      return;
    }

    let active = true;
    const term = q;
    const limit = searchLimit;

    const loadArticles = async () => {
      setArticlesLoading(true);
      setArticlesError(null);
      try {
        const res = await http.get<PaginationPayload<Article>>("/editor/articles", {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setArticles(res.data?.data ?? []);
        setArticlesTotal(res.data?.total ?? 0);
      } catch {
        if (!active) return;
        setArticles([]);
        setArticlesTotal(0);
        setArticlesError("Gagal memuat hasil artikel.");
      } finally {
        active && setArticlesLoading(false);
      }
    };

    const loadPrograms = async () => {
      setProgramsLoading(true);
      setProgramsError(null);
      try {
        const res = await http.get<PaginationPayload<Program>>("/editor/programs", {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setPrograms(res.data?.data ?? []);
        setProgramsTotal(res.data?.total ?? 0);
      } catch {
        if (!active) return;
        setPrograms([]);
        setProgramsTotal(0);
        setProgramsError("Gagal memuat hasil program.");
      } finally {
        active && setProgramsLoading(false);
      }
    };

    const loadMembers = async () => {
      setMembersLoading(true);
      setMembersError(null);
      try {
        const res = await http.get<PaginationPayload<OrganizationMember>>("/editor/organization-members", {
          params: { q: term, page: 1, per_page: limit },
        });
        if (!active) return;
        setMembers(res.data?.data ?? []);
        setMembersTotal(res.data?.total ?? 0);
      } catch {
        if (!active) return;
        setMembers([]);
        setMembersTotal(0);
        setMembersError("Gagal memuat hasil struktur.");
      } finally {
        active && setMembersLoading(false);
      }
    };

    const loadPartners = async () => {
      setPartnersLoading(true);
      setPartnersError(null);
      try {
        const res = await http.get<Partner[]>("/editor/partners");
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
        setPartners(filtered.slice(0, limit));
        setPartnersTotal(filtered.length);
      } catch {
        if (!active) return;
        setPartners([]);
        setPartnersTotal(0);
        setPartnersError("Gagal memuat hasil mitra.");
      } finally {
        active && setPartnersLoading(false);
      }
    };

    void loadArticles();
    void loadPrograms();
    void loadPartners();
    void loadMembers();

    return () => {
      active = false;
    };
  }, [q, searchLimit]);

  const totalResults = useMemo(() => {
    return articlesTotal + programsTotal + partnersTotal + membersTotal;
  }, [articlesTotal, membersTotal, partnersTotal, programsTotal]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-700 ring-1 ring-primary-100">
              Pencarian
            </span>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">Cari data</h1>  

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
      </div>

      {!q ? (
        <div className="rounded-[28px] border border-dashed border-primary-100 bg-primary-50 p-8 text-center text-sm font-semibold text-slate-700">
          Ketik kata kunci di kolom pencarian pada top bar untuk menampilkan hasil.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Konten</p>
                <h2 className="mt-2 flex items-center gap-2 font-heading text-xl font-semibold text-slate-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-600 text-white">
                    <FontAwesomeIcon icon={faBookOpen} className="text-sm" />
                  </span>
                  Artikel
                </h2>
                <p className="mt-2 text-sm text-slate-600">Hasil paling relevan dari data artikel.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                {articlesTotal} hasil
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {articlesLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
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
                ))
              ) : articlesError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{articlesError}</div>
              ) : articles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
                  Tidak ada artikel yang cocok.
                </div>
              ) : (
                articles.map((item) => {
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
                      onClick={() => navigate(`/editor/articles/${item.id}/edit`)}
                    />
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Konten</p>
                <h2 className="mt-2 flex items-center gap-2 font-heading text-xl font-semibold text-slate-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brandGreen-600 text-white">
                    <FontAwesomeIcon icon={faHeart} className="text-sm" />
                  </span>
                  Program
                </h2>
                <p className="mt-2 text-sm text-slate-600">Hasil paling relevan dari data program.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                {programsTotal} hasil
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {programsLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
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
                ))
              ) : programsError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{programsError}</div>
              ) : programs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
                  Tidak ada program yang cocok.
                </div>
              ) : (
                programs.map((item) => {
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
                      onClick={() => navigate(`/editor/programs/${item.id}/edit`)}
                    />
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Organisasi</p>
                <h2 className="mt-2 flex items-center gap-2 font-heading text-xl font-semibold text-slate-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-600 text-white">
                    <FontAwesomeIcon icon={faHandshake} className="text-sm" />
                  </span>
                  Mitra
                </h2>
                <p className="mt-2 text-sm text-slate-600">Hasil paling relevan dari data mitra.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                {partnersTotal} hasil
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {partnersLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
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
                ))
              ) : partnersError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{partnersError}</div>
              ) : partners.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
                  Tidak ada mitra yang cocok.
                </div>
              ) : (
                partners.map((item) => {
                  const active = Boolean(item.is_active);
                  const meta = [
                    <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(active ? "green" : "neutral")}`}>
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
                      onClick={() => navigate(`/editor/partners/${item.id}/edit`)}
                    />
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Organisasi</p>
                <h2 className="mt-2 flex items-center gap-2 font-heading text-xl font-semibold text-slate-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brandGreen-600 text-white">
                    <FontAwesomeIcon icon={faSitemap} className="text-sm" />
                  </span>
                  Struktur
                </h2>
                <p className="mt-2 text-sm text-slate-600">Hasil paling relevan dari data struktur.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                {membersTotal} hasil
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {membersLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
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
                ))
              ) : membersError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{membersError}</div>
              ) : members.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
                  Tidak ada anggota struktur yang cocok.
                </div>
              ) : (
                members.map((item) => {
                  const active = Boolean(item.is_active);
                  const meta = [
                    <span key="status" className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${badgeTone(active ? "green" : "neutral")}`}>
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
                      onClick={() => navigate(`/editor/organization-members/${item.id}`)}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorSearchPage;



