import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowRight,
  faHandHoldingHeart,
  faReceipt,
  faTruck,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LandingLayout } from "../layouts/LandingLayout";
import http from "../lib/http";
import { resolveStorageBaseUrl } from "../lib/urls";
import imagePlaceholder from "../brand/assets/image-placeholder.jpg";
import placeholderBanner from "../brand/placeholder-banner.png";
import heroImage from "../brand/assets/Hero.png";
import { useLang } from "../lib/i18n";
import { landingDict, translate } from "../i18n/landing";

type Program = {
  id: number;
  slug?: string | null;
  title: string;
  title_en?: string | null;
  short_description: string;
  short_description_en?: string | null;
  thumbnail_path: string | null;
  target_amount: string | number;
  collected_amount: string | number;
  status: string;
  category?: string | null;
  category_en?: string | null;
  deadline_days?: number | string | null;
};

type Article = {
  id: number;
  slug: string;
  title: string;
  title_en?: string | null;
  excerpt: string;
  excerpt_en?: string | null;
  published_at: string | null;
  thumbnail_path?: string | null;
  category?: string | null;
  category_en?: string | null;
  author_name?: string | null;
};

type Partner = {
  id: number;
  name: string;
  name_en?: string | null;
  logo_path: string | null;
  url?: string | null;
};

type Banner = {
  id: number;
  image_path: string;
  display_order: number;
};

type HomePayload = {
  highlights: Program[];
  latest_articles: Article[];
  partners: Partner[];
  stats: {
    total_programs: number;
    total_donations: number;
    amount_collected: string | number;
  };
};

const formatCurrency = (value: number | string | undefined, locale: "id" | "en") =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

const formatDate = (value: string | null | undefined, locale: "id" | "en", t: (k: string, f?: string) => string) => {
  if (!value) return t("landing.common.soon");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t("landing.common.soon");
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const pickLocale = (idVal?: string | null, enVal?: string | null, locale: "id" | "en" = "id") => {
  const idText = (idVal ?? "").trim();
  const enText = (enVal ?? "").trim();
  if (locale === "en") return enText || idText;
  return idText || enText;
};

const getImageUrl = (path?: string | null) => {
  if (!path) return imagePlaceholder;
  if (path.startsWith("http")) return path;
  const base = resolveStorageBaseUrl();
  return `${base}/${path}`;
};

const getProgress = (collected: number | string | undefined, target: number | string | undefined) => {
  const safeTarget = Math.max(Number(target ?? 0), 1);
  const value = Math.min(Math.round((Number(collected ?? 0) / safeTarget) * 100), 100);
  return Number.isNaN(value) ? 0 : value;
};

const normalizeProgramStatus = (status: string | null | undefined, t: (k: string, f?: string) => string) => {
  const raw = String(status ?? "").trim().toLowerCase();
  if (!raw) return t("landing.common.na");
  if (raw === "active") return t("landing.programs.status.ongoing");
  if (raw === "completed") return t("landing.programs.status.completed");
  if (raw === "draft" || raw === "upcoming") return t("landing.programs.status.upcoming");
  if (raw === "archived") return t("landing.programs.status.archived");
  return status ?? raw;
};

const getProgramStatusTone = (status?: string | null) => {
  const s = String(status ?? "").trim().toLowerCase();
  if (s === "berjalan" || s === "active") return "bg-brandGreen-50 text-brandGreen-700 ring-brandGreen-100";
  if (s === "segera" || s === "draft") return "bg-amber-50 text-amber-700 ring-amber-100";
  if (s === "selesai" || s === "completed") return "bg-blue-50 text-blue-700 ring-blue-100";
  if (s === "arsip" || s === "archived") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
};

function LandingPage() {
  const [data, setData] = useState<HomePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(landingDict, locale, key, fallback);

  useEffect(() => {
    let mounted = true;
    http
      .get<HomePayload>("/home")
      .then((response) => {
        if (!mounted) return;
        setData(response.data);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError(t("landing.error"));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    http
      .get<Banner[]>("/banners")
      .then((res) => {
        if (!active) return;
        setBanners(res.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setBanners([]);
      })
    return () => {
      active = false;
    };
  }, []);

  const highlights = data?.highlights ?? [];
  const articles = data?.latest_articles ?? [];
  const partners = data?.partners ?? [];
  const localizedHighlights = useMemo(
    () =>
      highlights.map((p) => ({
        ...p,
        title: pickLocale(p.title, p.title_en, locale),
        short_description: pickLocale(p.short_description, p.short_description_en, locale),
        category: pickLocale(p.category, p.category_en, locale),
      })),
    [highlights, locale]
  );
  const localizedArticles = useMemo(
    () =>
      articles.map((a) => ({
        ...a,
        title: pickLocale(a.title, a.title_en, locale),
        excerpt: pickLocale(a.excerpt, a.excerpt_en, locale),
        category: pickLocale(a.category, a.category_en, locale),
      })),
    [articles, locale]
  );
  const localizedPartners = useMemo(
    () =>
      partners.map((p) => ({
        ...p,
        name: pickLocale(p.name, p.name_en, locale),
      })),
    [partners, locale]
  );

  return (
    <LandingLayout whatsappPhone="6281234567890" footerWaveBgClassName="bg-white">
      <BannerSection banners={banners} />
      <HeroSection error={error} t={t} />
      <PromiseStrip t={t} />
      <ProgramsSection highlights={localizedHighlights} loading={loading} t={t} locale={locale} />
      <ArticlesSection articles={localizedArticles} loading={loading} t={t} locale={locale} />
      <PartnerSection partners={localizedPartners} t={t} locale={locale} />
    </LandingLayout>
  );
}

export default LandingPage;
export { LandingPage };

function BannerSection({ banners }: { banners: Banner[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(landingDict, locale, key, fallback);
  const hasBanners = banners.length > 0;
  const slides = hasBanners ? banners : [{ id: -1, image_path: "", display_order: 0 }];

  useEffect(() => {
    setActiveIndex(0);
  }, [banners.length]);

  useEffect(() => {
    if (!hasBanners || banners.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [banners.length, hasBanners]);

  const handleNext = () => {
    if (!hasBanners) return;
    setActiveIndex((prev) => (prev + 1) % banners.length);
  };

  const activeBanner = slides[activeIndex] ?? slides[0];
  const imageUrl = hasBanners && activeBanner?.image_path ? getImageUrl(activeBanner.image_path) : placeholderBanner;
  const bannerImageClass = hasBanners
    ? "h-full w-full bg-cover bg-center bg-fixed animate-banner-pan motion-reduce:animate-none"
    : "h-full w-full bg-cover bg-center bg-fixed";

  const slideVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <section className="relative -mt-24 overflow-hidden bg-slate-900">
      <div
        className="relative h-[100svh] min-h-[520px] lg:min-h-[600px]"
        onClick={handleNext}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={activeBanner?.id}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div
              className={bannerImageClass}
              style={{ backgroundImage: `url("${imageUrl}"), url("${placeholderBanner}")` }}
              role="img"
              aria-label="Banner"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/35 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900/45 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-sm backdrop-blur sm:gap-4 sm:px-4 sm:text-xs">
          <span className="flex h-10 w-7 items-center justify-center rounded-full border border-white/70">
            <FontAwesomeIcon icon={faArrowDown} className="text-sm animate-bounce motion-reduce:animate-none" />
          </span>
          <span className="leading-tight">{t("landing.banner.scroll", "Scroll untuk eksplorasi")}</span>
        </div>

      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Hero section                                */
/* -------------------------------------------------------------------------- */

function HeroSection({ error, t }: { error: string | null; t: (k: string, f?: string) => string }) {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-brandGreen-50"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-primary-200/40 blur-[120px]" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-brandGreen-200/35 blur-[120px]" />
        <div className="absolute inset-x-10 top-1/3 h-32 rounded-full bg-white/50 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:gap-10 sm:px-6 lg:grid lg:grid-cols-[1.1fr,0.9fr] lg:items-center lg:gap-10 lg:px-8 lg:py-20">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary-700 shadow-sm">
            {t("landing.hero.badge")}
          </span>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            {t("landing.hero.title1")} <span className="text-primary-500">{t("landing.hero.title2")} </span>{t("landing.hero.title3")}
          </h1>
          <p className="max-w-2xl text-2xl text-slate-700">
            {t("landing.hero.subtitle")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/donate"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <FontAwesomeIcon icon={faHandHoldingHeart} className="text-sm" />
              {t("landing.hero.ctaDonate")}
            </Link>
            <Link
              to="/program"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brandGreen-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brandGreen-600"
            >
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
              {t("landing.hero.ctaProgram")}
            </Link>
          </div>

          {error && <p className="text-sm text-primary-700">{error}</p>}

        </div>

        <div className="relative">
          <div className="relative overflow-visible backdrop-blur lg:overflow-hidden">
            <div className="absolute -left-6 top-6 h-20 w-20 rounded-full bg-primary-200/60 blur-3xl" />
            <div className="absolute -right-10 bottom-6 h-24 w-24 rounded-full bg-brandGreen-200/60 blur-3xl" />

            <div className="relative w-full min-h-[220px] aspect-[4/3] sm:min-h-[320px] sm:aspect-[16/9] lg:min-h-[380px] lg:aspect-auto">
              <img
                src={heroImage}
                alt={t("landing.hero.imageAlt")}
                className="h-auto w-full max-w-full object-contain lg:h-full lg:object-cover"
                onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Value promise strip                             */
/* -------------------------------------------------------------------------- */

function PromiseStrip({ t }: { t: (k: string, f?: string) => string }) {
  const promiseItems = useMemo(
    () => [
      {
        title: t("landing.promise.jemput.title"),
        text: t("landing.promise.jemput.text"),
        icon: faTruck,
        href: "/layanan",
      },
      {
        title: t("landing.promise.konfirmasi.title"),
        text: t("landing.promise.konfirmasi.text"),
        icon: faReceipt,
        href: "/layanan",
      },
      {
        title: t("landing.promise.konsultasi.title"),
        text: t("landing.promise.konsultasi.text"),
        icon: faUserGroup,
        href: "/layanan",
      },
    ],
    [t]
  );

  return (
    <section className="relative bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-2 pb-8">
          <h2 className="text-3xl sm:text-4xl font-heading font-semibold text-slate-900">
            {t("landing.promise.title")}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {t("landing.promise.subtitle")}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {promiseItems.map((item) => (
            <div
              key={item.title}
              className="flex h-full flex-col gap-4 rounded-[28px] border border-slate-100 bg-gradient-to-b from-slate-50 to-white px-5 py-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brandGreen-50 text-brandGreen-600 shadow-sm">
                  <FontAwesomeIcon icon={item.icon} className="text-xl" />
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xl font-heading font-semibold text-slate-900 leading-snug">{item.title}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
              </div>

              <Link
                to={item.href}
                className="mt-auto inline-flex w-fit items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brandGreen-500 to-brandGreen-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {t("landing.promise.more")}
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Programs section                             */
/* -------------------------------------------------------------------------- */

function ProgramsSection({ highlights, loading, t, locale }: { highlights: Program[]; loading: boolean; t: (k: string, f?: string) => string; locale: "id" | "en" }) {
  const hasPrograms = highlights.length > 0;

  return (
    <section id="programs" className="relative bg-slate-50">
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-xs font-semibold text-brandGreen-700 ring-1 ring-brandGreen-100">
              {t("landing.programs.badge")}
            </p>
            <h2 className="text-3xl font-heading font-semibold text-slate-900 sm:text-4xl">
              {t("landing.programs.title")}
            </h2>
            <p className="text-sm text-slate-600 max-w-xl">
              {t("landing.programs.subtitle")}
            </p>
          </div>
          <Link
            to="/program"
            className="inline-flex items-center gap-2 rounded-full border border-brandGreen-500 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:text-white hover:bg-brandGreen-500 hover:border-slate-200"
          >
            {t("landing.programs.all")}
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
        </div>

        <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {hasPrograms &&
            highlights.map((program) => <ProgramCard key={program.id} program={program} t={t} locale={locale} />)}

          {!hasPrograms && loading &&
            Array.from({ length: 3 }).map((_, idx) => <ProgramSkeleton key={`program-skel-${idx}`} />)}
        </div>

        {!hasPrograms && !loading && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-soft">
            {t("landing.programs.empty")}
          </div>
        )}
      </div>
    </section>
  );
}

function ProgramCard({ program, t, locale }: { program: Program; t: (k: string, f?: string) => string; locale: "id" | "en" }) {
  const progress = getProgress(program.collected_amount, program.target_amount);
  const statusLabel = normalizeProgramStatus(program.status, t);
  const statusTone = getProgramStatusTone(program.status);
  const detailHref = program.slug ? `/program/${program.slug}` : "/program";
  const title = pickLocale(program.title, program.title_en, locale);
  const desc = pickLocale(program.short_description, program.short_description_en, locale);
  const category = pickLocale(program.category, program.category_en, locale) || t("landing.programs.defaultCategory");

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-100 bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-lg hover:shadow-slate-200/50">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
              <img
                src={getImageUrl(program.thumbnail_path)}
                alt={title}
                className="h-full w-full object-cover"
                onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
              />
        <div className="absolute left-4 top-4 flex items-center gap-2 text-xs font-semibold text-white">
          <span className="rounded-full uppercase font-heading bg-primary-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm">
            {category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone}`}>
            {statusLabel}
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-brandGreen-100/80 px-2 py-1 rounded-lg">{t("landing.programs.progress")} {progress}%</span>
        </div>

        <h3 className="text-lg font-heading font-semibold text-slate-900 leading-snug">{title}</h3>
        <p className="text-sm text-slate-600 line-clamp-3">{desc}</p>

        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brandGreen-600 transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>{t("landing.programs.collected")} {formatCurrency(program.collected_amount, locale)}</span>
          <span>{t("landing.programs.target")} {formatCurrency(program.target_amount, locale)}</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <Link to={detailHref} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            {t("landing.programs.detail")}
          </Link>
          <Link
            to={`/donate?program_id=${program.id}`}
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

/* -------------------------------------------------------------------------- */
/*                              Articles section                              */
/* -------------------------------------------------------------------------- */
function ArticlesSection({ articles, loading, t, locale }: { articles: Article[]; loading: boolean; t: (k: string, f?: string) => string; locale: "id" | "en" }) {
  const limited = articles.slice(0, 6);
  const hasArticles = limited.length > 0;

  return (
    <section id="articles" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-heading font-semibold text-slate-900">
            {t("landing.articles.title")}
          </h2>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {hasArticles && limited.map((article) => <ArticleCard key={article.id} article={article} t={t} locale={locale} />)}

          {!hasArticles && loading &&
            Array.from({ length: 3 }).map((_, idx) => <ArticleSkeleton key={`article-skel-${idx}`} />)}
        </div>

        {!hasArticles && !loading && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            {t("landing.articles.empty")}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Article Card Fix                              */
/* -------------------------------------------------------------------------- */

function ArticleCard({ article, t, locale }: { article: Article; t: (k: string, f?: string) => string; locale: "id" | "en" }) {
  // localizedArticles sudah memetakan title, excerpt, dan category
  // Jadi kita langsung menggunakan nilai yang sudah di-localize
  const title = article.title;
  const excerpt = article.excerpt;
  const category = article.category;

  const author = (article.author_name ?? "").trim();
  const authorLabel = author !== "" ? author : t("landing.articles.anonymous");
  const isAnonymous = author === "";
  const initials = authorLabel
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/articles/${article.slug}`} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
              <img
                src={getImageUrl(article.thumbnail_path)}
                alt={title}
                className="h-full w-full object-cover"
                onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
              />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {category ? (
          <span className="inline-flex w-fit items-center rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-700 ring-1 ring-primary-100">
            {category}
          </span>
        ) : null}

        <h3 className="mt-4 line-clamp-2 min-h-[56px] font-heading text-lg font-semibold leading-snug text-slate-900">
          <Link to={`/articles/${article.slug}`}>{title}</Link>
        </h3>

        <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-relaxed text-slate-600">
          {excerpt}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brandGreen-50 text-xs font-bold text-brandGreen-700 ring-1 ring-brandGreen-100">
              {initials || "A"}
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-700">{authorLabel}</p>
              <p className="text-[11px] text-slate-500">{isAnonymous ? t("landing.articles.anonymous") : t("landing.articles.author")}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500">{formatDate(article.published_at, locale, t)}</span>
        </div>
      </div>
    </article>
  );
}

function ArticleSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="aspect-[16/9] w-full rounded-2xl bg-slate-100 animate-pulse" />

      <div className="mt-4 h-5 w-24 rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-3 h-5 w-3/4 rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-2 h-4 w-full rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-2 h-4 w-5/6 rounded-full bg-slate-100 animate-pulse" />

      <div className="mt-auto pt-5">
        <div className="h-10 w-full rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}
/* -------------------------------------------------------------------------- */
/*                              Partners section                              */
/* -------------------------------------------------------------------------- */
function PartnerSection({ partners, t, locale }: { partners: Partner[]; t: (k: string, f?: string) => string; locale: "id" | "en" }) {
  const hasPartners = partners.length > 0;

  const buildMarqueeList = () => {
    if (!hasPartners) return [];
    const minCards = 8; // ensure track long enough for large screens
    let base = [...partners];
    while (base.length < minCards) {
      base = base.concat(partners);
    }
    return [...base, ...base]; // two identical halves for seamless -50% animation
  };

  const marqueePartners = buildMarqueeList();

  return (
    <section className="bg-white py-24 overflow-hidden border-t border-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-accent font-bold uppercase tracking-[0.2em] text-brandGreen-600/80">
            {t("landing.partners.badge")}
          </p>
          <h2 className="mt-3 text-3xl font-heading font-bold text-slate-900 sm:text-4xl">
            {t("landing.partners.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
            {t("landing.partners.subtitle")}
          </p>
        </div>

        {hasPartners ? (
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-24 bg-gradient-to-r from-white via-white/90 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-24 bg-gradient-to-l from-white via-white/90 to-transparent" />

            <div className="flex py-6 overflow-hidden">
              <div className="animate-marquee flex w-max items-center gap-6 px-4 hover:[animation-play-state:paused]">
                {marqueePartners.map((partner, idx) => (
                  <div
                    key={`${partner.id}-${idx}`}
                    className="group relative flex h-[110px] w-[220px] flex-none items-center justify-center rounded-2xl border border-transparent bg-transparent p-4 transition-all duration-300"
                  >
                    <div className="relative h-16 w-full transition-all duration-500 group-hover:scale-105">
                      <img
                        src={getImageUrl(partner.logo_path)}
                        alt={pickLocale(partner.name, partner.name_en, locale)}
                        className="h-full w-full object-contain"
                        onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                      />
                    </div>

                    <div className="pointer-events-none absolute -bottom-3 left-1/2 flex -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="whitespace-nowrap rounded-full bg-gradient-to-r from-brandGreen-600 to-primary-600 px-3 py-1 text-[10px] font-semibold tracking-wide text-white shadow-lg shadow-brandGreen-800/30 backdrop-blur-sm">
                        {pickLocale(partner.name, partner.name_en, locale)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-lg rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <p className="text-sm font-medium text-slate-400">{t("landing.partners.empty")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
