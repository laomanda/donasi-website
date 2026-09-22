import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { getImageUrl } from "../LiterasiShared";
import { imagePlaceholder } from "@/lib/placeholder";
import type { RelatedProgram } from "./useLiterasiDetail";

interface LiterasiDetailProgramsProps {
  programs?: RelatedProgram[];
  locale: "id" | "en";
}

export function LiterasiDetailPrograms({ programs = [], locale }: LiterasiDetailProgramsProps) {
  if (!programs || programs.length === 0) return null;

  return (
    <section className="border-t border-slate-200 pt-8 mt-10 min-w-0 max-w-full">
      <div className="mb-5">
        <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 break-words [overflow-wrap:anywhere]">
          {locale === "en" ? "Related Waqf Programs" : "Program Wakaf Terkait"}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          {locale === "en"
            ? "Support waqf programs associated with this article"
            : "Salurkan kebaikan melalui program wakaf yang terhubung dengan artikel ini"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((prog) => {
          const imageSrc = getImageUrl(
            prog.thumbnail_path || (prog as any).thumbnail_url || (prog as any).banner_path
          );

          return (
            <Link
              key={prog.id}
              to={`/program/${prog.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 min-w-0"
            >
              <div>
                {/* Foto Program dengan Kategori */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100">
                  <img
                    src={imageSrc}
                    alt={prog.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                  />
                  {prog.category ? (
                    <span className="absolute left-2.5 top-2.5 rounded-md bg-primary-600 text-white px-2.5 py-0.5 text-[11px] font-bold tracking-wide shadow-xs">
                      {prog.category}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3">
                  <h4 className="font-heading text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {prog.title}
                  </h4>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>{locale === "en" ? "View Program" : "Salurkan Wakaf"}</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-[11px]" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
