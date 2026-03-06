import { Link } from "react-router-dom";
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
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-heading text-xl font-semibold text-slate-900">{locale === "en" ? "Related articles" : "Berita terkait"}</h2>
        <p className="mt-6 text-sm font-semibold text-slate-500">{locale === "en" ? "No related articles yet." : "Belum ada berita terkait."}</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">{locale === "en" ? "Recommendation" : "Rekomendasi"}</p>
          <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">{locale === "en" ? "Related articles" : "Berita terkait"}</h2>
        </div>
        <Link to="/literasi" className="text-sm font-bold text-primary-600 hover:text-primary-700">
          {locale === "en" ? "View all" : "Lihat semua"}
        </Link>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {related.slice(0, 3).map((item) => (
          <Link
            key={item.id}
            to={`/literasi/${item.slug}`}
            className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary-100 hover:shadow-soft"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
              <img
                src={getImageUrl(item.thumbnail_path)}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-xl"
                onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
              />
              <img
                src={getImageUrl(item.thumbnail_path)}
                alt={item.title}
                className="relative z-10 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-100"
                onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
              />
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                {item.category ? (
                  <span className="inline-flex min-w-0 max-w-full items-center rounded-full bg-brandGreen-50 px-3 py-1 text-[11px] font-semibold text-brandGreen-700 ring-1 ring-brandGreen-100 sm:max-w-[14rem] truncate">
                    {locale === "en" ? "Category" : "Kategori"}: {item.category}
                  </span>
                ) : null}
                <span>{locale === "en" ? "Published" : "Terbit"}: {formatDate(item.published_at, locale, t)}</span>
              </div>
              <h3 className="mt-2 line-clamp-2 font-heading text-base font-bold text-slate-900 group-hover:text-primary-700">
                {item.title}
              </h3>
              {item.excerpt && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
