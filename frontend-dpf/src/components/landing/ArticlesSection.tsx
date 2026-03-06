import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import imagePlaceholder from "@/brand/assets/image-placeholder.jpg";
import { type Literasi, getImageUrl, formatDate } from "./LandingUI";

export function ArticlesSection({ 
    articles, 
    loading, 
    t, 
    locale 
}: { 
    articles: Literasi[]; 
    loading: boolean; 
    t: (k: string, f?: string) => string; 
    locale: "id" | "en" 
}) {
  const limited = articles.slice(0, 3);
  const hasArticles = limited.length > 0;

  return (
    <section id="articles" className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-heading font-semibold text-slate-900 sm:text-4xl">
              {t("landing.articles.title")}
            </h2>
          </div>
          <Link
            to="/literasi"
            className="inline-flex items-center gap-2 rounded-full border border-brandGreen-500 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:text-white hover:bg-brandGreen-500 hover:border-slate-200"
          >
            {t("landing.articles.all")}
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {hasArticles && limited.map((article) => <LiterasiCard key={article.id} article={article} t={t} locale={locale} />)}

          {!hasArticles && loading &&
            Array.from({ length: 3 }).map((_, idx) => <LiterasiSkeleton key={`article-skel-${idx}`} />)}
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

function LiterasiCard({ article, t, locale }: { article: Literasi; t: (k: string, f?: string) => string; locale: "id" | "en" }) {
  const title = article.title;
  const excerpt = article.excerpt;
  const category = article.category;

  const author = (article.author_name ?? "").trim();
  const authorLabel = author !== "" ? author : t("landing.articles.anonymous");
  const isAnonymous = author === "";
  const initials = authorLabel
    .split(/\s+/)
    .filter(Boolean)
    .map((part: string) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/literasi/${article.slug}`} className="block">
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
          <Link to={`/literasi/${article.slug}`}>{title}</Link>
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

function LiterasiSkeleton() {
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
