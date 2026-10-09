import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { getImageUrl, formatDate } from "../LiterasiShared.ts";
import { imagePlaceholder } from "@/lib/placeholder";
import type { LiterasiDetail } from "./useLiterasiDetail.ts";

interface LiterasiDetailRelatedProps {
  related: LiterasiDetail[];
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
}

export function LiterasiDetailRelated({ related, locale, t }: LiterasiDetailRelatedProps) {
  if (!related || related.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs min-w-0">
      {/* Widget Header with clean accent bar */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-5 rounded-full bg-primary-500 shrink-0" />
          <div>
            <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {locale === "en" ? "Related Articles" : "Berita Terkait"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === "en" ? "Selected readings" : "Artikel & literasi pilihan"}
            </p>
          </div>
        </div>

        <Link
          to="/literasi"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-brandGreen-700 hover:text-brandGreen-800 transition-colors"
        >
          <span>{locale === "en" ? "View all" : "Lihat semua"}</span>
          <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
        </Link>
      </div>

      {/* Related News List */}
      <div className="divide-y divide-slate-100">
        {related.slice(0, 5).map((item) => (
          <Link
            key={item.id}
            to={`/literasi/${item.slug}`}
            className="group flex gap-3.5 py-4 first:pt-0 last:pb-0 transition-colors min-w-0 items-start"
          >
            {/* Thumbnail */}
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-100">
              <img
                src={getImageUrl(item.thumbnail_path)}
                alt={item.title}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
              />
            </div>

            {/* Meta & Title */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mb-1">
                {item.category ? (
                  <span className="font-bold text-[10px] text-white bg-slate-800 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                ) : null}
                <span>{formatDate(item.published_at, locale, t)}</span>
              </div>

              <h4 className="font-heading text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-brandGreen-700 transition-colors">
                {item.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


