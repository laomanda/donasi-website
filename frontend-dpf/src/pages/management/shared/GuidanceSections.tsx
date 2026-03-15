import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faListCheck,
  faCommentDots,
  faWallet,
  faHandshake,
  faHeadset,
  faTruckRampBox,
  faCheckCircle,
  faCircleQuestion,
  faPlus,
  faPen,
  faTrash,
  faCloudArrowUp,
  faGaugeHigh,
  faCircleExclamation,
  faBookOpen,
  faPuzzlePiece,
  faImage,
  faChartLine,
  faGears,
  faChevronRight,
  faHeart,
  faUserGroup,
  faShieldHalved
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

export { faShieldHalved };

interface SectionProps {
  t: (key: string, fallback?: string) => string;
}

interface MenuItem {
  n: string;
  i: any;
}

/**
 * Banner Pengantar Dinamis
 */
export function WelcomeBanner({ t, role }: { t: any, role: string }) {
  const isEditor = role === 'editor';
  
  const icon = isEditor ? faBookOpen : (role === 'superadmin' ? faShieldHalved : faShieldHalved);
  const colorClass = isEditor ? "text-brandGreen-500" : "text-brandGreen-500";
  const bgClass = "bg-brandGreen-50";
  const ringClass = "ring-brandGreen-100";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <div className={`flex items-center justify-center ${bgClass} p-6 sm:w-48`}>
          <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md ring-4 ${ringClass}`}>
            <FontAwesomeIcon icon={icon} className={`h-10 w-10 ${colorClass}`} />
          </div>
        </div>
        <div className="flex-1 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            {role === 'editor' ? t("guidance.editor.title") : (role === 'admin' ? t("guidance.admin.title") : t("guidance.superadmin.title"))}
          </h2>
          <p className="text-slate-600 leading-relaxed text-lg">
            {role === 'editor' ? t("guidance.editor.welcome") : (role === 'admin' ? t("guidance.admin.welcome") : t("guidance.superadmin.welcome"))}
          </p>
          <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 flex gap-3 items-start">
            <FontAwesomeIcon icon={faShieldHalved} className="text-blue-600 mt-1" />
            <p className="text-sm text-blue-800 italic">
              {role === 'editor' ? t("guidance.editor.section.limit.text") : (role === 'admin' ? t("guidance.admin.section.limit.text") : t("guidance.superadmin.section.authority.text"))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Tujuan & Responsibilitas Berdasarkan Hak Akses
 */
export function RolePurposeSection({ t, type }: { t: any, type: 'editor' | 'admin' }) {
  if (type === 'editor') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">1</span>
            {t("guidance.editor.section.purpose.title")}
          </h3>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 h-full">
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
              <span className="text-slate-700 font-medium">{t("guidance.editor.section.categories.content")}</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
              <FontAwesomeIcon icon={faPuzzlePiece} className="text-blue-500" />
              <span className="text-slate-700 font-medium">{t("guidance.editor.section.categories.support")}</span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">1</span>
        {t("guidance.admin.section.responsibility.title")}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  );
}

/**
 * Daftar Menu Detail (Dinamis berdasarkan permissions)
 */
export function MenuListSection({ t, permissions, isSuperAdmin }: { t: any, permissions: Set<string>, isSuperAdmin: boolean }) {
  const menuItems: MenuItem[] = [];

  if (isSuperAdmin || permissions.has('manage donations')) {
    menuItems.push({ n: "Donasi", i: faReceipt }, { n: "Konfirmasi Donasi", i: faCheckCircle });
  }
  if (isSuperAdmin || permissions.has('manage programs')) {
    menuItems.push({ n: "Program", i: faHeart });
  }
  if (isSuperAdmin || permissions.has('manage articles')) {
    menuItems.push({ n: "Artikel", i: faBookOpen });
  }
  if (isSuperAdmin || permissions.has('manage tasks')) {
    menuItems.push({ n: (isSuperAdmin ? "Editor Tasks" : "Tugas Editor"), i: faListCheck });
  }
  if (isSuperAdmin || permissions.has('manage pickup_requests')) {
    menuItems.push({ n: "Jemput Wakaf", i: faTruckRampBox });
  }
  if (isSuperAdmin || permissions.has('manage consultations')) {
    menuItems.push({ n: "Konsultasi", i: faHeadset });
  }
  if (isSuperAdmin || permissions.has('manage reports')) {
    menuItems.push({ n: "Laporan Donasi", i: faChartLine });
  }
  if (isSuperAdmin || permissions.has('manage allocations')) {
    menuItems.push({ n: "Alokasi", i: faHandshake });
  }
  if (isSuperAdmin) {
    menuItems.push({ n: "Pengguna", i: faUserGroup }, { n: "Roles", i: faShieldHalved });
  }
  
  menuItems.push({ n: "Pengaturan", i: faGears });

  // Remove duplicates
  const uniqueItems = Array.from(new Set(menuItems.map(m => m.n)))
    .map(name => menuItems.find(m => m.n === name)!);

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
         Daftar Menu Tersedia:
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {uniqueItems.map((m, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 text-sm shadow-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <FontAwesomeIcon icon={m.i} className="w-4 text-slate-400" />
              <span>{t(`nav.item.${m.n}`, m.n)}</span>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="text-[10px] text-slate-300" />
          </div>
        ))}
      </div>
    </section>
  );
}

interface SectionProps {
  t: (key: string, fallback?: string) => string;
}

/**
 * Blok Panduan Operasional Donasi (Admin & Superadmin)
 */
export function DonationOperationsSection({ t }: SectionProps) {
  return (
    <section className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-sm border border-rose-100">
          <FontAwesomeIcon icon={faReceipt} />
        </div>
        Manajemen Donasi & Transaksi
      </h3>
      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 text-rose-600">
            <FontAwesomeIcon icon={faGaugeHigh} />
            Verifikasi Status Donasi
          </h4>
          <p className="text-slate-600 leading-relaxed text-sm italic">
             {t("guidance.admin.section.features.status")}
          </p>
          <div className="flex gap-4 items-center p-3 bg-amber-50 rounded-xl border border-amber-100">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-amber-500" />
            <p className="text-xs text-amber-800 font-medium">{t("guidance.admin.important")}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 text-emerald-600">
            <FontAwesomeIcon icon={faWhatsapp} />
            Integrasi WhatsApp
          </h4>
          <p className="text-slate-600 leading-relaxed text-sm">
             {t("guidance.admin.section.features.wa")}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Blok Panduan Konten & Artikel (Editor, Admin, Superadmin)
 */
export function ContentManagementSection({ t }: SectionProps) {
  return (
    <section className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
          <FontAwesomeIcon icon={faBookOpen} />
        </div>
        Pengelolaan Konten & Program
      </h3>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-4">
            <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded bg-emerald-50 text-emerald-600">
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <p className="text-xs text-slate-600">{t("guidance.editor.section.steps.crud.add")}</p>
          </div>
          <div className="flex gap-4">
            <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded bg-amber-50 text-amber-600">
              <FontAwesomeIcon icon={faPen} />
            </div>
            <p className="text-xs text-slate-600">{t("guidance.editor.section.steps.crud.edit")}</p>
          </div>
          <div className="flex gap-4">
            <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded bg-red-50 text-red-600">
              <FontAwesomeIcon icon={faTrash} />
            </div>
            <p className="text-xs text-slate-600">{t("guidance.editor.section.steps.crud.delete")}</p>
          </div>
        </div>
        
        <div className="flex gap-4 bg-slate-50 p-4 rounded-xl items-center">
          <FontAwesomeIcon icon={faCloudArrowUp} className="text-slate-400" />
          <p className="text-sm text-slate-700 font-medium">
            {t("guidance.editor.section.steps.image")}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Blok Panduan Tugas & Koordinasi (Editor & Admin)
 */
export function OperationalTaskSection({ t }: SectionProps) {
  return (
    <section className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandGreen-50 text-brandGreen-600 shadow-sm border border-brandGreen-100">
          <FontAwesomeIcon icon={faListCheck} />
        </div>
        Tugas & Koordinasi Tim
      </h3>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex gap-6 items-center">
        <div className="h-16 w-16 bg-slate-50 flex items-center justify-center rounded-full text-slate-400 shrink-0">
          <FontAwesomeIcon icon={faListCheck} className="text-2xl" />
        </div>
        <p className="text-slate-600 leading-relaxed text-sm">
          {t("guidance.editor.section.tasks.desc")}
        </p>
      </div>
    </section>
  );
}

/**
 * Blok Layanan Pengguna (Pickup, Konsultasi, Saran)
 */
export function UserServicesSection({ t }: SectionProps) {
  return (
    <section className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-sm border border-amber-100">
          <FontAwesomeIcon icon={faHeadset} />
        </div>
        Layanan & Komunikasi Publik
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { n: "Jemput Wakaf", i: faTruckRampBox, d: "Kelola permintaan penjemputan donasi fisik dari publik." },
          { n: "Konsultasi", i: faHeadset, d: "Jawab pertanyaan atau konsultasi wakaf dari para mitra." },
          { n: "Saran Wakaf", i: faCommentDots, d: "Pantau masukan dan ide penyaluran wakaf dari masyarakat." },
          { n: "Konfirmasi Donasi", i: faCheckCircle, d: "Verifikasi bukti transfer manual yang diunggah donatur." },
        ].map((m, i) => (
          <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200">
             <div className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded text-amber-600 shrink-0">
               <FontAwesomeIcon icon={m.i} />
             </div>
             <div>
               <p className="font-bold text-slate-800 text-sm">{t(`nav.item.${m.n}`, m.n)}</p>
               <p className="text-xs text-slate-500 mt-1">{m.d}</p>
             </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Blok Keuangan & Alokasi
 */
export function FinanceAllocationSection({ t }: SectionProps) {
  return (
    <section className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
          <FontAwesomeIcon icon={faWallet} />
        </div>
        Transparansi & Alokasi Dana
      </h3>
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex gap-4 items-start">
          <FontAwesomeIcon icon={faHandshake} className="text-emerald-600 mt-1" />
          <p className="text-slate-600 text-sm leading-relaxed">
            {t("guidance.admin.section.features.allocation")}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Blok FAQ Modular
 */
export function FAQSection({ t, faqs }: { t: any, faqs: { q: string, a: string }[] }) {
  return (
    <section className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shadow-sm border border-slate-200">
          <FontAwesomeIcon icon={faCircleQuestion} />
        </div>
        Tanya Jawab (FAQ)
      </h3>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {faqs.map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-brandGreen-700 font-bold text-sm">
              <FontAwesomeIcon icon={faCircleQuestion} />
              <span>{t(item.q)}</span>
            </div>
            <p className="text-slate-600 pl-6 leading-relaxed text-xs">
              {t(item.a)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
