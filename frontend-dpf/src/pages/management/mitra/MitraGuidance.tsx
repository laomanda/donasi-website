import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHandshake, 
  faGaugeHigh, 
  faFilePdf, 
  faReceipt,
  faCircleQuestion,
  faCircleExclamation,
  faArrowRight,
  faDownload,
  faGear,
  faCircleInfo,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { useLang } from "../../../lib/i18n";
import { translate } from "../../../lib/i18n-utils";
import { guidanceDict } from "../../../i18n/guidance";

export function MitraGuidance() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(guidanceDict, locale, key, fallback);

  return (
    <div className="space-y-8 pb-10">
      {/* Intro Section */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center justify-center bg-brandGreen-50 p-6 sm:w-48">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-brandGreen-100">
              <FontAwesomeIcon icon={faHandshake} className="h-10 w-10 text-brandGreen-500" />
            </div>
          </div>
          <div className="flex-1 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {t("guidance.mitra.title", "Selamat Datang di Dashboard Mitra DPF")}
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              {t("guidance.mitra.welcome", "Panduan ini dirancang untuk membantu Anda memantau kontribusi dan transparansi penyaluran dana secara mandiri.")}
            </p>
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3 items-start">
              <FontAwesomeIcon icon={faCircleExclamation} className="text-amber-600 mt-1" />
              <p className="text-sm text-amber-800 italic">
                {t("guidance.mitra.important", "Catatan: Anda tidak memiliki akses untuk membuat, mengedit, atau menghapus data utama.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Goals */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">1</span>
          {t("guidance.mitra.section.goal.title", "Tujuan Dashboard Mitra")}
        </h3>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 ml-10">
          <p className="text-slate-600">
            {t("guidance.mitra.section.goal.text", "Memberikan transparansi penuh kepada Anda sebagai pendonor atau mitra kerjasama.")}
          </p>
        </div>
      </section>

      {/* 2. Menus */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">2</span>
          {t("guidance.mitra.section.menu.title", "Mengenal Menu Anda")}
        </h3>
        <div className="grid gap-4 ml-10">
          {[
            { icon: faGaugeHigh, text: "guidance.mitra.section.menu.item1" },
            { icon: faHandshake, text: "guidance.mitra.section.menu.item2" },
            { icon: faReceipt, text: "guidance.mitra.section.menu.item3" },
            { icon: faGear, text: "guidance.mitra.section.menu.item4" },
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                <FontAwesomeIcon icon={m.icon} />
              </div>
              <span className="text-slate-700">{t(m.text)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Daftar Menu Visual */}
      <section className="space-y-4">
        <h4 className="text-lg font-bold text-slate-900 ml-10">Daftar Menu Sidebar Mitra:</h4>
        <div className="ml-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { n: "Dashboard", i: faGaugeHigh },
            { n: "Bukti Alokasi", i: faHandshake },
            { n: "Riwayat Donasi", i: faReceipt },
            { n: "Panduan", i: faCircleInfo },
            { n: "Pengaturan", i: faGear },
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

      {/* 3. Steps */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">3</span>
          {t("guidance.mitra.section.steps.title", "Cara Penggunaan Situs")}
        </h3>
        
        <div className="ml-10 space-y-8">
          {/* Allocation Steps */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-slate-800">{t("guidance.mitra.section.steps.allocation.title")}</h4>
              <FontAwesomeIcon icon={faFilePdf} className="text-red-500" />
            </div>
            <div className="p-6 space-y-4">
              {[
                "guidance.mitra.section.steps.allocation.step1",
                "guidance.mitra.section.steps.allocation.step2",
                "guidance.mitra.section.steps.allocation.step3"
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs text-brandGreen-500" />
                  <p className="text-slate-700">{t(step)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Donation Steps */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-slate-800">{t("guidance.mitra.section.steps.donation.title")}</h4>
              <FontAwesomeIcon icon={faDownload} className="text-blue-500" />
            </div>
            <div className="p-6 space-y-4">
              {[
                "guidance.mitra.section.steps.donation.step1",
                "guidance.mitra.section.steps.donation.step2",
                "guidance.mitra.section.steps.donation.step3"
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs text-brandGreen-500" />
                  <p className="text-slate-700">{t(step)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">4</span>
          {t("guidance.mitra.section.trouble.title", "Troubleshooting & FAQ")}
        </h3>
        <div className="ml-10 space-y-4">
          {[
            { q: "guidance.mitra.faq.q1", a: "guidance.mitra.faq.a1" },
            { q: "guidance.mitra.faq.q2", a: "guidance.mitra.faq.a2" }
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-brandGreen-700 font-bold">
                <FontAwesomeIcon icon={faCircleQuestion} />
                <span>{t(item.q)}</span>
              </div>
              <p className="text-slate-600 pl-6 leading-relaxed">
                {t(item.a)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
