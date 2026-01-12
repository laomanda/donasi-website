import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faSliders,
  faNewspaper
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import { WaveDivider } from "../components/landing/WaveDivider";
import http from "../lib/http";
import { resolveStorageBaseUrl } from "../lib/urls";
import imagePlaceholder from "../brand/assets/image-placeholder.jpg";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";

/* --- Types & Helpers --- */

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

const pickLocale = (idVal?: string | null, enVal?: string | null, locale: "id" | "en" = "id") => {
  const idText = (idVal ?? "").trim();
  const enText = (enVal ?? "").trim();
  if (locale === "en") return enText || idText;
  return idText || enText;
};

const formatDate = (value?: string | null, locale: "id" | "en" = "id", t?: (key: string, fallback?: string) => string) => {
  if (!value) return t ? t("literasi.date.soon") : locale === "en" ? "Just published" : "Baru Tayang";
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

const getImageUrl = (path?: string | null) => {
  if (!path) return imagePlaceholder;
  if (path.startsWith("http")) return path;
  const base = resolveStorageBaseUrl();
  return `${base}/${path}`;
};

/* --- Main Page --- */

export function LiterasiPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<"fetch_failed" | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    http
      .get<{ data: Article[] }>("/articles")
      .then((res) => {
        if (!active) return;
        setArticles(res.data?.data ?? []);
        setErrorKey(null);
      })
      .catch(() => {
        if (!active) return;
        setErrorKey("fetch_failed");
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, []);

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

  const categories = useMemo(() => {
    const set = new Set<string>();
    localizedArticles.forEach((a) => a.category && set.add(a.category));
    return Array.from(set);
  }, [localizedArticles]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return localizedArticles.filter((a) => {
      const matchCategory = activeCategory ? a.category === activeCategory : true;
      const matchSearch =
        !term ||
        a.title.toLowerCase().includes(term) ||
        (a.excerpt ?? "").toLowerCase().includes(term);
      return matchCategory && matchSearch;
    });
  }, [localizedArticles, search, activeCategory]);

  const limited = filtered.slice(0, 12);

  // Styles untuk tombol filter
  const getFilterClass = (isActive: boolean) =>
    isActive
      ? "bg-primary-600 text-white shadow-md shadow-primary-200 border-transparent"
      : "bg-white text-slate-600 border-slate-200 hover:border-primary-200 hover:text-primary-700";

  return (
    <LandingLayout>
      {/* HEADER HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/40 via-white to-white pb-20 pt-28">
         <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-[-100px] left-[20%] h-[400px] w-[400px] rounded-full bg-primary-100/40 blur-[100px]" />
             <div className="absolute bottom-0 right-[10%] h-[300px] w-[300px] rounded-full bg-brandGreen-100/40 blur-[80px]" />
         </div>

         <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
               <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 font-heading text-xs font-semibold tracking-wide text-primary-700 shadow-sm border border-primary-100">
                  <FontAwesomeIcon icon={faNewspaper} />
                  {t("literasi.hero.badge")}
               </span>
               <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl font-heading">
                  {t("literasi.hero.title.leading")} <span className="text-primary-600">{t("literasi.hero.title.highlight")}</span>
               </h1>
               <p className="mt-6 text-lg leading-relaxed text-slate-600">
                  {t("literasi.hero.subtitle")}
               </p>
            </div>

            {/* --- FLOATING SEARCH & FILTER --- */}
            <div className="mx-auto mt-10 max-w-3xl">
               <div className="relative flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/40 md:flex-row md:items-center transition-shadow hover:shadow-2xl hover:shadow-slate-200/50">

                  {/* Search Input */}
                  <div className="flex flex-1 items-center gap-3 px-3">
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                     </div>
                     <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("literasi.search.placeholder")}
                        className="h-12 w-full bg-transparent text-base font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                     />
                     {search && (
                        <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                           <FontAwesomeIcon icon={faXmark} />
                        </button>
                     )}
                  </div>

                  <div className="h-px w-full bg-slate-100 md:h-12 md:w-px" />

                  {/* Filter Toggle */}
                  <div className="flex items-center gap-3 px-3 md:w-auto md:shrink-0 md:justify-end">
                     <button
                        onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition-all md:flex-none
                           ${isFilterExpanded
                             ? "bg-primary-50 border-primary-200 text-primary-700"
                             : "bg-slate-900 border-transparent text-white shadow-lg hover:bg-slate-800"}`}
                     >
                        <FontAwesomeIcon icon={faSliders} />
                        <span>{t("literasi.filter.toggle")}</span>
                     </button>
                  </div>
               </div>

               {/* EXPANDABLE CATEGORIES */}
               <div className={`overflow-hidden transition-all duration-300 ease-out ${isFilterExpanded ? 'max-h-[300px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                          <p className="text-xs font-semibold tracking-wide text-slate-500">{t("literasi.filter.categories")}</p>
                          <span className="text-xs font-medium text-slate-500">{filtered.length} {t("literasi.filter.results")}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                          <button onClick={() => setActiveCategory(null)} className={`rounded-lg px-4 py-2 text-xs font-bold border transition ${getFilterClass(activeCategory === null)}`}>
                              {t("literasi.filter.all")}
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
               </div>
            </div>
         </div>
      </section>

      {/* WAVE SEPARATOR */}
      <WaveDivider fillClassName="fill-white" flipY className="-mt-[1px]" />

      <section className="bg-slate-50 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {errorKey && (
             <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm font-medium text-red-600">
                {t("literasi.error")}
             </div>
          )}

          {/* GRID ARTICLES */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {loading &&
              Array.from({ length: 6 }).map((_, idx) => <ArticleSkeleton key={`art-skel-${idx}`} />)}

            {!loading && limited.map((article) => <ArticleCard key={article.id} article={article} locale={locale} t={t} />)}
          </div>

          {!loading && limited.length === 0 && (
             <div className="mx-auto max-w-lg py-12 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                    <FontAwesomeIcon icon={faNewspaper} className="text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{t("literasi.empty.title")}</h3>
                <p className="mt-2 text-slate-500 text-sm">{t("literasi.empty.desc")}</p>
                <button
                    onClick={() => { setSearch(""); setActiveCategory(null); }}
                    className="mt-6 text-sm font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4"
                >
                    {t("literasi.empty.reset")}
                </button>
             </div>
          )}
        </div>
      </section>
    </LandingLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Article Card Modern                             */
/* -------------------------------------------------------------------------- */

function ArticleCard({
  article,
  locale,
  t,
}: {
  article: Article;
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
}) {
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
            alt={article.title}
            className="h-full w-full object-cover"
            onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {article.category ? (
          <span className="inline-flex w-fit items-center rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-700 ring-1 ring-primary-100">
            {article.category}
          </span>
        ) : null}

        <h3 className="mt-4 line-clamp-2 min-h-[56px] font-heading text-lg font-semibold leading-snug text-slate-900">
          <Link to={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>

        <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-relaxed text-slate-600">
          {article.excerpt}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brandGreen-50 text-xs font-bold text-brandGreen-700 ring-1 ring-brandGreen-100">
              {initials || "A"}
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-700">{authorLabel}</p>
              <p className="text-[11px] text-slate-500">
                {isAnonymous ? t("landing.articles.anonymous") : t("landing.articles.author")}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {formatDate(article.published_at, locale, t)}
          </span>
        </div>
      </div>
    </article>
  );
}

function ArticleSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="aspect-[16/9] w-full rounded-xl bg-slate-100 animate-pulse" />

      <div className="mt-5 flex gap-2">
        <div className="h-3 w-4 rounded-full bg-slate-100 animate-pulse" />
        <div className="h-3 w-24 rounded-full bg-slate-100 animate-pulse" />
      </div>

      <div className="mt-4 h-6 w-full rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-2 h-6 w-3/4 rounded-full bg-slate-100 animate-pulse" />

      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded-full bg-slate-100 animate-pulse" />
        <div className="h-4 w-full rounded-full bg-slate-100 animate-pulse" />
      </div>

      <div className="mt-auto pt-6">
        <div className="h-4 w-32 rounded-full bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}
