import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheckCircle, 
  faHandHoldingHeart 
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import type { Program } from "../ProgramShared";
import { getStatusLabel, getProgramStatusTone, formatCurrency } from "../ProgramShared";
import { dpfIcon } from "@/assets/brand";

interface ProgramDetailSidebarProps {
  program: Program;
  localizedProgram: any;
  locale: "id" | "en";
  t: (key: string, fallback?: string) => string;
  progressPercent: number;
  isCompleted: boolean;
  deadlineText: string;
  shareText: string;
}

export function ProgramDetailSidebar({
  program,
  localizedProgram,
  locale,
  t,
  progressPercent,
  isCompleted,
  deadlineText,
  shareText
}: ProgramDetailSidebarProps) {
  const brandName = "Djalalaludin Pane Foundation";
  const statusTone = getProgramStatusTone(program?.status, program?.deadline_days);

  return (
    <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold text-slate-500">{locale === "en" ? "Donation summary" : "Ringkasan donasi"}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-700 ring-1 ring-primary-100">
            {localizedProgram?.category}
          </span>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${statusTone}`}>
            {getStatusLabel(program?.status, t, program?.deadline_days)}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
          <img src={dpfIcon} alt={brandName} className="h-8 w-8 rounded-md bg-white object-contain" />
          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">{brandName}</span>
          <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500 text-sm ml-auto" />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>{t("landing.programs.deadline")}</span>
          <span className="text-slate-800">{deadlineText}</span>
        </div>

        <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
          {locale === "en" ? "Part of social program" : "Bagian dari program sosial"}
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-2">
          <p className="font-heading text-3xl font-semibold text-slate-900">
            {formatCurrency(program?.collected_amount, locale)}
          </p>
          <p className="text-sm font-semibold text-slate-500">
            {locale === "en" ? "Of" : "Dari"} {formatCurrency(program?.target_amount, locale)}
          </p>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brandGreen-600"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{Math.round(progressPercent)}% {locale === "en" ? "Achieved" : "Tercapai"}</span>
          <span className="inline-flex items-center gap-1.5">
            <FontAwesomeIcon icon={faCheckCircle} className="text-brandGreen-600" />
            {getStatusLabel(program?.status, t, program?.deadline_days)}
          </span>
        </div>

        <Link
          to={`/donate?program_id=${program?.id}`}
          className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-sm transition ${
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
          {locale === "en" ? "Donate now" : "Donasi sekarang"}
        </Link>

        <p className="mt-3 text-xs text-slate-500">
          {locale === "en"
            ? "Donation is made through the donate page. Make sure the amount and data are correct."
            : "Donasi dilakukan melalui halaman donate. Pastikan nominal dan data sudah benar."}
        </p>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold text-slate-900">{locale === "en" ? "Share program" : "Bagikan program"}</p>
        <p className="mt-1 text-xs text-slate-500">
          {locale === "en"
            ? "Spread the goodness so more people can be helped."
            : "Sebarkan kebaikan agar lebih banyak yang terbantu."}
        </p>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-brandGreen-200 px-5 py-3 text-sm font-bold text-brandGreen-500 transition hover:bg-brandGreen-500 hover:text-white"
        >
          <FontAwesomeIcon icon={faWhatsapp} />
          {locale === "en" ? "Share via WhatsApp" : "Bagikan via WhatsApp"}
        </a>
      </div>
    </div>
  );
}
