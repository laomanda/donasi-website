import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCircleInfo, 
  faGear
} from "@fortawesome/free-solid-svg-icons";
import { getAuthUser } from "../../../lib/auth";
import { useLang } from "../../../lib/i18n";
import { translate } from "../../../lib/i18n-utils";
import { guidanceDict } from "../../../i18n/guidance";

import { MitraGuidance } from "../mitra/MitraGuidance";
import * as Sections from "./GuidanceSections";

export function GuidancePage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translate(guidanceDict, locale, key, fallback);
  
  const user = useMemo(() => getAuthUser(), []);
  const role = useMemo(() => {
    if (!user) return null;
    if (user.roles?.some(r => r.name === 'superadmin')) return 'superadmin';
    if (user.roles?.some(r => r.name === 'admin')) return 'admin';
    if (user.roles?.some(r => r.name === 'editor')) return 'editor';
    if (user.roles?.some(r => r.name === 'mitra')) return 'mitra';
    return user.role_label?.toLowerCase() || null;
  }, [user]);

  const permissions = useMemo(() => {
    if (!user) return new Set<string>();
    const p = new Set<string>();
    if (Array.isArray(user.permissions)) {
      user.permissions.forEach((perm: any) => {
        if (typeof perm === 'string') p.add(perm);
        else if (perm?.name) p.add(perm.name);
      });
    }
    return p;
  }, [user]);

  const isSuperAdmin = useMemo(() => user?.roles?.some(r => r.name === 'superadmin'), [user]);
  const isCoreRole = useMemo(() => ['superadmin', 'admin', 'editor'].includes(role || ''), [role]);

  const DynamicContent = useMemo(() => {
    // Mitra logic stays separate as it's a completely different user type
    if (role === 'mitra') return <MitraGuidance />;

    const sections: React.ReactNode[] = [];

    // 0. Intro Section (Only for Core Roles)
    if (isCoreRole && role) {
      sections.push(<Sections.WelcomeBanner key="banner" t={t} role={role} />);
      
      // 1. Role Purpose / Responsibility
      if (role === 'editor') {
        sections.push(<Sections.RolePurposeSection key="purpose" t={t} type="editor" />);
      } else if (role === 'admin' || role === 'superadmin') {
        sections.push(<Sections.RolePurposeSection key="purpose" t={t} type="admin" />);
      }
    } else if (!isCoreRole && role) {
      // 0. Simple Header for Custom Roles
      sections.push(
        <section key="custom-header" className="bg-brandGreen-50 p-6 rounded-2xl border border-brandGreen-100 flex items-center gap-4">
           <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-brandGreen-100 flex items-center justify-center text-brandGreen-600">
             <FontAwesomeIcon icon={faGear} />
           </div>
           <div>
             <h2 className="text-xl font-bold text-brandGreen-900">Panduan Operasional: {user?.role_label || role}</h2>
             <p className="text-brandGreen-700 text-sm">Instruksi kerja berdasarkan izin (permissions) yang diberikan pada akun Anda.</p>
           </div>
        </section>
      );
    }

    // 2. Superadmin special section
    if (isSuperAdmin) {
      sections.push(
        <section key="super" className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
           <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
               <FontAwesomeIcon icon={Sections.faShieldHalved} />
             </div>
             {t("guidance.superadmin.section.authority.title", "Kontrol Utama Sistem")}
           </h3>
           <p className="text-slate-600 text-sm leading-relaxed">
             {t("guidance.superadmin.section.authority.text")}
           </p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-xs uppercase text-slate-500 mb-2">Manajemen User</p>
                <p className="text-sm text-slate-700">{t("guidance.superadmin.section.users.crud")}</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-xs uppercase text-slate-500 mb-2">Akses & Role</p>
                <p className="text-sm text-slate-700">{t("guidance.superadmin.section.users.roles")}</p>
             </div>
           </div>
        </section>
      );
    }

    // 3. Donation & Payments (Admin / specialized staff)
    if (isSuperAdmin || permissions.has('manage donations')) {
      sections.push(<Sections.DonationOperationsSection key="donations" t={t} />);
    }

    // 4. Content & Programs (Editor / specialized staff)
    if (isSuperAdmin || permissions.has('manage programs') || permissions.has('manage articles')) {
      sections.push(<Sections.ContentManagementSection key="content" t={t} />);
    }

    // 5. Tasks (Anyone who can manage tasks)
    if (isSuperAdmin || permissions.has('manage tasks')) {
      sections.push(<Sections.OperationalTaskSection key="tasks" t={t} />);
    }

    // 6. User services
    if (isSuperAdmin || permissions.has('manage consultations') || permissions.has('manage pickup_requests')) {
      sections.push(<Sections.UserServicesSection key="services" t={t} />);
    }

    // 7. Finance & Allocation
    if (isSuperAdmin || permissions.has('manage allocations')) {
      sections.push(<Sections.FinanceAllocationSection key="finance" t={t} />);
    }

    // 8. Detailed Menu List
    sections.push(<Sections.MenuListSection key="menus" t={t} permissions={permissions} isSuperAdmin={!!isSuperAdmin} />);

    // 9. FAQ Section (Only for Core Roles)
    if (isCoreRole) {
      const faqs = [];
      if (role === 'editor') {
         faqs.push({ q: "guidance.editor.faq.q1", a: "guidance.editor.faq.a1" }, { q: "guidance.editor.faq.q2", a: "guidance.editor.faq.a2" });
      } else if (role === 'admin' || role === 'superadmin') {
         faqs.push({ q: "guidance.admin.faq.q1", a: "guidance.admin.faq.a1" }, { q: "guidance.admin.faq.q2", a: "guidance.admin.faq.a2" });
      }
      if (faqs.length > 0) {
        sections.push(<Sections.FAQSection key="faq" t={t} faqs={faqs} />);
      }
    }

    if (sections.length === 1 && !isCoreRole) { 
      // Only the header is there, meaning no permissions found
      return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row">
            <div className="flex items-center justify-center bg-slate-50 p-6 sm:w-48">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                <FontAwesomeIcon icon={faCircleInfo} className="h-8 w-8 text-brandGreen-500" />
              </div>
            </div>
            <div className="flex-1 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Belum Ada Instruksi Kerja</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Akun Anda belum memiliki izin (permission) spesifik untuk menjalankan modul operasional di dashboard ini.
              </p>
            </div>
          </div>
        </section>
      );
    }

    if (sections.length === 0) {
      return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row">
            <div className="flex items-center justify-center bg-slate-50 p-6 sm:w-48">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                <FontAwesomeIcon icon={faCircleInfo} className="h-8 w-8 text-brandGreen-500" />
              </div>
            </div>
            <div className="flex-1 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Panduan Umum</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Silakan gunakan menu navigasi untuk mengakses fitur-fitur yang tersedia sesuai akun Anda.
              </p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <div className="space-y-12">
        {sections}
      </div>
    );
  }, [role, permissions, isSuperAdmin, t]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t('guidance.title', 'Panduan Pengguna')}
        </h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          {t('guidance.subtitle', 'Penjelasan fitur sesuai peran akses Anda.')}
        </p>
      </header>

      <div className="grid gap-6">
        {DynamicContent}

        <section className="rounded-2xl bg-brandGreen-50 p-6 border border-brandGreen-100">
          <div className="flex items-start gap-4">
            <FontAwesomeIcon icon={faGear} className="mt-1 text-brandGreen-600 h-5 w-5" />
            <div>
              <h3 className="font-semibold text-brandGreen-900">{t("guidance.tips.title", "Tips Tambahan")}</h3>
              <p className="text-sm text-brandGreen-700 mt-1">
                {t("guidance.tips.desc", "Jika Anda merasa kesulitan menemukan fitur tertentu, gunakan fitur Cari Cepat di header atas. Jangan lupa untuk selalu Keluar (Logout) setelah selesai mengelola dashboard demi keamanan akun Anda.")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

