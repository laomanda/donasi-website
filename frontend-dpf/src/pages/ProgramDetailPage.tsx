import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCheckCircle,
  faCopy,
  faHandHoldingHeart,
  faLayerGroup,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import http from "../lib/http";
import { resolveStorageBaseUrl } from "../lib/urls";
import imagePlaceholder from "../brand/assets/image-placeholder.jpg";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";

type Program = {
  id: number;
  slug: string;
  title: string;
  title_en?: string | null;
  category?: string | null;
  category_en?: string | null;
  short_description?: string | null;
  short_description_en?: string | null;
  description?: string | null;
  description_en?: string | null;
  benefits?: string | null;
  benefits_en?: string | null;
  target_amount?: number | string | null;
  collected_amount?: number | string | null;
  thumbnail_path?: string | null;
  banner_path?: string | null;
  program_images?: string[] | null;
  is_highlight?: boolean | null;
  status?: string | null;
  deadline_days?: number | string | null;
  published_at?: string | null;
};

const pickLocale = (idVal?: string | null, enVal?: string | null, locale: "id" | "en" = "id") => {
  const idText = (idVal ?? "").trim();
  const enText = (enVal ?? "").trim();
  if (locale === "en") return enText || idText;
  return idText || enText;
};

type ProgramShowResponse = {
  program: Program;
  progress_percent?: number;
  recent_donations?: Array<{
    id: number;
    donor_name?: string | null;
    amount?: number | string | null;
    paid_at?: string | null;
    is_anonymous?: boolean | null;
  }>;
  latest_updates?: Array<{
    id: number;
    slug?: string | null;
    title?: string | null;
    excerpt?: string | null;
    published_at?: string | null;
  }>;
};

type RecentDonations = NonNullable<ProgramShowResponse["recent_donations"]>;

const formatCurrency = (value?: number | string | null) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

const formatDateShort = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
};

const getExcerptParagraph = (value?: string | null) => {
  if (!value) return "";
  const cleaned = value.replace(/\r/g, "").trim();
  if (!cleaned) return "";
  const parts = cleaned.split(/\n\s*\n|\n/).map((part) => part.trim()).filter(Boolean);
  return parts[0] ?? "";
};

const getImageUrl = (path?: string | null) => {
  if (!path) return imagePlaceholder;
  if (path.startsWith("http")) return path;
  const base = resolveStorageBaseUrl();
  return `${base}/${path}`;
};

const sanitizeHtml = (html: string) => {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
};

const getStatusTone = (status?: string | null) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "active" || s === "berjalan") return "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100";
  if (s === "completed" || s === "selesai" || s === "archived" || s === "arsip") {
    return "bg-blue-50 text-blue-700 ring-blue-100";
  }
  if (s === "draft" || s === "segera") return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-slate-50 text-slate-700 ring-slate-200";
};

const getStatusLabel = (
  status?: string | null,
  locale: "id" | "en" = "id",
  t?: (key: string, fallback?: string) => string
) => {
  const translateFn = t ?? ((key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback));
  const s = String(status ?? "").toLowerCase();
  if (s === "active") return translateFn("landing.programs.status.ongoing");
  if (s === "completed" || s === "archived") return translateFn("landing.programs.status.completed");
  if (s === "draft") return translateFn("landing.programs.status.upcoming");
  return status ? String(status) : translateFn("landing.common.na");
};

function ProgramDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <div className="h-[320px] rounded-[32px] bg-slate-100 animate-pulse sm:h-[380px]" />
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="h-5 w-40 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-4 h-8 w-4/5 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-3 h-4 w-2/3 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="h-6 w-40 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-5 space-y-3">
            <div className="h-4 w-full rounded-full bg-slate-100 animate-pulse" />
            <div className="h-4 w-5/6 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-4 w-4/6 rounded-full bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="space-y-6 lg:col-span-5">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="h-4 w-28 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-4 h-8 w-3/4 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-4 h-2 w-full rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-6 h-12 w-full rounded-2xl bg-slate-100 animate-pulse" />
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="h-4 w-40 rounded-full bg-slate-100 animate-pulse" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-12 w-full rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);
  const brandName = "Djalalaludin Pane Foundation";

  const [program, setProgram] = useState<Program | null>(null);
  const [recentDonations, setRecentDonations] = useState<RecentDonations>([]);
  const [latestUpdates, setLatestUpdates] = useState<ProgramShowResponse["latest_updates"]>([]);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<"not_found" | "load_failed" | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"detail" | "updates" | "donors">("detail");
  const [donorQuery, setDonorQuery] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const localizedProgram = useMemo(() => {
    if (!program) return null;
    return {
      ...program,
      title: pickLocale(program.title, program.title_en, locale),
      category: pickLocale(program.category, program.category_en, locale) || t("landing.programs.defaultCategory", locale),
      short_description: pickLocale(program.short_description, program.short_description_en, locale),
      description: pickLocale(program.description, program.description_en, locale),
      benefits: pickLocale(program.benefits, program.benefits_en, locale),
      deadline_days: program.deadline_days ?? null,
    };
  }, [program, locale, t]);

  const deadlineText = useMemo(() => {
    const raw = localizedProgram?.deadline_days;
    if (raw === null || raw === undefined || String(raw).trim() === "") {
      return t("landing.programs.deadline.unlimited", locale);
    }
    return `${raw} ${locale === "en" ? "days" : "hari"}`;
  }, [localizedProgram?.deadline_days, locale, t]);

  const isCompleted = useMemo(() => {
    const normalized = String(program?.status ?? "").trim().toLowerCase();
    return (
      normalized === "completed" ||
      normalized === "selesai" ||
      normalized === "tersalurkan" ||
      normalized === "archived" ||
      normalized === "arsip"
    );
  }, [program?.status]);

  const filteredDonations = useMemo(() => {
    const term = donorQuery.trim().toLowerCase();
    if (!term) return recentDonations;
    return recentDonations.filter((donation) => {
      const name = String(donation.donor_name ?? "").trim().toLowerCase();
      return name.includes(term);
    });
  }, [donorQuery, recentDonations]);

  useEffect(() => {
    if (!slug) {
      setErrorKey("not_found");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    http
      .get<ProgramShowResponse>(`/programs/${slug}`)
      .then((res) => {
        if (!active) return;
        setProgram(res.data.program);
        const rawProgress = Number(res.data.progress_percent ?? 0);
        setProgressPercent(Number.isFinite(rawProgress) ? Math.max(rawProgress, 0) : 0);
        setRecentDonations(res.data.recent_donations ?? []);
        setLatestUpdates(res.data.latest_updates ?? []);
        setErrorKey(null);
      })
      .catch(() => {
        if (!active) return;
        setErrorKey("load_failed");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const galleryImages = useMemo(() => {
    if (!program) return [];
    const raw = Array.isArray(program.program_images) ? program.program_images : [];
    const cleaned = raw.map((value) => String(value ?? "").trim()).filter(Boolean);
    if (cleaned.length) return cleaned;
    const fallback = program.banner_path ?? program.thumbnail_path ?? "";
    return fallback ? [fallback] : [];
  }, [program]);

  const galleryUrls = useMemo(() => {
    if (!galleryImages.length) return [imagePlaceholder];
    return galleryImages.map((path) => getImageUrl(path));
  }, [galleryImages]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [galleryUrls.join("|")]);

  useEffect(() => {
    if (galleryUrls.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % galleryUrls.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [galleryUrls.length]);

  const heroImage = galleryUrls[activeImageIndex] ?? imagePlaceholder;

  const shareUrl = typeof window !== "undefined" && slug ? `${window.location.origin}/program/${slug}` : "";
  const shareText = localizedProgram?.title ? `${localizedProgram.title} - ${shareUrl}` : shareUrl;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: localizedProgram?.title ?? "Program DPF",
          text: localizedProgram?.short_description ?? localizedProgram?.title ?? "",
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus(locale === "en" ? "Link copied" : "Tautan disalin");
        setTimeout(() => setShareStatus(null), 2000);
      }
    } catch {
      setShareStatus(locale === "en" ? "Failed to share" : "Gagal membagikan");
      setTimeout(() => setShareStatus(null), 2000);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus(locale === "en" ? "Link copied" : "Tautan disalin");
      setTimeout(() => setShareStatus(null), 2000);
    } catch {
      setShareStatus(locale === "en" ? "Failed to copy" : "Gagal menyalin");
      setTimeout(() => setShareStatus(null), 2000);
    }
  };

  const benefits = useMemo(() => {
    const raw = String(localizedProgram?.benefits ?? "").trim();
    if (!raw) return [];
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 12);
  }, [localizedProgram?.benefits]);

  const rawDescription = useMemo(() => {
    return String(localizedProgram?.description ?? localizedProgram?.short_description ?? "");
  }, [localizedProgram?.description, localizedProgram?.short_description]);

  const isProbablyHtml = useMemo(() => {
    const body = String(rawDescription ?? "");
    return /<\/?(p|div|span|h1|h2|h3|h4|ul|ol|li|br|strong|em|img|a|blockquote)\b/i.test(body);
  }, [rawDescription]);

  const contentHtml = useMemo(() => {
    if (!rawDescription) return "";
    if (isProbablyHtml) return sanitizeHtml(rawDescription);
    return sanitizeHtml(rawDescription.replace(/\n/g, "<br/>"));
  }, [isProbablyHtml, rawDescription]);

  return (
    <LandingLayout>
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-8 rounded-[24px] border border-slate-200 bg-white/90 px-4 py-4 shadow-sm sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  {locale === "en" ? "Back" : "Kembali"}
                </button>
                <span className="hidden h-4 w-px bg-slate-200 sm:inline-flex" />
                <Link to="/program" className="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors">
                  {locale === "en" ? "View other programs" : "Lihat program lain"}
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <FontAwesomeIcon icon={faShareNodes} />
                  <span className="hidden sm:inline">{locale === "en" ? "Share" : "Bagikan"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <FontAwesomeIcon icon={faCopy} />
                  <span className="hidden sm:inline">{locale === "en" ? "Copy" : "Salin"}</span>
                </button>
                {shareStatus ? (
                  <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
                    {shareStatus}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {loading ? (
            <ProgramDetailSkeleton />
          ) : errorKey ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorKey === "not_found"
                ? locale === "en"
                  ? "Program not found."
                  : "Program tidak ditemukan."
                : locale === "en"
                  ? "Failed to load program details."
                  : "Gagal memuat detail program."}
            </div>
          ) : localizedProgram ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <div className="space-y-8">
                <div className="relative overflow-hidden rounded-[28px] border border-slate-100 bg-slate-100 shadow-soft">
                  <div className="relative aspect-[16/9]">
                    <img
                      src={heroImage}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl transition-opacity duration-500"
                      onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                    />
                    <div className="relative z-10 h-full w-full overflow-hidden">
                      <div
                        className="flex h-full w-full transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
                      >
                        {galleryUrls.map((url, idx) => (
                          <img
                            key={url + idx}
                            src={url}
                            alt={localizedProgram?.title ?? ""}
                            className="h-full w-full shrink-0 object-contain"
                            onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                          />
                        ))}
                      </div>
                    </div>

                    {galleryUrls.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((prev) => (prev - 1 + galleryUrls.length) % galleryUrls.length)
                          }
                          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-white"
                          aria-label="Foto sebelumnya"
                        >
                          <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveImageIndex((prev) => (prev + 1) % galleryUrls.length)}
                          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-white"
                          aria-label="Foto berikutnya"
                        >
                          <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                      </>
                    ) : null}
                  </div>

                  {galleryUrls.length > 1 ? (
                    <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-white/90 px-4 py-3">
                      {galleryUrls.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={[
                            "h-2.5 w-2.5 rounded-full transition",
                            idx === activeImageIndex ? "bg-brandGreen-600" : "bg-slate-300",
                          ].join(" ")}
                          aria-label={`Pilih foto ${idx + 1}`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
                      <FontAwesomeIcon icon={faLayerGroup} className="text-orange-500" />
                      {localizedProgram?.category ?? t("landing.programs.defaultCategory", locale)}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                      {getStatusLabel(program?.status, locale, t)}
                    </span>
                    {program?.is_highlight ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                        Highlight
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 shadow-sm">
                    <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white">
                      <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden="true" />
                      {locale === "en" ? "Program date" : "Tanggal program"}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatDateShort(program?.published_at ?? null)}
                    </span>
                  </div>

                  <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                    {localizedProgram?.title ?? ""}
                  </h1>

                  {localizedProgram?.short_description ? (
                    <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
                      {localizedProgram.short_description}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-6 border-b border-slate-100 pb-3 text-sm font-semibold">
                    <button
                      type="button"
                      onClick={() => setActiveTab("detail")}
                      className={`pb-2 transition ${activeTab === "detail" ? "text-brandGreen-700 border-b-2 border-brandGreen-600" : "text-slate-500"}`}
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("updates")}
                      className={`pb-2 transition ${activeTab === "updates" ? "text-brandGreen-700 border-b-2 border-brandGreen-600" : "text-slate-500"}`}
                    >
                      Kabar Terbaru
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("donors")}
                      className={`relative pb-2 transition ${activeTab === "donors" ? "text-brandGreen-700 border-b-2 border-brandGreen-600" : "text-slate-500"}`}
                    >
                      Donatur
                      <span className="ml-2 inline-flex min-w-[26px] items-center justify-center rounded-full bg-brandGreen-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        {recentDonations?.length ?? 0}
                      </span>
                    </button>
                  </div>

                  {activeTab === "detail" && (
                    <div className="mt-5">
                      <div
                        className={[
                          "break-words text-[15px] leading-7 text-slate-800 sm:text-base sm:leading-8",
                          "[&_h1]:text-2xl [&_h1]:font-heading [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-6",
                          "[&_h2]:text-xl [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-6",
                          "[&_h3]:text-lg [&_h3]:font-heading [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-5",
                          "[&_p]:mt-4 [&_p]:text-slate-700 [&_strong]:text-slate-900",
                          "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5",
                          "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5",
                          "[&_li]:mt-1 [&_li]:text-slate-700",
                          "[&_a]:text-primary-700 [&_a]:font-semibold hover:[&_a]:text-primary-800",
                          "[&_blockquote]:mt-5 [&_blockquote]:rounded-2xl [&_blockquote]:border [&_blockquote]:border-slate-200 [&_blockquote]:bg-slate-50 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-slate-700",
                          "[&_img]:my-6 [&_img]:block [&_img]:w-full [&_img]:h-auto [&_img]:rounded-2xl [&_img]:shadow-sm [&_img]:ring-1 [&_img]:ring-slate-200",
                        ].join(" ")}
                        {...(isProbablyHtml ? { dangerouslySetInnerHTML: { __html: contentHtml } } : {})}
                      >
                        {isProbablyHtml ? null : <div className="whitespace-pre-wrap">{rawDescription}</div>}
                      </div>

                      {benefits.length > 0 ? (
                        <div className="mt-8 border-t border-slate-100 pt-6">
                          <p className="text-sm font-bold text-slate-900">{locale === "en" ? "Benefits" : "Manfaat"}</p>
                          <ul className="mt-3 space-y-2 text-sm text-slate-700">
                            {benefits.map((b, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                                <span className="leading-relaxed">{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {activeTab === "updates" && (
                    <div className="mt-5 space-y-4">
                      {latestUpdates && latestUpdates.length > 0 ? (
                        latestUpdates.map((u) => (
                          <div
                            key={u.id}
                            className="rounded-[20px] border border-slate-100 bg-slate-50/80 p-5 shadow-sm ring-1 ring-slate-50 hover:ring-slate-100 transition"
                          >
                            <p className="text-base font-semibold text-slate-900">
                              {u.title ?? "Kabar terbaru"}
                            </p>
                            <p className="mt-1 text-[12px] font-semibold text-slate-500">
                              {formatDateShort(u.published_at)}
                            </p>
                            {u.excerpt ? (
                              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                                {getExcerptParagraph(u.excerpt)}
                              </p>
                            ) : null}
                            {u.slug ? (
                              <div className="mt-4 flex justify-end">
                                <Link
                                  to={`/articles/${u.slug}`}
                                  className="inline-flex items-center gap-2 text-xs font-semibold text-brandGreen-700 transition hover:text-brandGreen-800"
                                >
                                  Selengkapnya
                                  <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                </Link>
                              </div>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-500">
                          Belum ada kabar terbaru untuk program ini.
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "donors" && (
                    <div className="mt-5 space-y-3">
                      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-500">
                            Cari Donatur
                          </span>
                          <input
                            value={donorQuery}
                            onChange={(e) => setDonorQuery(e.target.value)}
                            placeholder="Ketik nama donatur..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-brandGreen-200 focus:outline-none focus:ring-2 focus:ring-brandGreen-100"
                          />
                        </div>
                      </div>
                      {filteredDonations && filteredDonations.length > 0 ? (
                        filteredDonations.map((don) => (
                          <div
                            key={don.id}
                            className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                          >
                            <div>
                              <p className="text-sm font-bold text-slate-800">{don.donor_name || "Hamba Allah"}</p>
                              <p className="text-[11px] font-semibold text-slate-500">{formatDateShort(don.paid_at)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] font-semibold text-slate-500">Donasi</p>
                              <p className="text-base font-bold text-slate-900">{formatCurrency(don.amount)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-500">
                          {recentDonations.length === 0
                            ? "Belum ada donatur untuk program ini."
                            : "Tidak ada donatur yang cocok."}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-semibold text-slate-500">{locale === "en" ? "Donation summary" : "Ringkasan donasi"}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-700 ring-1 ring-primary-100">
                      {localizedProgram?.category ?? t("landing.programs.defaultCategory", locale)}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${getStatusTone(program?.status)}`}>
                      {getStatusLabel(program?.status, locale, t)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                    <img src="/brand/dpf-icon.png" alt={brandName} className="h-8 w-8 rounded-md bg-white object-contain" />
                    <span className="text-sm font-semibold text-slate-800">{brandName}</span>
                    <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500 text-sm" />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>{t("landing.programs.deadline")}</span>
                    <span className="text-slate-800">{deadlineText}</span>
                  </div>

                  <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
                    {locale === "en" ? "Part of social program" : "Bagian dari program sosial"}
                  </div>

                  <div className="mt-5 flex flex-wrap items-end justify-between gap-2">
                    <p className="font-heading text-3xl font-semibold text-slate-900">
                      {formatCurrency(program?.collected_amount)}
                    </p>
                    <p className="text-sm font-semibold text-slate-500">
                      {locale === "en" ? "Of" : "Dari"} {formatCurrency(program?.target_amount)}
                    </p>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brandGreen-600"
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>{Math.round(progressPercent)}% {locale === "en" ? "Achieved" : "Tercapai"}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-brandGreen-600" />
                      {getStatusLabel(program?.status, locale, t)}
                    </span>
                  </div>

                  <Link
                    to={`/donate?program_id=${program?.id}`}
                    className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-sm transition ${
                      isCompleted ? "bg-slate-300 cursor-not-allowed" : "bg-brandGreen-600 hover:bg-brandGreen-700"
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
                    {locale === "en" ? "Donate now" : "Donasi sekarang"}
                  </Link>

                  <p className="mt-3 text-xs text-slate-500">
                    {locale === "en"
                      ? "Donation is made through the donate page. Make sure the amount and data are correct."
                      : "Donasi dilakukan melalui halaman donate. Pastikan nominal dan data sudah benar."}
                  </p>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-sm font-bold text-slate-900">{locale === "en" ? "Share program" : "Bagikan program"}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {locale === "en"
                      ? "Spread the goodness so more people can be helped."
                      : "Sebarkan kebaikan agar lebih banyak yang terbantu."}
                  </p>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-brandGreen-200 px-5 py-3 text-sm font-bold text-brandGreen-500 transition hover:bg-brandGreen-500 hover:text-white"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} />
                    {locale === "en" ? "Share via WhatsApp" : "Bagikan via WhatsApp"}
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </LandingLayout>
  );
}

export default ProgramDetailPage;
