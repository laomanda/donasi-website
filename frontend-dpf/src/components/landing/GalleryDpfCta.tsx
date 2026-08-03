import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faImages } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import type { Locale } from "@/lib/i18n";

export function GalleryDpfCta({ locale }: { locale: Locale }) {
  const isEnglish = locale === "en";
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[32px] bg-gradient-to-br from-brandGreen-700 via-brandGreen-600 to-primary-600 px-6 py-8 text-white shadow-2xl shadow-brandGreen-900/20 sm:flex-row sm:items-center sm:px-10 sm:py-10">
          <div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15"><FontAwesomeIcon icon={faImages} /></span><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">{isEnglish ? "Our activities" : "Aktivitas kami"}</p><h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">{isEnglish ? "See DPF in action" : "Lihat aktivitas DPF"}</h2></div></div>
          <Link to="/aktivitas-dpf" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary-700 transition hover:bg-slate-100">{isEnglish ? "View gallery" : "Lihat gallery"}<FontAwesomeIcon icon={faArrowRight} /></Link>
        </div>
      </div>
    </section>
  );
}
