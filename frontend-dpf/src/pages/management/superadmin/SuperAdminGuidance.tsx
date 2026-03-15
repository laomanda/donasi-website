import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserShield,
  faUsers,
  faKey,
  faChartPie,
  faGears,
  faShieldHalved,
  faCircleQuestion,
  faChevronRight,
  faChartLine,
  faUserGroup,
  faGear,
  faCircleInfo
} from "@fortawesome/free-solid-svg-icons";
import { useLang } from "../../../lib/i18n";
import { translate } from "../../../lib/i18n-utils";
import { guidanceDict } from "../../../i18n/guidance";

export function SuperAdminGuidance() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(guidanceDict, locale, key, fallback);

  return (
    <div className="space-y-8 pb-10">
      {/* Intro Section */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center justify-center bg-slate-900 p-6 sm:w-48 text-white">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 shadow-xl ring-4 ring-slate-700">
              <FontAwesomeIcon icon={faUserShield} className="h-10 w-10 text-brandGreen-400" />
            </div>
          </div>
          <div className="flex-1 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {t("guidance.superadmin.title", "Kontrol Sistem Utama: Panduan Pengguna Superadmin")}
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              {t("guidance.superadmin.welcome", "Sebagai Superadmin, Anda memegang otoritas tertinggi sistem DPF.")}
            </p>
            <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-200 flex gap-3 items-start">
              <FontAwesomeIcon icon={faShieldHalved} className="text-orange-600 mt-1" />
              <p className="text-sm text-orange-800 font-medium italic">
                {t("guidance.superadmin.important", "Peringatan Keamanan: Gunakan akun Superadmin hanya untuk kebutuhan administratif tingkat tinggi.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Authority Scope */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">1</span>
          {t("guidance.superadmin.section.authority.title")}
        </h3>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 ml-10">
          <p className="text-slate-600 leading-relaxed">
            {t("guidance.superadmin.section.authority.text")}
          </p>
        </div>
      </section>

      {/* 2. Management & Rights */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">2</span>
          {t("guidance.superadmin.section.users.title")}
        </h3>
        <div className="ml-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-3 text-brandGreen-600 font-bold">
              <FontAwesomeIcon icon={faUsers} />
              <span>CRUD User</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("guidance.superadmin.section.users.crud")}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-3 text-rose-600 font-bold">
              <FontAwesomeIcon icon={faKey} />
              <span>Role & Permission</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("guidance.superadmin.section.users.roles")}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Global Features */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">3</span>
          {t("guidance.superadmin.section.core.title")}
        </h3>
        <div className="ml-10 space-y-4">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex gap-4">
             <FontAwesomeIcon icon={faChartPie} className="text-brandGreen-500 text-xl mt-1" />
             <div className="space-y-1">
               <h4 className="font-bold text-slate-800">Laporan Konsolidasi</h4>
               <p className="text-sm text-slate-600">{t("guidance.superadmin.section.core.reports")}</p>
             </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex gap-4">
             <FontAwesomeIcon icon={faGears} className="text-blue-500 text-xl mt-1" />
             <div className="space-y-1">
               <h4 className="font-bold text-slate-800">Pengaturan Sistem</h4>
               <p className="text-sm text-slate-600">{t("guidance.superadmin.section.core.settings")}</p>
             </div>
          </div>
        </div>
      </section>

      {/* 4. Menu List */}
      <section className="space-y-4">
        <h4 className="text-lg font-bold text-slate-900 ml-10 italic">Menu Khusus Superadmin:</h4>
        <div className="ml-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { n: "Pengguna", i: faUserGroup },
            { n: "Laporan Donasi", i: faChartLine },
            { n: "Pengaturan", i: faGear },
            { n: "Panduan", i: faCircleInfo },
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

      {/* 5. Cross-module note */}
      <section className="p-6 rounded-2xl bg-brandGreen-50 border border-brandGreen-100 flex gap-4 items-center">
        <FontAwesomeIcon icon={faShieldHalved} className="text-brandGreen-600 text-xl" />
        <p className="text-brandGreen-900 font-medium text-sm">
           Superadmin dapat mengakses seluruh menu **Operasional** (Admin) dan **Konten** (Editor) yang dijelaskan pada halaman panduan role tersebut.
        </p>
      </section>

      {/* 6. FAQ */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">6</span>
          {t("guidance.mitra.section.trouble.title")}
        </h3>
        <div className="ml-10 grid gap-4 grid-cols-1 md:grid-cols-2">
          {[
            { q: "guidance.superadmin.faq.q1", a: "guidance.superadmin.faq.a1" },
            { q: "guidance.superadmin.faq.q2", a: "guidance.superadmin.faq.a2" }
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
    </div>
  );
}
