import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingHeart, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import imagePlaceholder from "../../brand/assets/image-placeholder.jpg";
import type { 
  Program, 
} from "./ProgramShared";
import { 
  getProgress, 
  getStatusLabel, 
  getProgramStatusTone, 
  getImageUrl, 
  canonicalStatus, 
  formatCurrency, 
  formatDate 
} from "./ProgramShared";

interface ProgramCardProps {
  program: Program;
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
}

export function ProgramCard({ program, locale, t }: ProgramCardProps) {
  const progress = getProgress(program.collected_amount, program.target_amount);
  const statusLabel = getStatusLabel(program.status, t, program.deadline_days);
  const statusTone = getProgramStatusTone(program.status, program.deadline_days);
  const detailHref = program.slug ? `/program/${program.slug}` : "/program";
  const brandName = "Djalalaludin Pane Foundation";
  const isCompleted = canonicalStatus(program.status, program.deadline_days) === "completed";
  const deadlineText = program.deadline_days !== null && program.deadline_days !== undefined && String(program.deadline_days).trim() !== ""
    ? `${program.deadline_days} ${locale === "en" ? "days" : "hari"}`
    : t("landing.programs.deadline.unlimited");

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-100 bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-lg hover:shadow-slate-200/50"
      style={{ minHeight: "540px" }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img
          src={getImageUrl(program.thumbnail_path ?? program.program_images?.[0])}
          alt={program.title}
          className="h-full w-full object-cover"
          onError={(evt) => ((evt.target as HTMLImageElement).src = imagePlaceholder)}
        />
        <div className="absolute left-4 top-4 flex items-center gap-2 text-xs font-semibold text-white">
          <span className="rounded-full uppercase font-heading bg-primary-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm">
            {program.category ?? t("landing.programs.defaultCategory")}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone}`}>
            {statusLabel}
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-brandGreen-100/80 px-2 py-1 rounded-lg">
            {t("landing.programs.progress")} {progress}%
          </span>
        </div>

        <h3 className="text-lg font-heading font-semibold text-slate-900 leading-snug">{program.title}</h3>
        <p className="text-sm text-slate-600 line-clamp-3 min-h-[60px]">{program.short_description}</p>
        <div className="flex items-center gap-2">
          <img src="/brand/dpf-icon.png" alt={brandName} className="h-6 w-6 rounded-md object-contain bg-white" />
          <span className="text-sm font-semibold text-slate-800">{brandName}</span>
          <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500 text-xs" />
        </div>

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
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>{t("landing.programs.deadline")}</span>
          <span className="text-slate-800">{deadlineText}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
             <span>{locale === 'en' ? 'Published:' : 'Diterbitkan:'}</span>
             <span>{formatDate(program.published_at ?? program.created_at, locale)}</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <Link to={detailHref} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            {t("landing.programs.detail")}
          </Link>
          <Link
            to={`/donate?program_id=${program.id}`}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] ${
              isCompleted
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-brandGreen-600 hover:bg-brandGreen-700"
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

export function ProgramSkeleton() {
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
