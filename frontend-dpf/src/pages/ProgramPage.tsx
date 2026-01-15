import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandHoldingHeart,
  faMagnifyingGlass,
  faXmark,
  faSliders,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { Link, useSearchParams } from "react-router-dom";
import { LandingLayout } from "../layouts/LandingLayout";
import http from "../lib/http";
import { resolveStorageBaseUrl } from "../lib/urls";
import imagePlaceholder from "../brand/assets/image-placeholder.jpg";
import donasiUmumImage from "../brand/assets/Donasi-umum.png";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";
import { useSearchHighlight } from "../lib/highlight";

/* --- Types & Utils --- */

type Program = {
  id: number;
  slug: string;
  title: string;
  title_en?: string | null;
  short_description: string;
  short_description_en?: string | null;
  thumbnail_path: string | null;
  program_images?: string[] | null;
  target_amount: number | string;
  collected_amount: number | string;
  status: string;
  category?: string | null;
  category_en?: string | null;
  deadline_days?: number | string | null;
  published_at?: string | null;
  created_at?: string | null;
};

const pickLocale = (idVal?: string | null, enVal?: string | null, locale: "id" | "en" = "id") => {
  const idText = (idVal ?? "").trim();
  const enText = (enVal ?? "").trim();
  if (locale === "en") return enText || idText;
  return idText || enText;
};

const formatCurrency = (value: number | string | undefined, locale: "id" | "en") =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Number(value ?? 0));

const getImageUrl = (path?: string | null) => {
  if (!path) return imagePlaceholder;
  if (path.startsWith("http")) return path;
  const base = resolveStorageBaseUrl();
  return `${base}/${path}`;
};

const getProgress = (collected: number | string | undefined, target: number | string | undefined) => {
  const safeTarget = Math.max(Number(target ?? 0), 1);
  const value = Math.round((Number(collected ?? 0) / safeTarget) * 100);
  return Number.isNaN(value) ? 0 : value;
};

const canonicalStatus = (status?: string | null) => {
  const raw = String(status ?? "").trim();
  const s = raw.toLowerCase();
  if (s === "active" || s === "berjalan") return "active";
  if (s === "completed" || s === "selesai" || s === "archived" || s === "arsip") return "completed";
  if (s === "draft" || s === "upcoming" || s === "segera") return "draft";
  return "other";
};

const getProgramStatusTone = (status?: string | null) => {
  const s = canonicalStatus(status);
  if (s === "active") return "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100";
  if (s === "draft") return "bg-amber-50 text-amber-700 ring-amber-100";
  if (s === "completed") return "bg-blue-50 text-blue-700 ring-blue-100";
  return "bg-slate-50 text-slate-700 ring-slate-200";
};

const getStatusLabel = (status?: string | null, t?: (key: string, fallback?: string) => string) => {
  const translateFn = t ?? ((key: string, fallback?: string) => translateLanding(landingDict, "id", key, fallback));
  const s = canonicalStatus(status);
  if (s === "active") return translateFn("landing.programs.status.ongoing");
  if (s === "completed") return translateFn("landing.programs.status.completed");
  if (s === "draft") return translateFn("landing.programs.status.upcoming");
  return translateFn("landing.common.na");
};

/* --- Main Page --- */

export function ProgramPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<"fetch_failed" | null>(null);
  const [searchParams] = useSearchParams();
  const initialSearch = (searchParams.get("q") ?? "").trim();
  const pageRef = useRef<HTMLDivElement | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false); // Mobile toggle filter

  // Data fetching
  useEffect(() => {
    let active = true;
    setLoading(true);
    http
      .get<{ data: Program[] }>("/programs")
      .then((res) => {
        if (!active) return;
        setPrograms(res.data?.data ?? []);
        setErrorKey(null);
      })
      .catch(() => {
        if (!active) return;
        setErrorKey("fetch_failed");
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, []);

  useEffect(() => {
    setSearch((searchParams.get("q") ?? "").trim());
  }, [searchParams]);

  useSearchHighlight(pageRef, { autoClearMs: 6000 });

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);

  const localizedPrograms = useMemo(() => {
    const filtered = programs.filter((p) => {
      const status = String(p.status ?? "").trim().toLowerCase();
      return status !== "draft" && status !== "segera";
    });

    const sorted = [...filtered].sort((a, b) => {
      const aDate = new Date(a.published_at ?? a.created_at ?? 0).getTime();
      const bDate = new Date(b.published_at ?? b.created_at ?? 0).getTime();
      return bDate - aDate;
    });

    return sorted.map((p) => ({
      ...p,
      title: pickLocale(p.title, p.title_en, locale),
      short_description: pickLocale(p.short_description, p.short_description_en, locale),
      category: pickLocale(p.category, p.category_en, locale) || t("landing.programs.defaultCategory"),
    }));
  }, [programs, locale, t]);

  // Compute Categories from Data
  const categories = useMemo(() => {
    const set = new Set<string>();
    localizedPrograms.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [localizedPrograms]);

  const statusOptions = useMemo(
    () => [
      { value: "active", label: getStatusLabel("active", t) },
      { value: "completed", label: getStatusLabel("completed", t) },
      { value: "draft", label: getStatusLabel("draft", t) },
    ],
    [locale, t]
  );

  // Filtering Logic
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return localizedPrograms.filter((p) => {
      const matchCategory = activeCategory ? p.category === activeCategory : true;
      const matchStatus = activeStatus ? canonicalStatus(p.status) === activeStatus : true;
      const matchSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        (p.short_description ?? "").toLowerCase().includes(term);
      return matchCategory && matchStatus && matchSearch;
    });
  }, [localizedPrograms, search, activeCategory, activeStatus]);

  const showGeneralCard = !activeStatus || activeStatus === "active";

  // Handle active status color
  const getFilterClass = (isActive: boolean) =>
    isActive
      ? "bg-brandGreen-600 text-white shadow-md shadow-brandGreen-200 border-transparent"
      : "bg-white text-slate-600 border-slate-200 hover:border-brandGreen-200 hover:text-brandGreen-700";

  return (
    <LandingLayout>
      <div ref={pageRef}>
      <section className="relative overflow-hidden bg-slate-50 pb-20 pt-28">
         <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-brandGreen-100/30 blur-[100px]" />
              <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-primary-50/50 blur-[80px]" />
         </div>

         <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
               <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-xs font-semibold text-brandGreen-700 ring-1 ring-brandGreen-100">
                  {t("program.list.badge")}
               </span>
                <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl font-heading">
                  {t("program.list.title.leading")} <span className="text-brandGreen-600">{t("program.list.title.highlight")}</span>
                </h1>
               <p className="mt-6 text-lg leading-relaxed text-slate-600">
                  {t("program.list.subtitle")}
               </p>
            </div>

             {/* --- MODERN SEARCH BAR (Floating) --- */}
             <div className="mx-auto mt-10 max-w-4xl">
                <div className="relative flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-soft md:flex-row md:items-center">

                  {/* Search Input Area */}
                  <div className="flex flex-1 items-center gap-3 px-3">
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                     </div>
                     <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("program.list.search.placeholder")}
                        className="h-12 w-full bg-transparent text-base font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                     />
                     {search && (
                        <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                           <FontAwesomeIcon icon={faXmark} />
                        </button>
                     )}
                  </div>

                  <div className="h-px w-full bg-slate-100 md:h-12 md:w-px" />

                  {/* Filter Actions */}
                  <div className="flex items-center gap-3 px-3 md:w-auto md:shrink-0 md:justify-end">
                     <span className="text-sm font-semibold text-slate-500 whitespace-nowrap hidden sm:inline-block">
                        {filtered.length} {t("program.list.results")}
                     </span>
                     <button
                        onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition-all md:flex-none
                           ${isFilterExpanded
                             ? "bg-brandGreen-50 border-brandGreen-200 text-brandGreen-700"
                             : "bg-slate-900 border-transparent text-white shadow-lg hover:bg-slate-800"}`}
                     >
                        <FontAwesomeIcon icon={faSliders} />
                        <span>{t("program.list.filter.toggle")}</span>
                     </button>
                  </div>
               </div>

                {/* --- EXPANDABLE FILTER PANEL --- */}
                <div className={`overflow-hidden transition-all duration-300 ease-out ${isFilterExpanded ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                   <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                       <div className="space-y-6">
                         {/* Categories */}
                          {categories.length > 0 && (
                             <div>
                               <p className="mb-3 text-xs font-semibold text-slate-500">{t("program.list.filter.categories")}</p>
                                <div className="flex flex-wrap gap-2">
                                   <button onClick={() => setActiveCategory(null)} className={`rounded-lg px-4 py-2 text-xs font-bold border transition ${getFilterClass(activeCategory === null)}`}>
                                      {t("program.list.filter.allCategories")}
                                   </button>
                                  {categories.map((cat) => (
                                     <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                                        className={`rounded-lg px-4 py-2 text-xs font-bold border transition ${getFilterClass(activeCategory === cat)}`}
                                     >
                                        {cat}
                                     </button>
                                  ))}
                               </div>
                            </div>
                         )}

                          {/* Status */}
                          <div>
                             <p className="mb-3 text-xs font-semibold text-slate-500">{t("program.list.filter.status")}</p>
                             <div className="flex flex-wrap gap-2">
                                <button onClick={() => setActiveStatus(null)} className={`rounded-lg px-4 py-2 text-xs font-bold border transition ${getFilterClass(activeStatus === null)}`}>
                                   {t("program.list.filter.allStatus")}
                                </button>
                               {statusOptions.map((stat) => (
                                  <button
                                     key={stat.value}
                                     onClick={() => setActiveStatus(stat.value === activeStatus ? null : stat.value)}
                                     className={`rounded-lg px-4 py-2 text-xs font-bold border transition ${getFilterClass(activeStatus === stat.value)}`}
                                  >
                                     {stat.label}
                                  </button>
                               ))}
                            </div>
                         </div>
                      </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* CONTENT GRID */}
      <section className="bg-slate-50 pb-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            {errorKey && (
               <div className="mx-auto mb-10 max-w-2xl rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm font-medium text-red-600">
                  {t("program.list.error")}
               </div>
            )}

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
               {loading
                  ? Array.from({ length: 6 }).map((_, idx) => <ProgramSkeleton key={`prog-skel-${idx}`} />)
                  : (
                    <>
                      {showGeneralCard && <GeneralDonationCard locale={locale} t={t} />}
                      {filtered.map((program) => <ProgramCard key={program.id} program={program} locale={locale} t={t} />)}
                    </>
                  )
               }
            </div>

            {!loading && filtered.length === 0 && !showGeneralCard && (
               <div className="mx-auto max-w-lg py-12 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                      <FontAwesomeIcon icon={faMagnifyingGlass} className="text-3xl" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{t("program.list.empty.title")}</h3>
                  <p className="mt-2 text-slate-500 text-sm">{t("program.list.empty.desc")}</p>
                  <button
                     onClick={() => { setSearch(""); setActiveCategory(null); setActiveStatus(null); }}
                     className="mt-6 font-semibold text-brandGreen-600 hover:text-brandGreen-700"
                  >
                    {t("program.list.empty.reset")}
                  </button>
               </div>
            )}
         </div>
      </section>
      </div>
    </LandingLayout>
  );
}

/* --- Program Card Component (Premium Card Style) --- */

function ProgramCard({
  program,
  locale,
  t,
}: {
  program: Program;
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
}) {
  const progress = getProgress(program.collected_amount, program.target_amount);
  const statusLabel = getStatusLabel(program.status, t);
  const statusTone = getProgramStatusTone(program.status);
  const detailHref = program.slug ? `/program/${program.slug}` : "/program";
  const brandName = "Djalalaludin Pane Foundation";
  const isCompleted = canonicalStatus(program.status) === "completed";
  const deadlineText = program.deadline_days !== null && program.deadline_days !== undefined && String(program.deadline_days).trim() !== ""
    ? `${program.deadline_days} ${locale === "en" ? "days" : "hari"}`
    : t("landing.programs.deadline.unlimited");

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-100 bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-lg hover:shadow-slate-200/50"
      style={{ minHeight: "540px" }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img
          src={getImageUrl(program.program_images?.[0] ?? program.thumbnail_path)}
          alt={program.title}
          className="h-full w-full object-cover"
          onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
        />
        <div className="absolute left-4 top-4 flex items-center gap-2 text-xs font-semibold text-white">
          <span className="rounded-full uppercase font-heading bg-primary-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm">
            {program.category ?? t("landing.programs.defaultCategory")}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone}`}>
            {statusLabel}
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-brandGreen-100/80 px-2 py-1 rounded-lg">
            {t("landing.programs.progress")} {progress}%
          </span>
        </div>

        <h3 className="text-lg font-heading font-semibold text-slate-900 leading-snug">{program.title}</h3>
        <p className="text-sm text-slate-600 line-clamp-3 min-h-[60px]">{program.short_description}</p>
        <div className="flex items-center gap-2">
          <img src="/brand/dpf-icon.png" alt={brandName} className="h-6 w-6 rounded-md object-contain bg-white" />
          <span className="text-sm font-semibold text-slate-800">{brandName}</span>
          <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500 text-xs" />
        </div>

        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brandGreen-600 transition-[width] duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>{t("landing.programs.collected")} {formatCurrency(program.collected_amount, locale)}</span>
          <span>{t("landing.programs.target")} {formatCurrency(program.target_amount, locale)}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>{t("landing.programs.deadline")}</span>
          <span className="text-slate-800">{deadlineText}</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <Link to={detailHref} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            {t("landing.programs.detail")}
          </Link>
          <Link
            to={`/donate?program_id=${program.id}`}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] ${
              isCompleted
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-brandGreen-600 hover:bg-brandGreen-700"
            }`}
            aria-disabled={isCompleted}
            tabIndex={isCompleted ? -1 : undefined}
            onClick={(e) => {
              if (isCompleted) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <FontAwesomeIcon icon={faHandHoldingHeart} />
            {t("landing.programs.donate")}
          </Link>
        </div>
      </div>
    </article>
  );
}

function GeneralDonationCard({ locale, t }: { locale: "id" | "en"; t: (key: string, fallback?: string) => string }) {
  const brandName = "Djalalaludin Pane Foundation";
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-100 bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-lg hover:shadow-slate-200/50"
      style={{ minHeight: "540px" }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img src={donasiUmumImage} alt={t("donate.program.general")} className="h-full w-full object-cover" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full uppercase font-heading bg-primary-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
            {t("donate.program.general")}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-emerald-200 bg-emerald-50 text-emerald-700">
            {t("donate.program.general")}
          </span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg ring-1 ring-emerald-100">
            {locale === "en" ? "Always open" : "Selalu terbuka"}
          </span>
        </div>

        <h3 className="text-lg font-heading font-semibold text-slate-900 leading-snug">{t("donate.program.general")}</h3>
        <p className="text-sm text-slate-600 line-clamp-3 min-h-[60px]">{t("donate.program.generalDesc")}</p>
        <div className="flex items-center gap-2">
          <img src="/brand/dpf-icon.png" alt={brandName} className="h-6 w-6 rounded-md object-contain bg-white" />
          <span className="text-sm font-semibold text-slate-800">{brandName}</span>
          <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500 text-xs" />
        </div>

        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>{t("landing.programs.deadline")}</span>
          <span className="text-slate-800">{t("landing.programs.deadline.unlimited")}</span>
        </div>

        <div className="mt-auto flex items-center justify-end border-t border-slate-100 pt-4">
          <Link
            to="/donate"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brandGreen-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brandGreen-700 active:scale-[0.99]"
          >
            <FontAwesomeIcon icon={faHandHoldingHeart} />
            {t("landing.programs.donate")}
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProgramSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-[18px] border border-slate-100 bg-white p-5 shadow-soft">
      <div className="aspect-[16/9] w-full rounded-2xl bg-slate-100 animate-pulse" />
      <div className="mt-4 h-4 w-24 rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-2 h-5 w-3/4 rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-2 h-4 w-full rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-3 h-2 w-full rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-3 h-9 w-full rounded-full bg-slate-100 animate-pulse" />
    </div>
  );
}
