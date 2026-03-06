import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faHandHoldingHeart } from "@fortawesome/free-solid-svg-icons";
import imagePlaceholder from "@/brand/assets/image-placeholder.jpg";
import { 
    type Program, 
    getProgress, 
    normalizeProgramStatus, 
    getProgramStatusTone, 
    getImageUrl, 
    pickLocale, 
    formatCurrency,
    isProgramCompleted
} from "./LandingUI";

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
              {t("landing.programs.badge")}
            </p>
            <h2 className="text-3xl font-heading font-semibold text-slate-900 sm:text-4xl">
              {t("landing.programs.title")}
            </h2>
            <p className="text-sm text-slate-600 max-w-xl">
              {t("landing.programs.subtitle")}
            </p>
          </div>
          <Link
            to="/program"
            className="inline-flex items-center gap-2 rounded-full border border-brandGreen-500 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:text-white hover:bg-brandGreen-500 hover:border-slate-200"
          >
            {t("landing.programs.all")}
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
        </div>

        <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {hasPrograms &&
            visiblePrograms.map((program) => <ProgramCard key={program.id} program={program} t={t} locale={locale} />)}

          {!hasPrograms && loading &&
            Array.from({ length: 3 }).map((_, idx) => <ProgramSkeleton key={`program-skel-${idx}`} />)}
        </div>

        {!hasPrograms && !loading && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-soft">
            {t("landing.programs.empty")}
          </div>
        )}
      </div>
    </section>
  );
}

function ProgramCard({ program, t, locale }: { program: Program; t: (k: string, f?: string) => string; locale: "id" | "en" }) {
  const progress = getProgress(program.collected_amount, program.target_amount);
  const statusLabel = normalizeProgramStatus(program.status, t, program.deadline_days);
  const statusTone = getProgramStatusTone(program.status, program.deadline_days);
  const detailHref = program.slug ? `/program/${program.slug}` : "/program";
  const title = pickLocale(program.title, program.title_en, locale);
  const desc = pickLocale(program.short_description, program.short_description_en, locale);
  const category = pickLocale(program.category, program.category_en, locale) || t("landing.programs.defaultCategory");
  const isCompleted = isProgramCompleted(program.status, program.deadline_days);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-100 bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-lg hover:shadow-slate-200/50">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
              <img
                src={getImageUrl(program.thumbnail_path)}
                alt={title}
                className="h-full w-full object-cover"
                onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
              />
        <div className="absolute left-4 top-4 flex items-center gap-2 text-xs font-semibold text-white">
          <span className="rounded-full uppercase font-heading bg-primary-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm">
            {category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone}`}>
            {statusLabel}
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-brandGreen-100/80 px-2 py-1 rounded-lg">{t("landing.programs.progress")} {progress}%</span>
        </div>

        <h3 className="text-lg font-heading font-semibold text-slate-900 leading-snug">{title}</h3>
        <p className="text-sm text-slate-600 line-clamp-3">{desc}</p>

        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brandGreen-600 transition-[width] duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>{t("landing.programs.collected")} {formatCurrency(program.collected_amount, locale)}</span>
          <span>{t("landing.programs.target")} {formatCurrency(program.target_amount, locale)}</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <Link to={detailHref} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            {t("landing.programs.detail")}
          </Link>
          <Link
            to={`/donate?program_id=${program.id}`}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] ${
              isCompleted ? "bg-slate-300 cursor-not-allowed" : "bg-brandGreen-600 hover:bg-brandGreen-700"
            }`}
            aria-disabled={isCompleted}
            tabIndex={isCompleted ? -1 : undefined}
            onClick={(e) => {
              if (isCompleted) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <FontAwesomeIcon icon={faHandHoldingHeart} />
            {t("landing.programs.donate")}
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProgramSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-[18px] border border-slate-100 bg-white p-5 shadow-soft">
      <div className="aspect-[16/9] w-full rounded-2xl bg-slate-100 animate-pulse" />
      <div className="mt-4 h-4 w-24 rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-2 h-5 w-3/4 rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-2 h-4 w-full rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-3 h-2 w-full rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-3 h-9 w-full rounded-full bg-slate-100 animate-pulse" />
    </div>
  );
}
