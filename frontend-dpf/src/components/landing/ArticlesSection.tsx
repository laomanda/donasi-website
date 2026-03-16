import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { type Literasi } from "./LandingUI";
import { LiterasiCard } from "../literasi/LiterasiCard";
import { LiterasiSkeleton } from "../literasi/LiterasiSkeleton";

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
            <p className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-xs font-semibold text-brandGreen-700 ring-1 ring-brandGreen-100">
              {t("landing.articles.badge")}
            </p>
            <h2 className="text-3xl font-heading font-semibold text-slate-900 sm:text-4xl">
              {t("landing.articles.title")}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
              {t("landing.articles.subtitle")}
            </p>
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


