import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingHeart, faCheckCircle, faArrowRight, faBookmark as faBookmarkSolid, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons";
import { imagePlaceholder } from "@/lib/placeholder";
import type { 
  Program, 
} from "./ProgramShared";
import { getProgress, getStatusLabel, getProgramStatusTone, getImageUrl, canonicalStatus, formatCurrency, formatDate, getRemainingDays, pickLocale } from "./ProgramShared";
import { dpfIcon } from "@/assets/brand";
import { useSavedItems } from "@/lib/SavedItemsContext";

interface ProgramCardProps {
  program: Program;
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
  variant?: "save" | "remove";
}

export function ProgramCard({ program, locale, t, variant = "save" }: ProgramCardProps) {
  const { toggleSave, isSaved } = useSavedItems();
  const saved = isSaved(Number(program.id), 'Program');

  const progress = getProgress(program.collected_amount, program.target_amount);
  const statusLabel = getStatusLabel(program.status, t, program.published_at, program.deadline_days);
  const statusTone = getProgramStatusTone(program.status, program.published_at, program.deadline_days);

  const brandName = "Djalalaludin Pane Foundation";
  const isCompleted = canonicalStatus(program.status, program.published_at, program.deadline_days) === "completed";
  
  const remainingDays = getRemainingDays(program.published_at, program.deadline_days);
  const deadlineText = remainingDays !== null 
    ? (remainingDays > 0 ? `${remainingDays} ${locale === "en" ? "days" : "hari"}` : t("program.deadline.ended", "Selesai"))
    : t("program.deadline.unlimited");

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
            {pickLocale(program.category, program.category_en, locale) || t("program.defaultCategory")}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSave(Number(program.id), 'Program');
          }}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-90 ${
            variant === "remove"
              ? "bg-red-50 text-red-500 hover:bg-red-100 shadow-sm border border-red-100"
              : saved 
                ? "bg-primary-600 text-white shadow-lg" 
                : "bg-white/70 text-slate-700 hover:bg-white hover:text-primary-600"
          }`}
          title={variant === "remove" ? "Hapus dari simpanan" : (saved ? "Hapus dari simpanan" : "Simpan program")}
        >
          <FontAwesomeIcon icon={variant === "remove" ? faTrash : (saved ? faBookmarkSolid : faBookmarkRegular)} className="text-sm" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone}`}>
            {statusLabel}
          </span>
        </div>

        <h3 className="text-lg font-heading font-semibold text-slate-900 leading-snug">{pickLocale(program.title, program.title_en, locale)}</h3>
        <p className="text-sm text-slate-600 line-clamp-3 min-h-[60px]">{pickLocale(program.short_description, program.short_description_en, locale)}</p>
        <div className="flex items-center gap-2">
          <img src={dpfIcon} alt={brandName} className="h-6 w-6 rounded-md object-contain bg-white" />
          <span className="text-sm font-semibold text-slate-800">{brandName}</span>
          <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500 text-xs" />
        </div>

        <div className="mt-1 relative h-5 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/50">
          <div
            className="h-full rounded-full bg-brandGreen-600 transition-[width] duration-700 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-[10px] font-bold transition-colors duration-300 ${progress >= 55 ? 'text-white' : 'text-brandGreen-800'}`}>
              {progress}%
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>{t("program.collected")} {formatCurrency(program.collected_amount, locale)}</span>
          <span>{t("program.target")} {formatCurrency(program.target_amount, locale)}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>{t("program.deadline")}</span>
          <span className="text-slate-800">{deadlineText}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
             <span>{locale === 'en' ? 'Published:' : 'Diterbitkan:'}</span>
             <span>{formatDate(program.published_at ?? program.created_at, locale)}</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <Link
            to={`/program/${program.slug}`}
            className="text-sm font-semibold text-brandGreen-600 hover:text-brandGreen-700 transition-colors"
          >
            {t("program.detail")}
            <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs" />
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
            {t("program.donate")}
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
