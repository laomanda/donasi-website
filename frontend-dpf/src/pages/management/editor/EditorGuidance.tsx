import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBookOpen, 
  faPlus, 
  faPen, 
  faTrash, 
  faImage, 
  faListCheck,
  faShieldHalved,
  faCircleQuestion,
  faCircleExclamation,
  faCloudArrowUp,
  faPuzzlePiece,
  faGaugeHigh,
  faHeart,
  faTags,
  faHandshake,
  faSitemap,
  faBuildingColumns,
  faGear,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { useLang } from "../../../lib/i18n";
import { translate } from "../../../lib/i18n-utils";
import { guidanceDict } from "../../../i18n/guidance";

export function EditorGuidance() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(guidanceDict, locale, key, fallback);

  return (
    <div className="space-y-8 pb-10">
      {/* Intro Section */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center justify-center bg-brandGreen-50 p-6 sm:w-48">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-brandGreen-100">
              <FontAwesomeIcon icon={faBookOpen} className="h-10 w-10 text-brandGreen-500" />
            </div>
          </div>
          <div className="flex-1 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {t("guidance.editor.title", "Pusat Konten: Panduan Pengguna Editor")}
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              {t("guidance.editor.welcome", "Sebagai Editor, Anda adalah nyawa dari informasi yang tampil di website.")}
            </p>
            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 flex gap-3 items-start">
              <FontAwesomeIcon icon={faShieldHalved} className="text-blue-600 mt-1" />
              <p className="text-sm text-blue-800 italic">
                {t("guidance.editor.section.limit.text", "Anda tidak memiliki akses ke manajemen User dan laporan keuangan.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Purpose & Grouping */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">1</span>
              {t("guidance.editor.section.purpose.title")}
            </h3>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <p className="text-slate-600 leading-relaxed">
                {t("guidance.editor.section.purpose.text")}
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">2</span>
              {t("guidance.editor.section.categories.title")}
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
                <FontAwesomeIcon icon={faImage} className="text-brandGreen-500" />
                <span className="text-slate-700">{t("guidance.editor.section.categories.content")}</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
                <FontAwesomeIcon icon={faPuzzlePiece} className="text-blue-500" />
                <span className="text-slate-700">{t("guidance.editor.section.categories.support")}</span>
              </div>
            </div>
          </section>
        </div>

        {/* 3. CRUD Guide */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">3</span>
            {t("guidance.editor.section.steps.crud.title")}
          </h3>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded bg-emerald-50 text-emerald-600">
                  <FontAwesomeIcon icon={faPlus} />
                </div>
                <p className="text-sm text-slate-600">{t("guidance.editor.section.steps.crud.add")}</p>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded bg-amber-50 text-amber-600">
                  <FontAwesomeIcon icon={faPen} />
                </div>
                <p className="text-sm text-slate-600">{t("guidance.editor.section.steps.crud.edit")}</p>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded bg-red-50 text-red-600">
                  <FontAwesomeIcon icon={faTrash} />
                </div>
                <p className="text-sm text-slate-600">{t("guidance.editor.section.steps.crud.delete")}</p>
              </div>
            </div>
            <hr border-slate-100 />
            <div className="flex gap-4 bg-slate-50 p-4 rounded-xl">
              <FontAwesomeIcon icon={faCloudArrowUp} className="text-slate-400 mt-1" />
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {t("guidance.editor.section.steps.image")}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* 4. Tasks */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">4</span>
          {t("guidance.editor.section.tasks.title")}
        </h3>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 ml-10 flex gap-6 items-center">
            <div className="h-16 w-16 bg-slate-50 flex items-center justify-center rounded-full text-slate-400">
              <FontAwesomeIcon icon={faListCheck} className="text-2xl" />
            </div>
            <p className="text-slate-600 leading-relaxed flex-1">
              {t("guidance.editor.section.tasks.desc")}
            </p>
        </div>
      </section>

      {/* 5. Menu List */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">5</span>
          Daftar Menu Editor
        </h3>
        <div className="ml-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { n: "Dashboard", i: faGaugeHigh },
            { n: "Tugas Editor", i: faListCheck },
            { n: "Artikel", i: faBookOpen },
            { n: "Program", i: faHeart },
            { n: "Banner", i: faImage },
            { n: "Tags", i: faTags },
            { n: "Mitra", i: faHandshake },
            { n: "Struktur", i: faSitemap },
            { n: "Rekening", i: faBuildingColumns },
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

      {/* 6. FAQ */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">6</span>
          {t("guidance.mitra.section.trouble.title", "Troubleshooting & FAQ")}
        </h3>
        <div className="ml-10 grid gap-4 grid-cols-1 md:grid-cols-2">
          {[
            { q: "guidance.editor.faq.q1", a: "guidance.editor.faq.a1" },
            { q: "guidance.editor.faq.q2", a: "guidance.editor.faq.a2" }
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

      {/* Footer warning */}
      <section className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4 items-center">
        <FontAwesomeIcon icon={faCircleExclamation} className="text-amber-500 text-xl" />
        <p className="text-amber-900 font-medium text-sm">
          {t("guidance.editor.section.limit.text")}
        </p>
      </section>
    </div>
  );
}
