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
  if (related.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-slate-200 pt-8 mt-10 min-w-0 max-w-full">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900 break-words [overflow-wrap:anywhere]">
            {locale === "en" ? "Related Articles" : "Berita Terkait"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {locale === "en"
              ? "Other articles you might find interesting"
              : "Artikel pilihan lainnya seputar literasi wakaf dan program"}
          </p>
        </div>

        <Link
          to="/literasi"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <span>{locale === "en" ? "View all" : "Lihat semua"}</span>
          <FontAwesomeIcon icon={faArrowRight} className="text-[11px]" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.slice(0, 3).map((item) => (
          <Link
            key={item.id}
            to={`/literasi/${item.slug}`}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 min-w-0"
          >
            <div>
              <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={getImageUrl(item.thumbnail_path)}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                />
              </div>

              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  {item.category && (
                    <>
                      <span className="font-semibold uppercase tracking-wider text-[11px] text-white bg-primary-600 px-1 rounded-full">
                        {item.category}
                      </span>
                      <span className="text-slate-300">&bull;</span>
                    </>
                  )}
                  <span className="text-[11px] text-slate-500">{formatDate(item.published_at, locale, t)}</span>
                </div>

                <h3 className="mt-1.5 font-heading text-sm sm:text-base font-bold text-slate-900">
                  {item.title}
                </h3>

                {item.excerpt && (
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed break-words [overflow-wrap:anywhere]">
                    {item.excerpt}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
              <span>{locale === "en" ? "Read Article" : "Baca Selengkapnya"}</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[11px]" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
