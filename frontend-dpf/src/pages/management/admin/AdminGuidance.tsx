import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faShieldHalved,
  faGaugeHigh,
  faListCheck,
  faReceipt,
  faCheckCircle,
  faCommentDots,
  faTruckRampBox,
  faHeadset,
  faHandshake,
  faWallet,
  faChartLine,
  faGears,
  faCircleExclamation,
  faCircleQuestion,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { useLang } from "../../../lib/i18n";
import { translate } from "../../../lib/i18n-utils";
import { guidanceDict } from "../../../i18n/guidance";

export function AdminGuidance() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(guidanceDict, locale, key, fallback);

  return (
    <div className="space-y-8 pb-10">
      {/* Intro Section */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center justify-center bg-brandGreen-50 p-6 sm:w-48">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-brandGreen-100">
              <FontAwesomeIcon icon={faShieldHalved} className="h-10 w-10 text-brandGreen-500" />
            </div>
          </div>
          <div className="flex-1 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {t("guidance.admin.title", "Pusat Operasional: Panduan Pengguna Admin")}
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              {t("guidance.admin.welcome", "Sebagai Admin, Anda memegang kunci operasional harian sistem DPF.")}
            </p>
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3 items-start">
              <FontAwesomeIcon icon={faCircleExclamation} className="text-red-600 mt-1" />
              <p className="text-sm text-red-800 font-medium italic">
                {t("guidance.admin.important", "Peringatan: Berhati-hatilah saat mengubah status donasi!")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Responsibilities */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">1</span>
          {t("guidance.admin.section.responsibility.title")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-10">
          {[
            { icon: faReceipt, color: "text-rose-500", key: "guidance.admin.section.responsibility.item1" },
            { icon: faListCheck, color: "text-brandGreen-500", key: "guidance.admin.section.responsibility.item2" },
            { icon: faCommentDots, color: "text-blue-500", key: "guidance.admin.section.responsibility.item3" },
            { icon: faWallet, color: "text-amber-500", key: "guidance.admin.section.responsibility.item4" },
          ].map((item, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 flex gap-4 items-center">
              <div className={`h-12 w-12 shrink-0 flex items-center justify-center rounded-lg bg-slate-50 ${item.color}`}>
                <FontAwesomeIcon icon={item.icon} className="text-xl" />
              </div>
              <p className="text-sm text-slate-700">{t(item.key)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Workflows */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">2</span>
          {t("guidance.admin.section.workflow.title")}
        </h3>
        <div className="ml-10 space-y-4">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
             <div className="flex gap-4 items-start">
               <div className="h-6 w-6 rounded bg-brandGreen-500 text-white flex items-center justify-center shrink-0 mt-1">
                 <FontAwesomeIcon icon={faReceipt} className="text-xs" />
               </div>
               <p className="text-slate-700 font-medium">{t("guidance.admin.section.workflow.donations")}</p>
             </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
             <div className="flex gap-4 items-start">
               <div className="h-6 w-6 rounded bg-brandGreen-500 text-white flex items-center justify-center shrink-0 mt-1">
                 <FontAwesomeIcon icon={faListCheck} className="text-xs" />
               </div>
               <p className="text-slate-700 font-medium">{t("guidance.admin.section.workflow.tasks")}</p>
             </div>
          </div>
        </div>
      </section>

      {/* 3. Features Detail */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">3</span>
          {t("guidance.admin.section.features.title")}
        </h3>
        <div className="ml-10 grid gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-rose-600">
              <FontAwesomeIcon icon={faGaugeHigh} />
              Verifikasi Status Donasi
            </h4>
            <p className="text-slate-600 leading-relaxed text-sm italic">
               {t("guidance.admin.section.features.status")}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-emerald-600">
              <FontAwesomeIcon icon={faWhatsapp} />
              Integrasi WhatsApp
            </h4>
            <p className="text-slate-600 leading-relaxed text-sm">
               {t("guidance.admin.section.features.wa")}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-brandGreen-600">
              <FontAwesomeIcon icon={faWallet} />
              Manajemen Alokasi Dana
            </h4>
            <p className="text-slate-600 leading-relaxed text-sm">
               {t("guidance.admin.section.features.allocation")}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Menu List */}
      <section className="space-y-4">
        <h4 className="text-lg font-bold text-slate-900 ml-10">Daftar Menu Utama Admin:</h4>
        <div className="ml-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { n: "Donasi", i: faReceipt },
            { n: "Konfirmasi Donasi", i: faCheckCircle },
            { n: "Saran Wakaf", i: faCommentDots },
            { n: "Editor Tasks", i: faListCheck },
            { n: "Jemput Wakaf", i: faTruckRampBox },
            { n: "Konsultasi", i: faHeadset },
            { n: "Laporan Donasi", i: faChartLine },
            { n: "Alokasi", i: faHandshake },
            { n: "Pengaturan", i: faGears },
          ].map((m, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 text-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <FontAwesomeIcon icon={m.i} className="w-4 text-slate-400" />
                <span>{m.n}</span>
              </div>
              <FontAwesomeIcon icon={faChevronRight} className="text-[10px] text-slate-300" />
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">5</span>
          {t("guidance.mitra.section.trouble.title")}
        </h3>
        <div className="ml-10 grid gap-4 grid-cols-1 md:grid-cols-2">
          {[
            { q: "guidance.admin.faq.q1", a: "guidance.admin.faq.a1" },
            { q: "guidance.admin.faq.q2", a: "guidance.admin.faq.a2" }
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-brandGreen-700 font-bold">
                <FontAwesomeIcon icon={faCircleQuestion} />
                <span>{t(item.q)}</span>
              </div>
              <p className="text-slate-600 pl-6 leading-relaxed text-sm">
                {t(item.a)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Batasan Akses */}
      <section className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4 items-center">
        <FontAwesomeIcon icon={faCircleExclamation} className="text-amber-500 text-xl" />
        <p className="text-amber-900 font-medium text-sm">
          {t("guidance.admin.section.limit.text")}
        </p>
      </section>
    </div>
  );
}
