import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { 
    type Program, 
} from "./LandingUI";
import { ProgramCard, ProgramSkeleton } from "../programs/ProgramCard";

export function ProgramsSection({ 
    highlights, 
    loading, 
    t, 
    locale 
}: { 
    highlights: Program[]; 
    loading: boolean; 
    t: (k: string, f?: string) => string; 
    locale: "id" | "en" 
}) {
  const hasPrograms = highlights.length > 0;
  const visiblePrograms = highlights.slice(0, 6);

  return (
    <section id="programs" className="relative bg-slate-50">
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-xs font-semibold text-brandGreen-700 ring-1 ring-brandGreen-100">
            {t("program.list.subtitle")}
            </p>
          </div>
          <Link
            to="/program"
            className="inline-flex items-center gap-2 rounded-full border border-brandGreen-500 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:text-white hover:bg-brandGreen-500 hover:border-slate-200"
          >
            {t("program.list.results", "Semua")}
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
        </div>

        <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {hasPrograms &&
            visiblePrograms.map((program) => (
              <ProgramCard 
                key={program.id} 
                program={program as any} 
                t={t} 
                locale={locale} 
              />
            ))}

          {!hasPrograms && loading &&
            Array.from({ length: 3 }).map((_, idx) => (
              <ProgramSkeleton key={`program-skel-${idx}`} />
            ))}
        </div>

        {!hasPrograms && !loading && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-soft">
            {t("program.list.empty.title")}
          </div>
        )}
      </div>
    </section>
  );
}


