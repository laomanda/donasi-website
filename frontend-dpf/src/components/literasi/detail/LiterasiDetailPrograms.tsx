import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faHandHoldingHeart } from "@fortawesome/free-solid-svg-icons";
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs min-w-0">
      <div className="mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <FontAwesomeIcon icon={faHandHoldingHeart} className="text-sm" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-base font-bold text-slate-900 leading-snug">
              {locale === "en" ? "Related Waqf Programs" : "Program Wakaf Terkait"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {locale === "en"
                ? "Support waqf programs linked to this article"
                : "Salurkan kebaikan melalui program wakaf ini"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {programs.map((prog) => {
          const imageSrc = getImageUrl(
            prog.thumbnail_path || (prog as any).thumbnail_url || (prog as any).banner_path
          );

          return (
            <Link
              key={prog.id}
              to={`/program/${prog.slug}`}
              className="group block overflow-hidden rounded-xl border border-slate-200 bg-slate-50/60 p-3 transition duration-200 hover:border-emerald-500 hover:bg-white hover:shadow-md min-w-0"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={imageSrc}
                  alt={prog.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                />
                {prog.category ? (
                  <span className="absolute left-2.5 top-2.5 rounded-md bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-xs">
                    {prog.category}
                  </span>
                ) : null}
              </div>

              <div className="mt-3">
                <h4 className="font-heading text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                  {prog.title}
                </h4>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>{locale === "en" ? "Donate Now" : "Salurkan Wakaf"}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition-transform group-hover:translate-x-1 group-hover:bg-emerald-600 group-hover:text-white">
                  <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

