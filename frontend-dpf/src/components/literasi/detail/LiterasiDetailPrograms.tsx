import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingHeart, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { resolveStorageUrl } from "../../../utils/management/editorArticleUtils";
import type { RelatedProgram } from "./useLiterasiDetail";

interface LiterasiDetailProgramsProps {
  programs?: RelatedProgram[];
  locale: "id" | "en";
}

export function LiterasiDetailPrograms({ programs = [], locale }: LiterasiDetailProgramsProps) {
  if (!programs || programs.length === 0) return null;

  return (
    <section className="mt-8 rounded-[32px] border border-emerald-150 bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-800">
            <FontAwesomeIcon icon={faHandHoldingHeart} className="text-emerald-600" />
            <span>{locale === "en" ? "Related Waqf Program" : "Program Wakaf Terkait"}</span>
          </div>
          <h3 className="mt-2 text-lg sm:text-xl font-heading font-bold text-slate-900">
            {locale === "en"
              ? "Support Related Waqf Programs"
              : "Salurkan Kebaikan Melalui Program Terkait"}
          </h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((prog) => {
          const thumbUrl = prog.thumbnail_path ? resolveStorageUrl(prog.thumbnail_path) : null;
          return (
            <Link
              key={prog.id}
              to={`/programs/${prog.slug}`}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
            >
              <div>
                {thumbUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={thumbUrl}
                      alt={prog.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {prog.category && (
                      <span className="absolute left-2.5 top-2.5 rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
                        {prog.category}
                      </span>
                    )}
                  </div>
                ) : (
                  prog.category && (
                    <span className="inline-block rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {prog.category}
                    </span>
                  )
                )}

                <h4 className="mt-3 text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                  {prog.title}
                </h4>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-emerald-600">
                <span>{locale === "en" ? "View Program" : "Salurkan Wakaf"}</span>
                <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
