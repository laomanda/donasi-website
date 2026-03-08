import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faGlobe, faShieldHalved, faUser } from "@fortawesome/free-solid-svg-icons";
import type { DashboardRole } from "../../../components/management/dashboard/DashboardUtils";

interface SettingsAccountSectionProps {
  role: DashboardRole;
  displayName: string;
  displayEmail: string;
  tokenExists: boolean;
  roleLabel: (role: DashboardRole) => string;
  onCopy: (value: string, label: string) => void;
}

export function SettingsAccountSection({
  role,
  displayName,
  displayEmail,
  tokenExists,
  roleLabel,
  onCopy,
}: SettingsAccountSectionProps) {
  return (
    <section id="account" className="scroll-mt-24 space-y-6">
      <div className="flex items-center gap-4">
         <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandGreen-600 text-white shadow-lg shadow-brandGreen-600/20">
            <FontAwesomeIcon icon={faUser} className="text-lg" />
         </div>
         <div>
            <h2 className="font-heading text-2xl font-bold text-slate-900">Informasi Akun</h2>
            <p className="text-sm font-medium text-slate-500">Detail identitas dan akses akun Anda.</p>
         </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Nama Lengkap", value: displayName, icon: faUser },
          { label: "Alamat Email", value: displayEmail, icon: faGlobe },
          { label: "Tingkat Akses / Role", value: roleLabel(role), icon: faShieldHalved },
          { label: "Status Sesi", value: tokenExists ? "Terverifikasi Aktif" : "Tidak Aktif", icon: faCircleCheck },
        ].map((item, i) => (
          <div key={i} className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-brandGreen-500/50 hover:shadow-md">
            <div className="absolute right-0 top-0 -mr-4 -mt-4 opacity-5 transition-transform group-hover:scale-110">
              <FontAwesomeIcon icon={item.icon} className="text-7xl" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
            <p className="mt-4 text-base font-bold text-slate-900 truncate">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void onCopy(displayEmail === "Email belum tersedia" ? "" : displayEmail, "Email")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-slate-800 active:scale-95"
        >
          Salin Email Profil
        </button>
      </div>
    </section>
  );
}

export default SettingsAccountSection;
