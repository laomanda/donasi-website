import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faImages } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import type { Locale } from "@/lib/i18n";

export function GalleryDpfCta({ locale }: { locale: Locale }) {
  const isEnglish = locale === "en";
  return (
    <Link
      to="/aktivitas-dpf"
      className="group flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-200 hover:shadow-md sm:p-7"
    >
      <div>
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brandGreen-50 text-brandGreen-700 transition-colors duration-300 group-hover:bg-brandGreen-600 group-hover:text-white">
            <FontAwesomeIcon icon={faImages} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brandGreen-700">
              {isEnglish ? "Our activities" : "Aktivitas kami"}
            </p>
            <h2 className="mt-0.5 font-heading text-lg font-bold leading-snug text-slate-900 transition-colors duration-300 group-hover:text-brandGreen-700">
              {isEnglish ? "See DPF in action" : "Lihat aktivitas DPF"}
            </h2>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 transition-all duration-300 group-hover:border-brandGreen-600 group-hover:bg-brandGreen-600 group-hover:text-white">
          <span>{isEnglish ? "Lihat gallery" : "Lihat gallery"}</span>
          <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
        </span>
      </div>
    </Link>
  );
}
