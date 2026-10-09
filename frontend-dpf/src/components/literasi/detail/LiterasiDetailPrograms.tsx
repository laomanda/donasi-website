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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs min-w-0">
      {/* Widget Header with clean accent bar */}
      <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
        <span className="w-1.5 h-5 rounded-full bg-brandGreen-500 shrink-0" />
        <div>
          <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {locale === "en" ? "Related Waqf Programs" : "Program Wakaf Terkait"}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {locale === "en" ? "Support waqf programs" : "Salurkan kebaikan melalui program wakaf ini"}
          </p>
        </div>
      </div>

      {/* Program Cards */}
      <div className="space-y-4">
        {programs.map((prog) => {
          const imageSrc = getImageUrl(
            prog.thumbnail_path || (prog as any).thumbnail_url || (prog as any).banner_path
          );

          return (
            <Link
              key={prog.id}
              to={`/program/${prog.slug}`}
              className="group block overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brandGreen-500 min-w-0"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={imageSrc}
                  alt={prog.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
                />
                {prog.category ? (
                  <span className="absolute left-2.5 top-2.5 rounded-md bg-brandGreen-500 text-white px-2.5 py-0.5 text-[10px] font-bold tracking-wide">
                    {prog.category}
                  </span>
                ) : null}
              </div>

              <div className="mt-3">
                <h4 className="font-heading text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-brandGreen-600 transition-colors">
                  {prog.title}
                </h4>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold text-brandGreen-600 group-hover:text-brandGreen-700 transition-colors">
                <span>{locale === "en" ? "Donate Now" : "Salurkan Wakaf"}</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


