import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { ProgramCard, ProgramSkeleton } from "./ProgramCard";
import type { Program } from "./ProgramShared";

interface ProgramGridProps {
  loading: boolean;
  errorKey: "fetch_failed" | null;
  programs: Program[];
  visibleCount: number;
  setVisibleCount: (val: (prev: number) => number) => void;
  filteredCount: number;
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
  resetFilters: () => void;
}

export function ProgramGrid({
  loading,
  errorKey,
  programs,
  visibleCount,
  setVisibleCount,
  filteredCount,
  locale,
  t,
  resetFilters,
}: ProgramGridProps) {
  return (
    <section className="bg-slate-50 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {errorKey && (
          <div className="mx-auto mb-10 max-w-2xl rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm font-medium text-red-600">
            {t("program.list.error")}
          </div>
        )}

        {/* GRID PROGRAMS */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <ProgramSkeleton key={`prog-skel-${idx}`} />
              ))
            : programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  locale={locale}
                  t={t}
                />
              ))}
        </div>

        {!loading && visibleCount < filteredCount && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-8 py-3 text-sm font-bold text-white shadow-md ring-1 ring-slate-200 transition hover:bg-primary-800 hover:shadow-lg active:scale-95"
            >
              {t("program.loadMore", "Lihat Lebih Banyak")}
            </button>
          </div>
        )}

        {!loading && filteredCount === 0 && (
          <div className="mx-auto max-w-lg py-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {t("program.list.empty.title")}
            </h3>
            <p className="mt-2 text-slate-500 text-sm">{t("program.list.empty.desc")}</p>
            <button
              onClick={resetFilters}
              className="mt-6 font-semibold text-brandGreen-600 hover:text-brandGreen-700"
            >
              {t("program.list.empty.reset")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
