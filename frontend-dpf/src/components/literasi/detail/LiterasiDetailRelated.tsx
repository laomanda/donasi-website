import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faNewspaper } from "@fortawesome/free-solid-svg-icons";
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs min-w-0">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 text-primary-700 shrink-0">
            <FontAwesomeIcon icon={faNewspaper} className="text-sm" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-base font-bold text-slate-900 leading-snug">
              {locale === "en" ? "Related Articles" : "Berita Terkait"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {locale === "en" ? "Selected readings" : "Artikel & literasi pilihan"}
            </p>
          </div>
        </div>

        <Link
          to="/literasi"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <span>{locale === "en" ? "All" : "Lihat semua"}</span>
          <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {related.slice(0, 5).map((item) => (
          <Link
            key={item.id}
            to={`/literasi/${item.slug}`}
            className="group flex gap-3 py-3.5 first:pt-0 last:pb-0 transition min-w-0 items-start"
          >
            {/* Thumbnail */}
            <div className="relative h-18 w-20 sm:h-20 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
              <img
                src={getImageUrl(item.thumbnail_path)}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
              />
            </div>

            {/* Meta & Title */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                {item.category ? (
                  <span className="font-bold uppercase tracking-wider text-[9px] text-white bg-slate-800 px-1.5 py-0.5 rounded">
                    {item.category}
                  </span>
                ) : null}
                <span className="text-slate-400 font-medium">
                  {formatDate(item.published_at, locale, t)}
                </span>
              </div>

              <h4 className="mt-1 font-heading text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                {item.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

